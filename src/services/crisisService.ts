/**
 * Crisis Safety & Guardian Notification Service
 * Typed client wrapper for human-gated crisis escalation and immutable delivery audits.
 * Compliant with Rule 0.3 (teenInformedAt required prior to guardian notification).
 */

import { safeInvoke as invoke } from '../utils/mockBackend';

export type CrisisDecision = 'NoAction' | 'ResourcesOnly' | 'GuardianNotified';

export type NotificationStatus =
  | 'Pending'
  | 'InFlight'
  | 'Delivered'
  | 'RetryableFailure'
  | 'PermanentFailure'
  | 'Cancelled';

export interface CrisisEventRecord {
  id: string;
  user_id: string;
  detected_at: number;
  severity: string;
  state: string;
  origin: string;
  reviewer_id?: string | null;
  reviewer_credentials_ref?: string | null;
  decision?: string | null;
  teen_informed_at?: number | null;
}

export interface DeliveryRecord {
  id: string;
  crisis_event_id: string;
  recipient_id: string;
  notification_type: string;
  status: NotificationStatus;
  provider: string;
  provider_reference?: string | null;
  created_at: string;
  updated_at: string;
  error_message?: string | null;
}

/** Normalize snake_case / camelCase crisis events returned from either Rust IPC or JS mocks. */
export function normalizeCrisisEvent(raw: any): CrisisEventRecord {
  return {
    id: raw.id,
    user_id: raw.user_id ?? raw.userId ?? 'unknown',
    detected_at: raw.detected_at ?? (raw.detectedAt ? new Date(raw.detectedAt).getTime() : Date.now()),
    severity: raw.severity ?? 'high',
    state: raw.state ?? raw.humanReviewStatus ?? 'HumanReview',
    origin: raw.origin ?? 'EXTERNAL',
    reviewer_id: raw.reviewer_id ?? raw.reviewerId ?? null,
    reviewer_credentials_ref: raw.reviewer_credentials_ref ?? raw.reviewerCredentialsRef ?? null,
    decision: raw.decision ?? null,
    teen_informed_at: raw.teen_informed_at ?? raw.teenInformedAt ?? null,
  };
}

export async function getPendingCrisisEvents(): Promise<CrisisEventRecord[]> {
  const rawList = await invoke<any[]>('get_pending_crisis_events');
  return (rawList || []).map(normalizeCrisisEvent);
}

export async function claimCrisisEvent(eventId: string): Promise<void> {
  await invoke('claim_crisis_event', { eventId });
}

export async function resolveCrisisEvent(params: {
  eventId: string;
  reviewerCredentialsRef: string;
  decision: CrisisDecision;
  teenInformedAt: number | null;
}): Promise<void> {
  if (params.decision === 'GuardianNotified' && !params.teenInformedAt) {
    throw new Error(
      'Rule 0.3 Violation: Adolescent must be transparently informed prior to guardian notification.'
    );
  }
  await invoke('resolve_crisis_event', {
    eventId: params.eventId,
    reviewerCredentialsRef: params.reviewerCredentialsRef,
    decision: params.decision,
    teenInformedAt: params.teenInformedAt,
  });
}

export async function getCrisisDeliveryRecords(crisisId: string): Promise<DeliveryRecord[]> {
  return (await invoke<DeliveryRecord[]>('get_crisis_delivery_records', { crisisId })) || [];
}

export async function getGuardianEmergencyAlerts(): Promise<DeliveryRecord[]> {
  return (await invoke<DeliveryRecord[]>('get_guardian_emergency_alerts')) || [];
}

