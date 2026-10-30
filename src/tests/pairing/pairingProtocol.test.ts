import { describe, it, expect, beforeEach } from 'vitest';
import { 
  generatePairingPayload, 
  encodePairingQrData, 
  parseAndVerifyPairingPayload, 
  verifyShortCodeFormat,
  confirmPairingHandshake,
  getPairedTeenInfo,
  unpairTeen,
  getStoredPairingRequest
} from '../../utils/pairingProtocol';

describe('Pairing Protocol & QR Verification Engine', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('generates a valid on-device pairing payload with 15-minute expiration', () => {
    const teenUser = { id: 'teen_user_123', name: 'Aarav Sharma' };
    const payload = generatePairingPayload(teenUser);

    expect(payload.prerna_v).toBe('1.0');
    expect(payload.type).toBe('parent_teen_pair');
    expect(payload.teenId).toBe('teen_user_123');
    expect(payload.teenName).toBe('Aarav Sharma');
    expect(payload.shortCode).toMatch(/^[A-Z0-9]{3}-[A-Z0-9]{3}$/);
    expect(payload.nonce.length).toBeGreaterThanOrEqual(16);
    expect(payload.exp).toBeGreaterThan(Date.now() + 14 * 60 * 1000);
    expect(payload.exp).toBeLessThanOrEqual(Date.now() + 15 * 60 * 1000 + 1000);
  });

  it('serializes and correctly parses a valid QR code payload', () => {
    const teenUser = { id: 'teen_user_456', name: 'Priya' };
    const payload = generatePairingPayload(teenUser);
    const qrString = encodePairingQrData(payload);

    const verification = parseAndVerifyPairingPayload(qrString);
    expect(verification.isValid).toBe(true);
    expect(verification.payload).toBeDefined();
    expect(verification.payload?.teenId).toBe('teen_user_456');
    expect(verification.payload?.teenName).toBe('Priya');
    expect(verification.payload?.shortCode).toBe(payload.shortCode);
  });

  it('rejects expired QR code tokens', () => {
    const teenUser = { id: 'teen_expired', name: 'Expired Teen' };
    const payload = generatePairingPayload(teenUser);
    payload.exp = Date.now() - 5000; // 5 seconds in the past

    const qrString = encodePairingQrData(payload);
    const verification = parseAndVerifyPairingPayload(qrString);

    expect(verification.isValid).toBe(false);
    expect(verification.error).toContain('expired');
  });

  it('rejects tampered or corrupted QR data', () => {
    const corrupted = JSON.stringify({ prerna_v: '0.9', type: 'unknown_type' });
    const verification = parseAndVerifyPairingPayload(corrupted);

    expect(verification.isValid).toBe(false);
    expect(verification.error).toContain('Incompatible');
  });

  it('accepts demo quick-link shortcodes (DEMO99 and A7X9P2)', () => {
    const demo1 = parseAndVerifyPairingPayload('DEMO99');
    expect(demo1.isValid).toBe(true);
    expect(demo1.payload?.teenName).toContain('Demo');

    const demo2 = parseAndVerifyPairingPayload('A7X-9P2');
    expect(demo2.isValid).toBe(true);
  });

  it('verifies 6-character shortcode formatting correctly', () => {
    expect(verifyShortCodeFormat('PRN-842')).toBe(true);
    expect(verifyShortCodeFormat('PRN842')).toBe(true);
    expect(verifyShortCodeFormat('A7X9P2')).toBe(true);
    expect(verifyShortCodeFormat('123')).toBe(false);
    expect(verifyShortCodeFormat('')).toBe(false);
  });

  it('successfully persists paired teen record and allows unpairing', () => {
    const teenUser = { id: 'teen_linked_789', name: 'Ananya' };
    const payload = generatePairingPayload(teenUser);

    confirmPairingHandshake(payload);

    const paired = getPairedTeenInfo();
    expect(paired).not.toBeNull();
    expect(paired?.teenId).toBe('teen_linked_789');
    expect(paired?.teenName).toBe('Ananya');
    expect(localStorage.getItem('prerna_parent_linked')).toBe('true');

    unpairTeen();
    expect(getPairedTeenInfo()).toBeNull();
    expect(localStorage.getItem('prerna_parent_linked')).toBeNull();
  });

  it('retrieves active stored pairing request if not expired', () => {
    const teenUser = { id: 'teen_active', name: 'Kabir' };
    const payload = generatePairingPayload(teenUser);

    const stored = getStoredPairingRequest();
    expect(stored).not.toBeNull();
    expect(stored?.teenId).toBe('teen_active');
    expect(stored?.shortCode).toBe(payload.shortCode);
  });
});
