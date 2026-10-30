import { describe, it, expect } from 'vitest';
import {
  sha256Hex,
  hashPasscode,
  verifyPasscode,
  computeSubscriptionSignature,
  verifySubscriptionSignature
} from '../../utils/cryptoVault';

describe('CryptoVault & Security Seals (DPDP §9 Invariants)', () => {
  it('computes correct standard SHA-256 hashes', () => {
    // NIST Standard Vector: SHA-256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
    const emptyHash = sha256Hex('');
    expect(emptyHash).toBe('e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');

    // SHA-256("PRERNA")
    const prernaHash = sha256Hex('PRERNA');
    expect(prernaHash).toHaveLength(64);
  });

  it('hashes passcode with cryptographic salt and never stores plaintext', () => {
    const rawPasscode = '4321';
    const hashed = hashPasscode(rawPasscode);

    expect(hashed).not.toBe(rawPasscode);
    expect(hashed).toHaveLength(64);
    // Deterministic: hashing same input yields same output
    expect(hashPasscode(rawPasscode)).toBe(hashed);
  });

  it('verifies correct passcode and rejects invalid attempts', () => {
    const storedHash = hashPasscode('9876');

    expect(verifyPasscode('9876', storedHash)).toBe(true);
    expect(verifyPasscode('0000', storedHash)).toBe(false);
    expect(verifyPasscode('9875', storedHash)).toBe(false);
    expect(verifyPasscode('', storedHash)).toBe(false);
    expect(verifyPasscode('9876', null)).toBe(false);
  });

  it('seamlessly supports legacy migration for unhashed passcodes', () => {
    // Legacy plaintext stored in older app versions
    const legacyPlain = '5555';
    expect(verifyPasscode('5555', legacyPlain)).toBe(true);
    expect(verifyPasscode('1111', legacyPlain)).toBe(false);
  });

  it('computes and verifies subscription anti-tamper seals', () => {
    const expiresAt = new Date(Date.now() + 30 * 86400000).toISOString();
    const signature = computeSubscriptionSignature('partner_pro_monthly', expiresAt, 'campus_annual', null);

    expect(signature).toHaveLength(64);

    // Valid signature passes
    const isValid = verifySubscriptionSignature(signature, 'partner_pro_monthly', expiresAt, 'campus_annual', null);
    expect(isValid).toBe(true);

    // Tampering with plan tier fails
    const tamperedTier = verifySubscriptionSignature(signature, 'partner_lifetime', expiresAt, 'campus_annual', null);
    expect(tamperedTier).toBe(false);

    // Tampering with expiration date fails
    const tamperedDate = verifySubscriptionSignature(signature, 'partner_pro_monthly', null, 'campus_annual', null);
    expect(tamperedDate).toBe(false);

    // Forged signature fails
    const forged = verifySubscriptionSignature('fake_signature_123', 'partner_pro_monthly', expiresAt, 'campus_annual', null);
    expect(forged).toBe(false);
  });
});

