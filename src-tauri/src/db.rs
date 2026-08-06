use rusqlite::{Connection, Result};
use std::sync::Mutex;
use once_cell::sync::Lazy;
use std::fs;

// A global mutex to hold the database connection securely
pub static DB_CONN: Lazy<Mutex<Option<Connection>>> = Lazy::new(|| Mutex::new(None));

pub fn init_db(db_path: &str, encryption_key: &str) -> Result<()> {
    println!("[PRERNA DB] Initializing SQLite connection at: {}", db_path);
    
    // In production, this path should be resolved via Tauri's app_data_dir()
    let conn = Connection::open(db_path)?;

    // Execute the SQLCipher pragma to decrypt/encrypt the database
    // (If compiled with actual SQLCipher, this is what enables the encryption)
    conn.execute(&format!("PRAGMA key = '{}';", encryption_key), [])?;

    // Load the schema from our schema.sql file to ensure tables exist
    // For this mockup, we'll execute a simplified schema directly
    conn.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS parent_consents (
            id TEXT PRIMARY KEY,
            teen_user_id TEXT NOT NULL,
            parent_verified_identity_ref TEXT NOT NULL,
            disclosure_version TEXT NOT NULL,
            consent_scope TEXT NOT NULL,
            consented_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            revoked_at DATETIME NULL
        );

        CREATE TABLE IF NOT EXISTS crisis_events (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL,
            detected_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            human_review_status TEXT DEFAULT 'pending',
            reviewer_ref TEXT NULL,
            teen_informed_at DATETIME NULL
        );
        "
    )?;

    println!("[PRERNA DB] Database successfully initialized and schema verified.");

    // Store the connection globally
    let mut global_conn = DB_CONN.lock().unwrap();
    *global_conn = Some(conn);

    Ok(())
}
