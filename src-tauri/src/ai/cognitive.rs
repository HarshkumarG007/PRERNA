use crate::db::models::{
    AuthorizationStatus, Critique, CritiqueVerdict, Decision, DerivedInference, GateStatus, Hypothesis,
    InferenceStatus, RawEvidence,
};
use anyhow::Result;

/// Provides access to the immutable evidence log and inference dependency graph.
pub trait EvidenceStore {
    fn get_raw_evidence(&self, ids: &[String]) -> Result<Vec<RawEvidence>>;
    fn get_derived_inferences(&self, ids: &[String]) -> Result<Vec<DerivedInference>>;
    
    /// Checks if any evidence underlying an inference is expired/deleted.
    fn validate_inference_provenance(&self, inference: &DerivedInference) -> Result<InferenceStatus>;
}

/// Builds the necessary context for the AI generators based on strict provenance.
pub trait ContextBuilder {
    fn build_context(&self, subject_id: &str, evidence_ids: &[String]) -> Result<String>;
}

/// Generates initial hypotheses based on the context.
pub trait HypothesisGenerator {
    fn generate(&self, context: &str) -> Result<Vec<Hypothesis>>;
}

/// Diversifies the hypothesis pool using structural parameters (THink 10x).
pub trait AlternativeGenerator {
    fn generate_alternatives(&self, base_hypotheses: &[Hypothesis]) -> Result<Vec<Hypothesis>>;
}

/// The adversarial reviewer that strictly evaluates a hypothesis against constraints.
pub trait KillCritic {
    fn critique(&self, hypothesis: &Hypothesis) -> Result<Critique>;
}

/// Ensures all evidence underlying a hypothesis is still valid and unexpired.
pub trait EvidenceValidator {
    fn validate(&self, store: &dyn EvidenceStore, hypothesis: &Hypothesis) -> Result<GateStatus>;
}

/// Enforces hard safety rules (e.g. self-harm risk limits).
pub trait SafetyGate {
    fn evaluate(&self, hypothesis: &Hypothesis, critique: &Critique) -> Result<GateStatus>;
}

/// Enforces application-level policy (e.g. parental sharing preferences, age bands).
pub trait PolicyGate {
    fn evaluate(&self, hypothesis: &Hypothesis, critique: &Critique) -> Result<GateStatus>;
}

/// The exclusive builder of actionable Decisions. Orchestrates the pipeline.
pub struct DecisionEngine;

impl Default for DecisionEngine {
    fn default() -> Self {
        Self::new()
    }
}

impl DecisionEngine {
    pub fn new() -> Self {
        Self
    }

    /// Orchestrates the pipeline and produces a Decision if and only if all gates pass.
    #[allow(clippy::too_many_arguments)]
    pub fn process(
        &self,
        subject_id: &str,
        hypothesis: Hypothesis,
        critic: &dyn KillCritic,
        validator: &dyn EvidenceValidator,
        safety_gate: &dyn SafetyGate,
        policy_gate: &dyn PolicyGate,
        store: &dyn EvidenceStore,
        action: String,
        audit_id: Option<String>,
    ) -> Result<Decision> {
        let critique = critic.critique(&hypothesis)?;
        let evidence_validation = validator.validate(store, &hypothesis)?;
        let safety_result = safety_gate.evaluate(&hypothesis, &critique)?;
        let policy_result = policy_gate.evaluate(&hypothesis, &critique)?;
        
        let authorization = if critique.verdict == CritiqueVerdict::Pass
            && evidence_validation == GateStatus::Pass
            && safety_result == GateStatus::Pass
            && policy_result == GateStatus::Pass
        {
            AuthorizationStatus::Allowed
        } else {
            AuthorizationStatus::Denied
        };

        // Decision::new_authorized handles the invariant enforcement internally.
        Decision::new_authorized(
            format!("dec-{}", chrono::Utc::now().timestamp_millis()),
            subject_id.to_string(),
            vec![hypothesis.id.clone()],
            critique,
            evidence_validation,
            safety_result,
            policy_result,
            authorization,
            action,
            audit_id,
        )
        .map_err(|e| anyhow::anyhow!("Decision blocked by invariant: {}", e))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::models::{CritiqueVerdict, Provenance, RetentionClass};

    struct MockExpiredStore;
    impl EvidenceStore for MockExpiredStore {
        fn get_raw_evidence(&self, _ids: &[String]) -> Result<Vec<RawEvidence>> {
            Ok(vec![RawEvidence {
                id: "ev1".into(),
                subject_id: "user1".into(),
                source: "test".into(),
                observed_at: "now".into(),
                content: "data".into(),
                disclosure_scope: "all".into(),
                provenance: Provenance {
                    source_type: "test".into(),
                    source_id: "id".into(),
                    observed_at: "now".into(),
                    collector_version: "v1".into(),
                    disclosure_scope: "all".into(),
                    transformation_chain: vec![],
                },
                retention_class: RetentionClass::ShortTerm,
                expires_at: Some("past".into()),
                deletion_reason: None,
            }])
        }
        fn get_derived_inferences(&self, _ids: &[String]) -> Result<Vec<DerivedInference>> {
            Ok(vec![])
        }
        fn validate_inference_provenance(&self, _inference: &DerivedInference) -> Result<InferenceStatus> {
            Ok(InferenceStatus::Expired)
        }
    }

    struct MockStrictValidator;
    impl EvidenceValidator for MockStrictValidator {
        fn validate(&self, store: &dyn EvidenceStore, _hypothesis: &Hypothesis) -> Result<GateStatus> {
            let dummy = DerivedInference {
                id: "".into(),
                subject_id: "".into(),
                evidence_ids: vec![],
                inference: "".into(),
                confidence: 1.0,
                model_version: "".into(),
                status: InferenceStatus::Valid,
                created_at: "".into(),
                expires_at: None,
            };
            if store.validate_inference_provenance(&dummy).unwrap() == InferenceStatus::Expired {
                Ok(GateStatus::Fail)
            } else {
                Ok(GateStatus::Pass)
            }
        }
    }

    struct MockCritic(CritiqueVerdict);
    impl KillCritic for MockCritic {
        fn critique(&self, _hypothesis: &Hypothesis) -> Result<Critique> {
            Ok(Critique {
                contradictions: vec![],
                unsupported_claims: vec![],
                missing_evidence: vec![],
                alternative_explanations: vec![],
                safety_concerns: vec![],
                policy_violations: vec![],
                confidence_adjustment: 1.0,
                verdict: self.0.clone(),
            })
        }
    }

    struct MockGate(GateStatus);
    impl SafetyGate for MockGate {
        fn evaluate(&self, _h: &Hypothesis, _c: &Critique) -> Result<GateStatus> {
            Ok(self.0.clone())
        }
    }
    impl PolicyGate for MockGate {
        fn evaluate(&self, _h: &Hypothesis, _c: &Critique) -> Result<GateStatus> {
            Ok(self.0.clone())
        }
    }

    fn dummy_hypothesis() -> Hypothesis {
        Hypothesis {
            id: "h1".into(),
            subject_id: "user1".into(),
            inference_ids: vec![],
            claim: "claim".into(),
            alternatives: vec![],
            assumptions: vec![],
            confidence: 0.9,
            reasoning_trace_metadata: None,
            created_at: "now".into(),
        }
    }

    #[test]
    fn test_expired_evidence_blocks_decision() {
        let engine = DecisionEngine::new();
        let store = MockExpiredStore;
        let validator = MockStrictValidator;
        let critic = MockCritic(CritiqueVerdict::Pass);
        let gate = MockGate(GateStatus::Pass);

        let result = engine.process(
            "user1",
            dummy_hypothesis(),
            &critic,
            &validator,
            &gate,
            &gate,
            &store,
            "action".into(),
            None,
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Evidence validation failed"));
    }

    #[test]
    fn test_failed_safety_gate_blocks_decision() {
        let engine = DecisionEngine::new();
        let store = MockExpiredStore;
        struct MockPassValidator;
        impl EvidenceValidator for MockPassValidator {
            fn validate(&self, _s: &dyn EvidenceStore, _h: &Hypothesis) -> Result<GateStatus> {
                Ok(GateStatus::Pass)
            }
        }
        let critic = MockCritic(CritiqueVerdict::Pass);
        let pass_policy = MockGate(GateStatus::Pass);
        let fail_safety = MockGate(GateStatus::Fail);

        let result = engine.process(
            "user1",
            dummy_hypothesis(),
            &critic,
            &MockPassValidator,
            &fail_safety,
            &pass_policy,
            &store,
            "action".into(),
            None,
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Safety gate failed"));
    }

    #[test]
    fn test_rejected_hypothesis_blocks_decision() {
        let engine = DecisionEngine::new();
        struct MockPassValidator;
        impl EvidenceValidator for MockPassValidator {
            fn validate(&self, _s: &dyn EvidenceStore, _h: &Hypothesis) -> Result<GateStatus> {
                Ok(GateStatus::Pass)
            }
        }
        let store = MockExpiredStore; 
        let pass_gate = MockGate(GateStatus::Pass);
        let critic = MockCritic(CritiqueVerdict::Fail); 

        let result = engine.process(
            "user1",
            dummy_hypothesis(),
            &critic,
            &MockPassValidator,
            &pass_gate,
            &pass_gate,
            &store,
            "action".into(),
            None,
        );
        assert!(result.is_err());
        assert!(result.unwrap_err().to_string().contains("Critique did not pass"));
    }
}
