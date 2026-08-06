import { describe, it, expect } from 'vitest';
import { validateConsentUpdate } from '../engine/consent/ageTierGate';

describe('Global Rule 0.1-1: Age Tier Gating', () => {
  it('throws an error if attempting to enable behavioral tracking for an under_18 account', () => {
    // Attempting to bypass the UI and call the data layer directly
    expect(() => validateConsentUpdate('under_18', { behavioral_tracking: true })).toThrowError(/DPDP Compliance Violation/);
  });

  it('allows enabling behavioral tracking for an adult account', () => {
    expect(() => validateConsentUpdate('adult', { behavioral_tracking: true })).not.toThrow();
  });

  it('allows disabling behavioral tracking for an under_18 account', () => {
    expect(() => validateConsentUpdate('under_18', { behavioral_tracking: false })).not.toThrow();
  });
});
