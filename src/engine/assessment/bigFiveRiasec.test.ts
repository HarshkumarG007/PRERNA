import { describe, it, expect } from 'vitest';
import {
  calculateBigFive,
  deriveBigFiveFromCognition,
  calculateRollingBigFive,
  calculateBigFivePercentiles,
  DEFAULT_BIG_FIVE_BASELINE,
} from './bigFive';
import {
  calculateRiasec,
  deriveRiasecFromCognition,
  calculateRollingRiasec,
  calculateRiasecPercentiles,
  DEFAULT_RIASEC_BASELINE,
} from './riasec';

describe('Big Five Assessment & Rolling Averages (P2-4)', () => {
  it('calculates raw Big Five scores from quest choices and clamps to 0-100', () => {
    const choices = [
      { id: 'c1', traitImpacts: { openness: 15, conscientiousness: 10 } },
      { id: 'c2', traitImpacts: { openness: 10, neuroticism: -10 } },
      { id: 'c3', traitImpacts: { extraversion: 20, agreeableness: 15 } },
    ];

    const result = calculateBigFive(choices);
    expect(result.openness).toBe(75); // 50 + 15 + 10
    expect(result.conscientiousness).toBe(60); // 50 + 10
    expect(result.neuroticism).toBe(40); // 50 - 10
    expect(result.extraversion).toBe(70); // 50 + 20
    expect(result.agreeableness).toBe(65); // 50 + 15
  });

  it('derives Big Five traits from Skill Arena cognitive performance', () => {
    const cognition = {
      creativeDivergence: 80,
      spatialIntelligence: 70,
      workingMemory: 75,
      logicalReasoning: 85,
      processingSpeed: 80,
    };

    const derived = deriveBigFiveFromCognition(cognition);
    // Openness = (80 * 0.6) + (70 * 0.4) = 48 + 28 = 76
    expect(derived.openness).toBe(76);
    // Conscientiousness = (75 * 0.5) + (85 * 0.5) = 80
    expect(derived.conscientiousness).toBe(80);
    // Neuroticism = 100 - (80 * 0.6) = 100 - 48 = 52
    expect(derived.neuroticism).toBe(52);
  });

  it('enforces rolling averages (EMA): profile evolves naturally without jumping erratically', () => {
    const baseline = { ...DEFAULT_BIG_FIVE_BASELINE }; // All 50

    // Extreme single session observed with Openness = 90
    const session1 = { openness: 90 };
    const smoothed1 = calculateRollingBigFive(baseline, session1, 0.25);
    // 0.25 * 90 + 0.75 * 50 = 22.5 + 37.5 = 60
    expect(smoothed1.openness).toBe(60);
    expect(smoothed1.conscientiousness).toBe(50); // Unchanged

    // Second consecutive strong session
    const session2 = { openness: 90 };
    const smoothed2 = calculateRollingBigFive(smoothed1, session2, 0.25);
    // 0.25 * 90 + 0.75 * 60 = 22.5 + 45 = 67.5 -> 68
    expect(smoothed2.openness).toBe(68);
  });

  it('computes normative percentiles against 1M+ IPIP participant distribution', () => {
    const profile = {
      openness: 80,
      conscientiousness: 50,
      extraversion: 60,
      agreeableness: 70,
      neuroticism: 30,
    };

    const { percentiles, scoreBands } = calculateBigFivePercentiles(profile);
    expect(percentiles.openness).toBeGreaterThan(60);
    expect(percentiles.neuroticism).toBeLessThan(40);
    expect(['Very Low', 'Low', 'Average', 'High', 'Very High']).toContain(scoreBands.openness);
  });
});

describe('RIASEC Assessment & Rolling Averages (P2-4)', () => {
  it('calculates raw RIASEC profile from action impacts', () => {
    const actions = [
      { id: 'a1', traitImpacts: { realistic: 20, investigative: 15 } },
      { id: 'a2', traitImpacts: { artistic: 25, social: -5 } },
    ];

    const result = calculateRiasec(actions);
    expect(result.realistic).toBe(70);
    expect(result.investigative).toBe(65);
    expect(result.artistic).toBe(75);
    expect(result.social).toBe(45);
    expect(result.enterprising).toBe(50);
    expect(result.conventional).toBe(50);
  });

  it('derives RIASEC orientations from cognitive metrics', () => {
    const cognition = {
      spatialIntelligence: 85,
      processingSpeed: 75,
      logicalReasoning: 90,
      workingMemory: 80,
      creativeDivergence: 70,
      verbalFluency: 60,
    };

    const derived = deriveRiasecFromCognition(cognition);
    // Realistic = 85*0.6 + 75*0.4 = 51 + 30 = 81
    expect(derived.realistic).toBe(81);
    // Investigative = 90*0.6 + 80*0.4 = 54 + 32 = 86
    expect(derived.investigative).toBe(86);
    // Artistic = 70*0.6 + 60*0.4 = 42 + 24 = 66
    expect(derived.artistic).toBe(66);
  });

  it('enforces rolling averages (EMA) for RIASEC', () => {
    const baseline = { ...DEFAULT_RIASEC_BASELINE }; // All 50

    const session = { investigative: 90, artistic: 80 };
    const smoothed = calculateRollingRiasec(baseline, session, 0.25);

    // 0.25 * 90 + 0.75 * 50 = 60
    expect(smoothed.investigative).toBe(60);
    // 0.25 * 80 + 0.75 * 50 = 20 + 37.5 = 57.5 -> 58
    expect(smoothed.artistic).toBe(58);
    expect(smoothed.realistic).toBe(50);
  });

  it('computes normative percentiles for RIASEC against O*NET norms', () => {
    const profile = {
      realistic: 75,
      investigative: 80,
      artistic: 50,
      social: 40,
      enterprising: 60,
      conventional: 50,
    };

    const { percentiles, scoreBands } = calculateRiasecPercentiles(profile);
    expect(percentiles.investigative).toBeGreaterThan(60);
    expect(['Very Low', 'Low', 'Average', 'High', 'Very High']).toContain(scoreBands.investigative);
  });
});
