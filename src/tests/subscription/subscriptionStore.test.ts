import { describe, it, expect, beforeEach } from 'vitest';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { computeSubscriptionSignature } from '../../utils/cryptoVault';

describe('SubscriptionStore Architecture (Phase 7-22)', () => {
  beforeEach(() => {
    const trialExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    const pilotExpires = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString();
    const validSignature = computeSubscriptionSignature('trial', trialExpires, 'pilot', pilotExpires);

    // Reset state before each test with valid cryptographic seal
    useSubscriptionStore.setState({
      partnerPlan: 'trial',
      partnerTrialDaysRemaining: 7,
      partnerActivatedAt: new Date().toISOString(),
      partnerExpiresAt: trialExpires,
      schoolLicense: 'pilot',
      schoolPilotDaysRemaining: 60,
      schoolActivatedAt: new Date().toISOString(),
      schoolExpiresAt: pilotExpires,
      integritySignature: validSignature,
    });
  });

  it('initializes partners with 7-Day Sacred Trial and returns isPartnerPro as true', () => {
    const store = useSubscriptionStore.getState();
    expect(store.partnerPlan).toBe('trial');
    expect(store.partnerTrialDaysRemaining).toBe(7);
    expect(store.isPartnerPro()).toBe(true);
  });

  it('upgrades partner to partner_pro_monthly with 30-day expiration', () => {
    const store = useSubscriptionStore.getState();
    store.upgradePartnerPlan('partner_pro_monthly');

    const updated = useSubscriptionStore.getState();
    expect(updated.partnerPlan).toBe('partner_pro_monthly');
    expect(updated.isPartnerPro()).toBe(true);
    expect(updated.partnerExpiresAt).not.toBeNull();
  });

  it('upgrades partner to partner_lifetime with null expiration (perpetual)', () => {
    const store = useSubscriptionStore.getState();
    store.upgradePartnerPlan('partner_lifetime');

    const updated = useSubscriptionStore.getState();
    expect(updated.partnerPlan).toBe('partner_lifetime');
    expect(updated.isPartnerPro()).toBe(true);
    expect(updated.partnerExpiresAt).toBeNull();
  });

  it('cancels partner plan to free and returns isPartnerPro as false', () => {
    const store = useSubscriptionStore.getState();
    store.cancelPartnerPlan();

    const updated = useSubscriptionStore.getState();
    expect(updated.partnerPlan).toBe('free');
    expect(updated.isPartnerPro()).toBe(false);
  });

  it('initializes schools with 60-Day Campus Pilot and returns isSchoolLicensed as true', () => {
    const store = useSubscriptionStore.getState();
    expect(store.schoolLicense).toBe('pilot');
    expect(store.schoolPilotDaysRemaining).toBe(60);
    expect(store.isSchoolLicensed()).toBe(true);
  });

  it('upgrades school license to campus_annual with 365-day validity', () => {
    const store = useSubscriptionStore.getState();
    store.upgradeSchoolLicense('campus_annual');

    const updated = useSubscriptionStore.getState();
    expect(updated.schoolLicense).toBe('campus_annual');
    expect(updated.isSchoolLicensed()).toBe(true);
    expect(updated.schoolExpiresAt).not.toBeNull();
  });

  it('correctly handles expired subscription dates with valid signature', () => {
    const expiredDate = new Date(Date.now() - 1000).toISOString();
    const sig = computeSubscriptionSignature('partner_pro_monthly', expiredDate, 'pilot', new Date(Date.now() + 60000).toISOString());
    useSubscriptionStore.setState({
      partnerPlan: 'partner_pro_monthly',
      partnerExpiresAt: expiredDate,
      integritySignature: sig,
    });

    const store = useSubscriptionStore.getState();
    expect(store.isPartnerPro()).toBe(false);
  });

  it('detects and rejects DevTools localStorage tampering without cryptographic signature', () => {
    // An adversary tries to bypass payment by setting partner_lifetime in DevTools localStorage
    useSubscriptionStore.setState({
      partnerPlan: 'partner_lifetime',
      partnerExpiresAt: null,
      integritySignature: 'forged_fake_signature_abc_123',
    });

    const store = useSubscriptionStore.getState();
    // Cryptographic anti-tamper seal detects forgery and denies pro status!
    expect(store.isPartnerPro()).toBe(false);
  });
});

