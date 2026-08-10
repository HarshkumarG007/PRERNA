use crate::db::models::TraitSnapshot;
use crate::db::DbState;
use tauri::State;

#[derive(Debug, serde::Serialize)]
pub struct SchoolAnalyticsReport {
    pub cohort_size: usize,
    pub average_wellbeing: i32,
    pub top_career_clusters: Vec<String>,
    pub top_cognitive_strengths: Vec<String>,
    pub k_anonymity_threshold_met: bool,
}

use crate::ActiveSession;

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

    // RED-009 Amendment: Fail-closed tenant boundary
    for student_id in &student_ids {
        if !db.check_educator_tenant_access(&caller_id, student_id) {
            return Err("Unauthorized: Cannot request data for a student outside your tenant (or student does not exist)".to_string());
        }
    }

    // K-Anonymity Guard: Refuse to process cohorts smaller than 5
    let k_threshold = 5;
    if student_ids.len() < k_threshold {
        return Ok(SchoolAnalyticsReport {
            cohort_size: student_ids.len(),
            average_wellbeing: 0,
            top_career_clusters: vec![],
            top_cognitive_strengths: vec![],
            k_anonymity_threshold_met: false,
        });
    }

    let mut all_snapshots = Vec::new();

    // Fetch latest snapshot for each student
    for id in &student_ids {
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
        });
    }

    // Aggregate Wellbeing
    let total_wellbeing: i32 = all_snapshots.iter().map(calculate_wellbeing_score).sum();
    let average_wellbeing = total_wellbeing / (all_snapshots.len() as i32);

    // Aggregate Careers & Strengths
    let mut career_counts: std::collections::HashMap<String, i32> =
        std::collections::HashMap::new();
    let mut strength_counts: std::collections::HashMap<String, i32> =
        std::collections::HashMap::new();

    for snapshot in &all_snapshots {
        for career in extract_career_interests(snapshot) {
            *career_counts.entry(career).or_insert(0) += 1;
        }
        for strength in extract_strengths(snapshot) {
            *strength_counts.entry(strength).or_insert(0) += 1;
        }
    }

    let mut sorted_careers: Vec<_> = career_counts.into_iter().collect();
    sorted_careers.sort_by(|a, b| b.1.cmp(&a.1));

    let mut sorted_strengths: Vec<_> = strength_counts.into_iter().collect();
    sorted_strengths.sort_by(|a, b| b.1.cmp(&a.1));

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
    })
}

// Helpers (Shared with ParentDashboard logic ideally, duplicated here for self-contained module)
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
        strengths.push("Creativity".to_string());
    }
    if profile.big_five.conscientiousness > 70.0 {
        strengths.push("Reliability".to_string());
    }
    if profile.big_five.extraversion > 70.0 {
        strengths.push("Leadership".to_string());
    }
    strengths
}
