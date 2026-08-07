use crate::db::models::TraitSnapshot;
use anyhow::Result;
use log::info;

pub struct DomainDoc {
    pub id: String,
    pub content: String,
    pub domain: String,
    pub target_trait: Option<String>,
}

pub struct RagContext {
    pub relevant_documents: Vec<String>,
}

pub struct DomainRag {
    // In production, this would hold Arc<EmbeddingModel> and a ChromaDB/SQLite-vec client
    pub knowledge_base: Vec<DomainDoc>,
}

impl DomainRag {
    pub fn new() -> Self {
        // Initialize with local domain knowledge.
        // In a full implementation, this reads from local SQLite-vec embeddings.
        Self {
            knowledge_base: vec![
                DomainDoc {
                    id: "yoga_001".to_string(),
                    content: "4-7-8 Breathing (Pranayama): Inhale for 4s, hold for 7s, exhale for 8s. Extremely effective for rapidly lowering physiological arousal and anxiety.".to_string(),
                    domain: "yoga_science".to_string(),
                    target_trait: Some("neuroticism_high".to_string()),
                },
                DomainDoc {
                    id: "study_001".to_string(),
                    content: "Pomodoro Technique adapted for high cognitive load: 25 minutes of intense focus followed by a 5-minute active physical break (e.g., stretching, walking).".to_string(),
                    domain: "education".to_string(),
                    target_trait: Some("conscientiousness_low".to_string()),
                },
                DomainDoc {
                    id: "pharmacy_001".to_string(),
                    content: "Circadian Rhythm Optimization: Avoid heavy cognitive tasks during the post-lunch dip (1PM - 3PM). Hydration and brief movement enhance focus better than excess caffeine.".to_string(),
                    domain: "pharmacy_informed_wellness".to_string(),
                    target_trait: None,
                }
            ]
        }
    }

    pub fn retrieve_context(&self, query: &str, teen_profile: &TraitSnapshot) -> Result<RagContext> {
        info!("Retrieving domain context for query: {}", query);
        let mut relevant = Vec::new();

        // 1. Profile Filtering
        // Extract emotional resilience to influence retrieval
        let resilience = teen_profile.emotional_profile.get("resilience")
            .and_then(|r| r.as_f64())
            .unwrap_or(50.0);
            
        let is_anxious = resilience < 40.0 || teen_profile.big_five.neuroticism > 60.0;
        let needs_focus = teen_profile.big_five.conscientiousness < 40.0;
        
        // 2. Hybrid Search (Mocked for Phase 6 setup)
        for doc in &self.knowledge_base {
            // Semantic keyword match
            let q = query.to_lowercase();
            let semantic_match = q.contains("stress") || 
                                 q.contains("focus") || 
                                 q.contains("sleep") || 
                                 q.contains("study");
                                 
            // Trait matching
            let trait_match = match doc.target_trait.as_deref() {
                Some("neuroticism_high") => is_anxious,
                Some("conscientiousness_low") => needs_focus,
                Some(_) => true,
                None => true, // Universal documents
            };

            // If it hits on semantic keywords OR perfectly matches the teen's struggles
            if semantic_match || trait_match {
                relevant.push(doc.content.clone());
            }
        }

        Ok(RagContext {
            relevant_documents: relevant,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::db::models::{TraitSnapshot, BigFive, Riasec};
    
    #[test]
    fn test_rag_retrieval_profile_filtering() {
        let rag = DomainRag::new();
        
        // Mock a highly neurotic (anxious) teen profile
        let mut profile = TraitSnapshot::default();
        profile.big_five = BigFive {
            neuroticism: 80.0, // High neuroticism
            openness: 50.0,
            conscientiousness: 50.0,
            extraversion: 50.0,
            agreeableness: 50.0,
        };
        profile.emotional_profile = serde_json::json!({
            "resilience": 30.0 // Low resilience
        });
        
        let docs = rag.retrieve_context("I'm stressed", &profile).unwrap();
        
        // Assert retrieved docs contain calming techniques (Pranayama)
        assert!(
            docs.relevant_documents.iter().any(|d| d.contains("4-7-8 Breathing")),
            "High neuroticism should retrieve grounding Pranayama"
        );
    }
}
