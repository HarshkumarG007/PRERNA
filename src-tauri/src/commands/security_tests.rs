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
}
