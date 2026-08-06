use tauri::State;
// use log::{info, error};

use crate::db::{Database, DbState};
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
    let db = state.0.lock().map_err(|e| e.to_string())?;
    
    let full_session = AssessmentSession {
        id: String::new(), // Will be generated
        user_id: session.user_id,
        session_type: session.session_type,
        started_at: chrono::Utc::now().to_rfc3339(),
        completed_at: Some(chrono::Utc::now().to_rfc3339()),
        raw_choices: session.raw_choices,
        derived_traits: session.derived_traits,
    };
    
    db.save_session(&full_session).map_err(|e| e.to_string())
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
