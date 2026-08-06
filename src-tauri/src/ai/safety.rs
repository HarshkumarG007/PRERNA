//! Safety guardrails for adolescent AI interactions

use anyhow::{Result, bail};

pub struct SafetyFilter;

impl SafetyFilter {
    pub fn new() -> Self {
        Self
    }
    
    pub fn check(&self, response: &str) -> Result<()> {
        let lower = response.to_lowercase();
        
        // Check for concerning content
        let concerning_patterns = [
            "suicide method",
            "how to die",
            "hurt yourself",
            "self harm technique",
        ];
        
        for pattern in &concerning_patterns {
            if lower.contains(pattern) {
                bail!("Safety filter triggered: harmful content detected");
            }
        }
        
        // Check for claims of being human
        let human_claims = [
            "i am human",
            "i'm a real person",
            "i have feelings too",
            "i am a living being",
        ];
        
        for pattern in &human_claims {
            if lower.contains(pattern) {
                bail!("Safety filter triggered: model claimed to be human");
            }
        }
        
        // Check for unsupported clinical/diagnostic language
        let diagnostic_claims = [
            "you have depression",
            "i diagnose you with",
            "your symptoms indicate bipolar",
            "you are suffering from adhd",
        ];
        
        for pattern in &diagnostic_claims {
            if lower.contains(pattern) {
                bail!("Safety filter triggered: model attempted to diagnose");
            }
        }
        
        // Check if the response should have triggered crisis detection
        if self.detect_crisis(response) {
            bail!("Safety filter triggered: response contained crisis-level language");
        }
        
        // Ensure response is appropriate length
        if response.len() > 2000 {
            bail!("Response too long");
        }
        
        Ok(())
    }
    
    /// Check if user message indicates crisis
    pub fn detect_crisis(&self, message: &str) -> bool {
        let crisis_keywords = [
            "kill myself",
            "end it all", 
            "want to die",
            "suicide",
            "self-harm",
        ];
        
        let lower = message.to_lowercase();
        crisis_keywords.iter().any(|&kw| lower.contains(kw))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_safety_filter_catches_human_claims() {
        let filter = SafetyFilter::new();
        let response = "I understand how you feel, because I am human too.";
        assert!(filter.check(response).is_err());
    }

    #[test]
    fn test_safety_filter_catches_diagnostic_claims() {
        let filter = SafetyFilter::new();
        let response = "Based on what you said, I diagnose you with severe anxiety.";
        assert!(filter.check(response).is_err());
    }

    #[test]
    fn test_safety_filter_catches_crisis_leakage() {
        let filter = SafetyFilter::new();
        let response = "It sounds like you want to end it all.";
        assert!(filter.check(response).is_err());
    }
}
