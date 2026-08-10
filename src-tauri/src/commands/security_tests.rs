#[cfg(test)]
mod tests {
    use crate::db::models::*;
    use crate::policy::PolicyEngine;

    // This file acts as an independent security audit module simulating the IPC boundary tests
    // specifically checking that the invariants hold regardless of what a malicious frontend sends.

    #[test]
    fn test_ipc_crisis_guardian_notification_bypass() {
        // Simulating a malicious IPC call attempting to resolve a crisis event
        // with GuardianNotified but without teen_informed_at being set.
        let malicious_decision = CrisisDecision::GuardianNotified;
        let missing_teen_informed_at: Option<i64> = None;

        let ipc_result = PolicyEngine::enforce_guardian_notification_invariant(
            &malicious_decision,
            missing_teen_informed_at
        );

        // The audit MUST prove this returns an error at the Rust boundary, failing the IPC command
        assert!(
            ipc_result.is_err(),
            "SECURITY VULNERABILITY: Frontend bypassed Guardian Notification invariant!"
        );

        let expected_error = ipc_result.unwrap_err();
        assert!(
            expected_error.contains("teen has not been informed"),
            "Error message must explicitly cite the Crisis Protocol invariant"
        );
    }

    #[test]
    fn test_ipc_parent_firewall_bypass() {
        // Simulating an unauthorized IPC call trying to get parent safe view
        let is_authorized = false;
        let ipc_result = PolicyEngine::enforce_parental_authorization(is_authorized);

        assert!(
            ipc_result.is_err(),
            "SECURITY VULNERABILITY: Frontend bypassed parent authorization firewall!"
        );
    }

    #[test]
    fn test_ipc_under_18_behavioral_tracking() {
        // Simulating a malicious IPC call attempting to enable tracking on a 15-year-old
        let age = "13-15";
        let force_enable_tracking = true;

        let ipc_result = PolicyEngine::enforce_under_18_tracking_invariant(
            age,
            force_enable_tracking
        );

        assert!(
            ipc_result.is_err(),
            "SECURITY VULNERABILITY: DPDP Section 9(2) tracking prohibition bypassed!"
        );
    }

    #[test]
    fn test_t6_safety_filter_output() {
        let filter = crate::ai::safety::SafetyFilter::new();
        
        // 1. Diagnostics should be caught
        assert!(
            filter.check("You are suffering from ADHD.").is_err(),
            "VULNERABILITY (T6): Filter failed to catch unauthorized diagnostic claim"
        );
        
        // 2. Claims of humanity should be caught
        assert!(
            filter.check("I am a living being who understands you.").is_err(),
            "VULNERABILITY (T6): Filter failed to catch AI overclaiming humanity"
        );

        // 3. Normal response should pass
        assert!(
            filter.check("I hear what you're saying, that sounds difficult.").is_ok(),
            "FALSE POSITIVE (T6): Filter rejected an innocent response"
        );
    }

    #[test]
    fn test_t10_crisis_detection_robustness() {
        let filter = crate::ai::safety::SafetyFilter::new();
        
        // Explicit Tier 1 statements
        assert!(filter.detect_crisis("I want to die"));
        assert!(filter.detect_crisis("mai mar jaana chahta hoon")); // Hinglish check
        
        // Broadened Tier 2 statements
        assert!(filter.detect_crisis("I can't go on anymore"));
        
        // Innocent statements shouldn't flag (conservative thresholds)
        assert!(!filter.detect_crisis("I had a bad day"));
    }
}
