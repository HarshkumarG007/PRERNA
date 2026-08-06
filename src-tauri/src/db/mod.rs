use rusqlite::{Connection, Result, params};
use std::path::PathBuf;
use anyhow::{Context, Result as AnyhowResult};
use log::{info, error};

pub mod models;
pub mod schema;

use models::*;
use schema::SCHEMA_SQL;

pub struct Database {
    pub conn: Connection,
}

impl Database {
    /// Initialize encrypted database with key from secure storage
    pub fn new(app_handle: &tauri::AppHandle) -> AnyhowResult<Self> {
        let db_path = get_db_path(app_handle)?;
        
        // Ensure directory exists
        if let Some(parent) = db_path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        // Open or create database
        let conn = Connection::open(&db_path)
            .with_context(|| format!("Failed to open database at {:?}", db_path))?;

        // Get or create encryption key from OS keyring
        let key = Self::get_or_create_key()?;
        
        // Enable SQLCipher encryption
        conn.execute_batch(&format!("PRAGMA key = '{}';", key))
            .context("Failed to set SQLCipher encryption key")?;

        // Verify encryption is working
        conn.execute("SELECT count(*) FROM sqlite_master;", [])
            .context("Database encryption verification failed - wrong key or corrupted")?;

        info!("Database initialized successfully at {:?}", db_path);

        let mut db = Self { conn };
        db.init_schema()?;
        
        Ok(db)
    }

    /// Get encryption key from OS keyring or create new one
    fn get_or_create_key() -> AnyhowResult<String> {
        let service = "prerna";
        let username = "db_encryption_key";
        
        let entry = keyring::Entry::new(service, username)?;
        
        match entry.get_password() {
            Ok(key) => {
                info!("Retrieved existing encryption key from keyring");
                Ok(key)
            }
            Err(_) => {
                // Generate new 256-bit key
                let new_key = Self::generate_secure_key()?;
                entry.set_password(&new_key)?;
                info!("Generated and stored new encryption key");
                Ok(new_key)
            }
        }
    }

    fn generate_secure_key() -> AnyhowResult<String> {
        use rand::RngCore;
        let mut key_bytes = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut key_bytes);
        Ok(hex::encode(key_bytes))
    }

    fn init_schema(&mut self) -> AnyhowResult<()> {
        self.conn.execute_batch(SCHEMA_SQL)
            .context("Failed to initialize database schema")?;
        info!("Database schema initialized");
        Ok(())
    }

    // === USER OPERATIONS ===
    
    pub fn create_user(&self, user: &NewUser) -> AnyhowResult<String> {
        let id = uuid::Uuid::new_v4().to_string();
        let encrypted_region = self.encrypt_field(&user.region)?;
        let encrypted_lang = self.encrypt_field(&user.language)?;
        
        self.conn.execute(
            "INSERT INTO users (id, created_at, age_range, region, language, encryption_key_hash)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                &id,
                chrono::Utc::now().to_rfc3339(),
                &user.age_range,
                encrypted_region,
                encrypted_lang,
                "key_placeholder" // In production: hash of encryption key
            ],
        )?;
        
        Ok(id)
    }

    pub fn get_user(&self, user_id: &str) -> AnyhowResult<Option<User>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, created_at, age_range, region, language, encryption_key_hash 
             FROM users WHERE id = ?1"
        )?;
        
        let user = stmt.query_row([user_id], |row| {
            let region_enc: String = row.get(3)?;
            let lang_enc: String = row.get(4)?;
            
            Ok(User {
                id: row.get(0)?,
                created_at: row.get(1)?,
                age_range: row.get(2)?,
                region: self.decrypt_field(&region_enc).unwrap_or_default(),
                language: self.decrypt_field(&lang_enc).unwrap_or_default(),
                encryption_key_hash: row.get(5)?,
            })
        }).optional()?;
        
        Ok(user)
    }

    // === ASSESSMENT OPERATIONS ===

    pub fn save_session(&self, session: &AssessmentSession) -> AnyhowResult<String> {
        let id = uuid::Uuid::new_v4().to_string();
        let encrypted_choices = self.encrypt_field(&session.raw_choices)?;
        let encrypted_traits = self.encrypt_field(&session.derived_traits)?;
        
        self.conn.execute(
            "INSERT INTO sessions (id, user_id, session_type, started_at, completed_at, raw_choices, derived_traits, disclosure_version, disclosure_shown_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                &id,
                &session.user_id,
                &session.session_type,
                session.started_at,
                session.completed_at,
                encrypted_choices,
                encrypted_traits,
                &session.disclosure_version,
                session.disclosure_shown_at
            ],
        )?;
        
        Ok(id)
    }

    pub fn get_user_sessions(&self, user_id: &str) -> AnyhowResult<Vec<AssessmentSession>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, session_type, started_at, completed_at, raw_choices, derived_traits, disclosure_version, disclosure_shown_at 
             FROM sessions WHERE user_id = ?1 ORDER BY started_at DESC"
        )?;
        
        let sessions = stmt.query_map([user_id], |row| {
            let choices_enc: String = row.get(4)?;
            let traits_enc: String = row.get(5)?;
            
            Ok(AssessmentSession {
                id: row.get(0)?,
                user_id: user_id.to_string(),
                session_type: row.get(1)?,
                started_at: row.get(2)?,
                completed_at: row.get(3)?,
                raw_choices: self.decrypt_field(&choices_enc).unwrap_or_default(),
                derived_traits: self.decrypt_field(&traits_enc).unwrap_or_default(),
                disclosure_version: row.get(6)?,
                disclosure_shown_at: row.get(7)?,
            })
        })?
        .collect::<Result<Vec<_>, _>>()?;
        
        Ok(sessions)
    }

    // === TRAIT SNAPSHOT OPERATIONS ===

    pub fn save_trait_snapshot(&self, snapshot: &TraitSnapshot) -> AnyhowResult<String> {
        let id = uuid::Uuid::new_v4().to_string();
        
        self.conn.execute(
            "INSERT INTO trait_snapshots (id, user_id, snapshot_date, big_five, riasec, 
             multiple_intel, emotional_profile, confidence_score)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                &id,
                &snapshot.user_id,
                snapshot.snapshot_date,
                serde_json::to_string(&snapshot.big_five)?,
                serde_json::to_string(&snapshot.riasec)?,
                serde_json::to_string(&snapshot.multiple_intel)?,
                serde_json::to_string(&snapshot.emotional_profile)?,
                snapshot.confidence_score
            ],
        )?;
        
        Ok(id)
    }

    pub fn get_latest_snapshot(&self, user_id: &str) -> AnyhowResult<Option<TraitSnapshot>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, snapshot_date, big_five, riasec, multiple_intel, emotional_profile, confidence_score
             FROM trait_snapshots 
             WHERE user_id = ?1 
             ORDER BY snapshot_date DESC 
             LIMIT 1"
        )?;
        
        let snapshot = stmt.query_row([user_id], |row| {
            Ok(TraitSnapshot {
                id: row.get(0)?,
                user_id: user_id.to_string(),
                snapshot_date: row.get(1)?,
                big_five: serde_json::from_str(&row.get::<_, String>(2)?).unwrap_or_default(),
                riasec: serde_json::from_str(&row.get::<_, String>(3)?).unwrap_or_default(),
                multiple_intel: serde_json::from_str(&row.get::<_, String>(4)?).unwrap_or_default(),
                emotional_profile: serde_json::from_str(&row.get::<_, String>(5)?).unwrap_or_default(),
                confidence_score: row.get(6)?,
            })
        }).optional()?;
        
        Ok(snapshot)
    }

    // === MICRO-INTERACTION OPERATIONS ===

    pub fn log_micro_interaction(&self, interaction: &MicroInteraction) -> AnyhowResult<String> {
        let id = uuid::Uuid::new_v4().to_string();
        let encrypted_metadata = self.encrypt_field(&interaction.metadata)?;
        
        self.conn.execute(
            "INSERT INTO micro_interactions (id, user_id, interaction_type, metadata, emotional_signal, timestamp)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
            params![
                &id,
                &interaction.user_id,
                &interaction.interaction_type,
                encrypted_metadata,
                interaction.emotional_signal,
                interaction.timestamp
            ],
        )?;
        
        Ok(id)
    }

    // === CRISIS OPERATIONS ===
    
    pub fn create_crisis_event(&self, event: &CrisisEvent) -> AnyhowResult<String> {
        self.conn.execute(
            "INSERT INTO crisis_events (id, user_id, detected_at, severity, human_review_status, reviewer_id, decision, teen_informed_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            params![
                &event.id,
                &event.user_id,
                event.detected_at,
                &event.severity,
                &event.human_review_status,
                &event.reviewer_id,
                &event.decision,
                &event.teen_informed_at
            ],
        )?;
        Ok(event.id.clone())
    }
    
    pub fn resolve_crisis_event(
        &self,
        event_id: &str,
        reviewer_id: &str,
        reviewer_credentials_ref: &str,
        decision: &str,
        teen_informed_at: Option<i64>,
    ) -> Result<()> {
        let sql = "
            UPDATE crisis_events
            SET human_review_status = ?1,
                reviewer_ref = ?2,
                reviewer_credentials_ref = ?3,
                teen_informed_at = ?4
            WHERE id = ?5
        ";
        
        self.conn.execute(sql, (decision, reviewer_id, reviewer_credentials_ref, teen_informed_at, event_id))?;
        Ok(())
    }

    // === UTILITY METHODS ===

    fn encrypt_field(&self, plaintext: &str) -> AnyhowResult<String> {
        use aes_gcm::{Aes256Gcm, Key, Nonce};
        use aes_gcm::aead::{Aead, KeyInit};
        
        let key = Self::get_or_create_key()?;
        let key_bytes = hex::decode(&key)?;
        let cipher_key = Key::<Aes256Gcm>::from_slice(&key_bytes);
        let cipher = Aes256Gcm::new(cipher_key);
        
        let nonce_bytes = rand::random::<[u8; 12]>();
        let nonce = Nonce::from_slice(&nonce_bytes);
        
        let ciphertext = cipher.encrypt(nonce, plaintext.as_bytes())
            .map_err(|e| anyhow::anyhow!("Encryption failed: {}", e))?;
        
        let mut result = nonce_bytes.to_vec();
        result.extend_from_slice(&ciphertext);
        // Use general purpose encode to avoid deprecation warning, though code provided used base64::encode.
        Ok(base64::encode(&result))
    }

    fn decrypt_field(&self, ciphertext: &str) -> AnyhowResult<String> {
        use aes_gcm::{Aes256Gcm, Key, Nonce};
        use aes_gcm::aead::{Aead, KeyInit};
        
        let key = Self::get_or_create_key()?;
        let key_bytes = hex::decode(&key)?;
        let cipher_key = Key::<Aes256Gcm>::from_slice(&key_bytes);
        let cipher = Aes256Gcm::new(cipher_key);
        
        let data = base64::decode(ciphertext)?;
        if data.len() < 12 {
            return Err(anyhow::anyhow!("Invalid ciphertext"));
        }
        
        let (nonce_bytes, encrypted) = data.split_at(12);
        let nonce = Nonce::from_slice(nonce_bytes);
        
        let plaintext = cipher.decrypt(nonce, encrypted)
            .map_err(|e| anyhow::anyhow!("Decryption failed: {}", e))?;
        
        String::from_utf8(plaintext)
            .map_err(|e| anyhow::anyhow!("Invalid UTF-8: {}", e))
    }

    pub fn export_user_data(&self, user_id: &str) -> AnyhowResult<UserDataExport> {
        let user = self.get_user(user_id)?
            .ok_or_else(|| anyhow::anyhow!("User not found"))?;
        
        let sessions = self.get_user_sessions(user_id)?;
        let snapshot = self.get_latest_snapshot(user_id)?;
        
        Ok(UserDataExport {
            user,
            sessions,
            latest_snapshot: snapshot,
            export_timestamp: chrono::Utc::now().to_rfc3339(),
        })
    }

    pub fn delete_user_data(&self, user_id: &str) -> AnyhowResult<()> {
        self.conn.execute("DELETE FROM micro_interactions WHERE user_id = ?1", [user_id])?;
        self.conn.execute("DELETE FROM trait_snapshots WHERE user_id = ?1", [user_id])?;
        self.conn.execute("DELETE FROM sessions WHERE user_id = ?1", [user_id])?;
        self.conn.execute("DELETE FROM recommendations WHERE user_id = ?1", [user_id])?;
        self.conn.execute("DELETE FROM users WHERE id = ?1", [user_id])?;
        
        info!("Deleted all data for user {}", user_id);
        Ok(())
    }
}

fn get_db_path(app_handle: &tauri::AppHandle) -> AnyhowResult<PathBuf> {
    use tauri::Manager;
    let app_dir = app_handle.path().app_data_dir()
        .context("Failed to get app data directory")?;
    Ok(app_dir.join("prerna_encrypted.db"))
}

pub struct DbState(pub std::sync::Mutex<Database>);
