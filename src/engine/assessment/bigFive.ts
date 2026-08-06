// src/engine/assessment/bigFive.ts

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

/**
 * Calculates a Big Five profile snapshot based on user choices.
 * In production, this would be a more complex ML heuristic or psychometric mapping.
 */
export function calculateBigFive(choices: QuestChoice[], baseline?: BigFiveProfile): BigFiveProfile {
  const profile: BigFiveProfile = baseline ? { ...baseline } : {
    openness: 50,
    conscientiousness: 50,
    extraversion: 50,
    agreeableness: 50,
    neuroticism: 50,
  };

  choices.forEach((choice) => {
    if (choice.traitImpacts.openness) profile.openness += choice.traitImpacts.openness;
    if (choice.traitImpacts.conscientiousness) profile.conscientiousness += choice.traitImpacts.conscientiousness;
    if (choice.traitImpacts.extraversion) profile.extraversion += choice.traitImpacts.extraversion;
    if (choice.traitImpacts.agreeableness) profile.agreeableness += choice.traitImpacts.agreeableness;
    if (choice.traitImpacts.neuroticism) profile.neuroticism += choice.traitImpacts.neuroticism;
  });

  // Clamp values between 0 and 100
  return {
    openness: Math.max(0, Math.min(100, profile.openness)),
    conscientiousness: Math.max(0, Math.min(100, profile.conscientiousness)),
    extraversion: Math.max(0, Math.min(100, profile.extraversion)),
    agreeableness: Math.max(0, Math.min(100, profile.agreeableness)),
    neuroticism: Math.max(0, Math.min(100, profile.neuroticism)),
  };
}
