use crate::db::models::TraitSnapshot;
use crate::db::DbState;
use crate::ActiveSession;
use std::collections::{HashMap, HashSet};
use std::sync::Mutex;
use tauri::State;

pub const DEFAULT_PRIVACY_EPSILON: f64 = 1.0;
pub const INITIAL_QUERY_BUDGET: usize = 10;
pub const K_ANONYMITY_THRESHOLD: usize = 5;
pub const SMALL_CELL_SUPPRESSION_THRESHOLD: i32 = 3;

#[derive(Debug, Clone, serde::Serialize, serde::Deserialize)]
pub struct SchoolAnalyticsReport {
    pub cohort_size: usize,
    pub average_wellbeing: i32,
    pub top_career_clusters: Vec<String>,
    pub top_cognitive_strengths: Vec<String>,
    pub k_anonymity_threshold_met: bool,
    pub differential_privacy_applied: bool,
    pub privacy_epsilon: f64,
    pub remaining_query_budget: usize,
}

// In-memory ledger tracking educator query history:
// Map: caller_id -> (past_query_sets, remaining_budget)
static PRIVACY_LEDGER: Mutex<Option<HashMap<String, (Vec<HashSet<String>>, usize)>>> =
    Mutex::new(None);

pub fn reset_privacy_ledger() {
    if let Ok(mut lock) = PRIVACY_LEDGER.lock() {
        *lock = Some(HashMap::new());
    }
}

/**
 * Validates privacy constraints and updates educator privacy budget (Audit H-09):
 * 1. Rejects queries if the session privacy budget is exhausted.
 * 2. Blocks differencing attacks where overlapping cohorts differ by fewer than k students.
 * 3. Records approved queries and deducts 1 query unit from the privacy budget.
 */
pub fn check_and_update_privacy_budget(
    caller_id: &str,
    cohort: &HashSet<String>,
    k_threshold: usize,
) -> Result<usize, String> {
    let mut lock = PRIVACY_LEDGER.lock().map_err(|e| e.to_string())?;
    let map = lock.get_or_insert_with(HashMap::new);

    let entry = map
        .entry(caller_id.to_string())
        .or_insert_with(|| (Vec::new(), INITIAL_QUERY_BUDGET));

    // 1. Budget exhaustion check
    if entry.1 == 0 {
        return Err(
            "Privacy budget exhausted: Maximum cohort analytics queries reached for this educator session to prevent reconstruction attacks."
                .to_string(),
        );
    }

    // 2. Differencing attack prevention:
    // If the new query overlaps with ANY past query, the symmetric difference
    // |Q_new Δ Q_past| MUST be >= k_threshold.
    // If it differs by fewer than k students, an attacker could compute Q_new - Q_past
    // and isolate private scores of individual adolescents.
    for past_query in &entry.0 {
        let intersection_size = cohort.intersection(past_query).count();
        if intersection_size > 0 {
            let diff_new = cohort.difference(past_query).count();
            let diff_past = past_query.difference(cohort).count();
            let symmetric_difference = diff_new + diff_past;

            if symmetric_difference < k_threshold {
                return Err(format!(
                    "Privacy violation (differencing attack detected): The requested cohort overlaps with a previous query and differs by only {} individual(s), which is below the safe threshold of {}. Query blocked.",
                    symmetric_difference, k_threshold
                ));
            }
        }
    }

    // Deduct 1 unit from budget and record query
    entry.1 -= 1;
    let remaining = entry.1;
    entry.0.push(cohort.clone());

    Ok(remaining)
}

/**
 * Applies Laplace noise to the raw mean score:
 * Sensitivity Δf = 100 / N
 * Scale b = Δf / ε
 * Sample from standard Laplace distribution
 */
pub fn apply_laplace_dp_noise(raw_value: f64, cohort_size: usize, epsilon: f64) -> i32 {
    if cohort_size == 0 {
        return 0;
    }
    let n = cohort_size.max(K_ANONYMITY_THRESHOLD) as f64;
    let sensitivity = 100.0 / n;
    let b = sensitivity / epsilon.max(0.1);

    // Uniform variate u in (-0.5, 0.5)
    let u: f64 = rand::random::<f64>() - 0.5;
    let sgn = if u < 0.0 { -1.0 } else { 1.0 };
    // Laplace noise = -b * sgn(u) * ln(1 - 2*|u|)
    let p = (1.0 - 2.0 * u.abs()).max(1e-10);
    let noise = -b * sgn * p.ln();

    ((raw_value + noise).round() as i32).clamp(0, 100)
}

/**
 * Small-cell suppression: Filters out categories with fewer than `threshold` students
 * to prevent identification through unique or rare attributes (Rule §6).
 */
pub fn apply_small_cell_suppression(counts: &mut Vec<(String, i32)>, threshold: i32) {
    counts.retain(|(_, count)| *count >= threshold);
}

#[tauri::command]
pub fn generate_school_report(
    state: State<DbState>,
    session: State<ActiveSession>,
    student_ids: Vec<String>,
) -> Result<SchoolAnalyticsReport, String> {
    // T1/T2: Require authentication.
    let caller_id = session.get_user_id()?;

    let db = state.0.lock().map_err(|e| e.to_string())?;

    // RED-009: Authorize the caller as an Educator
    if !db.is_educator(&caller_id) {
        return Err(
            "Unauthorized: Must be an authorized educator to request school analytics".to_string(),
        );
    }

    let unique_student_ids: HashSet<String> = student_ids.into_iter().collect();

    // RED-009 Amendment: Fail-closed tenant boundary
    for student_id in &unique_student_ids {
        if !db.check_educator_tenant_access(&caller_id, student_id) {
            return Err(
                "Unauthorized: Cannot request data for a student outside your tenant (or student does not exist)"
                    .to_string(),
            );
        }
    }

    // K-Anonymity Guard: Refuse to process cohorts smaller than 5
    let k_threshold = K_ANONYMITY_THRESHOLD;
    if unique_student_ids.len() < k_threshold {
        return Ok(SchoolAnalyticsReport {
            cohort_size: unique_student_ids.len(),
            average_wellbeing: 0,
            top_career_clusters: vec![],
            top_cognitive_strengths: vec![],
            k_anonymity_threshold_met: false,
            differential_privacy_applied: false,
            privacy_epsilon: DEFAULT_PRIVACY_EPSILON,
            remaining_query_budget: INITIAL_QUERY_BUDGET,
        });
    }

    // Differencing Attack & Privacy Budget Check (Audit H-09)
    let remaining_budget =
        check_and_update_privacy_budget(&caller_id, &unique_student_ids, k_threshold)?;

    let mut all_snapshots = Vec::new();

    // Fetch latest snapshot for each student
    for id in &unique_student_ids {
        if let Ok(Some(snapshot)) = db.get_latest_snapshot(id) {
            all_snapshots.push(snapshot);
        }
    }

    // Check threshold again in case some IDs were invalid/missing
    if all_snapshots.len() < k_threshold {
        return Ok(SchoolAnalyticsReport {
            cohort_size: all_snapshots.len(),
            average_wellbeing: 0,
            top_career_clusters: vec![],
            top_cognitive_strengths: vec![],
            k_anonymity_threshold_met: false,
            differential_privacy_applied: false,
            privacy_epsilon: DEFAULT_PRIVACY_EPSILON,
            remaining_query_budget: remaining_budget,
        });
    }

    // Aggregate Wellbeing with Laplace Differential Privacy Noise (ε = 1.0)
    let total_wellbeing: i32 = all_snapshots.iter().map(calculate_wellbeing_score).sum();
    let raw_average = total_wellbeing as f64 / (all_snapshots.len() as f64);
    let average_wellbeing =
        apply_laplace_dp_noise(raw_average, all_snapshots.len(), DEFAULT_PRIVACY_EPSILON);

    // Aggregate Careers & Strengths
    let mut career_counts: HashMap<String, i32> = HashMap::new();
    let mut strength_counts: HashMap<String, i32> = HashMap::new();

    for snapshot in &all_snapshots {
        for career in extract_career_interests(snapshot) {
            *career_counts.entry(career).or_insert(0) += 1;
        }
        for strength in extract_strengths(snapshot) {
            *strength_counts.entry(strength).or_insert(0) += 1;
        }
    }

    let mut sorted_careers: Vec<_> = career_counts.into_iter().collect();
    let mut sorted_strengths: Vec<_> = strength_counts.into_iter().collect();

    // Small-cell suppression (Audit H-09): suppress categories with < 3 students
    apply_small_cell_suppression(&mut sorted_careers, SMALL_CELL_SUPPRESSION_THRESHOLD);
    apply_small_cell_suppression(&mut sorted_strengths, SMALL_CELL_SUPPRESSION_THRESHOLD);

    sorted_careers.sort_by_key(|b| std::cmp::Reverse(b.1));
    sorted_strengths.sort_by_key(|b| std::cmp::Reverse(b.1));

    Ok(SchoolAnalyticsReport {
        cohort_size: all_snapshots.len(),
        average_wellbeing,
        top_career_clusters: sorted_careers.into_iter().take(3).map(|(k, _)| k).collect(),
        top_cognitive_strengths: sorted_strengths
            .into_iter()
            .take(3)
            .map(|(k, _)| k)
            .collect(),
        k_anonymity_threshold_met: true,
        differential_privacy_applied: true,
        privacy_epsilon: DEFAULT_PRIVACY_EPSILON,
        remaining_query_budget: remaining_budget,
    })
}

// Helpers
fn calculate_wellbeing_score(profile: &TraitSnapshot) -> i32 {
    let emotional = profile
        .emotional_profile
        .get("resilience")
        .and_then(|v| v.as_f64())
        .unwrap_or(0.5);

    ((emotional * 100.0) as i32).clamp(0, 100)
}

fn extract_career_interests(profile: &TraitSnapshot) -> Vec<String> {
    let mut interests = vec![];
    if profile.riasec.investigative > 60.0 {
        interests.push("Technology/Research".to_string());
    }
    if profile.riasec.artistic > 60.0 {
        interests.push("Design/Arts".to_string());
    }
    if profile.riasec.social > 60.0 {
        interests.push("Helping Professions".to_string());
    }
    interests
}

fn extract_strengths(profile: &TraitSnapshot) -> Vec<String> {
    let mut strengths = vec![];
    if profile.big_five.openness > 70.0 {
        interests_helper(&mut strengths, "Creativity");
    }
    if profile.big_five.conscientiousness > 70.0 {
        interests_helper(&mut strengths, "Reliability");
    }
    if profile.big_five.extraversion > 70.0 {
        interests_helper(&mut strengths, "Leadership");
    }
    strengths
}

fn interests_helper(list: &mut Vec<String>, val: &str) {
    list.push(val.to_string());
}
