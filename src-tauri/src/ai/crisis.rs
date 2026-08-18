use crate::db::models::{CrisisEvent, CrisisOrigin, CrisisState};
use anyhow::Result;

pub struct CrisisManager;

impl Default for CrisisManager {
    fn default() -> Self {
        Self::new()
    }
}

impl CrisisManager {
    pub fn new() -> Self {
        Self
    }

    /// Evaluates a transition, enforcing strict AI boundaries
    pub fn transition_crisis(
        &self,
        event: &mut CrisisEvent,
        new_state: CrisisState,
        actor: CrisisOrigin,
    ) -> Result<()> {
        // Enforce state transition rules
        event
            .state
            .transition_to(&new_state, &actor)
            .map_err(|e| anyhow::anyhow!("{}", e))?;

        // Apply transition
        event.state = new_state;

        Ok(())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn dummy_event() -> CrisisEvent {
        CrisisEvent {
            id: "evt1".into(),
            user_id: "u1".into(),
            detected_at: 0,
            severity: "HIGH".into(),
            state: CrisisState::SignalDetected,
            origin: CrisisOrigin::SYSTEM,
            cognitive_decision_id: None,
            reviewer_id: None,
            reviewer_credentials_ref: None,
            decision: None,
            teen_informed_at: None,
        }
    }

    #[test]
    fn test_valid_human_escalation() {
        let mut evt = dummy_event();
        evt.state = CrisisState::HumanReview;

        let mgr = CrisisManager::new();
        let res = mgr.transition_crisis(&mut evt, CrisisState::Escalate, CrisisOrigin::HUMAN);

        assert!(res.is_ok());
        assert_eq!(evt.state, CrisisState::Escalate);
    }

    #[test]
    fn test_ai_cannot_escalate_from_human_review() {
        let mut evt = dummy_event();
        evt.state = CrisisState::HumanReview;

        let mgr = CrisisManager::new();
        let res = mgr.transition_crisis(&mut evt, CrisisState::Escalate, CrisisOrigin::AI);

        assert!(res.is_err());
        assert!(res
            .unwrap_err()
            .to_string()
            .contains("AI cannot authorize state transition"));
        assert_eq!(evt.state, CrisisState::HumanReview); // State unchanged
    }

    #[test]
    fn test_ai_cannot_clear_crisis() {
        let mut evt = dummy_event();
        evt.state = CrisisState::HumanReview;

        let mgr = CrisisManager::new();
        let res = mgr.transition_crisis(&mut evt, CrisisState::Cleared, CrisisOrigin::AI);

        assert!(res.is_err());
        assert!(res
            .unwrap_err()
            .to_string()
            .contains("AI cannot authorize state transition"));
    }
}
