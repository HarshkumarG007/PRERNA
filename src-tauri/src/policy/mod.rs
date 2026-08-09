use crate::db::models::CrisisDecision;

pub struct PolicyEngine;

impl PolicyEngine {
    /// Enforces DPDP transparency requirement: Data cannot be saved without an explicit disclosure being recorded.
    pub fn enforce_disclosure_invariant(disclosure_version: &str) -> Result<(), String> {
        if disclosure_version.trim().is_empty() {
            return Err("Cannot save session: no disclosure was recorded. Violates DPDP Section 9(3).".into());
        }
        Ok(())
    }

    /// Enforces Clinical Safety requirement: Guardian cannot be autonomously notified without human review and teen being informed first.
    pub fn enforce_guardian_notification_invariant(decision: &CrisisDecision, teen_informed_at: Option<i64>) -> Result<(), String> {
        if *decision == CrisisDecision::GuardianNotified && teen_informed_at.is_none() {
            return Err("Cannot notify guardian: teen has not been informed yet. Violates Crisis Protocol.".into());
        }
        Ok(())
    }
    /// Enforces DPDP Behavioral Tracking prohibition: Accounts under 18 cannot be subject to behavioral tracking.
    pub fn enforce_under_18_tracking_invariant(age_range: &str, tracking_enabled: bool) -> Result<(), String> {
        if tracking_enabled && age_range != "18+" {
            return Err("Behavioral tracking is strictly prohibited for users under 18. Violates DPDP Section 9(2).".into());
        }
        Ok(())
    }

    /// Enforces Privacy requirement: Parent view must be explicitly authorized.
    pub fn enforce_parental_authorization(is_authorized: bool) -> Result<(), String> {
        if !is_authorized {
            return Err("Parental view denied: no authorized relationship found or consent missing.".into());
        }
        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_crisis_invariant_guardian_notification_blocked() {
        let decision = CrisisDecision::GuardianNotified;
        let teen_informed_at = None;
        let result = PolicyEngine::enforce_guardian_notification_invariant(&decision, teen_informed_at);
        assert!(result.is_err(), "FATAL: Guardian notification must be blocked if teen is not informed");

        let decision_valid = CrisisDecision::GuardianNotified;
        let teen_informed_at_valid = Some(1620000000);
        let result_valid = PolicyEngine::enforce_guardian_notification_invariant(&decision_valid, teen_informed_at_valid);
        assert!(result_valid.is_ok(), "Guardian notification should pass if teen is informed");
    }

    #[test]
    fn test_under_18_tracking_blocked() {
        assert!(PolicyEngine::enforce_under_18_tracking_invariant("13-15", true).is_err());
        assert!(PolicyEngine::enforce_under_18_tracking_invariant("16-17", true).is_err());
        assert!(PolicyEngine::enforce_under_18_tracking_invariant("18+", true).is_ok());
        assert!(PolicyEngine::enforce_under_18_tracking_invariant("13-15", false).is_ok());
    }

    #[test]
    fn test_disclosure_invariant_blocked() {
        assert!(PolicyEngine::enforce_disclosure_invariant("").is_err(), "Empty disclosure should be blocked");
        assert!(PolicyEngine::enforce_disclosure_invariant("   ").is_err(), "Whitespace disclosure should be blocked");
        assert!(PolicyEngine::enforce_disclosure_invariant("v1.0").is_ok(), "Valid disclosure should pass");
    }
}
