use serde::{Deserialize, Serialize};
use std::time::{SystemTime, UNIX_EPOCH};
use sha2::{Sha256, Digest};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConsentRecord {
    pub provider_reference: String,
    pub verification_method: String,
    pub status: String,
    pub issued_at: String,
    pub expires_at: Option<String>,
}

pub trait GuardianVerificationAdapter {
    fn verify_token(&self, token: &str) -> Result<ConsentRecord, String>;
}

/// A strictly non-production mock adapter that simulates email OTP verification.
/// Used only for development and testing.
pub struct MockEmailVerificationAdapter;

impl GuardianVerificationAdapter for MockEmailVerificationAdapter {
    fn verify_token(&self, token: &str) -> Result<ConsentRecord, String> {
        if !cfg!(debug_assertions) {
            return Err("Mock adapter cannot be used in production".into());
        }

        // Simulate token validation (e.g., must be 6 digits)
        if token.len() != 6 || !token.chars().all(char::is_numeric) {
            return Err("Invalid mock OTP token".into());
        }

        // Hash the token as the "provider reference" instead of storing raw PII
        let mut hasher = Sha256::new();
        hasher.update(token.as_bytes());
        let provider_reference = format!("{:x}", hasher.finalize());

        let now = SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_secs();
        let expires = now + 365 * 24 * 60 * 60; // 1 year expiry

        Ok(ConsentRecord {
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
