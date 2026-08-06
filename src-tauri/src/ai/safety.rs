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
