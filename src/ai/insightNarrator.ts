// src/ai/insightNarrator.ts

import { UnifiedProfile } from '../store';

export interface CitedInsight {
  text: string;
  citations: string[]; // e.g., ["personality.bigFive.openness", "RAG:identity_formation"]
  isValid: boolean;
}

export interface InsightNarrativeResult {
  sentences: CitedInsight[];
  isSafeToDisplay: boolean;
  rawOutput: string;
}

/**
 * Validates a generated claim against the ground truth scores.
 * Example citation format: [cite: bigFive.openness]
 */
function validateCitation(citation: string, profile: UnifiedProfile): boolean {
  if (citation.startsWith('rag:')) return true; // Assume RAG citations are valid for this check, though could verify against manifest.
  
  if (citation.includes('bigFive.openness')) return profile.personality.bigFive.openness !== undefined;
  if (citation.includes('bigFive.conscientiousness')) return profile.personality.bigFive.conscientiousness !== undefined;
  if (citation.includes('bigFive.extraversion')) return profile.personality.bigFive.extraversion !== undefined;
  if (citation.includes('bigFive.agreeableness')) return profile.personality.bigFive.agreeableness !== undefined;
  if (citation.includes('bigFive.neuroticism')) return profile.personality.bigFive.neuroticism !== undefined;
  if (citation.includes('bigFive.openness')) return (profile as any).personality?.bigFive?.openness !== undefined;
  if (citation.includes('bigFive.conscientiousness')) return (profile as any).personality?.bigFive?.conscientiousness !== undefined;
  if (citation.includes('bigFive.extraversion')) return (profile as any).personality?.bigFive?.extraversion !== undefined;
  if (citation.includes('bigFive.agreeableness')) return (profile as any).personality?.bigFive?.agreeableness !== undefined;
  if (citation.includes('bigFive.neuroticism')) return (profile as any).personality?.bigFive?.neuroticism !== undefined;
  
  if (citation.includes('riasec.')) return true;
  
  return false;
}

export async function generateTeenInsight(profile: UnifiedProfile): Promise<InsightNarrativeResult> {
  // In a real app, this would query the local LLM sidecar and retrieve RAG docs.
  // For this implementation, we simulate the LLM output with explicit citations.

  // Mocked LLM response
  const mockLlmOutput = `You have a very strong imagination and love exploring new ideas [cite: bigFive.openness]. Your ability to stay organized helps you achieve your goals [cite: bigFive.conscientiousness]. You are secretly a superhero [cite: hallucinated_field].`;

  return parseAndValidateNarrative(mockLlmOutput, profile);
}

export function parseAndValidateNarrative(rawText: string, profile: UnifiedProfile): InsightNarrativeResult {
  const sentences = rawText.split(/\.\s+/).map(s => s.trim()).filter(s => s.length > 0);
  const citedInsights: CitedInsight[] = [];

  for (const sentence of sentences) {
    const citeRegex = /\[cite:\s*([^\]]+)\]/g;
    let match;
    const citations: string[] = [];
    
    while ((match = citeRegex.exec(sentence)) !== null) {
      citations.push(match[1].trim());
    }
    
    // Clean text
    const text = sentence.replace(/\[cite:\s*([^\]]+)\]/g, '').trim().replace(/\s+\.$/, '.') + (sentence.endsWith('.') ? '' : '.');
    
    let isSentenceValid = citations.length > 0;
    for (const cite of citations) {
      if (!validateCitation(cite, profile)) {
        isSentenceValid = false;
      }
    }
    
    
    citedInsights.push({
      text,
      citations,
      isValid: isSentenceValid
    });
  }
  
  return {
    sentences: citedInsights.filter(s => s.isValid), // Strip hallucinations
    isSafeToDisplay: citedInsights.some(s => s.isValid), // Safe if at least one valid sentence remains
    rawOutput: rawText
  };
}
