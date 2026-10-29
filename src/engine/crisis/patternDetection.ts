// src/engine/crisis/patternDetection.ts

import { safeInvoke as invoke } from '../../utils/mockBackend';

export interface CrisisEvent {
  id: string;
  userId: string;
  detectedAt: Date;
  severity: 'high' | 'medium';
  humanReviewStatus: 'pending' | 'reviewed_no_action' | 'reviewed_resources_only' | 'reviewed_guardian_notified';
  reviewerRef?: string;
  teenInformedAt?: number;
  triggerReason?: string;
}

export interface CrisisDetectionInput {
  userId: string;
  content?: string;
  sentiment?: string;
  recentMoodScores?: number[]; // Longitudinal valence history (0-100)
}

export interface DetectionResult {
  flagged: boolean;
  severity?: 'high' | 'medium';
  reason?: string;
  isTrajectoryTrigger?: boolean;
}

/**
 * Idiomatic phrases commonly used by adolescents that MUST NOT trigger false-positive crisis alerts.
 */
const BENIGN_IDIOMS = [
  /dying (of|from) (laughter|laughing)/i,
  /that (exam|test|homework|workout|run) (killed|murdered) me/i,
  /(this|the) spicy (food|sauce|chili) hurts/i,
  /i am (literally )?dead\b/i,
  /dying to (see|watch|hear|try|go)/i,
  /sick and tired of (math|homework|rain|traffic)/i,
  /kill (two birds|some time)/i,
];

/**
 * Validated distress and safety patterns across English and Hinglish expressions.
 */
export const CRISIS_PATTERNS = {
  severe_distress: [
    /\b(suicide|suicidal|kill myself|want to die|end (it all|my life)|hang myself|jump off|cut(ting)? my(self| wrists?))\b/i,
    /\b(mar jaunga|marna chahta hoon|zindagi khatam|jaan de dunga|zeher|khudkushi)\b/i,
    /\b(nobody cares if i die|better off dead|no reason to live)\b/i,
  ],
  abuse_or_threat: [
    /\b(touching me inappropriately|threatened to (hit|beat|kill) me|domestic violence|forced me to)\b/i,
    /\b(blackmailing me|leaked my photos|cyberbully(ing)?|pareshan kar raha hai|maar peet)\b/i,
  ],
  substance_misuse: [
    /\b(pills? overdose|took too many pills|drinking until i pass out)\b/i,
    /\b(drugs? addiction|buying weed|ganja|charas|nasha|sniffing glue)\b/i,
  ],
};

/**
 * Evaluates whether text content contains genuine distress indicators,
 * explicitly screening out benign colloquialisms.
 */
export function evaluateTextDistress(text: string): { flagged: boolean; severity?: 'high' | 'medium'; reason?: string } {
  const trimmed = text.trim();
  if (!trimmed) return { flagged: false };

  // 1. Negative controls check: Benign adolescent slang/idioms are exempt
  for (const idiom of BENIGN_IDIOMS) {
    if (idiom.test(trimmed)) {
      return { flagged: false };
    }
  }

  // 2. High severity checks (suicide, immediate self-harm, abuse/threat)
  for (const pattern of CRISIS_PATTERNS.severe_distress) {
    if (pattern.test(trimmed)) {
      return { flagged: true, severity: 'high', reason: 'Explicit self-harm or suicidal ideation pattern' };
    }
  }

  for (const pattern of CRISIS_PATTERNS.abuse_or_threat) {
    if (pattern.test(trimmed)) {
      return { flagged: true, severity: 'high', reason: 'Abuse, threat, or exploitation indicator' };
    }
  }

  // 3. Medium severity checks (substance mentions)
  for (const pattern of CRISIS_PATTERNS.substance_misuse) {
    if (pattern.test(trimmed)) {
      return { flagged: true, severity: 'medium', reason: 'Substance abuse or risky behavior mention' };
    }
  }

  return { flagged: false };
}

/**
 * Evaluates a longitudinal sequence of mood valence scores (0 to 100).
 * Detects chronic depressive trajectory:
 * - 3 consecutive sessions in severe distress (<= 25).
 * - Or steep sustained collapse (> 40 point drop ending <= 25).
 */
export function evaluateMoodTrajectory(recentScores: number[]): { flagged: boolean; severity?: 'high' | 'medium'; reason?: string } {
  if (!recentScores || recentScores.length < 3) {
    return { flagged: false };
  }

  const lastThree = recentScores.slice(-3);

  // Condition A: 3 consecutive sessions <= 25 (Stormy / Severe Distress)
  const allStormy = lastThree.every(s => s <= 25);
  if (allStormy) {
    return {
      flagged: true,
      severity: 'high',
      reason: 'Sustained severe emotional distress across 3 consecutive sessions (scores <= 25)',
    };
  }

  // Condition B: Rapid emotional collapse from healthy/neutral to critical
  const baseline = lastThree[0];
  const latest = lastThree[2];
  if (baseline >= 65 && latest <= 25 && baseline - latest >= 40) {
    return {
      flagged: true,
      severity: 'medium',
      reason: 'Rapid precipitous mood trajectory collapse (>40 point decline to critical)',
    };
  }

  return { flagged: false };
}

/**
 * Master pattern detection routine.
 * Enforces Global Rule 0.1-3:
 * Creates a CrisisEvent strictly routed to human clinical review (`state = 'HumanReview'`).
 * Takes ZERO autonomous guardian notification action.
 */
export async function detectCrisisSignals(input: CrisisDetectionInput): Promise<DetectionResult> {
  // Check text content if provided
  if (input.content) {
    const textResult = evaluateTextDistress(input.content);
    if (textResult.flagged) {
      await logCrisisEventToBackend(input.userId, textResult.severity || 'high', textResult.reason);
      return { flagged: true, severity: textResult.severity, reason: textResult.reason };
    }
  }

  // Check sentiment flag
  if (input.sentiment === 'severe_distress') {
    const reason = 'Direct severe distress sentiment logged';
    await logCrisisEventToBackend(input.userId, 'high', reason);
    return { flagged: true, severity: 'high', reason };
  }

  // Check longitudinal mood trajectory if provided
  if (input.recentMoodScores && input.recentMoodScores.length >= 3) {
    const trajectoryResult = evaluateMoodTrajectory(input.recentMoodScores);
    if (trajectoryResult.flagged) {
      await logCrisisEventToBackend(input.userId, trajectoryResult.severity || 'medium', trajectoryResult.reason);
      return { flagged: true, severity: trajectoryResult.severity, reason: trajectoryResult.reason, isTrajectoryTrigger: true };
    }
  }

  return { flagged: false };
}

async function logCrisisEventToBackend(userId: string, severity: 'high' | 'medium', reason?: string): Promise<void> {
  try {
    await invoke('create_crisis_event', {
      userId,
      detectedAt: Date.now(),
      severity,
      triggerReason: reason,
    });
  } catch (err) {
    console.warn('[Pattern Detection] Could not register crisis event in backend:', err);
  }
}
