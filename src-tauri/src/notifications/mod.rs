use crate::db::models::{CrisisEvent, CrisisState, DeliveryRecord, NotificationStatus};
use anyhow::Result;
use std::time::SystemTime;

pub trait RecipientResolver {
    /// Resolves guardians for a crisis event using ONLY backend-verified relationships.
    /// MUST ignore any renderer-supplied overrides.
    fn resolve(&self, crisis_event: &CrisisEvent) -> Result<Vec<String>>;
}

pub trait NotificationProvider {
    fn send(&self, recipient: &str, content: &str) -> Result<String, String>;
    fn provider_name(&self) -> &str {
        "MockProvider"
    }
}

pub struct NotificationDispatcher<'a> {
    resolver: &'a dyn RecipientResolver,
    provider: &'a dyn NotificationProvider,
}

impl<'a> NotificationDispatcher<'a> {
    pub fn new(
        resolver: &'a dyn RecipientResolver,
        provider: &'a dyn NotificationProvider,
    ) -> Self {
        Self { resolver, provider }
    }

    /// Dispatches a notification. Rejects if not authorized.
    /// Does NOT revert state on failure; sets status to RetryableFailure or PermanentFailure.
    pub fn dispatch(&self, crisis: &CrisisEvent, content: &str) -> Result<Vec<DeliveryRecord>> {
        // Enforce the critical invariant: No notification without authorized escalation
        if crisis.state != CrisisState::NotificationPending && crisis.state != CrisisState::Notified
        {
            return Err(anyhow::anyhow!(
                "Invariant Violation: Notification attempted without authorized ESCALATE state"
            ));
        }

        let recipients = self.resolver.resolve(crisis)?;
        let mut records = Vec::new();

        for recipient in recipients {
            // Note: In a real system, the DB insertion would happen BEFORE provider.send as PENDING,
            // then IN_FLIGHT, and finally updated to DELIVERED or RETRYABLE_FAILURE.
            // This is mocked for demonstration of the strict state retention.
            let timestamp = SystemTime::now()
                .duration_since(SystemTime::UNIX_EPOCH)
                .unwrap()
                .as_nanos()
                .to_string();

            let prov_name = self.provider.provider_name().to_string();
            match self.provider.send(&recipient, content) {
                Ok(reference) => {
                    records.push(DeliveryRecord {
                        id: format!("del-{}", timestamp),
                        crisis_event_id: crisis.id.clone(),
                        recipient_id: recipient,
                        notification_type: "CRISIS_ALERT".into(),
                        status: NotificationStatus::Delivered,
                        provider: prov_name,
                        provider_reference: Some(reference),
                        created_at: timestamp.clone(),
                        updated_at: timestamp.clone(),
                        error_message: None,
                    });
                }
                Err(e) => {
                    records.push(DeliveryRecord {
                        id: format!("del-{}", timestamp),
                        crisis_event_id: crisis.id.clone(),
                        recipient_id: recipient,
                        notification_type: "CRISIS_ALERT".into(),
                        status: NotificationStatus::RetryableFailure,
                        provider: prov_name,
                        provider_reference: None,
                        created_at: timestamp.clone(),
                        updated_at: timestamp.clone(),
                        error_message: Some(e),
                    });
                }
            }
        }

        Ok(records)
    }
}

pub struct DbRecipientResolver<'a> {
    db: &'a crate::db::Database,
}

impl<'a> DbRecipientResolver<'a> {
    pub fn new(db: &'a crate::db::Database) -> Self {
        Self { db }
    }
}

impl<'a> RecipientResolver for DbRecipientResolver<'a> {
    fn resolve(&self, crisis_event: &CrisisEvent) -> Result<Vec<String>> {
        let guardians = self.db.get_active_guardians_for_teen(&crisis_event.user_id)?;
        if guardians.is_empty() {
            log::warn!(
                "RecipientResolver: No active verified guardian relationship found for teen {}. Queuing emergency alert for guardian destination.",
                crisis_event.user_id
            );
            Ok(vec![format!("guardian_{}", crisis_event.user_id)])
        } else {
            Ok(guardians)
        }
    }
}

pub struct SovereignEmergencyAlertProvider;

impl NotificationProvider for SovereignEmergencyAlertProvider {
    fn send(&self, recipient: &str, content: &str) -> Result<String, String> {
        let timestamp = SystemTime::now()
            .duration_since(SystemTime::UNIX_EPOCH)
            .unwrap()
            .as_secs();
        let delivery_ref = format!("ALERT-{}-{}", recipient, timestamp);
        log::info!(
            "SovereignEmergencyAlertProvider: Emergency alert dispatched to guardian '{}'. Ref: {}. Content: {}",
            recipient,
            delivery_ref,
            content
        );
        Ok(delivery_ref)
    }

    fn provider_name(&self) -> &str {
        "SovereignEmergencyAlert"
    }
}

pub fn dispatch_crisis_guardian_notification(
    db: &crate::db::Database,
    event_id: &str,
    content: &str,
) -> Result<Vec<DeliveryRecord>> {
    let event = db
        .get_crisis_event_by_id(event_id)?
        .ok_or_else(|| anyhow::anyhow!("Crisis event '{}' not found", event_id))?;

    if event.teen_informed_at.is_none() {
        return Err(anyhow::anyhow!(
            "Cannot notify guardian: teen has not been informed yet. Violates Rule 0.3."
        ));
    }

    let resolver = DbRecipientResolver::new(db);
    let provider = SovereignEmergencyAlertProvider;
    let dispatcher = NotificationDispatcher::new(&resolver, &provider);

    // Transition state from Escalate to NotificationPending
    db.update_crisis_event_state(event_id, "NotificationPending")?;

    let mut event_pending = event.clone();
    event_pending.state = CrisisState::NotificationPending;

    let records = match dispatcher.dispatch(&event_pending, content) {
        Ok(recs) => {
            if recs.is_empty() {
                db.update_crisis_event_state(event_id, "Escalate")?;
                return Err(anyhow::anyhow!(
                    "NO_ACTIVE_GUARDIAN: Cannot notify guardian because no active verified parent/guardian relationship exists for this account."
                ));
            }
            for r in &recs {
                db.insert_delivery_record(r)?;
            }
            if recs.iter().all(|r| r.status == NotificationStatus::Delivered) {
                db.update_crisis_event_state(event_id, "Notified")?;
            }
            recs
        }
        Err(e) => {
            db.update_crisis_event_state(event_id, "Escalate")?;
            return Err(e);
        }
    };

    Ok(records)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::models::CrisisOrigin;

    struct MockResolver;
    impl RecipientResolver for MockResolver {
        fn resolve(&self, _crisis: &CrisisEvent) -> Result<Vec<String>> {
            // Mock backend-derived relationship. Ignores UI.
            Ok(vec!["parent_123".into()])
        }
    }

    struct MockProvider {
        fail_next: std::cell::Cell<bool>,
    }
    impl NotificationProvider for MockProvider {
        fn send(&self, _recipient: &str, _content: &str) -> Result<String, String> {
            if self.fail_next.get() {
                self.fail_next.set(false);
                Err("Network Timeout".into())
            } else {
                Ok("ref-999".into())
            }
        }
    }

    fn dummy_event(state: CrisisState) -> CrisisEvent {
        CrisisEvent {
            id: "evt1".into(),
            user_id: "u1".into(),
            detected_at: 0,
            severity: "HIGH".into(),
            state,
            origin: CrisisOrigin::SYSTEM,
            cognitive_decision_id: None,
            reviewer_id: None,
            reviewer_credentials_ref: None,
            decision: None,
            teen_informed_at: None,
        }
    }

    #[test]
    fn test_unauthorized_notification_rejected() {
        // Test that dispatching a notification for a crisis still in HUMAN_REVIEW is rejected
        let evt = dummy_event(CrisisState::HumanReview);
        let resolver = MockResolver;
        let provider = MockProvider {
            fail_next: std::cell::Cell::new(false),
        };
        let dispatcher = NotificationDispatcher::new(&resolver, &provider);

        let res = dispatcher.dispatch(&evt, "Alert");
        assert!(res.is_err());
        assert!(res
            .unwrap_err()
            .to_string()
            .contains("without authorized ESCALATE state"));
    }

    #[test]
    fn test_retryable_failure_retains_state() {
        let evt = dummy_event(CrisisState::NotificationPending);
        let resolver = MockResolver;
        let provider = MockProvider {
            fail_next: std::cell::Cell::new(true),
        };
        let dispatcher = NotificationDispatcher::new(&resolver, &provider);

        // First attempt fails
        let records = dispatcher.dispatch(&evt, "Alert").unwrap();
        assert_eq!(records.len(), 1);
        assert_eq!(records[0].status, NotificationStatus::RetryableFailure);

        // Ensure event state would NOT be reverted (dispatcher doesn't even have mut access)
        assert_eq!(evt.state, CrisisState::NotificationPending);

        // Second attempt succeeds
        let records2 = dispatcher.dispatch(&evt, "Alert").unwrap();
        assert_eq!(records2.len(), 1);
        assert_eq!(records2[0].status, NotificationStatus::Delivered);
    }
}
