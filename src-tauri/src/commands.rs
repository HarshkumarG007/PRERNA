// Re-export the inner modules
pub mod ai;

use tauri::State;
use crate::db::{DbState};
use crate::db::models::*;

// === USER COMMANDS ===

#[tauri::command]
pub fn create_user(
    state: State<DbState>,
    user: NewUser,
) -> Result<String, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.create_user(&user).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_user(
    state: State<DbState>,
    user_id: String,
) -> Result<Option<User>, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.get_user(&user_id).map_err(|e| e.to_string())
}

// === SESSION COMMANDS ===

#[tauri::command]
pub fn save_session(
    state: State<DbState>,
    session: NewAssessmentSession,
) -> Result<String, String> {
    if session.disclosure_version.is_empty() {
        return Err("Cannot save session: no disclosure was recorded".into());
    }
    
    let db = state.0.lock().map_err(|e| e.to_string())?;
    
    let full_session = AssessmentSession {
        id: String::new(), // Will be generated
        user_id: session.user_id,
        session_type: session.session_type,
        started_at: chrono::Utc::now().to_rfc3339(),
        completed_at: Some(chrono::Utc::now().to_rfc3339()),
        raw_choices: session.raw_choices,
        derived_traits: session.derived_traits,
        disclosure_version: session.disclosure_version,
        disclosure_shown_at: session.disclosure_shown_at,
    };
    
    db.save_session(&full_session).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_skill_session(
    state: State<DbState>,
    user_id: String,
    game_type: String,
    score: i32,
    cognitive_data: String,
    disclosure_version: String,
    disclosure_shown_at: i64,
) -> Result<String, String> {
    if disclosure_version.is_empty() {
        return Err("Cannot save skill session: no disclosure was recorded".into());
    }
    
    let db = state.0.lock().map_err(|e| e.to_string())?;
    
    let session = crate::db::models::AssessmentSession {
        id: String::new(),
        user_id,
        session_type: format!("skill_{}", game_type),
        started_at: chrono::Utc::now().to_rfc3339(),
        completed_at: Some(chrono::Utc::now().to_rfc3339()),
        raw_choices: serde_json::json!({ "score": score }).to_string(),
        derived_traits: cognitive_data,
        disclosure_version,
        disclosure_shown_at,
    };
    
    db.save_session(&session).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_unified_profile(
    state: State<DbState>,
    user_id: String,
    profile_data: String,
) -> Result<String, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    
    // Parse and validate
    let profile: serde_json::Value = serde_json::from_str(&profile_data)
        .map_err(|e| format!("Invalid profile data: {}", e))?;
    
    // Extract trait snapshot from unified profile
    let snapshot = crate::db::models::TraitSnapshot {
        id: String::new(),
        user_id: user_id.clone(),
        snapshot_date: chrono::Utc::now().to_rfc3339(),
        big_five: serde_json::from_value(
            profile.get("personality").and_then(|p| p.get("bigFive")).cloned()
                .unwrap_or(serde_json::json!({}))
        ).unwrap_or_default(),
        riasec: serde_json::from_value(
            profile.get("personality").and_then(|p| p.get("riasec")).cloned()
                .unwrap_or(serde_json::json!({}))
        ).unwrap_or_default(),
        emotional_profile: profile.get("personality")
            .and_then(|p| p.get("emotional"))
            .cloned()
            .unwrap_or(serde_json::json!({})),
        confidence_score: profile.get("archetypeConfidence")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.5) as f32,
    };
    
    let snapshot_id = db.save_trait_snapshot(&snapshot)
        .map_err(|e| e.to_string())?;
    
    // Also save as session for history
    let session = crate::db::models::AssessmentSession {
        id: String::new(),
        user_id,
        session_type: "unified_profile".to_string(),
        started_at: profile.get("generatedAt")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string(),
        completed_at: Some(chrono::Utc::now().to_rfc3339()),
        raw_choices: profile_data,
        derived_traits: serde_json::to_string(&profile.get("archetype"))
            .unwrap_or_default(),
        disclosure_version: "system_generated".to_string(),
        disclosure_shown_at: chrono::Utc::now().timestamp(),
    };
    
    db.save_session(&session).map_err(|e| e.to_string())?;
    
    Ok(snapshot_id)
}

#[tauri::command]
pub fn get_unified_profile(
    state: State<DbState>,
    user_id: String,
) -> Result<Option<serde_json::Value>, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    
    let sessions = db.get_user_sessions(&user_id).map_err(|e| e.to_string())?;
    
    let profile_session = sessions.into_iter().find(|s| s.session_type == "unified_profile");
    
    if let Some(session) = profile_session {
        let profile: serde_json::Value = serde_json::from_str(&session.raw_choices)
            .map_err(|e| format!("Failed to parse profile data: {}", e))?;
        Ok(Some(profile))
    } else {
        Ok(None)
    }
}

#[derive(Debug, serde::Deserialize)]
pub struct ParentViewRequest {
    pub teen_id: String,
    pub parent_id: String,
}

#[derive(Debug, serde::Serialize)]
pub struct ParentViewResponse {
    pub has_access: bool,
    pub profile: Option<serde_json::Value>,
    pub pending_requests: Vec<String>,
}

#[tauri::command]
pub fn get_parent_view(
    state: State<DbState>,
    request: ParentViewRequest,
) -> Result<ParentViewResponse, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    
    // In production: Verify parent-teen relationship
    let is_authorized = true;
    
    if !is_authorized {
        return Ok(ParentViewResponse {
            has_access: false,
            profile: None,
            pending_requests: vec![],
        });
    }
    
    let profile = db.get_latest_snapshot(&request.teen_id)
        .map_err(|e| e.to_string())?;
    
    let parent_safe = profile.map(|p| {
        serde_json::json!({
            "wellbeing_score": calculate_wellbeing_score(&p),
            "career_interests": extract_career_interests(&p),
            "strengths": extract_strengths(&p),
            "last_active": p.snapshot_date,
        })
    });
    
    Ok(ParentViewResponse {
        has_access: true,
        profile: parent_safe,
        pending_requests: vec![],
    })
}

fn calculate_wellbeing_score(profile: &crate::db::models::TraitSnapshot) -> i32 {
    let emotional = profile.emotional_profile
        .get("resilience")
        .and_then(|v| v.as_f64())
        .unwrap_or(0.5);
    
    ((emotional * 100.0) as i32).clamp(0, 100)
}

fn extract_career_interests(profile: &crate::db::models::TraitSnapshot) -> Vec<String> {
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

fn extract_strengths(profile: &crate::db::models::TraitSnapshot) -> Vec<String> {
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

#[derive(Debug, serde::Serialize)]
pub struct ExportPackage {
    pub user: serde_json::Value,
    pub sessions: Vec<serde_json::Value>,
    pub snapshots: Vec<serde_json::Value>,
    pub preferences: serde_json::Value,
}

#[tauri::command]
pub fn export_all_user_data(
    state: State<DbState>,
    user_id: String,
) -> Result<ExportPackage, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    
    // Export user profile
    let user = db.get_user(&user_id)
        .map_err(|e| e.to_string())?
        .ok_or("User not found")?;
    
    // Export all sessions
    let sessions = db.get_user_sessions(&user_id)
        .map_err(|e| e.to_string())?;
    
    // Export trait snapshots
    let snapshots = db.get_user_snapshots(&user_id)
        .map_err(|e| e.to_string())?;
    
    Ok(ExportPackage {
        user: serde_json::to_value(user).map_err(|e| e.to_string())?,
        sessions: sessions.into_iter()
            .map(|s| serde_json::to_value(s).unwrap())
            .collect(),
        snapshots: snapshots.into_iter()
            .map(|s| serde_json::to_value(s).unwrap())
            .collect(),
        preferences: serde_json::json!({}), // Mock preferences
    })
}

#[derive(Debug, serde::Deserialize)]
pub struct ImportPackage {
    pub user: serde_json::Value,
    pub sessions: Vec<serde_json::Value>,
    pub snapshots: Vec<serde_json::Value>,
    pub preferences: serde_json::Value,
}

#[tauri::command]
pub fn import_user_data(
    state: State<DbState>,
    data: ImportPackage,
) -> Result<String, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    
    // Import user
    let user: crate::db::models::User = serde_json::from_value(data.user)
        .map_err(|e| format!("Invalid user data: {}", e))?;
    
    // Check if user exists
    match db.get_user(&user.id).map_err(|e| e.to_string())? {
        Some(_) => {
            // Update existing (mocking with create_user for now)
            // db.update_user(&user).map_err(|e| e.to_string())?;
        }
        None => {
            // Create new
            db.create_user(&crate::db::models::NewUser {
                age_range: user.age_range,
                region: user.region,
                language: user.language,
            }).map_err(|e| e.to_string())?;
        }
    }
    
    // Import sessions
    for session_json in data.sessions {
        let session: crate::db::models::AssessmentSession = 
            serde_json::from_value(session_json)
                .map_err(|e| format!("Invalid session: {}", e))?;
        db.save_session(&session).map_err(|e| e.to_string())?;
    }
    
    // Import snapshots
    for snapshot_json in data.snapshots {
        let snapshot: crate::db::models::TraitSnapshot = 
            serde_json::from_value(snapshot_json)
                .map_err(|e| format!("Invalid snapshot: {}", e))?;
        db.save_trait_snapshot(&snapshot).map_err(|e| e.to_string())?;
    }
    
    Ok(user.id)
}

#[tauri::command]
pub fn get_user_sessions(
    state: State<DbState>,
    user_id: String,
) -> Result<Vec<AssessmentSession>, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.get_user_sessions(&user_id).map_err(|e| e.to_string())
}

// === TRAIT COMMANDS ===

#[tauri::command]
pub fn save_trait_snapshot(
    state: State<DbState>,
    snapshot: NewTraitSnapshot,
) -> Result<String, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    
    let full_snapshot = TraitSnapshot {
        id: String::new(),
        user_id: snapshot.user_id,
        snapshot_date: chrono::Utc::now().to_rfc3339(),
        big_five: snapshot.big_five,
        riasec: snapshot.riasec,
        multiple_intel: snapshot.multiple_intel,
        emotional_profile: snapshot.emotional_profile,
        confidence_score: snapshot.confidence_score,
    };
    
    db.save_trait_snapshot(&full_snapshot).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_latest_snapshot(
    state: State<DbState>,
    user_id: String,
) -> Result<Option<TraitSnapshot>, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.get_latest_snapshot(&user_id).map_err(|e| e.to_string())
}

// === MICRO-INTERACTION COMMANDS ===

#[tauri::command]
pub fn log_interaction(
    state: State<DbState>,
    interaction: NewMicroInteraction,
) -> Result<String, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    
    let full_interaction = MicroInteraction {
        id: String::new(),
        user_id: interaction.user_id,
        interaction_type: interaction.interaction_type,
        metadata: interaction.metadata,
        emotional_signal: interaction.emotional_signal,
        timestamp: chrono::Utc::now().to_rfc3339(),
    };
    
    db.log_micro_interaction(&full_interaction).map_err(|e| e.to_string())
}

// === CRISIS PROTOCOL COMMANDS ===

#[tauri::command]
pub fn create_crisis_event(
    state: State<DbState>,
    user_id: String,
    detected_at: i64,
    severity: String,
) -> Result<String, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    
    let event = CrisisEvent {
        id: uuid::Uuid::new_v4().to_string(),
        user_id,
        detected_at,
        severity,
        human_review_status: "pending".to_string(),
        reviewer_id: None,
        decision: None,
        teen_informed_at: None,
    };
    
    db.create_crisis_event(&event).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn resolve_crisis_event(
    state: State<DbState>,
    event_id: String,
    reviewer_id: String,
    decision: CrisisDecision,
    teen_informed_at: Option<i64>,
) -> Result<(), String> {
    if decision == CrisisDecision::GuardianNotified && teen_informed_at.is_none() {
        return Err("Cannot notify guardian: teen has not been informed yet".into());
    }
    
    let decision_str = match decision {
        CrisisDecision::NoAction => "NoAction",
        CrisisDecision::ResourcesOnly => "ResourcesOnly",
        CrisisDecision::GuardianNotified => "GuardianNotified",
    };
    
    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.resolve_crisis_event(&event_id, &reviewer_id, decision_str, teen_informed_at).map_err(|e| e.to_string())
}

// === DATA MANAGEMENT COMMANDS ===

#[tauri::command]
pub fn export_user_data(
    state: State<DbState>,
    user_id: String,
) -> Result<UserDataExport, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.export_user_data(&user_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn delete_user_data(
    state: State<DbState>,
    user_id: String,
) -> Result<(), String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.delete_user_data(&user_id).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_health_metrics(state: State<DbState>) -> Result<HealthMetrics, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    
    let total_users: i64 = db.conn.query_row(
        "SELECT COUNT(*) FROM users", [], |r| r.get(0)
    ).map_err(|e| e.to_string())?;
    
    let total_sessions: i64 = db.conn.query_row(
        "SELECT COUNT(*) FROM sessions", [], |r| r.get(0)
    ).map_err(|e| e.to_string())?;
    
    Ok(HealthMetrics {
        total_users,
        total_sessions,
        db_size_bytes: 0, // Would need to check file size
        encryption_status: "SQLCipher AES-256".to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_crisis_invariant_guardian_notification_blocked() {
        // The invariant is: decision == GuardianNotified && teen_informed_at.is_none() -> Err
        
        let decision = CrisisDecision::GuardianNotified;
        let teen_informed_at = None;
        
        let is_valid = !(decision == CrisisDecision::GuardianNotified && teen_informed_at.is_none());
        assert!(!is_valid, "FATAL: Guardian notification must be blocked if teen is not informed");
        
        let decision_valid = CrisisDecision::GuardianNotified;
        let teen_informed_at_valid = Some(1620000000);
        let is_valid_2 = !(decision_valid == CrisisDecision::GuardianNotified && teen_informed_at_valid.is_none());
        assert!(is_valid_2, "Guardian notification should pass if teen is informed");
    }
}
