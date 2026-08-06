import { invoke } from '@tauri-apps/api/core';

export interface CrisisEvent {
  id: string;
  userId: string;
  detectedAt: Date;
  humanReviewStatus: 'pending' | 'reviewed_no_action' | 'reviewed_resources_only' | 'reviewed_guardian_notified';
  reviewerRef?: string;
  teenInformedAt?: Date;
}

/**
 * Ticket P4-2: Detects patterns from Mood Mirror / Mentor logs.
 * CRITICAL RULE: Takes NO autonomous action beyond flagging a pending case.
 * Does NOT notify parents. Does NOT push active alerts.
 */
export async function detectCrisisPattern(userId: string, dataPayload: any): Promise<void> {
  // Mock detection logic: e.g., if a user explicitly selects a "severe distress" state in a mock UI
  const isConcerning = dataPayload?.sentiment === 'severe_distress' || dataPayload?.content?.includes('harm');

  if (isConcerning) {
    console.log(`[CRISIS ENGINE] Concerning pattern detected for user ${userId}. Dispatching to Rust backend...`);
    
    try {
      const response: { success: boolean, message: string } = await invoke('insert_crisis_event', { userId });
      console.log(`[CRISIS ENGINE] Rust Backend Response: ${response.message}`);
    } catch (error) {
      console.error(`[CRISIS ENGINE] Failed to log crisis event securely via IPC:`, error);
    }
  }
}
