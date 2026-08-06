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

const SYSTEM_PROMPT_TEMPLATE = `
You are PRERNA's AI Mentor. You are an artificial intelligence, not a real human, and you must explicitly identify yourself as an AI if asked.
Your goal is to help this adolescent user discover their strengths and interests. Be encouraging, concise, and supportive.
Never make definitive medical or psychological diagnoses.

User Context:
{CONTEXT}
`;

/**
 * Sends a message to the local LLM sidecar (llama.cpp) via Tauri's IPC or local HTTP.
 * This function mocks the sidecar response for frontend development.
 */
export async function sendMessageToLLM(
  history: ChatMessage[],
  userContext: UserContext,
  newMessage: string
): Promise<string> {
  const contextString = JSON.stringify(userContext, null, 2);
  const systemPrompt = SYSTEM_PROMPT_TEMPLATE.replace('{CONTEXT}', contextString);

  // In production, this would be:
  // const response = await fetch('http://localhost:8080/v1/chat/completions', { ... })
  
  console.log('[LLM Client] Sending request to local model sidecar...');
  console.log('[LLM Client] System Prompt Context:', systemPrompt);
  
  // Mock response delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Strict check: ensuring it identifies as AI when asked
  if (newMessage.toLowerCase().includes('are you a real person') || newMessage.toLowerCase().includes('are you human')) {
    return "I am an artificial intelligence designed to help you discover your strengths. I am not a real human!";
  }

  // Simulated context-aware response
  if (userContext.bigFive && userContext.bigFive.extraversion > 60) {
    return `That sounds like a great idea! Given your highly outgoing nature, working with others on this could be really fun. What do you think?`;
  }
  
  return `I understand. Let's explore that together. What part of that interests you the most?`;
}
