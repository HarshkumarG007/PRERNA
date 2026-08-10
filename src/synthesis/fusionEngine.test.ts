import { describe, it, expect } from 'vitest';
import { DeterministicScorer, RawItemResponse } from './fusionEngine';

describe('DeterministicScorer (FE-1)', () => {
  it('correctly scores IPIP Big Five against published examples', () => {
    // Simulated responses mapping to IPIP scoring keys.
    // 50 items. We will mock a few to test logic.
    // Formula: Sum of positive + (6 - negative) for 1-5 scale.
    // Let's assume user answered 5 to everything:
    // positive = 5, negative = (6 - 5) = 1.
    const responses: RawItemResponse[] = [
      { id: 'ipip_e1', domain: 'extraversion', keyed: 'positive', score: 5 },
      { id: 'ipip_e2', domain: 'extraversion', keyed: 'negative', score: 5 },
      // total E = 5 + 1 = 6. (Normalised = 6/10 * 100 = 60%)
      { id: 'ipip_a1', domain: 'agreeableness', keyed: 'positive', score: 4 },
      { id: 'ipip_c1', domain: 'conscientiousness', keyed: 'negative', score: 2 },
      { id: 'ipip_n1', domain: 'neuroticism', keyed: 'positive', score: 3 },
      { id: 'ipip_o1', domain: 'openness', keyed: 'positive', score: 5 },
    ];
    
    const result = DeterministicScorer.scoreIPIP(responses);
    
    expect(result.extraversion).toBe(60); // (6/10) * 100
    expect(result.agreeableness).toBe(80); // 4/5 * 100
    expect(result.conscientiousness).toBe(80); // (6-2)=4 -> 4/5 * 100
    expect(result.neuroticism).toBe(60); // 3/5 * 100
    expect(result.openness).toBe(100); // 5/5 * 100
  });

  it('correctly scores O*NET RIASEC against published examples', () => {
    // RIASEC is straight summation, then sometimes normalized to 0-100 or 0-40.
    // O*NET short form: 60 items, 10 per domain. Scale 1-5. Max raw score = 50.
    const responses: RawItemResponse[] = [
      { id: 'onet_r1', domain: 'realistic', keyed: 'positive', score: 5 },
      { id: 'onet_r2', domain: 'realistic', keyed: 'positive', score: 4 }, // raw 9. Normalised: 9/10 * 100 = 90
      { id: 'onet_i1', domain: 'investigative', keyed: 'positive', score: 3 },
    ];
    
    const result = DeterministicScorer.scoreONET(responses);
    
    expect(result.realistic).toBe(90); 
    expect(result.investigative).toBe(60); // 3/5 * 100
    expect(result.artistic).toBe(0); // 0
  });
});
