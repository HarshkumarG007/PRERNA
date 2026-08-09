// src/engine/crisis/escalationRouter.ts

import { invoke } from '@tauri-apps/api/core';

export interface MoodLogOrChatMessage {
  userId: string;
  content: string;
  sentiment?: string;
}

export async function checkForCrisisIndicators(input: MoodLogOrChatMessage): Promise<void> {
  const isConcerning = input.sentiment === 'severe_distress' || /\b(harm|hurt|kill|die|suicide)\b/i.test(input.content);
  
  if (isConcerning) {
    // This is the ONLY thing this function is allowed to do on a match.
    // No notification. No guardian contact. No autonomous action beyond this write.
    await invoke('create_crisis_event', {
      userId: input.userId,
      detectedAt: Date.now(),
      severity: 'high',
      // human_review_status defaults to 'pending' in Rust/DB — never set here
    });
  }
}

export async function executeGuardianNotification(event: any): Promise<void> {
  if (event.humanReviewStatus !== 'reviewed_guardian_notified') {
    throw new Error('FATAL SECURITY EXCEPTION: Cannot notify guardian without explicit human review status');
  }
  if (!event.teenInformedAt) {
    throw new Error('FATAL SECURITY EXCEPTION: Cannot notify guardian if the teen has not been informed first');
  }
  console.log('Simulating Guardian Notification via verified API...');
}
