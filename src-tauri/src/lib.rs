pub mod db;
pub mod commands;

use tauri::Manager;
use log::info;

use db::{Database, DbState};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    env_logger::init();
    
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            info!("PRERNA backend initializing...");
            
            // Initialize encrypted database
            let database = Database::new(app.handle())
                .expect("Failed to initialize database");
            
            app.manage(DbState(std::sync::Mutex::new(database)));
            
            info!("PRERNA backend ready");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            // User commands
            commands::create_user,
            commands::get_user,
            
            // Session commands
            commands::save_session,
            commands::get_user_sessions,
            
            // Trait commands
            commands::save_trait_snapshot,
            commands::get_latest_snapshot,
            
            // Interaction commands
            commands::log_interaction,
            
            // Data management
            commands::export_user_data,
            commands::delete_user_data,
            commands::get_health_metrics,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
