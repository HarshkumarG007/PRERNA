// src/ai/parentGuideNarrator.ts

import { ParentSafeProfile } from '../parent/permissions';

export interface ParentCitedInsight {
  text: string;
  citations: string[]; // e.g., ["bigFive.openness", "rag:pg_communication_basics"]
  isValid: boolean;
}

export interface ParentGuideResult {
  sentences: ParentCitedInsight[];
  isSafeToDisplay: boolean;
}

function validateParentCitation(citation: string, profile: ParentSafeProfile): boolean {
  if (citation.startsWith('rag:')) return true; 
  
  if (citation.includes('bigFive.openness')) return profile.bigFive?.openness !== undefined;
  if (citation.includes('bigFive.conscientiousness')) return profile.bigFive?.conscientiousness !== undefined;
  if (citation.includes('bigFive.extraversion')) return profile.bigFive?.extraversion !== undefined;
  if (citation.includes('bigFive.agreeableness')) return profile.bigFive?.agreeableness !== undefined;
  
  // Explicitly block neuroticism citations in parent view
  if (citation.includes('bigFive.neuroticism') || citation.includes('neuroticism')) return false;
  
  if (citation.includes('riasec.')) return true;
  
  return false;
}

export async function generateParentGuide(profile: ParentSafeProfile): Promise<ParentGuideResult> {
  // In a real app, this queries the local LLM using only the ParentSafeProfile.

  // Mocked LLM response
  const mockLlmOutput = `Your teen has high openness, meaning they will appreciate opportunities to explore new ideas [cite: bigFive.openness]. Encouraging their conscientiousness will help them build structure [cite: bigFive.conscientiousness]. Their anxiety levels are high [cite: bigFive.neuroticism].`;

  return parseAndValidateParentGuide(mockLlmOutput, profile);
}

export function parseAndValidateParentGuide(rawText: string, profile: ParentSafeProfile): ParentGuideResult {
  const sentences = rawText.split(/\.\s+/).map(s => s.trim()).filter(s => s.length > 0);
  const citedInsights: ParentCitedInsight[] = [];

  for (const sentence of sentences) {
    const citeRegex = /\[cite:\s*([^\]]+)\]/g;
    let match;
    const citations: string[] = [];
    
    while ((match = citeRegex.exec(sentence)) !== null) {
      citations.push(match[1].trim());
    }
    
    const text = sentence.replace(/\[cite:\s*([^\]]+)\]/g, '').trim().replace(/\s+\.$/, '.') + (sentence.endsWith('.') ? '' : '.');
    
    let isSentenceValid = citations.length > 0;
    for (const cite of citations) {
      if (!validateParentCitation(cite, profile)) {
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
    sentences: citedInsights.filter(s => s.isValid), 
    isSafeToDisplay: citedInsights.some(s => s.isValid)
  };
}
