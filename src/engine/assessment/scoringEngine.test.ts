import { describe, it, expect } from 'vitest';
import { scoreQuestionnaire, deriveArchetype } from './scoringEngine';
import { calculatePercentile, getScoreBand } from '../../data/psychometrics/ipipNorms';
import { QUESTIONNAIRE_ITEMS } from './questionnaireData';

describe('Empirical Scoring Engine & IPIP Normative Calibration', () => {
  it('calculates correct Gaussian percentiles from population means', () => {
    // Exactly at the mean -> 50th percentile
    const medianPct = calculatePercentile(3.82, 3.82, 0.65);
    expect(medianPct).toBe(50);
    expect(getScoreBand(medianPct)).toBe('Average');

    // 1 standard deviation above mean -> approx 84th percentile
    const highPct = calculatePercentile(3.82 + 0.65, 3.82, 0.65);
    expect(highPct).toBeGreaterThanOrEqual(83);
    expect(highPct).toBeLessThanOrEqual(85);
    expect(getScoreBand(highPct)).toBe('High');

    // 2 standard deviations below mean -> approx 2nd percentile
    const lowPct = calculatePercentile(3.82 - 2 * 0.65, 3.82, 0.65);
    expect(lowPct).toBeLessThanOrEqual(3);
    expect(getScoreBand(lowPct)).toBe('Very Low');
  });

  it('correctly scores full questionnaire responses with percentiles and bands', () => {
    // Generate responses: 4 for positive items, 2 for negative
    const mockResponses = QUESTIONNAIRE_ITEMS.map((item) => ({
      questionId: item.id,
      score: item.reverseScored ? 2 : 4,
    }));

    const profile = scoreQuestionnaire(mockResponses);

    // Assert raw scores in 0-100 range
    expect(profile.openness).toBeGreaterThan(0);
    expect(profile.openness).toBeLessThanOrEqual(100);
    expect(profile.conscientiousness).toBeGreaterThan(0);

    // Assert normative percentiles exist and are calibrated between 1 and 99
    expect(profile.percentiles).toBeDefined();
    expect(profile.percentiles?.openness).toBeGreaterThanOrEqual(1);
    expect(profile.percentiles?.openness).toBeLessThanOrEqual(99);

    // Assert score bands are populated
    expect(profile.bands).toBeDefined();
    expect(['Very Low', 'Low', 'Average', 'High', 'Very High']).toContain(profile.bands?.openness);
  });

  it('derives personality archetypes accurately', () => {
    const mockProfile = {
      openness: 85,
      conscientiousness: 80,
      extraversion: 40,
      agreeableness: 50,
      neuroticism: 30,
      realistic: 40,
      investigative: 90,
      artistic: 40,
      social: 30,
      enterprising: 40,
      conventional: 70,
      empathy: 50,
      resilience: 70,
      impulseControl: 70,
      emotionalAwareness: 60,
      socialIntuition: 50,
    };

    const archetype = deriveArchetype(mockProfile);
    expect(archetype).toBeDefined();
    expect(archetype.name).toBe('The Strategist');
    expect(archetype.coreStrengths).toContain('Analytical thinking');
    expect(archetype.coreStrengths).toContain('Pattern recognition');
  });
});
