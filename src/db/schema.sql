-- =======================================================================
-- [AUTO-GENERATED REFERENCE ONLY - DO NOT EDIT]
-- The true source of truth is src-tauri/src/db/schema.rs
-- This file exists solely for frontend reference of the database layout.
-- =======================================================================

-- Users
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    created_at TIMESTAMP,
    age_declared INTEGER,
    account_type TEXT CHECK(account_type IN ('under_18', 'adult')),
    parent_consent_id TEXT REFERENCES parent_consents(id), -- NULL for adult accounts
    region TEXT,
    language TEXT DEFAULT 'en'
);

-- Parental consent records (new — required for DPDP Section 9 compliance)
CREATE TABLE parent_consents (
    id TEXT PRIMARY KEY,
    parent_verified_identity_ref TEXT, -- reference to the verification signal used
    consented_at TIMESTAMP,
    disclosure_version TEXT, -- which version of the plain-language disclosure was shown
    scope JSON, -- exactly what was consented to
    revoked_at TIMESTAMP -- NULL unless revoked; revocation must be honored immediately
);

-- Assessment sessions (each tied to its OWN disclosure, not a blanket one)
CREATE TABLE sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    session_type TEXT CHECK(session_type IN ('life_quest', 'skill_arena', 'mood_mirror', 'social_compass', 'body_clock')),
    disclosure_shown_id TEXT, -- which Section 7 disclosure was shown before this session
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    choices JSON, -- no longer described as needing to be hidden from the user; visible to the user in their own activity history
    derived_traits JSON
);

-- Trait profiles
CREATE TABLE trait_snapshots (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    snapshot_date TIMESTAMP,
    big_five JSON,
    riasec JSON,
    multiple_intel JSON,
    emotional_profile JSON,
    confidence_score REAL
);

-- Recommendations
CREATE TABLE recommendations (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    category TEXT CHECK(category IN ('career', 'skill', 'mental_health', 'physical', 'social')),
    content TEXT,
    reasoning TEXT,
    accepted BOOLEAN,
    completed BOOLEAN,
    created_at TIMESTAMP
);

-- Crisis escalation events (new — separate, stricter-access table)
CREATE TABLE crisis_events (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    detected_at TIMESTAMP,
    human_review_status TEXT CHECK(human_review_status IN ('pending', 'reviewed_no_action', 'reviewed_resources_only', 'reviewed_guardian_notified')),
    reviewer_ref TEXT, -- which trained reviewer handled it — never blank for a notified case
    teen_informed_at TIMESTAMP -- must be non-null before or at the moment of any guardian notification
);

-- Data access audit log (new — supports the user-accessible audit trail from Section 10)
CREATE TABLE access_audit_log (
    id TEXT PRIMARY KEY,
    user_id TEXT REFERENCES users(id),
    accessed_by TEXT CHECK(accessed_by IN ('self', 'parent_dashboard', 'system_process')),
    data_scope TEXT,
    accessed_at TIMESTAMP
);
