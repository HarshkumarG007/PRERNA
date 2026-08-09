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

const MOCK_RESPONSES = [
  "That's really interesting! Tell me more about what specifically draws you to that.",
  "I hear you. It sounds like this matters a lot to you — what do you think is underneath that feeling?",
  "Great question to be thinking about. What's one small step you could take this week toward that?",
  "You're clearly giving this real thought. Based on your profile, you tend to think creatively — have you tried approaching it from a completely different angle?",
  "That makes a lot of sense. What would your ideal outcome look like if everything worked out?",
  "I appreciate you sharing that. Feeling that way is completely valid. What usually helps you when things feel like this?",
  "It sounds like you're someone who cares deeply about doing things well. What are you most proud of recently?",
];

/**
 * Sends a message to the local LLM sidecar (llama.cpp) via Tauri's IPC.
 * NOTE: Currently in offline mock mode — responses are simulated.
 * In production, this invokes the Tauri `chat_with_mentor` command.
 */
export async function sendMessageToLLM(
  newMessage: string,
  history: ChatMessage[],
  userContext: UserContext
): Promise<string> {
  const contextString = JSON.stringify(userContext, null, 2);
  // System prompt prepared but inference handled by Tauri backend in production
  void SYSTEM_PROMPT_TEMPLATE.replace('{CONTEXT}', contextString);

  console.log('[LLM Client] Local model in mock mode. Message received:', newMessage);

  // Simulate response latency
  await new Promise((resolve) => setTimeout(resolve, 1200 + Math.random() * 800));

  // Always correctly identify as AI
  if (/are you (a real person|human|real|ai|artificial)/i.test(newMessage)) {
    return "I'm an artificial intelligence called PRERNA's Mentor — not a real human. I'm currently running in offline mock mode, so my responses are simulated. The full local AI model will be available once the GGUF model file is downloaded. How can I help you explore your strengths today?";
  }

  // Context-aware responses based on Big Five
  if (userContext.bigFive) {
    if (userContext.bigFive.openness > 65 && /creat|art|idea|imagine/i.test(newMessage)) {
      return "Your profile shows a really high creative openness — which means your imagination is one of your biggest assets! What creative project or idea have you been thinking about lately that excites you most?";
    }
    if (userContext.bigFive.extraversion > 65 && /friend|social|group|team/i.test(newMessage)) {
      return "Given how energized you are by social connection, that environment sounds perfect for you. What's one thing you could do this week to deepen a friendship or collaboration?";
    }
    if (userContext.bigFive.neuroticism > 65 && /stress|anxious|worry|nervous/i.test(newMessage)) {
      return "It makes complete sense to feel that way sometimes. You're not alone in this. Can you name one thing right now that you know helps you feel calmer, even a little bit?";
    }
  }

  // Detect crisis language and route appropriately
  if (/\b(harm|hurt|kill|die|suicide|hopeless)\b/i.test(newMessage)) {
    return "I'm really glad you're talking about this. What you're feeling sounds really heavy. I want to make sure you have the right support — please reach out to iCall at 9152987821 or text a trusted adult in your life. I'm here to listen, but a real human can help you through this much better than I can right now. 💙";
  }

  // Topic-aware responses
  if (/career|job|future|college|study/i.test(newMessage)) {
    return "Career questions are really important — and the good news is that your PRERNA profile already has some insights about where your strengths might lead! Have you explored the career suggestions in your profile yet? What areas feel most exciting to you?";
  }
  if (/parent|family|home|mom|dad/i.test(newMessage)) {
    return "Family dynamics can be so complex, especially as you're figuring out who you are. What would you want your family to understand about you that you feel they might not fully see yet?";
  }
  if (history.length > 4) {
    return "You've been sharing a lot with me today — I appreciate your openness. Is there one thing from our conversation you'd like to reflect on or do something about?";
  }

  // Random contextual default
  return MOCK_RESPONSES[Math.floor(Math.random() * MOCK_RESPONSES.length)];
}

