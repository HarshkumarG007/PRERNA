import { describe, it, expect } from 'vitest';
import { 
  deriveSixteenType, 
  SIXTEEN_TYPE_DEFINITIONS, 
  SIXTEEN_ROLES,
  SixteenTypeCode 
} from '../../engine/assessment/sixteenPersonalities';

describe('16 Personality Types Engine', () => {
  it('contains valid configurations for all 16 personality types', () => {
    const codes = Object.keys(SIXTEEN_TYPE_DEFINITIONS) as SixteenTypeCode[];
    expect(codes).toHaveLength(16);

    for (const code of codes) {
      const def = SIXTEEN_TYPE_DEFINITIONS[code];
      expect(def.code).toBe(code);
      expect(def.name).toBeTruthy();
      expect(def.hindiName).toBeTruthy();
      expect(def.avatarEmoji).toBeTruthy();
      expect(def.traits.length).toBeGreaterThanOrEqual(3);
      expect(def.strengths.length).toBeGreaterThanOrEqual(3);
      expect(def.careerDirections.length).toBeGreaterThanOrEqual(2);
      expect(def.famousFigures.length).toBeGreaterThanOrEqual(2);
      expect(SIXTEEN_ROLES[def.role]).toBeDefined();
    }
  });

  it('accurately derives INTJ-A from Big Five trait scores', () => {
    const result = deriveSixteenType({
      openness: 80,         // High Openness -> N
      conscientiousness: 75,// High Conscientiousness -> J
      extraversion: 30,     // Low Extraversion -> I
      agreeableness: 35,    // Low Agreeableness -> T
      neuroticism: 25,      // Low Neuroticism -> Assertive (-A)
    });

    expect(result.code).toBe('INTJ');
    expect(result.fullCode).toBe('INTJ-A');
    expect(result.identity).toBe('Assertive');
    expect(result.definition.name).toBe('The Architect');
    expect(result.definition.role).toBe('analysts');
    expect(result.dichotomies.energy.dominant).toBe('I');
    expect(result.dichotomies.mind.dominant).toBe('N');
    expect(result.dichotomies.nature.dominant).toBe('T');
    expect(result.dichotomies.tactics.dominant).toBe('J');
    expect(result.dichotomies.identity.dominant).toBe('-A');
  });

  it('accurately derives ENFP-T from Big Five trait scores', () => {
    const result = deriveSixteenType({
      openness: 85,         // High Openness -> N
      conscientiousness: 35,// Low Conscientiousness -> P
      extraversion: 78,     // High Extraversion -> E
      agreeableness: 82,    // High Agreeableness -> F
      neuroticism: 65,      // High Neuroticism -> Turbulent (-T)
    });

    expect(result.code).toBe('ENFP');
    expect(result.fullCode).toBe('ENFP-T');
    expect(result.identity).toBe('Turbulent');
    expect(result.definition.name).toBe('The Campaigner');
    expect(result.definition.role).toBe('diplomats');
    expect(result.dichotomies.energy.pctB).toBe(78);
    expect(result.dichotomies.mind.pctA).toBe(85);
  });

  it('accurately derives ISTJ-A (Sentinel archetype)', () => {
    const result = deriveSixteenType({
      openness: 30,         // Low Openness -> S
      conscientiousness: 85,// High Conscientiousness -> J
      extraversion: 40,     // Low Extraversion -> I
      agreeableness: 45,    // Low Agreeableness -> T
      neuroticism: 30,      // Low Neuroticism -> Assertive (-A)
    });

    expect(result.code).toBe('ISTJ');
    expect(result.fullCode).toBe('ISTJ-A');
    expect(result.definition.name).toBe('The Logistician');
    expect(result.definition.role).toBe('sentinels');
  });

  it('accurately derives ESFP-A (Explorer archetype)', () => {
    const result = deriveSixteenType({
      openness: 40,         // Low Openness -> S
      conscientiousness: 30,// Low Conscientiousness -> P
      extraversion: 85,     // High Extraversion -> E
      agreeableness: 75,    // High Agreeableness -> F
      neuroticism: 35,      // Low Neuroticism -> Assertive (-A)
    });

    expect(result.code).toBe('ESFP');
    expect(result.fullCode).toBe('ESFP-A');
    expect(result.definition.name).toBe('The Entertainer');
    expect(result.definition.role).toBe('explorers');
  });
});
