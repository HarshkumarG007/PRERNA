// src/engine/consent/ageTierGate.ts

export type AccountType = 'under_18' | 'adult';

export interface ConsentSettings {
  behavioral_tracking: boolean;
  targeted_advertising: boolean;
  assessment_mode: 'transparent_only' | 'standard';
}

/**
 * Enforces Global Rule 0.1-1: No code path may set behavioral_tracking or 
 * targeted_advertising to anything but FALSE for an under-18 account.
 */
export function getPermittedSettings(
  accountType: AccountType,
  requestedSettings: Partial<ConsentSettings>
): ConsentSettings {
  if (accountType === 'under_18') {
    return {
      behavioral_tracking: false, // Structurally disabled
      targeted_advertising: false, // Permanently disabled
      assessment_mode: 'transparent_only',
    };
  }

  // Adult account permits requested settings or defaults
  return {
    behavioral_tracking: requestedSettings.behavioral_tracking ?? false,
    targeted_advertising: requestedSettings.targeted_advertising ?? false,
    assessment_mode: requestedSettings.assessment_mode ?? 'transparent_only',
  };
}

export function validateConsentUpdate(
  accountType: AccountType,
  updatePayload: Partial<ConsentSettings>
): void {
  if (accountType === 'under_18') {
    if (
      updatePayload.behavioral_tracking === true ||
      updatePayload.targeted_advertising === true
    ) {
      throw new Error(
        'DPDP Compliance Violation: Cannot enable tracking or advertising for under-18 accounts.'
      );
    }
  }
}
