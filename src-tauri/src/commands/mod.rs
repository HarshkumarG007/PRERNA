// Re-export the inner modules
pub mod ai;
pub mod security_tests;

use crate::consent::ConsentService;
use crate::db::models::*;
use crate::db::DbState;
use crate::policy::PolicyEngine;
use crate::ActiveSession;
use aes_gcm::{
    aead::{Aead, KeyInit},
    Aes256Gcm, Nonce,
};
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use base64::{engine::general_purpose::STANDARD as b64, Engine};
use tauri::State;

use qrcode::render::svg;
use qrcode::QrCode;
use totp_rs::{Algorithm, Secret, TOTP};

// === USER COMMANDS ===

#[tauri::command]
pub fn create_user(state: State<DbState>, mut user: NewUser) -> Result<String, String> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();

    let password_hash = argon2
        .hash_password(user.password_hash.as_bytes(), &salt)
        .map_err(|e| e.to_string())?
        .to_string();

    user.password_hash = password_hash;

    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.create_user(&user).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn authenticate_user(
    state: State<DbState>,
    session: State<ActiveSession>,
    username: String,
    password_input: String,
) -> Result<Option<serde_json::Value>, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;
    let user_opt = db
        .authenticate_user_raw(&username)
        .map_err(|e| e.to_string())?;

    if let Some(mut user) = user_opt {
        let mut is_valid = false;
        let mut needs_migration = false;

        if user.password_hash.starts_with("$argon2") {
            let parsed_hash = PasswordHash::new(&user.password_hash).map_err(|e| e.to_string())?;
            is_valid = Argon2::default()
                .verify_password(password_input.as_bytes(), &parsed_hash)
                .is_ok();
        } else {
            // Legacy SHA-256 fallback (T4 migration path)
            use sha2::{Digest, Sha256};
            let mut hasher = Sha256::new();
            hasher.update(password_input.as_bytes());
            let hashed_pw = hex::encode(hasher.finalize());
            if hashed_pw == user.password_hash {
                is_valid = true;
                needs_migration = true;
            }
        }

        if is_valid {
            if needs_migration {
                // Rehash with Argon2id and update database
                let salt = SaltString::generate(&mut OsRng);
                let new_hash = Argon2::default()
                    .hash_password(password_input.as_bytes(), &salt)
                    .map_err(|e| e.to_string())?
                    .to_string();

                db.conn
                    .execute(
                        "UPDATE users SET password_hash = ?1 WHERE id = ?2",
                        rusqlite::params![new_hash, user.id],
                    )
                    .map_err(|e| e.to_string())?;
                user.password_hash = new_hash;
            }

            if user.mfa_enabled {
                session.set_pending_mfa(user.id.clone())?;
                Ok(Some(serde_json::json!({
                    "mfaRequired": true
                })))
            } else {
                // RED-001/020: Only commit session if MFA is not required
                session.set_authenticated(user.id.clone())?;

                let public_user = PublicUser::from(&user);
                Ok(Some(
                    serde_json::to_value(public_user).map_err(|e| e.to_string())?,
                ))
            }
        } else {
            // Password mismatch
            Ok(None)
        }
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub fn get_user(
    state: State<DbState>,
    session: State<ActiveSession>,
) -> Result<Option<PublicUser>, String> {
    // Read user_id exclusively from the backend session â€” never trust the renderer
    let user_id = session.get_user_id()?;
    let db = state.0.lock().map_err(|e| e.to_string())?;
    let user_opt = db.get_user(&user_id).map_err(|e| e.to_string())?;
    Ok(user_opt.map(|u| PublicUser::from(&u)))
}

#[tauri::command]
pub fn revoke_consent(state: State<DbState>, session: State<ActiveSession>) -> Result<(), String> {
    let user_id = session.get_user_id()?;
    let db = state.0.lock().map_err(|e| e.to_string())?;

    // RED-010: Actually soft-delete the relationship from the database for audit trailing
    db.conn.execute(
        "UPDATE parent_teen_relationships SET status = 'revoked', revoked_at = ?1 WHERE parent_user_id = ?2 OR teen_user_id = ?2",
        rusqlite::params![chrono::Utc::now().to_rfc3339(), user_id]
    ).map_err(|e| e.to_string())?;

    db.insert_audit_log("CONSENT_REVOKED", "Consent relationship revoked")
        .map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn submit_consent_token(
    token: String,
    frontend_teen_id: String,
    state: State<DbState>,
    session: State<ActiveSession>,
) -> Result<(), String> {
    let parent_user_id = session.get_user_id()?;

    // Verify token using the provider-independent ConsentService
    let consent_service = ConsentService::new();
    let record = consent_service.process_consent_token(&token)?;

    // Non-authoritative consistency check: Ensure the frontend didn't pass a mismatched teen ID
    if !frontend_teen_id.is_empty() && frontend_teen_id != record.teen_user_id {
        return Err("Consent token is not valid for the selected teen".to_string());
    }

    // IDENTITY BOUNDARY: The authoritative teen_user_id is derived exclusively from the token
    let authoritative_teen_id = record.teen_user_id;

    let db = state.0.lock().map_err(|e| e.to_string())?;

    // Insert or update the parent_teen_relationships table
    // For development, we assume relationship_id can be UUID
    let relationship_id = uuid::Uuid::new_v4().to_string();
    let consent_record_id = uuid::Uuid::new_v4().to_string();

    db.conn
        .execute(
            "INSERT INTO parent_teen_relationships (
            id, parent_user_id, teen_user_id, established_at, consent_record_id, relationship_id,
            verification_method, status, issued_at, expires_at, verified_at, provider_reference
        ) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, ?12)
        ON CONFLICT(parent_user_id, teen_user_id) DO UPDATE SET
            status = excluded.status,
            verification_method = excluded.verification_method,
            provider_reference = excluded.provider_reference,
            issued_at = excluded.issued_at,
            expires_at = excluded.expires_at,
            verified_at = excluded.verified_at,
            consent_record_id = excluded.consent_record_id
        ",
            rusqlite::params![
                relationship_id,
                parent_user_id,
                authoritative_teen_id,
                record.issued_at,
                consent_record_id,
                relationship_id,
                record.verification_method,
                record.status,
                record.issued_at,
                record.expires_at.unwrap_or_default(),
                record.issued_at, // verified_at
                record.provider_reference
            ],
        )
        .map_err(|e| format!("Database error: {}", e))?;

    db.insert_audit_log(
        "CONSENT_VERIFIED",
        &format!(
            "Consent verified successfully, relationship={}",
            relationship_id
        ),
    )
    .map_err(|e| e.to_string())?;

    Ok(())
}

#[derive(serde::Serialize)]
pub struct MfaSetupResponse {
    pub secret: String,
    pub qr_code_svg: String,
}

#[tauri::command]
pub fn logout(
    session: State<ActiveSession>,
    store: State<crate::ConversationStore>,
) -> Result<(), String> {
    let user_id_opt = session.get_user_id().ok();
    // RED-025: Evict memory on logout
    if let Some(user_id) = user_id_opt {
        if let Ok(mut store_guard) = store.0.lock() {
            store_guard.remove(&user_id);
        }
    }
    session.clear()?;
    Ok(())
}

#[tauri::command]
pub fn generate_mfa_secret(
    state: State<DbState>,
    session: State<ActiveSession>,
) -> Result<MfaSetupResponse, String> {
    let user_id = session.get_user_id()?;
    let db = state.0.lock().map_err(|e| e.to_string())?;
    let user = db
        .get_user(&user_id)
        .map_err(|e| e.to_string())?
        .ok_or("User not found")?;

    let secret = Secret::generate_secret();
    let totp = TOTP::new(
        Algorithm::SHA1,
        6,
        1,
        30,
        secret.to_bytes().unwrap(),
        Some("PRERNA".to_string()),
        user.username.clone(),
    )
    .map_err(|e| e.to_string())?;

    let url = totp.get_url();
    let code = QrCode::new(url).map_err(|e| e.to_string())?;
    let svg = code
        .render()
        .min_dimensions(200, 200)
        .dark_color(svg::Color("#6d28d9"))
        .light_color(svg::Color("#ffffff"))
        .build();

    // Save secret to DB temporarily or permanently (but not enabled yet)
    db.conn
        .execute(
            "UPDATE users SET mfa_secret = ?1 WHERE id = ?2",
            rusqlite::params![secret.to_string(), user_id],
        )
        .map_err(|e| e.to_string())?;

    Ok(MfaSetupResponse {
        secret: secret.to_string(),
        qr_code_svg: svg,
    })
}

#[tauri::command]
pub fn verify_mfa_setup(
    state: State<DbState>,
    session: State<ActiveSession>,
    token: String,
) -> Result<bool, String> {
    let user_id = session.get_user_id()?;
    let db = state.0.lock().map_err(|e| e.to_string())?;
    let user = db
        .get_user(&user_id)
        .map_err(|e| e.to_string())?
        .ok_or("User not found")?;

    let secret_str = user.mfa_secret.ok_or("MFA secret not set")?;
    let secret = Secret::Encoded(secret_str);
    let totp = TOTP::new(
        Algorithm::SHA1,
        6,
        1,
        30,
        secret.to_bytes().unwrap(),
        None,
        "".to_string(),
    )
    .map_err(|e| e.to_string())?;

    let is_valid = totp.check_current(&token).unwrap_or(false);

    if is_valid {
        db.conn
            .execute(
                "UPDATE users SET mfa_enabled = 1 WHERE id = ?1",
                rusqlite::params![user_id],
            )
            .map_err(|e| e.to_string())?;
        Ok(true)
    } else {
        Ok(false)
    }
}

#[tauri::command]
pub fn verify_login_mfa(
    state: State<DbState>,
    session: State<ActiveSession>,
    token: String,
) -> Result<Option<PublicUser>, String> {
    let user_id = session.get_pending_mfa_user()?;

    let db = state.0.lock().map_err(|e| e.to_string())?;
    let user = db
        .get_user(&user_id)
        .map_err(|e| e.to_string())?
        .ok_or("User not found")?;

    if !user.mfa_enabled {
        return Err("MFA not enabled".to_string());
    }

    let secret = user.mfa_secret.as_ref().ok_or("No MFA secret configured")?;

    let totp = TOTP::new(
        Algorithm::SHA1,
        6,
        1,
        30,
        Secret::Encoded(secret.to_string()).to_bytes().unwrap(),
        Some("PRERNA".to_string()),
        user.username.clone(),
    )
    .map_err(|e| e.to_string())?;

    if totp.check_current(&token).unwrap_or(false) {
        // MFA passed â€” fully commit the session now
        session.set_authenticated(user.id.clone())?;
        Ok(Some((&user).into()))
    } else {
        Err("Invalid token".to_string())
    }
}

// === SESSION COMMANDS ===

#[tauri::command]
pub fn save_session(
    state: State<DbState>,
    session_state: State<ActiveSession>,
    session: NewAssessmentSession,
) -> Result<String, String> {
    PolicyEngine::enforce_disclosure_invariant(&session.disclosure_version)?;

    let user_id = session_state.get_user_id()?;

    let db = state.0.lock().map_err(|e| e.to_string())?;
    let user = db
        .get_user(&user_id)
        .map_err(|e| e.to_string())?
        .ok_or("User not found")?;
    PolicyEngine::enforce_under_18_tracking_invariant(&user.age_range, false)?;

    let full_session = AssessmentSession {
        id: String::new(), // Will be generated
        user_id,
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
    session_state: State<ActiveSession>,
    game_type: String,
    score: i32,
    cognitive_data: String,
    disclosure_version: String,
    disclosure_shown_at: i64,
) -> Result<String, String> {
    PolicyEngine::enforce_disclosure_invariant(&disclosure_version)?;

    let user_id = session_state.get_user_id()?;

    let db = state.0.lock().map_err(|e| e.to_string())?;
    let user = db
        .get_user(&user_id)
        .map_err(|e| e.to_string())?
        .ok_or("User not found")?;
    PolicyEngine::enforce_under_18_tracking_invariant(&user.age_range, false)?;

    let session = crate::db::models::AssessmentSession {
        id: String::new(),
        user_id,
        session_type: "skill_arena".to_string(),
        started_at: chrono::Utc::now().to_rfc3339(),
        completed_at: Some(chrono::Utc::now().to_rfc3339()),
        raw_choices: serde_json::json!({ "score": score, "game_type": game_type }).to_string(),
        derived_traits: cognitive_data,
        disclosure_version,
        disclosure_shown_at,
    };

    db.save_session(&session).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn save_unified_profile(
    state: State<DbState>,
    session: State<ActiveSession>,
    profile_data: String,
) -> Result<String, String> {
    let user_id = session.get_user_id()?;
    let db = state.0.lock().map_err(|e| e.to_string())?;
    let user = db
        .get_user(&user_id)
        .map_err(|e| e.to_string())?
        .ok_or("User not found")?;
    PolicyEngine::enforce_under_18_tracking_invariant(&user.age_range, false)?;

    // Parse and validate
    let profile: serde_json::Value =
        serde_json::from_str(&profile_data).map_err(|e| format!("Invalid profile data: {}", e))?;

    // Extract trait snapshot from unified profile
    let snapshot = crate::db::models::TraitSnapshot {
        id: String::new(),
        user_id: user_id.clone(),
        snapshot_date: chrono::Utc::now().to_rfc3339(),
        item_bank_version: "v2-ipip-onet-2026".to_string(),
        big_five: serde_json::from_value(
            profile
                .get("personality")
                .and_then(|p| p.get("bigFive"))
                .cloned()
                .unwrap_or(serde_json::json!({})),
        )
        .unwrap_or_default(),
        riasec: serde_json::from_value(
            profile
                .get("personality")
                .and_then(|p| p.get("riasec"))
                .cloned()
                .unwrap_or(serde_json::json!({})),
        )
        .unwrap_or_default(),
        multiple_intel: serde_json::json!({}),
        emotional_profile: profile
            .get("personality")
            .and_then(|p| p.get("emotional"))
            .cloned()
            .unwrap_or(serde_json::json!({})),
        // T11: Renamed from confidence_score â€” this is questionnaire completion
        // fraction, not a validated statistical confidence measure.
        confidence_score: profile
            .get("archetypeConfidence")
            .and_then(|v| v.as_f64())
            .unwrap_or(0.0) as f32, // Defaults to 0 (incomplete), not 0.5 (fake midpoint)
    };

    let snapshot_id = db
        .save_trait_snapshot(&snapshot)
        .map_err(|e| e.to_string())?;

    // Also save as session for history
    let session = crate::db::models::AssessmentSession {
        id: String::new(),
        user_id,
        session_type: "unified_profile".to_string(),
        started_at: profile
            .get("generatedAt")
            .and_then(|v| v.as_str())
            .unwrap_or("")
            .to_string(),
        completed_at: Some(chrono::Utc::now().to_rfc3339()),
        raw_choices: profile_data,
        derived_traits: serde_json::to_string(&profile.get("archetype")).unwrap_or_default(),
        disclosure_version: "system_generated".to_string(),
        disclosure_shown_at: chrono::Utc::now().timestamp(),
    };

    db.save_session(&session).map_err(|e| e.to_string())?;

    Ok(snapshot_id)
}

#[tauri::command]
pub fn get_unified_profile(
    state: State<DbState>,
    session: State<ActiveSession>,
) -> Result<Option<serde_json::Value>, String> {
    let user_id = session.get_user_id()?;
    let db = state.0.lock().map_err(|e| e.to_string())?;

    let sessions = db.get_user_sessions(&user_id).map_err(|e| e.to_string())?;

    let profile_session = sessions
        .into_iter()
        .find(|s| s.session_type == "unified_profile");

    if let Some(session) = profile_session {
        let profile: serde_json::Value = serde_json::from_str(&session.raw_choices)
            .map_err(|e| format!("Failed to parse profile data: {}", e))?;
        Ok(Some(profile))
    } else {
        Ok(None)
    }
}

#[derive(Debug, serde::Serialize)]
pub struct ParentViewResponse {
    pub has_access: bool,
    pub profile: Option<serde_json::Value>,
    pub pending_requests: Vec<String>,
}

#[tauri::command]
pub fn update_sharing_preferences(
    state: State<DbState>,
    session_state: State<ActiveSession>,
    preferences: crate::db::models::SharingPreferences,
) -> Result<(), String> {
    let session_user_id = session_state.get_user_id()?;

    if session_user_id != preferences.user_id {
        return Err("Unauthorized: Cannot update preferences for another user".to_string());
    }

    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.save_sharing_preferences(&preferences.user_id, &preferences)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_parent_view(
    state: State<DbState>,
    session_state: State<ActiveSession>,
) -> Result<ParentViewResponse, String> {
    let db = state.0.lock().map_err(|e| e.to_string())?;

    let parent_id = session_state.get_user_id()?;

    // The backend autonomously resolves the authorized teen relationship
    let target_teen_id: Option<String> = db
        .conn
        .query_row(
            "SELECT teen_user_id FROM parent_teen_relationships WHERE parent_user_id = ?1 AND status = 'active' LIMIT 1",
            rusqlite::params![parent_id],
            |row| row.get(0),
        )
        .ok();

    let is_authorized = target_teen_id.is_some();
    let target_teen_id = target_teen_id.unwrap_or_default();

    if PolicyEngine::enforce_parental_authorization(is_authorized).is_err() {
        return Ok(ParentViewResponse {
            has_access: false,
            profile: None,
            pending_requests: vec![],
        });
    }

    let profile = db
        .get_latest_snapshot(&target_teen_id)
        .map_err(|e| e.to_string())?;

    // Load sharing preferences, fallback to restrictive defaults
    let prefs = db
        .get_sharing_preferences(&target_teen_id)
        .map_err(|e| e.to_string())?;

    let parent_safe = profile.map(|p| {
        let mut map = serde_json::Map::new();
        map.insert(
            "last_active".to_string(),
            serde_json::json!(p.snapshot_date),
        );

        if let Some(ref preferences) = prefs {
            if preferences.shares.wellbeing_score {
                map.insert(
                    "wellbeing_score".to_string(),
                    serde_json::json!(calculate_wellbeing_score(&p)),
                );
            }
            if preferences.shares.career_interests {
                map.insert(
                    "career_interests".to_string(),
                    serde_json::json!(extract_career_interests(&p)),
                );
            }
            if preferences.shares.strengths {
                map.insert(
                    "strengths".to_string(),
                    serde_json::json!(extract_strengths(&p)),
                );
            }
        }

        serde_json::Value::Object(map)
    });

    Ok(ParentViewResponse {
        has_access: true,
        profile: parent_safe,
        pending_requests: vec![],
    })
}

fn calculate_wellbeing_score(profile: &crate::db::models::TraitSnapshot) -> i32 {
    let emotional = profile
        .emotional_profile
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

#[derive(serde::Serialize, serde::Deserialize)]
pub struct EncryptedExportEnvelope {
    pub version: String,
    pub kdf: String,
    pub alg: String,
    pub salt: String,       // Base64
    pub nonce: String,      // Base64
    pub ciphertext: String, // Base64
}

#[tauri::command]
pub fn export_user_data(
    state: State<DbState>,
    session: State<ActiveSession>,
    password: Option<String>,
) -> Result<EncryptedExportEnvelope, String> {
    let user_id = session.get_user_id()?;
    let db = state.0.lock().map_err(|e| e.to_string())?;

    let pwd = password.ok_or_else(|| "Password required for export".to_string())?;

    let portable_data = db.export_user_data(&user_id).map_err(|e| e.to_string())?;

    let plaintext = serde_json::to_vec(&portable_data).map_err(|e| e.to_string())?;

    use rand::RngCore;
    let mut salt = [0u8; 16];
    rand::thread_rng().fill_bytes(&mut salt);

    let mut key = [0u8; 32];
    Argon2::default()
        .hash_password_into(pwd.as_bytes(), &salt, &mut key)
        .map_err(|e| e.to_string())?;

    let cipher = Aes256Gcm::new(aes_gcm::Key::<Aes256Gcm>::from_slice(&key));
    let mut nonce_bytes = [0u8; 12];
    rand::thread_rng().fill_bytes(&mut nonce_bytes);
    let nonce = Nonce::from_slice(&nonce_bytes);

    let ciphertext = cipher
        .encrypt(nonce, plaintext.as_ref())
        .map_err(|e| format!("Encryption failed: {}", e))?;

    Ok(EncryptedExportEnvelope {
        version: "v1".to_string(),
        kdf: "argon2id".to_string(),
        alg: "aes-256-gcm".to_string(),
        salt: b64.encode(salt),
        nonce: b64.encode(nonce_bytes),
        ciphertext: b64.encode(ciphertext),
    })
}

#[tauri::command]
pub fn import_user_data(
    state: State<DbState>,
    session_state: State<ActiveSession>,
    envelope: EncryptedExportEnvelope,
    password: Option<String>,
) -> Result<String, String> {
    let caller_id = session_state.get_user_id()?;

    let pwd = password.ok_or_else(|| "Password required for import".to_string())?;

    let salt = b64
        .decode(&envelope.salt)
        .map_err(|_| "Invalid salt".to_string())?;
    let nonce_bytes = b64
        .decode(&envelope.nonce)
        .map_err(|_| "Invalid nonce".to_string())?;
    let ciphertext = b64
        .decode(&envelope.ciphertext)
        .map_err(|_| "Invalid ciphertext".to_string())?;

    let mut key = [0u8; 32];
    Argon2::default()
        .hash_password_into(pwd.as_bytes(), &salt, &mut key)
        .map_err(|_| "Key derivation failed".to_string())?;

    let cipher = Aes256Gcm::new(aes_gcm::Key::<Aes256Gcm>::from_slice(&key));
    let nonce = Nonce::from_slice(&nonce_bytes);

    let plaintext = cipher
        .decrypt(nonce, ciphertext.as_ref())
        .map_err(|_| "Invalid password or corrupted export".to_string())?;

    let data: crate::db::models::PortableUserData =
        serde_json::from_slice(&plaintext).map_err(|_| "Invalid export schema".to_string())?;

    let db = state.0.lock().map_err(|e| e.to_string())?;

    let mut user = data.profile;
    user.id = caller_id.clone();

    // TRANSACTIONAL IMPORT
    db.conn
        .execute("BEGIN TRANSACTION", [])
        .map_err(|e| e.to_string())?;

    let result: Result<(), String> = (|| {
        let user_exists = db.get_user(&user.id).map_err(|e| e.to_string())?;
        if user_exists.is_none() {
            return Err("Cannot import data: target user account does not exist.".to_string());
        }

        for mut session in data.sessions {
            session.user_id = caller_id.clone();
            db.save_session(&session).map_err(|e| e.to_string())?;
        }

        if let Some(mut snapshot) = data.latest_snapshot {
            snapshot.user_id = caller_id.clone();
            db.save_trait_snapshot(&snapshot)
                .map_err(|e| e.to_string())?;
        }
        Ok(())
    })();

    if let Err(e) = result {
        let _ = db.conn.execute("ROLLBACK", []);
        return Err(e);
    }

    db.conn.execute("COMMIT", []).map_err(|e| e.to_string())?;

    Ok(caller_id)
}

#[tauri::command]
pub fn get_user_sessions(
    state: State<DbState>,
    session: State<ActiveSession>,
) -> Result<Vec<AssessmentSession>, String> {
    let user_id = session.get_user_id()?;
    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.get_user_sessions(&user_id).map_err(|e| e.to_string())
}

// === TRAIT COMMANDS ===

#[tauri::command]
pub fn save_trait_snapshot(
    state: State<DbState>,
    session_state: State<ActiveSession>,
    snapshot: NewTraitSnapshot,
) -> Result<String, String> {
    let user_id = session_state.get_user_id()?;
    let db = state.0.lock().map_err(|e| e.to_string())?;

    let full_snapshot = TraitSnapshot {
        id: String::new(),
        user_id,
        snapshot_date: chrono::Utc::now().to_rfc3339(),
        item_bank_version: snapshot.item_bank_version,
        big_five: snapshot.big_five,
        riasec: snapshot.riasec,
        multiple_intel: snapshot.multiple_intel,
        emotional_profile: snapshot.emotional_profile,
        confidence_score: snapshot.confidence_score,
    };

    db.save_trait_snapshot(&full_snapshot)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_latest_snapshot(
    state: State<DbState>,
    session: State<ActiveSession>,
) -> Result<Option<TraitSnapshot>, String> {
    let user_id = session.get_user_id()?;
    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.get_latest_snapshot(&user_id).map_err(|e| e.to_string())
}

// === MICRO-INTERACTION COMMANDS ===

#[tauri::command]
pub fn log_interaction(
    state: State<DbState>,
    session_state: State<ActiveSession>,
    interaction: NewMicroInteraction,
) -> Result<String, String> {
    let user_id = session_state.get_user_id()?;
    let db = state.0.lock().map_err(|e| e.to_string())?;

    let full_interaction = MicroInteraction {
        id: String::new(),
        user_id,
        interaction_type: interaction.interaction_type,
        metadata: interaction.metadata,
        emotional_signal: interaction.emotional_signal,
        timestamp: chrono::Utc::now().to_rfc3339(),
    };

    db.log_micro_interaction(&full_interaction)
        .map_err(|e| e.to_string())
}

// === CRISIS PROTOCOL COMMANDS ===

#[tauri::command]
pub fn create_crisis_event(
    state: State<DbState>,
    session: State<ActiveSession>,
    detected_at: i64,
    severity: String,
) -> Result<String, String> {
    // Crisis events are always created for the currently authenticated user.
    // The renderer cannot create a crisis event on behalf of another user.
    let user_id = session.get_user_id()?;
    let db = state.0.lock().map_err(|e| e.to_string())?;

    let event = CrisisEvent {
        id: uuid::Uuid::new_v4().to_string(),
        user_id,
        detected_at,
        severity,
        human_review_status: "pending".to_string(),
        reviewer_id: None,
        reviewer_credentials_ref: None,
        decision: None,
        teen_informed_at: None,
    };

    db.create_crisis_event(&event).map_err(|e| e.to_string())
}

#[tauri::command]
pub fn get_pending_crisis_events(
    state: State<DbState>,
    session_state: State<ActiveSession>,
) -> Result<Vec<CrisisEvent>, String> {
    let reviewer_id = session_state.get_user_id()?;

    let db = state.0.lock().map_err(|e| e.to_string())?;

    // T2/T5: Verify caller is authorized
    if !db.is_reviewer(&reviewer_id) {
        return Err("Unauthorized: Must be an authorized reviewer".to_string());
    }
    db.get_pending_crisis_events().map_err(|e| e.to_string())
}

#[tauri::command]
pub fn claim_crisis_event(
    state: State<DbState>,
    session_state: State<ActiveSession>,
    event_id: String,
) -> Result<(), String> {
    execute_claim_crisis_event(&state, &session_state, event_id)
}

pub fn execute_claim_crisis_event(
    state: &DbState,
    session_state: &ActiveSession,
    event_id: String,
) -> Result<(), String> {
    let reviewer_id = session_state.get_user_id()?;

    let db = state.0.lock().map_err(|e| e.to_string())?;

    if !db.is_reviewer(&reviewer_id) {
        return Err("Unauthorized: Must be a clinical reviewer".to_string());
    }

    db.claim_crisis_event(&event_id, &reviewer_id)
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub fn resolve_crisis_event(
    state: State<DbState>,
    session_state: State<ActiveSession>,
    event_id: String,
    reviewer_credentials_ref: String,
    decision: CrisisDecision,
    teen_informed_at: Option<i64>,
) -> Result<(), String> {
    execute_resolve_crisis_event(
        &state,
        &session_state,
        event_id,
        reviewer_credentials_ref,
        decision,
        teen_informed_at,
    )
}

pub fn execute_resolve_crisis_event(
    state: &DbState,
    session_state: &ActiveSession,
    event_id: String,
    reviewer_credentials_ref: String,
    decision: CrisisDecision,
    teen_informed_at: Option<i64>,
) -> Result<(), String> {
    // T5: Ensure the caller has a session and derive reviewer ID from it
    let reviewer_id = session_state.get_user_id()?;

    let db = state.0.lock().map_err(|e| e.to_string())?;

    // RED-003/016/017/018: Strict Reviewer Authorization
    if !db.is_reviewer(&reviewer_id) {
        return Err("Unauthorized: Must be a clinical reviewer".to_string());
    }

    // DB now atomicly checks assignment and pending status in `resolve_crisis_event`

    PolicyEngine::enforce_guardian_notification_invariant(&decision, teen_informed_at)?;

    let decision_str = match decision {
        CrisisDecision::NoAction => "NoAction",
        CrisisDecision::ResourcesOnly => "ResourcesOnly",
        CrisisDecision::GuardianNotified => {
            // ============================================================
            // GUARDIAN NOTIFICATION — STATUS: NOT IMPLEMENTED
            // ============================================================
            // This decision records that the reviewing clinician chose to
            // notify the guardian. The notification delivery mechanism
            // (push notification, SMS, email, or in-app alert) has NOT
            // been implemented. No notification is actually delivered.
            //
            // The evidence matrix MUST NOT claim this as a functional
            // safety notification until a real delivery channel exists.
            //
            // TODO(P0-safety): Implement real notification delivery before
            // any production deployment. See: docs/security-evidence-matrix.md
            // ============================================================
            log::warn!(
                "GUARDIAN NOTIFICATION — NOT IMPLEMENTED: \
                 Decision recorded for event '{}' but no notification was delivered. \
                 A real delivery mechanism must be implemented before production.",
                event_id
            );
            "GuardianNotified"
        }
    };

    db.resolve_crisis_event(
        &event_id,
        &reviewer_id,
        &reviewer_credentials_ref,
        decision_str,
        teen_informed_at,
    )
    .map_err(|e| e.to_string())
}

// === DATA MANAGEMENT COMMANDS ===

// Old export_user_data removed

#[tauri::command]
pub fn delete_user_data(
    state: State<DbState>,
    session: State<ActiveSession>,
    store: State<crate::ConversationStore>,
) -> Result<(), String> {
    let user_id = session.get_user_id()?;
    let db = state.0.lock().map_err(|e| e.to_string())?;
    db.delete_user_data(&user_id).map_err(|e| e.to_string())?;

    // RED-014: Clear the user's ConversationStore in memory
    if let Ok(mut store_guard) = store.0.lock() {
        store_guard.remove(&user_id);
    }
    Ok(())
}

#[tauri::command]
pub fn get_health_metrics(
    state: State<DbState>,
    session_state: State<ActiveSession>,
) -> Result<HealthMetrics, String> {
    let reviewer_id = session_state.get_user_id()?;

    let db = state.0.lock().map_err(|e| e.to_string())?;

    // T2: Only authorized educators can view health metrics
    if !db.is_educator(&reviewer_id) {
        return Err("Unauthorized: Must be an authorized reviewer to view metrics".to_string());
    }

    let total_users: i64 = db
        .conn
        .query_row("SELECT COUNT(*) FROM users", [], |r| r.get(0))
        .map_err(|e| e.to_string())?;

    let total_sessions: i64 = db
        .conn
        .query_row("SELECT COUNT(*) FROM sessions", [], |r| r.get(0))
        .map_err(|e| e.to_string())?;

    Ok(HealthMetrics {
        total_users,
        total_sessions,
        db_size_bytes: 0, // Would need to check file size
        encryption_status: "SQLCipher AES-256".to_string(),
    })
}

// === AUDIT LOG (INTERNAL ONLY) ===
// SECURITY: This is intentionally NOT a #[tauri::command].
// The audit trail must be server-authoritative: only backend Rust code
// may write to it. Rendering-controlled action or details strings
// would allow an authenticated user to forge audit entries.
//
// Callers: use `db.insert_audit_log(action, details)` directly from
// Rust command implementations.
