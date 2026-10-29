// src/engine/crisis/escalationRouter.ts

import { safeInvoke as invoke } from '../../utils/mockBackend';
import { CrisisEvent } from './patternDetection';

export interface MoodLogOrChatMessage {
  userId: string;
  content: string;
  sentiment?: string;
}

const CRISIS_PATTERNS = {
  severe_distress: /\b(harm|hurt|kill|die|suicide|end it|cut myself|marna|khatam|mar jaunga)\b/i,
  abuse_bullying: /\b(hit me|beat me|touching me|scared of him|cyberbully|leaked|blackmail|pareshan|maar)\b/i,
  substance: /\b(drugs?|high|drunk|weed|pills?|overdose|nasha)\b/i
};

/**
 * Screens incoming input for crisis indicators.
 * Strictly constrained: Writes a 'pending' CrisisEvent ONLY.
 * NEVER takes autonomous escalation, notifications, or external dispatch.
 */
export async function checkForCrisisIndicators(input: MoodLogOrChatMessage): Promise<void> {
  let severity: 'high' | 'medium' | null = null;
  
  if (input.sentiment === 'severe_distress' || CRISIS_PATTERNS.severe_distress.test(input.content) || CRISIS_PATTERNS.abuse_bullying.test(input.content)) {
    severity = 'high';
  } else if (CRISIS_PATTERNS.substance.test(input.content)) {
    severity = 'medium';
  }
  
  if (severity) {
    // This is the ONLY thing this function is allowed to do on a match.
    // No notification. No guardian contact. No autonomous action beyond this write.
    await invoke('create_crisis_event', {
      userId: input.userId,
      detectedAt: Date.now(),
      severity: severity,
      // human_review_status defaults to 'pending' in Rust/DB — never set here
    });
  }
}

export interface GuardianNotificationPayload {
  crisisEvent: CrisisEvent;
  teenInformedAt: number | null;
  reviewerId: string;
  reviewerCredentialsRef: string;
  guardianRecipient: {
    name: string;
    contact: string;
  };
  customMessage?: string;
}

export interface NotificationResult {
  dispatched: boolean;
  deliveryId: string;
  timestamp: number;
  recipient: string;
  teenInformedAt: number;
}

/**
 * Dispatches an imminent-risk notification to a verified guardian.
 * GATED STRICTLY BY GLOBAL RULE 0.3:
 * 1. Must have teen_informed_at != null (teen is informed first or simultaneously).
 * 2. Must have human_review_status == 'reviewed_guardian_notified'.
 * 3. Must have valid reviewer credentials reference (e.g. MCI / RCI clinical registration).
 */
export async function dispatchGuardianNotification(
  payload: GuardianNotificationPayload
): Promise<NotificationResult> {
  // Invariant 1: Teen MUST be informed first
  if (!payload.teenInformedAt || typeof payload.teenInformedAt !== 'number') {
    throw new Error(
      'Rule 0.3 Violation: Guardian notification is strictly prohibited unless the teenager has been informed first (teen_informed_at timestamp is required).'
    );
  }

  // Invariant 2: Review status MUST be 'reviewed_guardian_notified'
  if (payload.crisisEvent.humanReviewStatus !== 'reviewed_guardian_notified') {
    throw new Error(
      `Rule 0.3 Violation: Cannot dispatch guardian notification for crisis event with status '${payload.crisisEvent.humanReviewStatus}'. A licensed clinical human reviewer must approve notification.`
    );
  }

  // Invariant 3: Reviewer credentials required
  if (!payload.reviewerCredentialsRef || payload.reviewerCredentialsRef.trim().length === 0) {
    throw new Error(
      'Rule 0.3 Violation: A valid human reviewer credential reference (e.g. MCI/RCI license ID) is required.'
    );
  }

  // Invariant 4: Recipient must be specified
  if (!payload.guardianRecipient || !payload.guardianRecipient.contact) {
    throw new Error('Guardian contact information is required for crisis dispatch.');
  }

  // Execute resolution and delivery via backend IPC
  await invoke('resolve_crisis_event', {
    eventId: payload.crisisEvent.id,
    reviewerId: payload.reviewerId,
    reviewerCredentialsRef: payload.reviewerCredentialsRef.trim(),
    decision: 'GuardianNotified',
    teenInformedAt: payload.teenInformedAt,
  });

  const deliveryId = 'deliv-' + Math.random().toString(36).substring(2, 9);
  const result: NotificationResult = {
    dispatched: true,
    deliveryId,
    timestamp: Date.now(),
    recipient: payload.guardianRecipient.contact,
    teenInformedAt: payload.teenInformedAt,
  };

  return result;
}


