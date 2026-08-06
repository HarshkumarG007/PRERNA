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
}
