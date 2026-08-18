pub mod ai;
pub mod commands;
pub mod consent;
pub mod db;
pub mod notifications;
pub mod policy;
pub mod school_api;

use log::{info, warn};
use tauri::Manager;

use ai::{LLMState, LocalLLM};
use db::{Database, DbState};
use std::sync::{Arc, Mutex};

/// Backend-owned authenticated session state.
/// The renderer CANNOT supply user_id to privileged commands;
/// this is the single source of truth after a successful authentication.
#[derive(Clone, Debug, PartialEq)]
pub enum AuthStatus {
    None,
    PendingMFA(String),
    Authenticated(String),
}

pub struct ActiveSession(pub Mutex<AuthStatus>);

impl ActiveSession {
    pub fn get_user_id(&self) -> Result<String, String> {
        match &*self.0.lock().map_err(|e| e.to_string())? {
            AuthStatus::Authenticated(id) => Ok(id.clone()),
            _ => Err("Unauthorized: No active session".to_string()),
        }
    }
    pub fn set_pending_mfa(&self, id: String) -> Result<(), String> {
        *self.0.lock().map_err(|e| e.to_string())? = AuthStatus::PendingMFA(id);
        Ok(())
    }
    pub fn set_authenticated(&self, id: String) -> Result<(), String> {
        *self.0.lock().map_err(|e| e.to_string())? = AuthStatus::Authenticated(id);
        Ok(())
    }
    pub fn clear(&self) -> Result<(), String> {
        *self.0.lock().map_err(|e| e.to_string())? = AuthStatus::None;
        Ok(())
    }
    pub fn get_pending_mfa_user(&self) -> Result<String, String> {
        match &*self.0.lock().map_err(|e| e.to_string())? {
            AuthStatus::PendingMFA(id) => Ok(id.clone()),
            _ => Err("Unauthorized: No pending MFA session".to_string()),
        }
    }
}

/// T7b: Backend-Owned Conversation History.
/// Bounded history keyed by user_id to prevent frontend injection.
pub struct ConversationStore(
    pub Mutex<std::collections::HashMap<String, Vec<crate::ai::prompts::Message>>>,
);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)]
    env_logger::init();

    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_log::Builder::new().build())
        .setup(|app| {
            info!("PRERNA backend initializing...");

            // Initialize encrypted database
            let database = Database::new(app.handle())
                .expect("Failed to initialize database");

            app.manage(DbState(std::sync::Mutex::new(database)));

            // Manage authenticated session state (initially empty)
            app.manage(ActiveSession(Mutex::new(AuthStatus::None)));

            // Manage backend-owned conversation history
            app.manage(ConversationStore(Mutex::new(std::collections::HashMap::new())));

            // Attempt to initialize local LLM
            let llm_option = match LocalLLM::new(app.handle()) {
                Ok(llm) => {
                    info!("Local LLM initialized successfully.");
                    Some(llm)
                },
                Err(e) => {
                    warn!("Local LLM initialization skipped/failed (expected if model is missing): {}", e);
                    None
                }
            };

            app.manage(LLMState(Arc::new(Mutex::new(llm_option))));

            info!("PRERNA backend ready");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // User commands
            commands::create_user,
            commands::authenticate_user,
            commands::get_user,
            commands::revoke_consent,
            commands::submit_consent_token,
            commands::generate_mfa_secret,
            commands::verify_mfa_setup,
            commands::verify_login_mfa,

            // Session commands
            commands::save_session,
            commands::save_skill_session,
            commands::save_unified_profile,
            commands::get_unified_profile,
            commands::get_parent_view,
            commands::update_sharing_preferences,
            commands::export_user_data,
            commands::import_user_data,
            commands::get_user_sessions,

            // Trait commands
            commands::save_trait_snapshot,
            commands::get_latest_snapshot,

            // Interaction commands
            commands::log_interaction,

            // Crisis commands
            commands::create_crisis_event,
            commands::get_pending_crisis_events,
            commands::claim_crisis_event,
            commands::resolve_crisis_event,

            // Data management
            commands::delete_user_data,
            commands::get_health_metrics,

            // AI Commands
            commands::ai::chat_with_mentor,
            commands::ai::get_model_status,
            commands::ai::unload_model,
            commands::ai::generate_career_insight,

            // School Integration
            school_api::generate_school_report,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_auth_status_state_machine() {
        let session = ActiveSession(Mutex::new(AuthStatus::None));

        // 1. None state should reject get_user_id and get_pending_mfa
        assert!(session.get_user_id().is_err());
        assert!(session.get_pending_mfa_user().is_err());

        // 2. Transition to PendingMFA
        session.set_pending_mfa("user_A".to_string()).unwrap();

        // 3. PendingMFA state should STILL reject get_user_id (RED-001/MFA bypass)
        assert!(
            session.get_user_id().is_err(),
            "CRITICAL: PendingMFA must not be treated as Authenticated"
        );

        // 4. PendingMFA should allow get_pending_mfa
        assert_eq!(session.get_pending_mfa_user().unwrap(), "user_A");

        // 5. Transition to Authenticated
        session.set_authenticated("user_A".to_string()).unwrap();

        // 6. Authenticated should allow get_user_id
        assert_eq!(session.get_user_id().unwrap(), "user_A");

        // 7. Authenticated should reject get_pending_mfa
        assert!(session.get_pending_mfa_user().is_err());

        // 8. Logout / clear
        session.clear().unwrap();

        // 9. Cleared state should reject everything
        assert!(session.get_user_id().is_err());
        assert!(session.get_pending_mfa_user().is_err());
    }
}
