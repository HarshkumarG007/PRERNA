// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/
mod db;

use serde::{Deserialize, Serialize};

#[tauri::command]
fn greet(name: &str) -> String {
    format!("Hello, {}! You've been greeted from Rust!", name)
}

#[derive(Serialize)]
struct CrisisEventResponse {
    success: bool,
    message: String,
}

/// A custom Tauri IPC command that the frontend can call to securely insert a crisis event.
/// This gives us strict control over the data layer, allowing us to enforce invariants
/// (like forcing 'pending' status initially) in compiled Rust code rather than just JS.
#[tauri::command]
fn insert_crisis_event(user_id: &str) -> Result<CrisisEventResponse, String> {
    let conn_guard = db::DB_CONN.lock().unwrap();
    
    if let Some(conn) = conn_guard.as_ref() {
        let event_id = format!("crisis_{}", chrono::Utc::now().timestamp());
        
        // Enforce Global Rule 0.1-3 / Ticket P4-2: 
        // Autonomous detection MUST ONLY set human_review_status to 'pending'.
        // We enforce this at the Rust layer by hardcoding the insert.
        match conn.execute(
            "INSERT INTO crisis_events (id, user_id, human_review_status) VALUES (?1, ?2, 'pending')",
            (&event_id, user_id),
        ) {
            Ok(_) => Ok(CrisisEventResponse {
                success: true,
                message: format!("Crisis event securely logged with PENDING status. ID: {}", event_id),
            }),
            Err(e) => Err(format!("Database insert failed: {}", e)),
        }
    } else {
        Err("Database connection not initialized!".to_string())
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize the encrypted database on startup
    // In a real app, this path would be retrieved from tauri::api::path::app_data_dir
    let _ = db::init_db("prerna_local.sqlite", "mock_secure_key_123");

    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            greet,
            insert_crisis_event
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
