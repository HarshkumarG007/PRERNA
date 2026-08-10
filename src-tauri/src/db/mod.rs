use rusqlite::{Connection, Result, params, OptionalExtension};
use std::path::PathBuf;
use anyhow::{Context, Result as AnyhowResult};
use log::info;
use zeroize::{Zeroize, Zeroizing};

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
        conn.execute_batch(&format!("PRAGMA key = '{}';", key.as_str()))
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
    fn get_or_create_key() -> AnyhowResult<Zeroizing<String>> {
        let service = "prerna";
        let username = "db_encryption_key";

        let entry = keyring::Entry::new(service, username)?;

        match entry.get_password() {
            Ok(key) => {
                info!("Retrieved existing encryption key from keyring");
                Ok(Zeroizing::new(key))
            }
            Err(_) => {
                // Generate new 256-bit key
                let new_key = Self::generate_secure_key()?;
                entry.set_password(new_key.as_str())?;
                info!("Generated and stored new encryption key");
                Ok(new_key)
            }
        }
    }

    fn generate_secure_key() -> AnyhowResult<Zeroizing<String>> {
        use rand::RngCore;
        let mut key_bytes = [0u8; 32];
        rand::thread_rng().fill_bytes(&mut key_bytes);
        let key_str = Zeroizing::new(hex::encode(&key_bytes));
        key_bytes.zeroize();
        Ok(key_str)
    }

    #[cfg(test)]
    pub fn new_in_memory(key: &str) -> AnyhowResult<Self> {
        let conn = Connection::open_in_memory()?;
        conn.execute_batch(&format!("PRAGMA key = '{}';", key))
            .context("Failed to set SQLCipher encryption key")?;
        let mut db = Self { conn };
        db.init_schema()?;
        Ok(db)
    }

    fn init_schema(&mut self) -> AnyhowResult<()> {
        self.conn.execute_batch(SCHEMA_SQL)
            .context("Failed to initialize database schema")?;

        // Run migrations for MFA columns if they don't exist
        let _ = self.conn.execute("ALTER TABLE users ADD COLUMN mfa_secret TEXT", []);
        let _ = self.conn.execute("ALTER TABLE users ADD COLUMN mfa_enabled BOOLEAN DEFAULT 0", []);

        // T3: Parent-teen relationship table for real authorization
        // Dropping for development purposes to apply Phase 4 schema changes
        let _ = self.conn.execute_batch("DROP TABLE IF EXISTS parent_teen_relationships;");

        self.conn.execute_batch("
            CREATE TABLE IF NOT EXISTS parent_teen_relationships (
                id TEXT PRIMARY KEY,
                parent_user_id TEXT NOT NULL,
                teen_user_id TEXT NOT NULL,
                established_at TEXT NOT NULL,
                consent_record_id TEXT,
                relationship_id TEXT,
                verification_method TEXT,
                status TEXT DEFAULT 'pending',
                issued_at TEXT,
                expires_at TEXT,
                verified_at TEXT,
                revoked_at TEXT,
                provider_reference TEXT,
                UNIQUE(parent_user_id, teen_user_id)
            );
        ").context("Failed to create parent_teen_relationships table")?;

        info!("Database schema initialized");
        Ok(())
    }

    // === USER OPERATIONS ===

    pub fn create_user(&self, user: &NewUser) -> AnyhowResult<String> {
        let id = uuid::Uuid::new_v4().to_string();
        let encrypted_region = self.encrypt_field(&user.region)?;
        let encrypted_lang = self.encrypt_field(&user.language)?;

        self.conn.execute(
            "INSERT INTO users (id, username, password_hash, created_at, age_range, region, language, encryption_key_hash, mfa_enabled, role, tenant_id)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, 0, 'teen', NULL)",
            params![
                &id,
                &user.username,
                &user.password_hash,
                chrono::Utc::now().to_rfc3339(),
                &user.age_range,
                encrypted_region,
                encrypted_lang,
                "key_placeholder" // In production: hash of encryption key
            ],
        )?;

        Ok(id)
    }

    pub fn authenticate_user_raw(&self, username: &str) -> AnyhowResult<Option<User>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, username, password_hash, created_at, age_range, region, language, encryption_key_hash, mfa_secret, mfa_enabled, role, tenant_id
             FROM users WHERE username = ?1"
        )?;

        let user = stmt.query_row([username], |row| {
            let region_enc: String = row.get(5)?;
            let lang_enc: String = row.get(6)?;

            Ok(User {
                id: row.get(0)?,
                username: row.get(1)?,
                password_hash: row.get(2)?,
                created_at: row.get(3)?,
                age_range: row.get(4)?,
                region: self.decrypt_field(&region_enc).unwrap_or_default(),
                language: self.decrypt_field(&lang_enc).unwrap_or_default(),
                encryption_key_hash: row.get(7)?,
                mfa_secret: row.get(8).ok(),
                mfa_enabled: row.get(9).unwrap_or(false),
                role: row.get(10).unwrap_or_else(|_| "teen".to_string()),
                tenant_id: row.get(11).ok(),
            })
        }).optional()?;

        Ok(user)
    }

    pub fn get_user(&self, user_id: &str) -> AnyhowResult<Option<User>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, username, password_hash, created_at, age_range, region, language, encryption_key_hash, mfa_secret, mfa_enabled, role, tenant_id
             FROM users WHERE id = ?1"
        )?;

        let user = stmt.query_row([user_id], |row| {
            let region_enc: String = row.get(5)?;
            let lang_enc: String = row.get(6)?;

            Ok(User {
                id: row.get(0)?,
                username: row.get(1)?,
                password_hash: row.get(2)?,
                created_at: row.get(3)?,
                age_range: row.get(4)?,
                region: self.decrypt_field(&region_enc).unwrap_or_default(),
                language: self.decrypt_field(&lang_enc).unwrap_or_default(),
                encryption_key_hash: row.get(7)?,
                mfa_secret: row.get(8).ok(),
                mfa_enabled: row.get(9).unwrap_or(false),
                role: row.get(10).unwrap_or_else(|_| "teen".to_string()),
                tenant_id: row.get(11).ok(),
            })
        }).optional()?;

        Ok(user)
    }

    /// T3: Check whether an authenticated parent has an established link to a teen.
    /// Returns false (denies access) if no explicit relationship record exists.
    pub fn check_parent_teen_link(&self, parent_id: &str, teen_id: &str) -> AnyhowResult<bool> {
        let count: i64 = self.conn.query_row(
            "SELECT COUNT(*) FROM parent_teen_relationships WHERE parent_user_id = ?1 AND teen_user_id = ?2 AND status = 'active'",
            rusqlite::params![parent_id, teen_id],
            |row| row.get(0)
        )?;
        Ok(count > 0)
    }

    // === AUTHORIZATION STUBS ===

    pub fn is_reviewer(&self, user_id: &str) -> bool {
        let role: Result<String, _> = self.conn.query_row(
            "SELECT role FROM users WHERE id = ?1",
            rusqlite::params![user_id],
            |row| row.get(0)
        );
        role.unwrap_or_default() == "reviewer"
    }

    pub fn is_educator(&self, user_id: &str) -> bool {
        let role: Result<String, _> = self.conn.query_row(
            "SELECT role FROM users WHERE id = ?1",
            rusqlite::params![user_id],
            |row| row.get(0)
        );
        role.unwrap_or_default() == "educator"
    }

    pub fn check_educator_tenant_access(&self, educator_id: &str, student_id: &str) -> bool {
        // Fetch both tenants
        let ed_tenant: Result<Option<String>, _> = self.conn.query_row(
            "SELECT tenant_id FROM users WHERE id = ?1",
            rusqlite::params![educator_id],
            |row| row.get(0)
        );
        let st_tenant: Result<Option<String>, _> = self.conn.query_row(
            "SELECT tenant_id FROM users WHERE id = ?1",
            rusqlite::params![student_id],
            |row| row.get(0)
        );

        match (ed_tenant, st_tenant) {
            (Ok(Some(ed)), Ok(Some(st))) => ed == st,
            _ => false, // fail closed if missing or error
        }
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
            "INSERT INTO trait_snapshots (id, user_id, snapshot_date, item_bank_version, big_five, riasec,
             multiple_intel, emotional_profile, confidence_score)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)",
            params![
                &id,
                &snapshot.user_id,
                snapshot.snapshot_date,
                snapshot.item_bank_version,
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
            "SELECT id, snapshot_date, item_bank_version, big_five, riasec, multiple_intel, emotional_profile, confidence_score
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
                item_bank_version: row.get(2)?,
                big_five: serde_json::from_str(&row.get::<_, String>(3)?).unwrap_or_default(),
                riasec: serde_json::from_str(&row.get::<_, String>(4)?).unwrap_or_default(),
                multiple_intel: serde_json::from_str(&row.get::<_, String>(5)?).unwrap_or_default(),
                emotional_profile: serde_json::from_str(&row.get::<_, String>(6)?).unwrap_or_default(),
                confidence_score: row.get(7)?,
            })
        }).optional()?;

        Ok(snapshot)
    }

    pub fn get_user_snapshots(&self, user_id: &str) -> AnyhowResult<Vec<TraitSnapshot>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, snapshot_date, item_bank_version, big_five, riasec, multiple_intel, emotional_profile, confidence_score
             FROM trait_snapshots
             WHERE user_id = ?1
             ORDER BY snapshot_date DESC"
        )?;

        let snapshots = stmt.query_map([user_id], |row| {
            Ok(TraitSnapshot {
                id: row.get(0)?,
                user_id: user_id.to_string(),
                snapshot_date: row.get(1)?,
                item_bank_version: row.get(2)?,
                big_five: serde_json::from_str(&row.get::<_, String>(3)?).unwrap_or_default(),
                riasec: serde_json::from_str(&row.get::<_, String>(4)?).unwrap_or_default(),
                multiple_intel: serde_json::from_str(&row.get::<_, String>(5)?).unwrap_or_default(),
                emotional_profile: serde_json::from_str(&row.get::<_, String>(6)?).unwrap_or_default(),
                confidence_score: row.get(7)?,
            })
        })?.collect::<Result<Vec<_>, _>>()?;

        Ok(snapshots)
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

    pub fn get_pending_crisis_events(&self) -> AnyhowResult<Vec<CrisisEvent>> {
        let mut stmt = self.conn.prepare(
            "SELECT id, user_id, detected_at, severity, human_review_status, reviewer_id, reviewer_credentials_ref, decision, teen_informed_at
             FROM crisis_events
             WHERE human_review_status = 'pending'"
        )?;

        let events = stmt.query_map([], |row| {
            Ok(CrisisEvent {
                id: row.get(0)?,
                user_id: row.get(1)?,
                detected_at: row.get(2)?,
                severity: row.get(3)?,
                human_review_status: row.get(4)?,
                reviewer_id: row.get(5)?,
                reviewer_credentials_ref: row.get(6)?,
                decision: row.get(7)?,
                teen_informed_at: row.get(8)?,
            })
        })?.collect::<Result<Vec<_>, _>>()?;

        Ok(events)
    }

    pub fn claim_crisis_event(&self, event_id: &str, reviewer_id: &str) -> AnyhowResult<()> {
        let updated = self.conn.execute(
            "UPDATE crisis_events SET reviewer_id = ?1 WHERE id = ?2 AND reviewer_id IS NULL AND human_review_status = 'pending'",
            rusqlite::params![reviewer_id, event_id]
        )?;
        if updated == 0 {
            return Err(anyhow::anyhow!("AlreadyAssigned or event does not exist / not pending"));
        }
        Ok(())
    }

    pub fn resolve_crisis_event(
        &self,
        event_id: &str,
        reviewer_id: &str,
        reviewer_credentials_ref: &str,
        decision: &str,
        teen_informed_at: Option<i64>,
    ) -> AnyhowResult<()> {
        let sql = "
            UPDATE crisis_events
            SET human_review_status = 'resolved',
                reviewer_credentials_ref = ?1,
                decision = ?2,
                teen_informed_at = ?3
            WHERE id = ?4 AND reviewer_id = ?5 AND human_review_status = 'pending'
        ";

        let updated = self.conn.execute(sql, rusqlite::params![reviewer_credentials_ref, decision, teen_informed_at, event_id, reviewer_id])?;
        if updated == 0 {
            return Err(anyhow::anyhow!("FATAL STATE MACHINE EXCEPTION: Event is not pending, or not assigned to you, or does not exist."));
        }
        Ok(())
    }

    // === PARENT SHARING PREFERENCES ===

    pub fn save_sharing_preferences(&self, user_id: &str, preferences: &crate::db::models::SharingPreferences) -> AnyhowResult<()> {
        let prefs_json = serde_json::to_string(preferences)?;
        let encrypted_prefs = self.encrypt_field(&prefs_json)?;

        self.conn.execute(
            "INSERT INTO parent_sharing_preferences (user_id, preferences, last_updated)
             VALUES (?1, ?2, ?3)
             ON CONFLICT(user_id) DO UPDATE SET
             preferences = excluded.preferences,
             last_updated = excluded.last_updated",
            params![user_id, encrypted_prefs, &preferences.last_updated],
        )?;

        Ok(())
    }

    pub fn get_sharing_preferences(&self, user_id: &str) -> AnyhowResult<Option<crate::db::models::SharingPreferences>> {
        let mut stmt = self.conn.prepare("SELECT preferences FROM parent_sharing_preferences WHERE user_id = ?1")?;
        let mut rows = stmt.query(params![user_id])?;

        if let Some(row) = rows.next()? {
            let encrypted_prefs: String = row.get(0)?;
            let decrypted_prefs = self.decrypt_field(&encrypted_prefs)?;
            let prefs: crate::db::models::SharingPreferences = serde_json::from_str(&decrypted_prefs)?;
            Ok(Some(prefs))
        } else {
            Ok(None)
        }
    }

    // === UTILITY METHODS ===

    fn encrypt_field(&self, plaintext: &str) -> AnyhowResult<String> {
        use aes_gcm::{Aes256Gcm, Key, Nonce};
        use aes_gcm::aead::{Aead, KeyInit};

        let key = Self::get_or_create_key()?;
        let mut key_bytes = hex::decode(&*key)?;
        let cipher_key = Key::<Aes256Gcm>::from_slice(&key_bytes);
        let cipher = Aes256Gcm::new(cipher_key);
        key_bytes.zeroize();

        let nonce_bytes = rand::random::<[u8; 12]>();
        let nonce = Nonce::from_slice(&nonce_bytes);

        let ciphertext = cipher.encrypt(nonce, plaintext.as_bytes())
            .map_err(|e| anyhow::anyhow!("Encryption failed: {}", e))?;

        let mut result = nonce_bytes.to_vec();
        result.extend_from_slice(&ciphertext);
        use base64::Engine;
        Ok(base64::engine::general_purpose::STANDARD.encode(&result))
    }

    fn decrypt_field(&self, ciphertext: &str) -> AnyhowResult<String> {
        use aes_gcm::{Aes256Gcm, Key, Nonce};
        use aes_gcm::aead::{Aead, KeyInit};

        let key = Self::get_or_create_key()?;
        let mut key_bytes = hex::decode(&*key)?;
        let cipher_key = Key::<Aes256Gcm>::from_slice(&key_bytes);
        let cipher = Aes256Gcm::new(cipher_key);
        key_bytes.zeroize();

        use base64::Engine;
        let data = base64::engine::general_purpose::STANDARD.decode(ciphertext)
            .map_err(|e| anyhow::anyhow!("Base64 decode failed: {}", e))?;
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
        // T9: Fix deletion completeness
        self.conn.execute("DELETE FROM crisis_events WHERE user_id = ?1", [user_id])?;
        self.conn.execute("DELETE FROM parent_teen_relationships WHERE teen_user_id = ?1 OR parent_user_id = ?1", [user_id])?;
        self.conn.execute("DELETE FROM parent_sharing_preferences WHERE user_id = ?1", [user_id])?;
        self.conn.execute("DELETE FROM audit_log WHERE details LIKE '%' || ?1 || '%'", [user_id])?;
        self.conn.execute("DELETE FROM users WHERE id = ?1", [user_id])?;

        info!("Deleted all data for user {}", user_id);
        Ok(())
    }

    // === AUDIT LOG ===

    pub fn insert_audit_log(&self, action: &str, details: &str) -> AnyhowResult<()> {
        self.conn.execute(
            "INSERT INTO audit_log (timestamp, action, details) VALUES (?1, ?2, ?3)",
            params![chrono::Utc::now().to_rfc3339(), action, details],
        )?;
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

#[cfg(test)]
mod tests {
    use super::*;
    use rusqlite::Connection;

    fn setup_test_db() -> Database {
        let conn = Connection::open_in_memory().unwrap();
        conn.execute_batch(crate::db::schema::SCHEMA_SQL).unwrap();
        Database { conn }
    }

    #[test]
    fn test_data_retention_guarantee() {
        let db = setup_test_db();
        let user_id = "test_user_delete_audit";

        // 1. Insert a user
        db.conn.execute(
            "INSERT INTO users (id, created_at, age_range, region, language, encryption_key_hash) VALUES (?1, '2023-01-01', '13-15', 'enc_reg', 'en', 'hash')",
            [user_id]
        ).unwrap();

        // 2. Insert mock data across sensitive tables
        db.conn.execute(
            "INSERT INTO sessions (id, user_id, session_type, started_at, disclosure_version, disclosure_shown_at) VALUES ('sess1', ?1, 'life_quest', '2023-01-01', 'v1', 1234567890)",
            [user_id]
        ).unwrap();

        db.conn.execute(
            "INSERT INTO trait_snapshots (id, user_id, snapshot_date) VALUES ('snap1', ?1, '2023-01-01')",
            [user_id]
        ).unwrap();

        db.conn.execute(
            "INSERT INTO micro_interactions (id, user_id, interaction_type, timestamp) VALUES ('mic1', ?1, 'mood_log', '2023-01-01')",
            [user_id]
        ).unwrap();

        // 3. Verify data exists
        let count_users: i64 = db.conn.query_row("SELECT COUNT(*) FROM users WHERE id = ?1", [user_id], |row| row.get(0)).unwrap();
        assert_eq!(count_users, 1);
        let count_sessions: i64 = db.conn.query_row("SELECT COUNT(*) FROM sessions WHERE user_id = ?1", [user_id], |row| row.get(0)).unwrap();
        assert_eq!(count_sessions, 1);

        // 4. Trigger deletion
        db.delete_user_data(user_id).expect("Delete operation failed");

        // 5. Hard Audit: Verify NO data remains for this user
        let count_users_after: i64 = db.conn.query_row("SELECT COUNT(*) FROM users WHERE id = ?1", [user_id], |row| row.get(0)).unwrap();
        assert_eq!(count_users_after, 0, "Zero-knowledge violation: User record remained");

        let count_sessions_after: i64 = db.conn.query_row("SELECT COUNT(*) FROM sessions WHERE user_id = ?1", [user_id], |row| row.get(0)).unwrap();
        assert_eq!(count_sessions_after, 0, "Zero-knowledge violation: Sessions remained");

        let count_traits_after: i64 = db.conn.query_row("SELECT COUNT(*) FROM trait_snapshots WHERE user_id = ?1", [user_id], |row| row.get(0)).unwrap();
        assert_eq!(count_traits_after, 0, "Zero-knowledge violation: Traits remained");

        let count_interactions_after: i64 = db.conn.query_row("SELECT COUNT(*) FROM micro_interactions WHERE user_id = ?1", [user_id], |row| row.get(0)).unwrap();
        assert_eq!(count_interactions_after, 0, "Zero-knowledge violation: Interactions remained");
    }

    #[test]
    fn test_revoke_consent_audit_trail() {
        let mut db = Database::new_in_memory("test_secret").unwrap();
        db.conn.execute(
            "INSERT INTO parent_teen_relationships (id, parent_user_id, teen_user_id, established_at, status) VALUES ('1', 'p1', 't1', 'now', 'active')",
            []
        ).unwrap();

        assert_eq!(db.check_parent_teen_link("p1", "t1").unwrap(), true);

        // Soft delete (simulate revoke_consent)
        db.conn.execute(
            "UPDATE parent_teen_relationships SET status = 'revoked', revoked_at = 'now' WHERE parent_user_id = 'p1' OR teen_user_id = 'p1'",
            []
        ).unwrap();

        // Prove access is denied
        assert_eq!(db.check_parent_teen_link("p1", "t1").unwrap(), false);

        // Prove row is retained for audit
        let status: String = db.conn.query_row("SELECT status FROM parent_teen_relationships WHERE id = '1'", [], |r| r.get(0)).unwrap();
        assert_eq!(status, "revoked");
    }

    #[test]
    fn test_crisis_state_machine() {
        let db = Database::new_in_memory("test_secret").unwrap();
        let user_id = "test_teen_123";

        // 1. Create a user
        db.conn.execute(
            "INSERT INTO users (id, username, password_hash, created_at, age_range, region, language, encryption_key_hash, mfa_enabled)
             VALUES (?1, 'test', 'hash', 'date', '13-15', 'in', 'en', 'hash', 0)",
            [user_id]
        ).unwrap();

        // 2. Create a crisis event
        let event = crate::db::models::CrisisEvent {
            id: "crisis_1".to_string(),
            user_id: user_id.to_string(),
            detected_at: 1620000000,
            severity: "high".to_string(),
            human_review_status: "pending".to_string(),
            reviewer_id: None,
            reviewer_credentials_ref: None,
            decision: None,
            teen_informed_at: None,
        };
        db.create_crisis_event(&event).unwrap();

        // 3. Verify it is pending
        let pending = db.get_pending_crisis_events().unwrap();
        assert_eq!(pending.len(), 1);
        assert_eq!(pending[0].id, "crisis_1");

        // 4. Resolve it
        let resolve_res = db.resolve_crisis_event(
            "crisis_1",
            "doc_123",
            "lcsw_ref",
            "GuardianNotified",
            Some(1620000000)
        );
        assert!(resolve_res.is_ok(), "Should resolve successfully");

        // 5. Verify it is no longer pending
        let pending_after = db.get_pending_crisis_events().unwrap();
        assert_eq!(pending_after.len(), 0);

        // 6. Attempt to resolve again (should fail)
        let resolve_res_2 = db.resolve_crisis_event(
            "crisis_1",
            "doc_123",
            "lcsw_ref",
            "GuardianNotified",
            Some(1620000000)
        );
        assert!(resolve_res_2.is_err(), "FATAL STATE MACHINE EXCEPTION: Should not resolve an already resolved event");
    }

    #[test]
    fn test_synthetic_crisis_drill_comprehensive() {
        let db = Database::new_in_memory("test_secret_comprehensive").unwrap();
        let user_id = "test_teen_synthetic";

        // Setup User
        db.conn.execute(
            "INSERT INTO users (id, username, password_hash, created_at, age_range, region, language, encryption_key_hash, mfa_enabled)
             VALUES (?1, 'test_synthetic', 'hash', 'date', '13-15', 'in', 'en', 'hash', 0)",
            [user_id]
        ).unwrap();

        // 1. Synthetic high-risk signal & Detection
        let event = crate::db::models::CrisisEvent {
            id: "synthetic_crisis_01".to_string(),
            user_id: user_id.to_string(),
            detected_at: 1620000000,
            severity: "high".to_string(),
            human_review_status: "pending".to_string(),
            reviewer_id: None,
            reviewer_credentials_ref: None,
            decision: None,
            teen_informed_at: None,
        };
        db.create_crisis_event(&event).unwrap();

        // Reviewer A claims the event
        db.claim_crisis_event("synthetic_crisis_01", "doc_123").unwrap();

        // Negative Path A: Unclaimed Reviewer (Reviewer B tries to resolve Reviewer A's event)
        let negative_a_res = db.resolve_crisis_event(
            "synthetic_crisis_01",
            "doc_456",
            "lcsw_ref_456",
            "Dismissed",
            None
        );
        assert!(negative_a_res.is_err(), "Negative Path A failed: Reviewer B could resolve Reviewer A's event");

        // Negative Path B: Guardian Notification Before Teen Notification
        // First we check PolicyEngine directly, as that's where the domain logic lives (in commands, this is checked before calling db)
        // Since db just saves it, in the real app `commands::resolve_crisis_event` calls `PolicyEngine::enforce_guardian_notification_invariant`.
        // Let's simulate the command layer logic:
        let decision_str = "GuardianNotified";
        let teen_informed_at: Option<i64> = None;
        let policy_check = crate::policy::PolicyEngine::enforce_guardian_notification_invariant(
            &crate::db::models::CrisisDecision::GuardianNotified,
            teen_informed_at
        );
        assert!(policy_check.is_err(), "Negative Path B failed: PolicyEngine allowed guardian notification without teen informed");

        // Positive Path Resolution
        let policy_check_pass = crate::policy::PolicyEngine::enforce_guardian_notification_invariant(
            &crate::db::models::CrisisDecision::GuardianNotified,
            Some(1620001000)
        );
        assert!(policy_check_pass.is_ok());

        let resolve_res = db.resolve_crisis_event(
            "synthetic_crisis_01",
            "doc_123",
            "lcsw_ref_123",
            "GuardianNotified",
            Some(1620001000)
        );
        assert!(resolve_res.is_ok(), "Positive path failed");

        // Negative Path E: Duplicate Notification
        let duplicate_res = db.resolve_crisis_event(
            "synthetic_crisis_01",
            "doc_123",
            "lcsw_ref_123",
            "GuardianNotified",
            Some(1620001000)
        );
        assert!(duplicate_res.is_err(), "Negative Path E failed: Allowed duplicate resolution");
    }

    #[test]
    fn test_synthetic_crisis_drill_sla() {
        let db = Database::new_in_memory("test_secret_sla").unwrap();
        let user_id = "test_teen_synthetic";

        // Setup User
        db.conn.execute(
            "INSERT INTO users (id, username, password_hash, created_at, age_range, region, language, encryption_key_hash, mfa_enabled)
             VALUES (?1, 'test_synthetic', 'hash', 'date', '13-15', 'in', 'en', 'hash', 0)",
            [user_id]
        ).unwrap();

        let base_clock = 1620000000;
        let sla_limit = 7200; // 2 hours

        // 1. Detection
        let event = crate::db::models::CrisisEvent {
            id: "synthetic_crisis_sla_01".to_string(),
            user_id: user_id.to_string(),
            detected_at: base_clock,
            severity: "high".to_string(),
            human_review_status: "pending".to_string(),
            reviewer_id: None,
            reviewer_credentials_ref: None,
            decision: None,
            teen_informed_at: None,
        };
        db.create_crisis_event(&event).unwrap();

        // 2. Pending Event -> Reviewer Claim
        let _claim_clock = base_clock + 1000;
        db.claim_crisis_event("synthetic_crisis_sla_01", "doc_sla").unwrap();

        // 3. Test Invalid Transition (Resolution without Teen Notification for GuardianNotification)
        let policy_check_reject = crate::policy::PolicyEngine::enforce_guardian_notification_invariant(
            &crate::db::models::CrisisDecision::GuardianNotified,
            None
        );
        assert!(policy_check_reject.is_err(), "Must reject guardian notification if teen not informed");

        // 4. Test Invalid Reviewer
        let resolve_wrong_reviewer = db.resolve_crisis_event(
            "synthetic_crisis_sla_01",
            "doc_wrong",
            "lcsw_ref_456",
            "Dismissed",
            None
        );
        assert!(resolve_wrong_reviewer.is_err(), "Must reject resolution by unclaimed reviewer");

        // 5. Test SLA Breach
        let late_resolution_clock = base_clock + 8000; // 8000 > 7200
        let sla_breach_res = crate::policy::PolicyEngine::enforce_sla_timing(base_clock, late_resolution_clock, sla_limit);
        assert!(sla_breach_res.is_err(), "Must reject or record SLA breach if time exceeds limit");

        // 6. Valid sequence within SLA -> succeeds
        let valid_resolution_clock = base_clock + 5000; // 5000 < 7200
        let sla_valid_res = crate::policy::PolicyEngine::enforce_sla_timing(base_clock, valid_resolution_clock, sla_limit);
        assert!(sla_valid_res.is_ok(), "Must pass SLA timing");

        let policy_check_pass = crate::policy::PolicyEngine::enforce_guardian_notification_invariant(
            &crate::db::models::CrisisDecision::GuardianNotified,
            Some(valid_resolution_clock)
        );
        assert!(policy_check_pass.is_ok());

        let resolve_res = db.resolve_crisis_event(
            "synthetic_crisis_sla_01",
            "doc_sla",
            "lcsw_ref_123",
            "GuardianNotified",
            Some(valid_resolution_clock)
        );
        assert!(resolve_res.is_ok(), "Valid end-to-end synthetic drill failed");
    }
}
