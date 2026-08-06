// src/engine/assessment/riasec.ts

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

/**
 * Calculates a RIASEC profile snapshot based on Skill Arena actions.
 */
export function calculateRiasec(actions: ArenaAction[], baseline?: RiasecProfile): RiasecProfile {
  const profile: RiasecProfile = baseline ? { ...baseline } : {
    realistic: 50,
    investigative: 50,
    artistic: 50,
    social: 50,
    enterprising: 50,
    conventional: 50,
  };

  actions.forEach((action) => {
    if (action.traitImpacts.realistic) profile.realistic += action.traitImpacts.realistic;
    if (action.traitImpacts.investigative) profile.investigative += action.traitImpacts.investigative;
    if (action.traitImpacts.artistic) profile.artistic += action.traitImpacts.artistic;
    if (action.traitImpacts.social) profile.social += action.traitImpacts.social;
    if (action.traitImpacts.enterprising) profile.enterprising += action.traitImpacts.enterprising;
    if (action.traitImpacts.conventional) profile.conventional += action.traitImpacts.conventional;
  });

  // Clamp values between 0 and 100
  return {
    realistic: Math.max(0, Math.min(100, profile.realistic)),
    investigative: Math.max(0, Math.min(100, profile.investigative)),
    artistic: Math.max(0, Math.min(100, profile.artistic)),
    social: Math.max(0, Math.min(100, profile.social)),
    enterprising: Math.max(0, Math.min(100, profile.enterprising)),
    conventional: Math.max(0, Math.min(100, profile.conventional)),
  };
}
