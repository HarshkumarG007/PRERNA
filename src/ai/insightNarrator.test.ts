import { describe, it, expect } from 'vitest';
import { parseAndValidateNarrative } from './insightNarrator';
import { UnifiedProfile } from '../store';

describe('Insight Narrator Citation Check (TN-2)', () => {
  const mockProfile: UnifiedProfile = {
    userId: 'test1',
    generatedAt: new Date().toISOString(),
    itemBankVersion: 'v2-ipip-onet-2026',
    personality: {
      bigFive: { openness: 80, conscientiousness: 70, extraversion: 60, agreeableness: 50, neuroticism: 40 },
      riasec: { realistic: 30, investigative: 40, artistic: 50, social: 60, enterprising: 70, conventional: 80 },
      emotional: { resilience: 50, empathy: 50, emotionalAwareness: 50, impulseControl: 50, socialIntuition: 50 }
    },
    cognition: { logicalReasoning: 50, verbalFluency: 50, spatialIntelligence: 50, creativeDivergence: 50, processingSpeed: 50, workingMemory: 50, learningStyle: 'mixed' },
    archetype: { name: 'Test', description: 'Test', traits: [] },
    wellbeingScore: 50,
    strengths: [],
    growthAreas: []
  };

  it('strips hallucinated claims and retains valid ones', () => {
    const rawOutput = `You are highly creative [cite: bigFive.openness]. You can fly [cite: superpower]. You are organized [cite: bigFive.conscientiousness].`;
    
    const result = parseAndValidateNarrative(rawOutput, mockProfile);
    
    // The superpower claim should be stripped because the citation is invalid
    expect(result.sentences.length).toBe(2);
    expect(result.sentences[0].text).toBe('You are highly creative.');
    expect(result.sentences[1].text).toBe('You are organized.');
    expect(result.isSafeToDisplay).toBe(true);
  });
  
  it('blocks entirely hallucinated output', () => {
    const rawOutput = `You can read minds [cite: magic]. You will win the lottery [cite: future].`;
    
    const result = parseAndValidateNarrative(rawOutput, mockProfile);
    
    expect(result.sentences.length).toBe(0);
    expect(result.isSafeToDisplay).toBe(false);
  });
});
