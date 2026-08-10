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
    session_type TEXT CHECK(session_type IN ('life_quest', 'skill_arena', 'mood_mirror', 'social_compass', 'body_clock')),
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
"#;
