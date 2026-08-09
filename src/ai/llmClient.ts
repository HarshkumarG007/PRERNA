// src/ai/llmClient.ts

import { BigFiveProfile } from '../engine/assessment/bigFive';
import { RiasecProfile } from '../engine/assessment/riasec';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UserContext {
  bigFive?: BigFiveProfile;
  riasec?: RiasecProfile;
  name?: string;
}

import { invoke } from '@tauri-apps/api/core';

export interface ChatResponse {
  response: string;
  conversation_id: string;
  sentiment: string;
  suggested_actions: string[];
}

/**
 * Sends a message to the local LLM sidecar (llama.cpp) via Tauri's IPC.
 */
export async function sendMessageToLLM(
  newMessage: string,
  recentMessages: ChatMessage[] = [],
  conversationId?: string
): Promise<ChatResponse> {
  console.log('[LLM Client] Sending message to Rust backend:', newMessage);
  
  try {
    const response = await invoke<ChatResponse>('chat_with_mentor', {
      request: {
        message: newMessage,
        recent_messages: recentMessages,
        conversation_id: conversationId,
      }
    });
    
    return response;
  } catch (error) {
    console.error('[LLM Client] Failed to communicate with Rust backend:', error);
    throw error;
  }
}


