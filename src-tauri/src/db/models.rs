use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub username: String,
    pub password_hash: String,
    pub created_at: String,
    pub age_range: AgeBand,
    pub region: String,
    pub language: String,
    pub encryption_key_hash: String,
    pub mfa_secret: Option<String>,
    pub mfa_enabled: bool,
    pub role: String,
    pub tenant_id: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PublicUser {
    pub id: String,
    pub username: String,
    pub created_at: String,
    pub age_range: AgeBand,
    pub region: String,
    pub language: String,
    pub mfa_enabled: bool,
    pub role: String,
    pub tenant_id: Option<String>,
}

impl From<&User> for PublicUser {
    fn from(user: &User) -> Self {
        Self {
            id: user.id.clone(),
            username: user.username.clone(),
            created_at: user.created_at.clone(),
            age_range: user.age_range.clone(),
            region: user.region.clone(),
            language: user.language.clone(),
            mfa_enabled: user.mfa_enabled,
            role: user.role.clone(),
            tenant_id: user.tenant_id.clone(),
        }
    }
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum AgeBand {
    #[serde(rename = "13-15")]
    Teen13To15,
    #[serde(rename = "16-17")]
    Teen16To17,
    #[serde(rename = "18+")]
    Adult18Plus,
}

impl AgeBand {
    pub fn from_age(age: u8) -> Self {
        match age {
            0..=15 => AgeBand::Teen13To15,
            16..=17 => AgeBand::Teen16To17,
            _ => AgeBand::Adult18Plus,
        }
    }
}

impl rusqlite::ToSql for AgeBand {
    fn to_sql(&self) -> rusqlite::Result<rusqlite::types::ToSqlOutput<'_>> {
        let s = match self {
            AgeBand::Teen13To15 => "13-15",
            AgeBand::Teen16To17 => "16-17",
            AgeBand::Adult18Plus => "18+",
        };
        Ok(rusqlite::types::ToSqlOutput::from(s))
    }
}

impl rusqlite::types::FromSql for AgeBand {
    fn column_result(value: rusqlite::types::ValueRef<'_>) -> rusqlite::types::FromSqlResult<Self> {
        let s = value.as_str()?;
        match s {
            "13-15" => Ok(AgeBand::Teen13To15),
            "16-17" => Ok(AgeBand::Teen16To17),
            "18+" => Ok(AgeBand::Adult18Plus),
            _ => Err(rusqlite::types::FromSqlError::InvalidType),
        }
    }
}

#[derive(Debug, Deserialize)]
pub struct NewUser {
    pub username: String,
    pub password_hash: String,
    pub age_range: AgeBand,
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
    pub raw_choices: String,    // JSON
    pub derived_traits: String, // JSON
    pub disclosure_version: String,
    pub disclosure_shown_at: i64,
}

#[derive(Debug, Deserialize)]
pub struct NewAssessmentSession {
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
    pub item_bank_version: String,
    pub big_five: BigFive,
    pub riasec: Riasec,
    pub multiple_intel: serde_json::Value,
    pub emotional_profile: serde_json::Value,
    pub confidence_score: f32,
}

#[derive(Debug, Deserialize)]
pub struct NewTraitSnapshot {
    pub user_id: String,
    pub item_bank_version: String,
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
    pub interaction_type: String,
    pub metadata: String,
    pub emotional_signal: f32,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PortableUserData {
    pub profile: PublicUser,
    pub sessions: Vec<AssessmentSession>,
    pub latest_snapshot: Option<TraitSnapshot>,
    pub export_timestamp: String,
    pub version: u32,
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
    pub reviewer_credentials_ref: Option<String>,
    pub decision: Option<String>,
    pub teen_informed_at: Option<i64>,
}

#[derive(Debug, Deserialize, Serialize, PartialEq)]
pub enum CrisisDecision {
    NoAction,
    ResourcesOnly,
    GuardianNotified,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SharingShares {
    #[serde(rename = "wellbeingScore")]
    pub wellbeing_score: bool,
    #[serde(rename = "careerInterests")]
    pub career_interests: bool,
    pub strengths: bool,
    #[serde(rename = "dailyCheckIn")]
    pub daily_check_in: bool,
    pub concerns: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SharingRequiresApproval {
    #[serde(rename = "fullProfile")]
    pub full_profile: bool,
    #[serde(rename = "chatHistory")]
    pub chat_history: bool,
    #[serde(rename = "riskAlerts")]
    pub risk_alerts: bool,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SharingPreferences {
    #[serde(rename = "userId")]
    pub user_id: String,
    #[serde(rename = "lastUpdated")]
    pub last_updated: String,
    pub shares: SharingShares,
    #[serde(rename = "requiresApproval")]
    pub requires_approval: SharingRequiresApproval,
}

// === Phase 2 Cognitive Architecture Models ===

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum RetentionClass {
    SessionEphemeral,
    ShortTerm,
    LongTerm,
    RequiredRecord,
    UserControlled,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Provenance {
    pub source_type: String,
    pub source_id: String,
    pub observed_at: String,
    pub collector_version: String,
    pub disclosure_scope: String,
    pub transformation_chain: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct RawEvidence {
    pub id: String,
    pub subject_id: String,
    pub source: String,
    pub observed_at: String,
    pub content: String, // Note: Encrypted at rest
    pub disclosure_scope: String,
    pub provenance: Provenance,
    pub retention_class: RetentionClass,
    pub expires_at: Option<String>,
    pub deletion_reason: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum InferenceStatus {
    Valid,
    Stale,
    Revoked,
    Expired,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DerivedInference {
    pub id: String,
    pub subject_id: String,
    pub evidence_ids: Vec<String>,
    pub inference: String, // Note: Encrypted at rest
    pub confidence: f64,
    pub model_version: String,
    pub status: InferenceStatus,
    pub created_at: String,
    pub expires_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Hypothesis {
    pub id: String,
    pub subject_id: String,
    pub inference_ids: Vec<String>,
    pub claim: String, // Note: Encrypted at rest
    pub alternatives: Vec<String>, // Note: Encrypted at rest
    pub assumptions: Vec<String>, // Note: Encrypted at rest
    pub confidence: f64,
    pub reasoning_trace_metadata: Option<serde_json::Value>,
    pub created_at: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Critique {
    pub contradictions: Vec<String>,
    pub unsupported_claims: Vec<String>,
    pub missing_evidence: Vec<String>,
    pub alternative_explanations: Vec<String>,
    pub safety_concerns: Vec<String>,
    pub policy_violations: Vec<String>,
    pub confidence_adjustment: f64,
    pub verdict: CritiqueVerdict,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum CritiqueVerdict {
    Pass,
    Fail,
    NeedsRevision,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum GateStatus {
    Pass,
    Fail,
    NotEvaluated,
}

#[derive(Debug, Serialize, Deserialize, Clone, PartialEq, Eq)]
pub enum AuthorizationStatus {
    Allowed,
    Denied,
    RequiresHumanReview,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Decision {
    pub id: String,
    pub subject_id: String,
    pub hypothesis_ids: Vec<String>,
    pub critic_result: Critique,
    pub evidence_validation: GateStatus,
    pub safety_result: GateStatus,
    pub policy_result: GateStatus,
    pub authorization: AuthorizationStatus,
    pub action: String,
    pub created_at: String,
    pub audit_id: Option<String>,
}

impl Decision {
    /// The only way to construct a Decision is if all gates PASS and Authorization is ALLOWED.
    pub fn new_authorized(
        id: String,
        subject_id: String,
        hypothesis_ids: Vec<String>,
        critic_result: Critique,
        evidence_validation: GateStatus,
        safety_result: GateStatus,
        policy_result: GateStatus,
        authorization: AuthorizationStatus,
        action: String,
        audit_id: Option<String>,
    ) -> Result<Self, &'static str> {
        if critic_result.verdict != CritiqueVerdict::Pass {
            return Err("Cannot authorize decision: Critique did not pass");
        }
        if evidence_validation != GateStatus::Pass {
            return Err("Cannot authorize decision: Evidence validation failed");
        }
        if safety_result != GateStatus::Pass {
            return Err("Cannot authorize decision: Safety gate failed");
        }
        if policy_result != GateStatus::Pass {
            return Err("Cannot authorize decision: Policy gate failed");
        }
        if authorization != AuthorizationStatus::Allowed {
            return Err("Cannot authorize decision: Action not authorized");
        }

        Ok(Self {
            id,
            subject_id,
            hypothesis_ids,
            critic_result,
            evidence_validation,
            safety_result,
            policy_result,
            authorization,
            action,
            created_at: chrono::Utc::now().to_rfc3339(),
            audit_id,
        })
    }
}
