use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::time::{SystemTime, UNIX_EPOCH};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsentRecord {
    pub teen_user_id: String,
    pub provider_reference: String,
    pub verification_method: String,
    pub status: String,
    pub issued_at: String,
    pub expires_at: Option<String>,
}

pub trait GuardianVerificationAdapter {
    fn verify_token(&self, token: &str) -> Result<ConsentRecord, String>;
}

/// # Consent States
/// 1. Mock (MockEmailVerificationAdapter): Development-only simulation. It does not establish that the submitting person is the parent/legal guardian and must not be used as evidence of production parental verification.
/// 2. Provider-bound: The architecture supports authenticated identity binding.
/// 3. Production verified: Real provider assertion + cryptographic/authenticated verification (pending implementation).
/// 
/// A strictly non-production mock adapter that simulates verification.
/// Used only for development and testing.
pub struct MockEmailVerificationAdapter;

impl GuardianVerificationAdapter for MockEmailVerificationAdapter {
    fn verify_token(&self, token: &str) -> Result<ConsentRecord, String> {
        if !cfg!(debug_assertions) {
            return Err("Mock adapter cannot be used in production".into());
        }

        // Token format for mock: "OTP:teen_user_id"
        let parts: Vec<&str> = token.split(':').collect();
        if parts.len() != 2 {
            return Err("Invalid mock token format. Expected OTP:teen_id".into());
        }

        let otp = parts[0];
        let teen_user_id = parts[1].to_string();

        // Simulate token validation (e.g., must be 6 digits)
        if otp.len() != 6 || !otp.chars().all(char::is_numeric) {
            return Err("Invalid mock OTP token".into());
        }

        // Hash the token as the "provider reference" instead of storing raw PII
        let mut hasher = Sha256::new();
        hasher.update(token.as_bytes());
        let provider_reference = format!("{:x}", hasher.finalize());

        let now = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let expires = now + 365 * 24 * 60 * 60; // 1 year expiry

        Ok(ConsentRecord {
            teen_user_id,
            provider_reference,
            verification_method: "mock_email_otp".to_string(),
            status: "verified".to_string(),
            issued_at: now.to_string(),
            expires_at: Some(expires.to_string()),
        })
    }
}

pub struct ProductionGuardianVerificationAdapter;

impl GuardianVerificationAdapter for ProductionGuardianVerificationAdapter {
    fn verify_token(&self, _token: &str) -> Result<ConsentRecord, String> {
        // P4-1 Requirement: The production GuardianVerificationAdapter should return an explicit
        // "provider not configured" state rather than silently falling back to mock verification.
        Err("Guardian verification provider not yet configured for production".into())
    }
}

pub struct ConsentService {
    adapter: Box<dyn GuardianVerificationAdapter + Send + Sync>,
}

impl ConsentService {
    pub fn new() -> Self {
        if cfg!(debug_assertions) {
            Self {
                adapter: Box::new(MockEmailVerificationAdapter),
            }
        } else {
            Self {
                adapter: Box::new(ProductionGuardianVerificationAdapter),
            }
        }
    }

    pub fn process_consent_token(&self, token: &str) -> Result<ConsentRecord, String> {
        // Here we could add additional global invariant checks
        self.adapter.verify_token(token)
    }
}
