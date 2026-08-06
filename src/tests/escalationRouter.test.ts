import { describe, it, expect } from 'vitest';
import { executeGuardianNotification } from '../engine/crisis/escalationRouter';
import { CrisisEvent } from '../engine/crisis/patternDetection';

describe('Global Rule 0.1-3: Guardian Notification Constraints', () => {
  it('throws FATAL exception if human review is not confirmed', async () => {
    const event: CrisisEvent = {
      id: 'c1',
      userId: 'u1',
      detectedAt: new Date(),
      humanReviewStatus: 'pending', // NOT reviewed
      teenInformedAt: new Date(),
    };

    await expect(executeGuardianNotification(event)).rejects.toThrowError(/FATAL SECURITY EXCEPTION: Cannot notify guardian without explicit human review status/);
  });

  it('throws FATAL exception if teen has not been informed first', async () => {
    const event: CrisisEvent = {
      id: 'c2',
      userId: 'u2',
      detectedAt: new Date(),
      humanReviewStatus: 'reviewed_guardian_notified',
      teenInformedAt: undefined, // TEEN NOT INFORMED
    };

    await expect(executeGuardianNotification(event)).rejects.toThrowError(/FATAL SECURITY EXCEPTION: Cannot notify guardian if the teen has not been informed first/);
  });

  it('succeeds if both conditions are strictly met', async () => {
    const event: CrisisEvent = {
      id: 'c3',
      userId: 'u3',
      detectedAt: new Date(),
      humanReviewStatus: 'reviewed_guardian_notified',
      teenInformedAt: new Date(), // Teen is informed
    };

    await expect(executeGuardianNotification(event)).resolves.toBeUndefined();
  });
});
