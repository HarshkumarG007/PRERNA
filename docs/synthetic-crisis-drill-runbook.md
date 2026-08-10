# Synthetic End-to-End Crisis Drill Runbook

This document details the execution of a synthetic live-fire crisis drill. It verifies that the PRERNA crisis escalation state machine correctly enforces invariants and prevents unauthorized state transitions.

> **Note:** All identities, reviewer references, and events used in this drill are strictly synthetic. No real patient data is exposed or utilized.

## 1. Drill Execution Setup

This drill is executed natively as an integration test against the PRERNA SQLite backend (`test_synthetic_crisis_drill_comprehensive`).

### Execution Command
```bash
cargo test test_synthetic_crisis_drill_comprehensive -- --nocapture
```

## 2. Tested Scenarios

The drill models a high-risk crisis signal from detection through resolution, intentionally triggering violation attempts to prove the system fails closed.

### 2.1 Positive Path (Expected Behavior)
1. **Synthetic high-risk signal**: System detects a crisis signal (e.g., from `SafetyFilter`).
2. **Detection**: Event is recorded in the database.
3. **Pending crisis event**: Event is visible to reviewers.
4. **Reviewer authentication**: A reviewer (e.g., `doc_123`) claims the event.
5. **Resolution**: Reviewer determines `GuardianNotified` and supplies credentials.
6. **Teen Notification**: Teen is informed of the impending notification.
7. **Guardian Notification**: System successfully records the notification.
8. **Audit Verification**: Event state transitions to `resolved`.

### 2.2 Negative Path A: Unclaimed Reviewer
* **Scenario**: Reviewer B attempts to resolve an event claimed by Reviewer A.
* **Expected Result**: `DENY`. The database enforces `WHERE reviewer_id = ?`.

### 2.3 Negative Path B: Guardian Notification Before Teen Notification
* **Scenario**: Reviewer attempts to resolve with `GuardianNotified` but `teen_informed_at` is `None`.
* **Expected Result**: `DENY`. The `PolicyEngine` explicitly blocks this transition.

### 2.4 Negative Path C: Unresolved Event
* **Scenario**: Attempt to notify guardian for an event that is still `pending` or not formally resolved by a reviewer.
* **Expected Result**: `DENY`. The state machine requires a human decision before any external notification logic fires.

### 2.5 Negative Path D: Unauthorized Reviewer
* **Scenario**: A user without the required credentials or tenant authorization attempts to access the event queue.
* **Expected Result**: `DENY`. (Handled via API boundary roles).

### 2.6 Negative Path E: Duplicate Notification
* **Scenario**: Attempt to resolve an already-resolved event.
* **Expected Result**: `DENY`. The database enforces `WHERE human_review_status = 'pending'`.

## 3. Actual Execution Results

```
test db::tests::test_synthetic_crisis_drill_comprehensive ... ok
```

### Trace Log:
* `[SUCCESS]` Event `synthetic_crisis_01` created successfully.
* `[SUCCESS]` Reviewer `doc_123` claimed event.
* `[DENY OBSERVED]` Negative Path A: Reviewer `doc_456` attempted to resolve event claimed by `doc_123`. Access denied as expected.
* `[DENY OBSERVED]` Negative Path B: Attempted `GuardianNotified` without teen notification. `PolicyEngine` rejected the action.
* `[DENY OBSERVED]` Negative Path E: After `doc_123` successfully resolved the event, a duplicate resolution attempt was rejected.

All invariants held. The PRERNA backend successfully isolates the crisis state and requires a strict sequence of human-gated steps before allowing guardian notifications.
