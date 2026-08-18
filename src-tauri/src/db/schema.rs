pub const SCHEMA_SQL: &str = r#"
-- Enable foreign keys
PRAGMA foreign_keys = ON;

-- Users table (anonymous by default but can be fully authenticated)
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TEXT NOT NULL,
    age_range TEXT CHECK(age_range IN ('13-15', '16-18', '19-22')),
    region TEXT, -- encrypted
    language TEXT DEFAULT 'en',
    encryption_key_hash TEXT,
    last_sync TEXT,
    mfa_secret TEXT,
    mfa_enabled BOOLEAN DEFAULT 0,
    role TEXT NOT NULL DEFAULT 'teen',
    tenant_id TEXT
);

-- Assessment Sessions (gamified interactions)
CREATE TABLE IF NOT EXISTS sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    session_type TEXT CHECK(session_type IN ('life_quest', 'skill_arena', 'mood_mirror', 'social_compass', 'body_clock', 'unified_profile')),
    started_at TEXT NOT NULL,
    completed_at TEXT,
    raw_choices TEXT, -- encrypted JSON
    derived_traits TEXT, -- encrypted JSON
    disclosure_version TEXT NOT NULL,
    disclosure_shown_at INTEGER NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Trait Profiles (evolving over time)
CREATE TABLE IF NOT EXISTS trait_snapshots (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    snapshot_date TEXT NOT NULL,
    item_bank_version TEXT DEFAULT 'v2-ipip-onet-2026',
    big_five TEXT, -- JSON
    riasec TEXT, -- JSON
    multiple_intel TEXT, -- JSON
    emotional_profile TEXT, -- JSON
    confidence_score REAL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Recommendations
CREATE TABLE IF NOT EXISTS recommendations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    category TEXT CHECK(category IN ('career', 'skill', 'mental_health', 'physical', 'social')),
    content TEXT NOT NULL,
    reasoning TEXT,
    accepted BOOLEAN DEFAULT 0,
    completed BOOLEAN DEFAULT 0,
    created_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Crisis Events (Pending Human Review)
CREATE TABLE IF NOT EXISTS crisis_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    detected_at INTEGER NOT NULL,
    severity TEXT NOT NULL,
    human_review_status TEXT DEFAULT 'pending',
    reviewer_id TEXT,
    reviewer_credentials_ref TEXT,
    decision TEXT,
    teen_informed_at INTEGER,
    resolved_by TEXT,
    resolved_at TEXT,
    notes TEXT, -- encrypted JSON
    -- P1 - POLICY DECISION REQUIRED: ON DELETE CASCADE currently forces hard-deletion pending ethics review on de-identified retention.
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Daily Check-ins (gamified data)
CREATE TABLE IF NOT EXISTS micro_interactions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    interaction_type TEXT NOT NULL,
    metadata TEXT, -- encrypted JSON
    emotional_signal REAL,
    timestamp TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_snapshots_user_date ON trait_snapshots(user_id, snapshot_date);
CREATE INDEX IF NOT EXISTS idx_interactions_user_time ON micro_interactions(user_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_recommendations_user ON recommendations(user_id);

-- Audit log (local only, no PII)
CREATE TABLE IF NOT EXISTS audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    timestamp TEXT NOT NULL,
    action TEXT NOT NULL,
    details TEXT
);

-- Parent Sharing Preferences
CREATE TABLE IF NOT EXISTS parent_sharing_preferences (
    user_id TEXT PRIMARY KEY,
    preferences TEXT NOT NULL, -- JSON
    last_updated TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Schema Migrations
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    applied_at TEXT NOT NULL
);

-- Parent-Teen Relationships
CREATE TABLE IF NOT EXISTS parent_teen_relationships (
    id TEXT PRIMARY KEY,
    parent_user_id TEXT NOT NULL,
    teen_user_id TEXT NOT NULL,
    established_at TEXT NOT NULL,
    consent_record_id TEXT,
    relationship_id TEXT,
    verification_method TEXT,
    status TEXT DEFAULT 'pending',
    issued_at TEXT,
    expires_at TEXT,
    verified_at TEXT,
    revoked_at TEXT,
    provider_reference TEXT,
    UNIQUE(parent_user_id, teen_user_id),
    FOREIGN KEY (parent_user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (teen_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Orphaned Relationships (Quarantine during migration)
CREATE TABLE IF NOT EXISTS orphaned_relationships (
    migration_id TEXT,
    migration_timestamp TEXT,
    parent_user_id_hash TEXT,
    teen_user_id_hash TEXT,
    reason TEXT,
    schema_version INTEGER
);

-- Phase 2 Cognitive Architecture: Evidence & Provenance
CREATE TABLE IF NOT EXISTS raw_evidence (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    source TEXT NOT NULL,
    observed_at TEXT NOT NULL,
    content TEXT NOT NULL, -- encrypted payload
    disclosure_scope TEXT NOT NULL,
    provenance TEXT NOT NULL, -- JSON
    retention_class TEXT NOT NULL,
    expires_at TEXT,
    deletion_reason TEXT,
    FOREIGN KEY (subject_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS derived_inferences (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    evidence_ids TEXT NOT NULL, -- JSON array
    inference TEXT NOT NULL, -- encrypted payload
    confidence REAL NOT NULL,
    model_version TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'VALID',
    created_at TEXT NOT NULL,
    expires_at TEXT,
    FOREIGN KEY (subject_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS hypotheses (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    inference_ids TEXT NOT NULL, -- JSON array
    claim TEXT NOT NULL, -- encrypted payload
    alternatives TEXT NOT NULL, -- encrypted JSON array
    assumptions TEXT NOT NULL, -- encrypted JSON array
    confidence REAL NOT NULL,
    reasoning_trace_metadata TEXT, -- JSON
    created_at TEXT NOT NULL,
    FOREIGN KEY (subject_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS decisions (
    id TEXT PRIMARY KEY,
    subject_id TEXT NOT NULL,
    hypothesis_ids TEXT NOT NULL, -- JSON array
    critic_result TEXT NOT NULL, -- encrypted JSON
    evidence_validation TEXT NOT NULL, -- JSON
    safety_result TEXT NOT NULL, -- JSON
    policy_result TEXT NOT NULL, -- JSON
    authorization TEXT NOT NULL,
    action TEXT NOT NULL,
    created_at TEXT NOT NULL,
    audit_id TEXT,
    FOREIGN KEY (subject_id) REFERENCES users(id) ON DELETE CASCADE
);
"#;
