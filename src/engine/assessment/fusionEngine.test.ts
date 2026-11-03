import { describe, it, expect } from 'vitest';
import { scoreFusionProfile, generateAssessment, RawFusionResponse } from './fusionEngine';

describe('FusionEngine', () => {
  it('generates an assessment combining item banks', () => {
    const items = generateAssessment();
    expect(items.length).toBeGreaterThan(0);
    
    // Check that we have both sources
    const hasIpip = items.some(i => i.source === 'IPIP');
    const hasOnet = items.some(i => i.source === 'ONET');
    
    expect(hasIpip).toBe(true);
    expect(hasOnet).toBe(true);
  });

  it('correctly scores positive and negative items and normalises to 0-100', () => {
    // Generate items to mock responses for
    const items = generateAssessment();
    
    // Find one positive and one negative IPIP item if possible
    // And one ONET item
    
    const responses: RawFusionResponse[] = items.map(item => {
      // Let's just answer "5" (Strongly Agree) to everything
      return { itemId: item.id, score: 5 };
    });

    const profile = scoreFusionProfile(responses);

    // If we answer 5 to all items:
    // Positive items score 5
    // Negative items score 6 - 5 = 1
    // The normalisation will result in an average somewhere between 0 and 100 based on the ratio of positive/negative items
    expect(profile).toBeDefined();
    expect(profile.big_five.openness).toBeGreaterThanOrEqual(0);
    expect(profile.big_five.openness).toBeLessThanOrEqual(100);
    expect(profile.riasec.realistic).toBeGreaterThanOrEqual(0);
    expect(profile.riasec.realistic).toBeLessThanOrEqual(100);
  });

  it('returns fallback profile if no responses provided', () => {
    const fallback = {
      id: "fallback-id",
      user_id: "user",
      snapshot_date: "2026-08-12",
      item_bank_version: "old",
      big_five: { openness: 99, conscientiousness: 99, extraversion: 99, agreeableness: 99, neuroticism: 99 },
      riasec: { realistic: 99, investigative: 99, artistic: 99, social: 99, enterprising: 99, conventional: 99 },
      confidence_score: 1.0,
    };
    const profile = scoreFusionProfile([], fallback);
    
    expect(profile.id).toBe("fallback-id");
    expect(profile.big_five.openness).toBe(99);
  });

  it('measures all 11 domains with dynamic confidence reaching 0.95 in full mode (C-05)', () => {
    const quickItems = generateAssessment('quick');
    expect(quickItems.length).toBe(11);
    const quickDomains = new Set(quickItems.map(i => i.domain));
    expect(quickDomains.size).toBe(11);

    const fullItems = generateAssessment('full');
    expect(fullItems.length).toBe(22);

    const responses: RawFusionResponse[] = fullItems.map(item => ({
      itemId: item.id,
      score: 4,
    }));

    const profile = scoreFusionProfile(responses);
    expect(profile.confidence_score).toBe(0.95);
    expect(profile.big_five.openness).toBeDefined();
    expect(profile.big_five.conscientiousness).toBeDefined();
    expect(profile.big_five.extraversion).toBeDefined();
    expect(profile.big_five.agreeableness).toBeDefined();
    expect(profile.big_five.neuroticism).toBeDefined();
    expect(profile.riasec.realistic).toBeDefined();
    expect(profile.riasec.investigative).toBeDefined();
    expect(profile.riasec.artistic).toBeDefined();
    expect(profile.riasec.social).toBeDefined();
    expect(profile.riasec.enterprising).toBeDefined();
    expect(profile.riasec.conventional).toBeDefined();
  });
});
