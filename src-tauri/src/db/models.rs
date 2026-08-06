use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub created_at: String,
    pub age_range: String,
    pub region: String,
    pub language: String,
    pub encryption_key_hash: String,
}

#[derive(Debug, Deserialize)]
pub struct NewUser {
    pub age_range: String,
    pub region: String,
    pub language: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct AssessmentSession {
    pub id: String,
    pub user_id: String,
    pub session_type: String,
    pub started_at: String,
    pub completed_at: Option<String>,
    pub raw_choices: String, // JSON
    pub derived_traits: String, // JSON
    pub disclosure_version: String,
    pub disclosure_shown_at: i64,
}

#[derive(Debug, Deserialize)]
pub struct NewAssessmentSession {
    pub user_id: String,
    pub session_type: String,
    pub raw_choices: String,
    pub derived_traits: String,
    pub disclosure_version: String,
    pub disclosure_shown_at: i64,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct BigFive {
    pub openness: f32,
    pub conscientiousness: f32,
    pub extraversion: f32,
    pub agreeableness: f32,
    pub neuroticism: f32,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct Riasec {
    pub realistic: f32,
    pub investigative: f32,
    pub artistic: f32,
    pub social: f32,
    pub enterprising: f32,
    pub conventional: f32,
}

#[derive(Debug, Serialize, Deserialize, Default)]
pub struct TraitSnapshot {
    pub id: String,
    pub user_id: String,
    pub snapshot_date: String,
    pub big_five: BigFive,
    pub riasec: Riasec,
    pub multiple_intel: serde_json::Value,
    pub emotional_profile: serde_json::Value,
    pub confidence_score: f32,
}

#[derive(Debug, Deserialize)]
pub struct NewTraitSnapshot {
    pub user_id: String,
    pub big_five: BigFive,
    pub riasec: Riasec,
    pub multiple_intel: serde_json::Value,
    pub emotional_profile: serde_json::Value,
    pub confidence_score: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct MicroInteraction {
    pub id: String,
    pub user_id: String,
    pub interaction_type: String,
    pub metadata: String, // JSON, encrypted
    pub emotional_signal: f32,
    pub timestamp: String,
}

#[derive(Debug, Deserialize)]
pub struct NewMicroInteraction {
    pub user_id: String,
    pub interaction_type: String,
    pub metadata: String,
    pub emotional_signal: f32,
}

#[derive(Debug, Serialize)]
pub struct UserDataExport {
    pub user: User,
    pub sessions: Vec<AssessmentSession>,
    pub latest_snapshot: Option<TraitSnapshot>,
    pub export_timestamp: String,
}

#[derive(Debug, Serialize)]
pub struct HealthMetrics {
    pub total_users: i64,
    pub total_sessions: i64,
    pub db_size_bytes: u64,
    pub encryption_status: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct CrisisEvent {
    pub id: String,
    pub user_id: String,
    pub detected_at: i64,
    pub severity: String,
    pub human_review_status: String,
    pub reviewer_id: Option<String>,
    pub decision: Option<String>,
    pub teen_informed_at: Option<i64>,
}

#[derive(Debug, Deserialize, Serialize, PartialEq)]
pub enum CrisisDecision {
    NoAction,
    ResourcesOnly,
    GuardianNotified,
}
