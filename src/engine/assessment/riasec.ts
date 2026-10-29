// src/engine/assessment/riasec.ts

import { ONET_RIASEC_NORMS, calculatePercentile, getScoreBand } from '../../data/psychometrics/ipipNorms';

export interface RiasecProfile {
  realistic: number;
  investigative: number;
  artistic: number;
  social: number;
  enterprising: number;
  conventional: number;
}

export interface ArenaAction {
  id: string;
  traitImpacts: Partial<RiasecProfile>;
}

export interface SkillArenaCognitiveInput {
  logicalReasoning?: number;
  verbalFluency?: number;
  spatialIntelligence?: number;
  creativeDivergence?: number;
  processingSpeed?: number;
  workingMemory?: number;
}

export const DEFAULT_RIASEC_BASELINE: RiasecProfile = {
  realistic: 50,
  investigative: 50,
  artistic: 50,
  social: 50,
  enterprising: 50,
  conventional: 50,
};

/**
 * Calculates a RIASEC profile snapshot based on direct action impacts.
 */
export function calculateRiasec(actions: ArenaAction[], baseline?: RiasecProfile): RiasecProfile {
  const profile: RiasecProfile = baseline ? { ...baseline } : { ...DEFAULT_RIASEC_BASELINE };

  actions.forEach((action) => {
    if (action.traitImpacts.realistic) profile.realistic += action.traitImpacts.realistic;
    if (action.traitImpacts.investigative) profile.investigative += action.traitImpacts.investigative;
    if (action.traitImpacts.artistic) profile.artistic += action.traitImpacts.artistic;
    if (action.traitImpacts.social) profile.social += action.traitImpacts.social;
    if (action.traitImpacts.enterprising) profile.enterprising += action.traitImpacts.enterprising;
    if (action.traitImpacts.conventional) profile.conventional += action.traitImpacts.conventional;
  });

  return clampRiasec(profile);
}

/**
 * Derives RIASEC orientation signals from cognitive arena performance:
 * - Spatial intelligence + Processing speed -> Realistic (hands-on, kinetic, mechanics)
 * - Logical reasoning + Working memory -> Investigative (scientific, analytical)
 * - Creative divergence + Word connections -> Artistic (expression, novel synthesis)
 */
export function deriveRiasecFromCognition(cognitive: SkillArenaCognitiveInput): Partial<RiasecProfile> {
  const delta: Partial<RiasecProfile> = {};

  if (cognitive.spatialIntelligence !== undefined && cognitive.processingSpeed !== undefined) {
    delta.realistic = Math.round((cognitive.spatialIntelligence * 0.6) + (cognitive.processingSpeed * 0.4));
  }

  if (cognitive.logicalReasoning !== undefined && cognitive.workingMemory !== undefined) {
    delta.investigative = Math.round((cognitive.logicalReasoning * 0.6) + (cognitive.workingMemory * 0.4));
  }

  if (cognitive.creativeDivergence !== undefined && cognitive.verbalFluency !== undefined) {
    delta.artistic = Math.round((cognitive.creativeDivergence * 0.6) + (cognitive.verbalFluency * 0.4));
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
export function calculateRollingRiasec(
  baseline: RiasecProfile,
  sessionData: Partial<RiasecProfile>,
  alpha = 0.25
): RiasecProfile {
  const updateTrait = (current: number, target?: number): number => {
    if (target === undefined || isNaN(target)) return current;
    const smoothed = (alpha * target) + ((1 - alpha) * current);
    return Math.round(Math.max(0, Math.min(100, smoothed)));
  };

  return {
    realistic: updateTrait(baseline.realistic, sessionData.realistic),
    investigative: updateTrait(baseline.investigative, sessionData.investigative),
    artistic: updateTrait(baseline.artistic, sessionData.artistic),
    social: updateTrait(baseline.social, sessionData.social),
    enterprising: updateTrait(baseline.enterprising, sessionData.enterprising),
    conventional: updateTrait(baseline.conventional, sessionData.conventional),
  };
}

/**
 * Computes population-normative percentiles and score bands for RIASEC profile
 * based on O*NET 28.0 normative reference distribution.
 */
export function calculateRiasecPercentiles(profile: RiasecProfile): {
  percentiles: Record<keyof RiasecProfile, number>;
  scoreBands: Record<keyof RiasecProfile, string>;
} {
  const traits = ['realistic', 'investigative', 'artistic', 'social', 'enterprising', 'conventional'] as const;
  const percentiles = {} as Record<keyof RiasecProfile, number>;
  const scoreBands = {} as Record<keyof RiasecProfile, string>;

  traits.forEach((t) => {
    const rawVal = profile[t];
    // Map 0-100 score to 1-5 Likert scale for O*NET normative distribution
    const likertVal = 1 + (rawVal / 100) * 4;
    const norm = ONET_RIASEC_NORMS[t];
    const pct = norm ? calculatePercentile(likertVal, norm.mean, norm.stdDev) : 50;
    percentiles[t] = pct;
    scoreBands[t] = getScoreBand(pct);
  });

  return { percentiles, scoreBands };
}

function clampRiasec(profile: RiasecProfile): RiasecProfile {
  return {
    realistic: Math.max(0, Math.min(100, profile.realistic)),
    investigative: Math.max(0, Math.min(100, profile.investigative)),
    artistic: Math.max(0, Math.min(100, profile.artistic)),
    social: Math.max(0, Math.min(100, profile.social)),
    enterprising: Math.max(0, Math.min(100, profile.enterprising)),
    conventional: Math.max(0, Math.min(100, profile.conventional)),
  };
}
