// src/engine/assessment/bigFive.ts

import { IPIP_BIG_FIVE_NORMS, calculatePercentile, getScoreBand } from '../../data/psychometrics/ipipNorms';

export interface BigFiveProfile {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

export interface QuestChoice {
  id: string;
  traitImpacts: Partial<BigFiveProfile>;
}

export interface SkillArenaCognitiveInput {
  logicalReasoning?: number;
  verbalFluency?: number;
  spatialIntelligence?: number;
  creativeDivergence?: number;
  processingSpeed?: number;
  workingMemory?: number;
}

/**
 * Default neutral baseline profile (midpoint 50 on 0-100 scale).
 */
export const DEFAULT_BIG_FIVE_BASELINE: BigFiveProfile = {
  openness: 50,
  conscientiousness: 50,
  extraversion: 50,
  agreeableness: 50,
  neuroticism: 50,
};

/**
 * Calculates raw Big Five impacts directly from a list of quest choices.
 */
export function calculateBigFive(choices: QuestChoice[], baseline?: BigFiveProfile): BigFiveProfile {
  const profile: BigFiveProfile = baseline ? { ...baseline } : { ...DEFAULT_BIG_FIVE_BASELINE };

  choices.forEach((choice) => {
    if (choice.traitImpacts.openness) profile.openness += choice.traitImpacts.openness;
    if (choice.traitImpacts.conscientiousness) profile.conscientiousness += choice.traitImpacts.conscientiousness;
    if (choice.traitImpacts.extraversion) profile.extraversion += choice.traitImpacts.extraversion;
    if (choice.traitImpacts.agreeableness) profile.agreeableness += choice.traitImpacts.agreeableness;
    if (choice.traitImpacts.neuroticism) profile.neuroticism += choice.traitImpacts.neuroticism;
  });

  return clampBigFive(profile);
}

/**
 * Derives Big Five trait tendencies from Skill Arena cognitive mini-game performance.
 * - High creative divergence & spatial exploration -> Openness
 * - High working memory & systematic puzzle solving -> Conscientiousness
 * - High processing speed & decisive reflex -> Low neuroticism / High emotional stability
 */
export function deriveBigFiveFromCognition(cognitive: SkillArenaCognitiveInput): Partial<BigFiveProfile> {
  const delta: Partial<BigFiveProfile> = {};

  if (cognitive.creativeDivergence !== undefined && cognitive.spatialIntelligence !== undefined) {
    const rawO = (cognitive.creativeDivergence * 0.6) + (cognitive.spatialIntelligence * 0.4);
    delta.openness = Math.round(rawO);
  }

  if (cognitive.workingMemory !== undefined && cognitive.logicalReasoning !== undefined) {
    const rawC = (cognitive.workingMemory * 0.5) + (cognitive.logicalReasoning * 0.5);
    delta.conscientiousness = Math.round(rawC);
  }

  if (cognitive.verbalFluency !== undefined) {
    // Verbal fluency correlates moderately with extraversion in communicative tasks
    delta.extraversion = Math.round((cognitive.verbalFluency * 0.4) + 30);
  }

  if (cognitive.processingSpeed !== undefined) {
    // High processing speed with high accuracy indicates lower cognitive stress/neuroticism
    delta.neuroticism = Math.max(10, Math.min(90, Math.round(100 - cognitive.processingSpeed * 0.6)));
  }

  return delta;
}

/**
 * Rolling average update function (Exponential Moving Average smoothing).
 * P2-4 Invariant: Profile evolves naturally and doesn't jump erratically.
 * @param baseline Current persistent trait profile
 * @param sessionData Newly observed traits from this session
 * @param alpha Smoothing factor (0.25 = 25% new session weight, 75% baseline momentum)
 */
export function calculateRollingBigFive(
  baseline: BigFiveProfile,
  sessionData: Partial<BigFiveProfile>,
  alpha = 0.25
): BigFiveProfile {
  const updateTrait = (current: number, target?: number): number => {
    if (target === undefined || isNaN(target)) return current;
    const smoothed = (alpha * target) + ((1 - alpha) * current);
    return Math.round(Math.max(0, Math.min(100, smoothed)));
  };

  return {
    openness: updateTrait(baseline.openness, sessionData.openness),
    conscientiousness: updateTrait(baseline.conscientiousness, sessionData.conscientiousness),
    extraversion: updateTrait(baseline.extraversion, sessionData.extraversion),
    agreeableness: updateTrait(baseline.agreeableness, sessionData.agreeableness),
    neuroticism: updateTrait(baseline.neuroticism, sessionData.neuroticism),
  };
}

/**
 * Computes population-normative percentiles and score bands for Big Five profile
 * based on OpenPsychometrics 1M+ participant parameters.
 */
export function calculateBigFivePercentiles(profile: BigFiveProfile): {
  percentiles: Record<keyof BigFiveProfile, number>;
  scoreBands: Record<keyof BigFiveProfile, string>;
} {
  const traits = ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] as const;
  const percentiles = {} as Record<keyof BigFiveProfile, number>;
  const scoreBands = {} as Record<keyof BigFiveProfile, string>;

  traits.forEach((t) => {
    const rawVal = profile[t];
    // Map 0-100 score to 1-5 Likert scale for IPIP normative distribution
    const likertVal = 1 + (rawVal / 100) * 4;
    const norm = IPIP_BIG_FIVE_NORMS[t];
    const pct = norm ? calculatePercentile(likertVal, norm.mean, norm.stdDev) : 50;
    percentiles[t] = pct;
    scoreBands[t] = getScoreBand(pct);
  });

  return { percentiles, scoreBands };
}

function clampBigFive(profile: BigFiveProfile): BigFiveProfile {
  return {
    openness: Math.max(0, Math.min(100, profile.openness)),
    conscientiousness: Math.max(0, Math.min(100, profile.conscientiousness)),
    extraversion: Math.max(0, Math.min(100, profile.extraversion)),
    agreeableness: Math.max(0, Math.min(100, profile.agreeableness)),
    neuroticism: Math.max(0, Math.min(100, profile.neuroticism)),
  };
}
