import { CURRENT_DISCLOSURES, ActivityType } from '../assessment/disclosures';

export interface SessionConfig {
  userId: string;
  sessionType: ActivityType;
  disclosureShownId: string | null;
}

/**
 * Enforces Global Rule 0.1-2: No assessment activity may collect profile data
 * without its Section 7 disclosure having been shown and logged first.
 */
export function validateSessionCreation(config: SessionConfig): void {
  if (!config.disclosureShownId) {
    throw new Error('DPDP Compliance Violation: Cannot start session without showing disclosure.');
  }

  // Find if the referenced disclosure is a valid, currently active one for this activity
  const expectedDisclosure = CURRENT_DISCLOSURES[config.sessionType];
  if (!expectedDisclosure) {
    throw new Error(`Invalid session type: ${config.sessionType}`);
  }

  if (config.disclosureShownId !== expectedDisclosure.id) {
    throw new Error(`DPDP Compliance Violation: Disclosure ID mismatch. Expected ${expectedDisclosure.id}, got ${config.disclosureShownId}`);
  }
}
