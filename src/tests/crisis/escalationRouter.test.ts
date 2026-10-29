import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  checkForCrisisIndicators,
  dispatchGuardianNotification,
  MoodLogOrChatMessage,
  GuardianNotificationPayload,
} from '../../engine/crisis/escalationRouter';
import { safeInvoke } from '../../utils/mockBackend';
import { CrisisEvent } from '../../engine/crisis/patternDetection';

// Mock the backend invoke
vi.mock('../../utils/mockBackend', () => ({
  safeInvoke: vi.fn().mockResolvedValue('mock-crisis-id'),
}));

describe('Escalation Router & Safety Signal Screener', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('True Positive Detections (High Severity)', () => {
    const highRiskPhrases = [
      'I just want to end it all tonight',
      'I feel like I want to die',
      'I want to hurt myself',
      'Mujhe lagta hai sab khatam ho gaya',
      'Main mar jaunga ab koi fayda nahi',
      'Somebody please help me he is going to beat me again',
      'Someone leaked my private pictures and is trying to blackmail me',
    ];

    highRiskPhrases.forEach((phrase) => {
      it(`detects high severity distress: "${phrase}"`, async () => {
        const input: MoodLogOrChatMessage = {
          userId: 'teen-user-123',
          content: phrase,
        };

        await checkForCrisisIndicators(input);

        expect(safeInvoke).toHaveBeenCalledWith('create_crisis_event', expect.objectContaining({
          userId: 'teen-user-123',
          severity: 'high',
        }));
      });
    });
  });

  describe('Substance Indicators (Medium Severity)', () => {
    it('detects substance mention with medium severity', async () => {
      const input: MoodLogOrChatMessage = {
        userId: 'teen-user-123',
        content: 'I took some pills and I feel really dizzy',
      };

      await checkForCrisisIndicators(input);

      expect(safeInvoke).toHaveBeenCalledWith('create_crisis_event', expect.objectContaining({
        userId: 'teen-user-123',
        severity: 'medium',
      }));
    });
  });

  describe('Invariable Autonomous Boundary (Global Rule 0.1-3)', () => {
    it('never calls any guardian notification or autonomous alert path', async () => {
      const input: MoodLogOrChatMessage = {
        userId: 'teen-user-123',
        content: 'I want to die',
      };

      await checkForCrisisIndicators(input);

      // Verify ONLY create_crisis_event was invoked
      const allCalls = vi.mocked(safeInvoke).mock.calls;
      expect(allCalls.length).toBe(1);
      expect(allCalls[0][0]).toBe('create_crisis_event');
      // Must NOT call any notification endpoint
      expect(allCalls.map(c => c[0])).not.toContain('notify_guardian');
      expect(allCalls.map(c => c[0])).not.toContain('send_sms');
      expect(allCalls.map(c => c[0])).not.toContain('resolve_crisis_event');
    });
  });

  describe('Benign Adolescent Expressions (Negative Controls)', () => {
    const benignPhrases = [
      'I am so excited for the match tomorrow!',
      'We had a great physics lab experiment today.',
      'Can you help me choose between PCM and Commerce?',
      'I like listening to classical music while studying.',
    ];

    benignPhrases.forEach((phrase) => {
      it(`does not trigger crisis on benign text: "${phrase}"`, async () => {
        const input: MoodLogOrChatMessage = {
          userId: 'teen-user-123',
          content: phrase,
        };

        await checkForCrisisIndicators(input);

        expect(safeInvoke).not.toHaveBeenCalled();
      });
    });
  });

  describe('Guardian Notification Dispatch (P4-6 / Global Rule 0.3)', () => {
    const baseEvent: CrisisEvent = {
      id: 'event-crisis-999',
      userId: 'teen-user-123',
      detectedAt: new Date(),
      severity: 'high',
      humanReviewStatus: 'reviewed_guardian_notified',
      triggerReason: 'Sustained severe depression indicators',
    };

    it('🔴 FAILS if teen_informed_at is null or undefined (Rule 0.3)', async () => {
      const payload: GuardianNotificationPayload = {
        crisisEvent: { ...baseEvent, humanReviewStatus: 'reviewed_guardian_notified' },
        teenInformedAt: null,
        reviewerId: 'clinician-001',
        reviewerCredentialsRef: 'RCI-CLIN-98765',
        guardianRecipient: { name: 'Smt. Sharma', contact: '+919876543210' },
      };

      await expect(dispatchGuardianNotification(payload)).rejects.toThrow(
        /Rule 0.3 Violation: Guardian notification is strictly prohibited unless the teenager has been informed first/
      );
      expect(safeInvoke).not.toHaveBeenCalledWith('resolve_crisis_event', expect.anything());
    });

    it('🔴 FAILS if human_review_status is "pending" (Rule 0.3)', async () => {
      const payload: GuardianNotificationPayload = {
        crisisEvent: { ...baseEvent, humanReviewStatus: 'pending' },
        teenInformedAt: Date.now(),
        reviewerId: 'clinician-001',
        reviewerCredentialsRef: 'RCI-CLIN-98765',
        guardianRecipient: { name: 'Smt. Sharma', contact: '+919876543210' },
      };

      await expect(dispatchGuardianNotification(payload)).rejects.toThrow(
        /Rule 0.3 Violation: Cannot dispatch guardian notification for crisis event with status 'pending'/
      );
      expect(safeInvoke).not.toHaveBeenCalledWith('resolve_crisis_event', expect.anything());
    });

    it('🔴 FAILS if human_review_status is "reviewed_resources_only" or "reviewed_no_action"', async () => {
      const payload: GuardianNotificationPayload = {
        crisisEvent: { ...baseEvent, humanReviewStatus: 'reviewed_resources_only' },
        teenInformedAt: Date.now(),
        reviewerId: 'clinician-001',
        reviewerCredentialsRef: 'RCI-CLIN-98765',
        guardianRecipient: { name: 'Smt. Sharma', contact: '+919876543210' },
      };

      await expect(dispatchGuardianNotification(payload)).rejects.toThrow(
        /Rule 0.3 Violation: Cannot dispatch guardian notification for crisis event with status 'reviewed_resources_only'/
      );
    });

    it('🔴 FAILS if reviewer_credentials_ref is missing or empty string', async () => {
      const payload: GuardianNotificationPayload = {
        crisisEvent: { ...baseEvent, humanReviewStatus: 'reviewed_guardian_notified' },
        teenInformedAt: Date.now(),
        reviewerId: 'clinician-001',
        reviewerCredentialsRef: '   ',
        guardianRecipient: { name: 'Smt. Sharma', contact: '+919876543210' },
      };

      await expect(dispatchGuardianNotification(payload)).rejects.toThrow(
        /Rule 0.3 Violation: A valid human reviewer credential reference/
      );
    });

    it('succeeds and calls resolve_crisis_event when all Rule 0.3 invariants are met', async () => {
      const informedAt = Date.now() - 5000;
      const payload: GuardianNotificationPayload = {
        crisisEvent: { ...baseEvent, humanReviewStatus: 'reviewed_guardian_notified' },
        teenInformedAt: informedAt,
        reviewerId: 'clinician-001',
        reviewerCredentialsRef: 'RCI-CLIN-98765',
        guardianRecipient: { name: 'Smt. Sharma', contact: '+919876543210' },
      };

      const result = await dispatchGuardianNotification(payload);

      expect(result.dispatched).toBe(true);
      expect(result.teenInformedAt).toBe(informedAt);
      expect(result.recipient).toBe('+919876543210');
      expect(safeInvoke).toHaveBeenCalledWith('resolve_crisis_event', {
        eventId: 'event-crisis-999',
        reviewerId: 'clinician-001',
        reviewerCredentialsRef: 'RCI-CLIN-98765',
        decision: 'GuardianNotified',
        teenInformedAt: informedAt,
      });
    });
  });
});

