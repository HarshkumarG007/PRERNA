// src/engine/crisis/escalationRouter.ts

import { invoke } from '@tauri-apps/api/core';

export interface MoodLogOrChatMessage {
  userId: string;
  content: string;
  sentiment?: string;
}

const CRISIS_PATTERNS = {
  severe_distress: /\b(harm|hurt|kill|die|suicide|end it|cut myself|marna|khatam|mar jaunga)\b/i,
  abuse_bullying: /\b(hit me|beat me|touching me|scared of him|cyberbully|leaked|blackmail|pareshan|maar)\b/i,
  substance: /\b(drugs|high|drunk|weed|pill|overdose|nasha)\b/i
};

export async function checkForCrisisIndicators(input: MoodLogOrChatMessage): Promise<void> {
  let severity: 'high' | 'medium' | null = null;
  
  if (input.sentiment === 'severe_distress' || CRISIS_PATTERNS.severe_distress.test(input.content) || CRISIS_PATTERNS.abuse_bullying.test(input.content)) {
    severity = 'high';
  } else if (CRISIS_PATTERNS.substance.test(input.content)) {
    severity = 'medium';
  }
  
  if (severity) {
    // This is the ONLY thing this function is allowed to do on a match.
    // No notification. No guardian contact. No autonomous action beyond this write.
    await invoke('create_crisis_event', {
      userId: input.userId,
      detectedAt: Date.now(),
      severity: severity,
      // human_review_status defaults to 'pending' in Rust/DB — never set here
    });
  }
}

