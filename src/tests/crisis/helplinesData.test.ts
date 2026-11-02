import { describe, it, expect } from 'vitest';
import { VERIFIED_HELPLINES } from '../../data/helplines';

describe('M-08 Helpline Data Quality and Staleness Validation', () => {
  it('contains mandatory government and institutional emergency hotlines', () => {
    const ids = VERIFIED_HELPLINES.map((h) => h.id);
    expect(ids).toContain('national-emergency-112');
    expect(ids).toContain('tele-manas-14416');
    expect(ids).toContain('childline-1098');
    expect(ids).toContain('kiran-1800-599-0019');
    expect(ids).toContain('vandrevala-foundation');
    expect(ids).toContain('icall-tiss');
    expect(ids).toContain('nimhans-support');
  });

  it('validates every helpline has non-empty phone numbers and source URL', () => {
    for (const helpline of VERIFIED_HELPLINES) {
      expect(helpline.name).toBeTruthy();
      expect(helpline.numbers.length).toBeGreaterThan(0);
      expect(helpline.organization).toBeTruthy();
      expect(helpline.language).toBeTruthy();
      expect(helpline.sourceUrl).toMatch(/^https?:\/\//);
      expect(helpline.status).toMatch(/^(active|integrated_with_tele_manas)$/);

      // Verify phone number formatting (digits, hyphens, spaces only)
      for (const num of helpline.numbers) {
        expect(num).toMatch(/^[0-9\s-]+$/);
      }
    }
  });

  it('verifies primary statutory numbers (112, 14416, 1098)', () => {
    const emergency112 = VERIFIED_HELPLINES.find((h) => h.id === 'national-emergency-112');
    expect(emergency112?.numbers).toContain('112');

    const teleManas = VERIFIED_HELPLINES.find((h) => h.id === 'tele-manas-14416');
    expect(teleManas?.numbers).toContain('14416');
    expect(teleManas?.numbers).toContain('1800-891-4416');

    const childline = VERIFIED_HELPLINES.find((h) => h.id === 'childline-1098');
    expect(childline?.numbers).toContain('1098');
  });

  it('enforces verified date staleness check: verified within the last 180 days', () => {
    const now = Date.now();
    const maxAgeMs = 180 * 24 * 60 * 60 * 1000; // 180 days

    for (const helpline of VERIFIED_HELPLINES) {
      const verifiedTimestamp = Date.parse(helpline.lastVerified);
      expect(isNaN(verifiedTimestamp)).toBe(false);
      // Ensure verified timestamp is not in the future beyond clock skew or older than maxAgeMs
      const ageMs = Math.abs(now - verifiedTimestamp);
      expect(ageMs).toBeLessThanOrEqual(maxAgeMs);
    }
  });
});
