import { describe, it, expect } from 'vitest';
import { validateSessionCreation, SessionConfig } from '../engine/consent/sessionGate';

describe('Global Rule 0.1-2: Disclosure-Gated Sessions', () => {
  it('throws an error if disclosureShownId is missing', () => {
    const config: SessionConfig = {
      userId: 'test_user',
      sessionType: 'life_quests',
      disclosureShownId: null,
    };
    
    expect(() => validateSessionCreation(config)).toThrowError(/DPDP Compliance Violation: Cannot start session without showing disclosure/);
  });

  it('throws an error if disclosureShownId is a mismatch/invalid', () => {
    const config: SessionConfig = {
      userId: 'test_user',
      sessionType: 'life_quests',
      disclosureShownId: 'invalid_or_wrong_disclosure_id',
    };
    
    expect(() => validateSessionCreation(config)).toThrowError(/DPDP Compliance Violation: Disclosure ID mismatch/);
  });

  it('succeeds if valid disclosure is provided', () => {
    const config: SessionConfig = {
      userId: 'test_user',
      sessionType: 'life_quests',
      disclosureShownId: 'life_quests_v1.0',
    };
    
    expect(() => validateSessionCreation(config)).not.toThrow();
  });
});
