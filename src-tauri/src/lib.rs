pub mod db;
pub mod commands;
pub mod policy;
pub mod ai;
pub mod school_api;

use tauri::Manager;
use log::{info, warn};

use db::{Database, DbState};
use ai::{LocalLLM, LLMState};
use std::sync::{Arc, Mutex};

/// Backend-owned authenticated session state.
/// The renderer CANNOT supply user_id to privileged commands;
/// this is the single source of truth after a successful authentication.
pub struct ActiveSession(pub Mutex<Option<String>>);

/// T7b: Backend-Owned Conversation History.
/// Bounded history keyed by user_id to prevent frontend injection.
pub struct ConversationStore(pub Mutex<std::collections::HashMap<String, Vec<crate::ai::prompts::Message>>>);

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    #[cfg(debug_assertions)]
    env_logger::init();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            info!("PRERNA backend initializing...");
            
            // Initialize encrypted database
            let database = Database::new(app.handle())
                .expect("Failed to initialize database");
            
            app.manage(DbState(std::sync::Mutex::new(database)));
            
            // Manage authenticated session state (initially empty)
            app.manage(ActiveSession(Mutex::new(None)));
            
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
            commands::export_all_user_data,
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
            commands::resolve_crisis_event,
            
            // Data management
            commands::export_user_data,
            commands::delete_user_data,
            commands::get_health_metrics,
            commands::insert_audit_log,

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
