use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use app_lib::ai::LLMState;
use app_lib::commands::ai::{execute_mentor_chat, ChatRequest};
use app_lib::commands::{execute_claim_crisis_event, execute_resolve_crisis_event};
use app_lib::db::models::{CrisisDecision, TraitSnapshot};
use app_lib::db::{Database, DbState};
use app_lib::{ActiveSession, AuthStatus, ConversationStore};

fn setup_test_env(
    auth_status: AuthStatus,
) -> (LLMState, DbState, ActiveSession, ConversationStore) {
    let db = Database::new_in_memory("test_secret").unwrap();

    // Pre-populate users so foreign keys (e.g. from crisis_events) don't fail
    db.conn.execute("INSERT INTO users (id, username, password_hash, created_at, role) VALUES ('USER_A', 'user_a', 'hash', '0', 'teen')", ()).unwrap();
    db.conn.execute("INSERT INTO users (id, username, password_hash, created_at, role) VALUES ('USER_B', 'user_b', 'hash', '0', 'teen')", ()).unwrap();
    db.conn.execute("INSERT INTO users (id, username, password_hash, created_at, role) VALUES ('REV_A', 'rev_a', 'hash', '0', 'reviewer')", ()).unwrap();
    db.conn.execute("INSERT INTO users (id, username, password_hash, created_at, role) VALUES ('REV_B', 'rev_b', 'hash', '0', 'reviewer')", ()).unwrap();

    let db_state = DbState(Mutex::new(db));
    let llm_state = LLMState(Arc::new(Mutex::new(None))); // Model not loaded
    let session = ActiveSession(Mutex::new(auth_status));
    let store = ConversationStore(Mutex::new(HashMap::new()));

    (llm_state, db_state, session, store)
}

fn create_user_profile(db_state: &DbState, user_id: &str) {
    let db_lock = db_state.0.lock().unwrap();
    let profile = TraitSnapshot {
        id: format!("snap_{}", user_id),
        user_id: user_id.to_string(),
        snapshot_date: chrono::Utc::now().to_rfc3339(),
        ..Default::default()
    };
    db_lock.save_trait_snapshot(&profile).unwrap();
}

#[test]
fn test_t15_1_crisis_persistence() {
    let (llm_state, db_state, session, store) =
        setup_test_env(AuthStatus::Authenticated("USER_A".to_string()));

    let request = ChatRequest {
        message: "I feel like giving up on everything forever".to_string(), // Crisis message
        conversation_id: None,
    };

    let result = execute_mentor_chat(&llm_state, &db_state, &session, &store, request);

    // Verify response is a crisis response
    assert!(result.is_ok());
    let response = result.unwrap();
    assert_eq!(response.sentiment, "crisis");

    // Verify it was persisted
    let db_lock = db_state.0.lock().unwrap();
    let events = db_lock.get_pending_crisis_events().unwrap();

    assert_eq!(
        events.len(),
        1,
        "Exactly one crisis event should be created"
    );
    assert_eq!(events[0].user_id, "USER_A");
    assert_eq!(events[0].severity, "high");
    assert_eq!(events[0].human_review_status, "pending");
}

#[test]
fn test_t15_2_identity_authority() {
    let (llm_state, db_state, session, store) =
        setup_test_env(AuthStatus::Authenticated("USER_A".to_string()));

    let request = ChatRequest {
        message: "I feel like giving up on everything forever".to_string(),
        conversation_id: Some("conv_123".to_string()),
    };

    let _ = execute_mentor_chat(&llm_state, &db_state, &session, &store, request);

    let db_lock = db_state.0.lock().unwrap();
    let events = db_lock.get_pending_crisis_events().unwrap();

    assert_eq!(events.len(), 1);
    assert_eq!(
        events[0].user_id, "USER_A",
        "Ownership must be derived from ActiveSession"
    );
}

#[test]
fn test_t15_3_persistence_failure() {
    let (llm_state, db_state, session, store) =
        setup_test_env(AuthStatus::Authenticated("USER_A".to_string()));

    // Drop the table to simulate infrastructure fault
    {
        let db_lock = db_state.0.lock().unwrap();
        db_lock
            .conn
            .execute("DROP TABLE crisis_events", [])
            .unwrap();
    }

    let request = ChatRequest {
        message: "I feel like giving up on everything forever".to_string(),
        conversation_id: None,
    };

    let result = execute_mentor_chat(&llm_state, &db_state, &session, &store, request);
    assert!(result.is_err(), "Persistence failure must not be swallowed");
}

#[test]
fn test_t15_4_non_crisis() {
    let (llm_state, db_state, session, store) =
        setup_test_env(AuthStatus::Authenticated("USER_A".to_string()));
    create_user_profile(&db_state, "USER_A");

    let request = ChatRequest {
        message: "Hello, how are you?".to_string(), // Benign message
        conversation_id: None,
    };

    let result = execute_mentor_chat(&llm_state, &db_state, &session, &store, request);

    {
        let db_lock = db_state.0.lock().unwrap();
        let events = db_lock.get_pending_crisis_events().unwrap();
        assert_eq!(
            events.len(),
            0,
            "Benign message must not create a crisis event"
        );
    }

    assert!(result.is_err()); // Errors because AI model isn't loaded
}

#[test]
fn test_t15_5_unauthenticated() {
    let (llm_state, db_state, session, store) = setup_test_env(AuthStatus::None);

    let request = ChatRequest {
        message: "I feel like giving up on everything forever".to_string(),
        conversation_id: None,
    };

    let result = execute_mentor_chat(&llm_state, &db_state, &session, &store, request);

    assert!(result.is_err(), "Must reject unauthenticated users");

    let db_lock = db_state.0.lock().unwrap();
    let events = db_lock.get_pending_crisis_events().unwrap();
    assert_eq!(
        events.len(),
        0,
        "No event should be created for unauthenticated request"
    );
}

#[test]
fn test_t15_6_pending_mfa() {
    let (llm_state, db_state, session, store) =
        setup_test_env(AuthStatus::PendingMFA("USER_A".to_string()));

    let request = ChatRequest {
        message: "I feel like giving up on everything forever".to_string(),
        conversation_id: None,
    };

    let result = execute_mentor_chat(&llm_state, &db_state, &session, &store, request);

    assert!(result.is_err(), "Must reject PendingMFA users");

    let db_lock = db_state.0.lock().unwrap();
    let events = db_lock.get_pending_crisis_events().unwrap();
    assert_eq!(
        events.len(),
        0,
        "No event should be created for PendingMFA request"
    );
}

#[test]
fn test_t15_7_cross_user_isolation() {
    let (llm_state, db_state, session_a, store) =
        setup_test_env(AuthStatus::Authenticated("USER_A".to_string()));
    let session_b = ActiveSession(Mutex::new(AuthStatus::Authenticated("USER_B".to_string())));

    // User A generates an event
    let req_a = ChatRequest {
        message: "crisis!".to_string(),
        conversation_id: None,
    };
    let _ = execute_mentor_chat(&llm_state, &db_state, &session_a, &store, req_a);

    let event_id = {
        let db_lock = db_state.0.lock().unwrap();
        let events = db_lock.get_pending_crisis_events().unwrap();
        assert_eq!(events[0].user_id, "USER_A");
        events[0].id.clone()
    };

    // Try to resolve the event using User B's session. User B is not a reviewer, so it should fail.
    // Even if User B was a reviewer, it shouldn't allow them unless they are authorized.
    // In PRERNA, users cannot read/modify events via API; reviewers do it.
    let result = execute_resolve_crisis_event(
        &db_state,
        &session_b, // User B
        event_id.clone(),
        "cred_ref".to_string(),
        CrisisDecision::NoAction,
        None,
    );
    assert!(result.is_err(), "User B cannot resolve User A's event");
}

#[test]
fn test_t15_8_duplicate_signal_preservation() {
    let (llm_state, db_state, session, store) =
        setup_test_env(AuthStatus::Authenticated("USER_A".to_string()));

    let request1 = ChatRequest {
        message: "I am in crisis".to_string(),
        conversation_id: None,
    };
    let request2 = ChatRequest {
        message: "I am in crisis".to_string(),
        conversation_id: None,
    };

    let _ = execute_mentor_chat(&llm_state, &db_state, &session, &store, request1);
    let _ = execute_mentor_chat(&llm_state, &db_state, &session, &store, request2);

    let db_lock = db_state.0.lock().unwrap();
    let events = db_lock.get_pending_crisis_events().unwrap();

    assert_eq!(
        events.len(),
        2,
        "Duplicate signals must generate distinct events"
    );
    assert_ne!(events[0].id, events[1].id, "Event IDs must be unique");
}

#[test]
fn test_t15_9_reviewer_ownership() {
    let (_, db_state, session_rev_a, _) =
        setup_test_env(AuthStatus::Authenticated("REV_A".to_string()));
    let session_rev_b = ActiveSession(Mutex::new(AuthStatus::Authenticated("REV_B".to_string())));

    // Create event directly
    let event_id = "event_123".to_string();
    {
        let db_lock = db_state.0.lock().unwrap();
        db_lock.conn.execute("INSERT INTO crisis_events (id, user_id, detected_at, severity, human_review_status) VALUES (?, 'USER_A', 0, 'high', 'pending')", rusqlite::params![event_id]).unwrap();
    }

    // Rev A claims
    let claim_res = execute_claim_crisis_event(&db_state, &session_rev_a, event_id.clone());
    assert!(claim_res.is_ok());

    // Rev B tries to resolve -> DENY
    let resolve_b = execute_resolve_crisis_event(
        &db_state,
        &session_rev_b,
        event_id.clone(),
        "ref".to_string(),
        CrisisDecision::NoAction,
        None,
    );
    assert!(
        resolve_b.is_err(),
        "Reviewer B cannot resolve Reviewer A's event"
    );

    // Rev A tries to resolve -> ALLOW
    let resolve_a = execute_resolve_crisis_event(
        &db_state,
        &session_rev_a,
        event_id.clone(),
        "ref".to_string(),
        CrisisDecision::NoAction,
        None,
    );
    assert!(
        resolve_a.is_ok(),
        "Reviewer A should be allowed to resolve their own event"
    );
}

#[test]
fn test_t15_10_notification_ordering() {
    let (_, db_state, session_rev, _) =
        setup_test_env(AuthStatus::Authenticated("REV_A".to_string()));

    let event_id = "event_456".to_string();
    {
        let db_lock = db_state.0.lock().unwrap();
        db_lock.conn.execute("INSERT INTO crisis_events (id, user_id, detected_at, severity, human_review_status) VALUES (?, 'USER_A', 0, 'high', 'pending')", rusqlite::params![event_id]).unwrap();
    }

    // Pending state -> Guardian notification -> DENY
    let notify_pending = execute_resolve_crisis_event(
        &db_state,
        &session_rev,
        event_id.clone(),
        "ref".to_string(),
        CrisisDecision::GuardianNotified,
        None,
    );
    assert!(
        notify_pending.is_err(),
        "Cannot notify guardian while in pending state (unclaimed)"
    );

    // Rev A claims
    execute_claim_crisis_event(&db_state, &session_rev, event_id.clone()).unwrap();

    // Claimed state -> Guardian notification without teen notification -> DENY
    let notify_claimed = execute_resolve_crisis_event(
        &db_state,
        &session_rev,
        event_id.clone(),
        "ref".to_string(),
        CrisisDecision::GuardianNotified,
        None,
    );
    assert!(
        notify_claimed.is_err(),
        "Cannot notify guardian before teen is notified"
    );

    // Claimed state -> Resolve -> ALLOW
    let notify_valid = execute_resolve_crisis_event(
        &db_state,
        &session_rev,
        event_id.clone(),
        "ref".to_string(),
        CrisisDecision::GuardianNotified,
        Some(123456789),
    );
    assert!(
        notify_valid.is_ok(),
        "Guardian notification allowed when teen is informed"
    );
}
