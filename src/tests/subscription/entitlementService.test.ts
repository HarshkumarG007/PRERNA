import { describe, it, expect } from 'vitest';
import {
  issueEntitlementToken,
  verifyEntitlementToken,
  verifyWebhookSignature,
  isWebhookDuplicate,
  processValidatedWebhook,
  WebhookEvent,
} from '../../services/entitlementService';
import { sha256Hex } from '../../utils/cryptoVault';

describe('Entitlement & Payment Webhook Service (WP6)', () => {
  const SECRET = 'test_authority_secret_key_12345';

  it('generates a valid, signed entitlement token and verifies successfully', () => {
    const token = issueEntitlementToken('user@test.org', 'partner_pro_monthly', 30, SECRET);

    expect(token.payload.subjectId).toBe('user@test.org');
    expect(token.payload.tier).toBe('partner_pro_monthly');
    expect(token.payload.expiresAt).not.toBeNull();
    expect(token.signature).toHaveLength(64);

    const verification = verifyEntitlementToken(token, SECRET);
    expect(verification.isValid).toBe(true);
    expect(verification.reason).toBeUndefined();
  });

  it('rejects an expired entitlement token', () => {
    // Generate token with negative duration (-1 day)
    const token = issueEntitlementToken('user@test.org', 'partner_pro_monthly', -1, SECRET);

    const verification = verifyEntitlementToken(token, SECRET);
    expect(verification.isValid).toBe(false);
    expect(verification.reason).toContain('expired');
  });

  it('detects and rejects a tampered entitlement token (C-04 forgery defense)', () => {
    const token = issueEntitlementToken('user@test.org', 'partner_pro_monthly', 30, SECRET);

    // Malicious client tries to upgrade tier to lifetime without valid signature
    const forgedToken = {
      ...token,
      payload: {
        ...token.payload,
        tier: 'partner_lifetime' as const,
        expiresAt: null,
      },
    };

    const verification = verifyEntitlementToken(forgedToken, SECRET);
    expect(verification.isValid).toBe(false);
    expect(verification.reason).toContain('Cryptographic signature mismatch');
  });

  it('verifies standard payment aggregator webhook signatures and rejects altered payloads', () => {
    const webhookSecret = 'rzp_webhook_secret_999';
    const rawPayload = JSON.stringify({ event: 'payment.captured', id: 'pay_123456789' });

    // Legitimate signature using standard secret + payload
    const validSignature = sha256Hex(`${webhookSecret}:${rawPayload}`);

    expect(verifyWebhookSignature(rawPayload, validSignature, webhookSecret)).toBe(true);
    expect(verifyWebhookSignature(rawPayload, 'invalid_forged_sig', webhookSecret)).toBe(false);
    expect(verifyWebhookSignature('{"event":"altered"}', validSignature, webhookSecret)).toBe(false);
  });

  it('detects duplicate webhook events and prevents replay attacks', () => {
    const eventId = `evt_test_${Date.now()}`;
    const currentSeconds = Math.floor(Date.now() / 1000);

    // First arrival: not duplicate
    expect(isWebhookDuplicate(eventId, currentSeconds)).toBe(false);

    // Immediate replay of same eventId: detected as duplicate
    expect(isWebhookDuplicate(eventId, currentSeconds)).toBe(true);

    // Replay of old event (> 10 minutes ago)
    const oldTimestampSeconds = currentSeconds - (15 * 60);
    expect(isWebhookDuplicate('evt_old_stale_123', oldTimestampSeconds)).toBe(true);
  });

  it('processes payment.captured to issue signed tokens and refund.processed to revoke', () => {
    const paymentEvent: WebhookEvent = {
      eventId: 'evt_pay_001',
      eventType: 'payment.captured',
      paymentId: 'pay_987654',
      orderId: 'order_123',
      amountInr: 999,
      currency: 'INR',
      tier: 'partner_pro_annual',
      customerEmail: 'school_admin@vidyapeeth.edu.in',
      timestamp: Math.floor(Date.now() / 1000),
    };

    const result = processValidatedWebhook(paymentEvent, SECRET);
    expect(result.action).toBe('issue');
    expect(result.entitlementToken).toBeDefined();

    const verified = verifyEntitlementToken(result.entitlementToken, SECRET);
    expect(verified.isValid).toBe(true);
    expect(result.entitlementToken?.payload.tier).toBe('partner_pro_annual');

    // Refund event
    const refundEvent: WebhookEvent = {
      ...paymentEvent,
      eventId: 'evt_ref_001',
      eventType: 'refund.processed',
    };

    const refundResult = processValidatedWebhook(refundEvent, SECRET);
    expect(refundResult.action).toBe('revoke');
  });
});
