// src/ai/llmClient.ts

import { BigFiveProfile } from '../engine/assessment/bigFive';
import { RiasecProfile } from '../engine/assessment/riasec';
import { safeInvoke as invoke } from '../utils/mockBackend';

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface UserContext {
  bigFive?: BigFiveProfile;
  riasec?: RiasecProfile;
  name?: string;
  archetype?: string;
  sixteenType?: string;
}

export interface ChatResponse {
  response: string;
  conversation_id: string;
  sentiment: string;
  suggested_actions: string[];
  latencyMs?: number;
  engine?: 'tauri_ipc' | 'local_sidecar' | 'sovereign_client';
}

export interface LocalSidecarStatus {
  isConfigured: boolean;
  isReachable: boolean;
  endpoint: string;
  model?: string;
  error?: string;
}

/**
 * Probes a local LLM server (Ollama, llama.cpp, LM Studio, etc.)
 */
export async function probeLocalSidecar(customEndpoint?: string): Promise<LocalSidecarStatus> {
  const endpoint = customEndpoint || (typeof localStorage !== 'undefined' ? localStorage.getItem('prerna_local_llm_endpoint') : null) || 'http://127.0.0.1:11434';
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);
    
    // Check Ollama tags or OpenAI /v1/models
    const res = await fetch(`${endpoint.replace(/\/+$/, '')}/api/tags`, {
      method: 'GET',
      signal: controller.signal
    }).catch(async () => {
      return fetch(`${endpoint.replace(/\/+$/, '')}/v1/models`, {
        method: 'GET',
        signal: controller.signal
      });
    });
    
    clearTimeout(timeoutId);

    if (res && res.ok) {
      const data = await res.json().catch(() => ({}));
      const modelName = data?.models?.[0]?.name || data?.data?.[0]?.id || 'Local Neural Engine';
      return {
        isConfigured: true,
        isReachable: true,
        endpoint,
        model: modelName
      };
    }

    return {
      isConfigured: typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('prerna_local_llm_endpoint')),
      isReachable: false,
      endpoint,
      error: `HTTP ${res?.status || 500}`
    };
  } catch (err: any) {
    return {
      isConfigured: typeof localStorage !== 'undefined' && Boolean(localStorage.getItem('prerna_local_llm_endpoint')),
      isReachable: false,
      endpoint,
      error: err?.message || 'Offline'
    };
  }
}

/**
 * Builds a prompt template with explicit AI self-identification and trait context.
 * Complies with P3-1 & P3-2 requirements.
 */
export function buildMentorPrompt(
  userMessage: string,
  recentMessages: ChatMessage[] = [],
  context?: UserContext
): string {
  let traitSummary = 'No prior psychometric snapshot available.';
  if (context?.bigFive) {
    const { openness, conscientiousness, extraversion, agreeableness, neuroticism } = context.bigFive;
    traitSummary = `User Traits: Openness: ${openness}%, Conscientiousness: ${conscientiousness}%, Extraversion: ${extraversion}%, Agreeableness: ${agreeableness}%, Emotional Stability: ${100 - neuroticism}%.`;
  }
  if (context?.sixteenType) {
    traitSummary += ` 16-Personality Typology: ${context.sixteenType}.`;
  }

  const history = recentMessages
    .slice(-5)
    .map((m) => `${m.role}: ${m.content}`)
    .join('\n');

  return `<|system|>
You are PRERNA, a supportive AI mentor for Indian adolescents.
You are an Artificial Intelligence, NOT a human, doctor, or licensed clinician.
If asked if you are real or a person, clearly self-identify as an AI assistant.
Keep answers concise (1-3 sentences), warm, and culturally empathetic.

Context:
${traitSummary}

History:
${history}

User:
${userMessage}
<|assistant|>`;
}

/**
 * Sends a message to the local LLM sidecar (llama.cpp) via Tauri's IPC,
 * with context injection and safety guarantees.
 */
export async function sendMessageToLLM(
  newMessage: string,
  recentMessages: ChatMessage[] = [],
  conversationId?: string,
  context?: UserContext
): Promise<ChatResponse> {
  const startTime = performance.now();
  const lowerMsg = newMessage.toLowerCase();

  try {
    const response = await invoke<ChatResponse>('chat_with_mentor', {
      request: {
        message: newMessage,
        recent_messages: recentMessages,
        conversation_id: conversationId,
        user_context: context,
      },
    });

    const latencyMs = Math.round(performance.now() - startTime);
    return {
      ...response,
      latencyMs,
    };
  } catch (error) {
    console.warn('[LLM Client] IPC call failed, falling back to local client processor:', error);

    // Check if user enabled local HTTP sidecar (e.g. Ollama on localhost:11434 or llama.cpp on localhost:8080)
    const localSidecarEnabled = typeof localStorage !== 'undefined' && localStorage.getItem('prerna_local_llm_enabled') === 'true';
    if (localSidecarEnabled) {
      const endpoint = localStorage.getItem('prerna_local_llm_endpoint') || 'http://127.0.0.1:11434';
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 4000);
        
        // Standard OpenAI-compatible format supported by Ollama /v1/chat/completions and llama.cpp
        const response = await fetch(`${endpoint.replace(/\/+$/, '')}/v1/chat/completions`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            model: localStorage.getItem('prerna_local_llm_model') || 'llama3.2:1b',
            messages: [
              { role: 'system', content: "You are PRERNA, a supportive AI mentor for Indian adolescents. You are an AI, NOT a doctor or therapist. Keep answers concise, warm, and culturally empathetic." },
              ...recentMessages.slice(-4),
              { role: 'user', content: newMessage }
            ],
            temperature: 0.7,
            max_tokens: 200
          })
        });
        clearTimeout(timeoutId);

        if (response.ok) {
          const result = await response.json();
          const content = result.choices?.[0]?.message?.content?.trim();
          if (content) {
            // Apply Mandatory Safety Filter on raw output
            if (/\b(suicide|kill myself|end my life|die|self harm|hurt myself|cutter|cutting)\b/i.test(newMessage + ' ' + content)) {
              return {
                response: "It sounds like you are going through a really painful moment right now. Please know that you are not alone and help is available. Would you be willing to speak with someone who can support you? You can call KIRAN (1800-599-0019) or Vandrevala Foundation (9999-666-555) 24/7 for free, confidential guidance.",
                conversation_id: conversationId || 'sidecar-' + Date.now(),
                sentiment: 'distress',
                suggested_actions: ['Call KIRAN Helpline (1800-599-0019)', 'Connect with a trusted adult'],
                latencyMs: Math.round(performance.now() - startTime),
                engine: 'local_sidecar'
              };
            }
            return {
              response: content,
              conversation_id: conversationId || 'sidecar-' + Date.now(),
              sentiment: 'supportive',
              suggested_actions: ['Reflect on this insight', 'Ask follow-up question'],
              latencyMs: Math.round(performance.now() - startTime),
              engine: 'local_sidecar'
            };
          }
        }
      } catch (sidecarErr) {
        console.warn('[LLM Client] Local sidecar attempt failed, smoothly falling back to sovereign processor:', sidecarErr);
      }
    }

    // Fallback client-side generator to ensure zero-latency degradation during offline/test modes
    const latencyMs = Math.round(performance.now() - startTime);

    // Crisis Safety Filter
    if (/\b(suicide|kill myself|end my life|die|self harm|hurt myself|cutter|cutting)\b/i.test(lowerMsg)) {
      return {
        response: "It sounds like you are going through a really painful moment right now. Please know that you are not alone and help is available. Would you be willing to speak with someone who can support you? You can call KIRAN (1800-599-0019) or Vandrevala Foundation (9999-666-555) 24/7 for free, confidential guidance.",
        conversation_id: conversationId || 'local-' + Date.now(),
        sentiment: 'distress',
        suggested_actions: ['Call KIRAN Helpline (1800-599-0019)', 'Connect with a trusted adult'],
        latencyMs,
      };
    }

    // Rule 1: Explicit AI identification
    if (/\b(are you (a )?(real (person|human)|human|real)|who are you|are you real)\b/i.test(lowerMsg)) {
      return {
        response: "I am PRERNA's AI Mentor. I am an artificial intelligence, not a real human or licensed therapist. I'm here to help you safely reflect on your strengths, habits, and self-discovery.",
        conversation_id: conversationId || 'local-' + Date.now(),
        sentiment: 'neutral',
        suggested_actions: ['Explore my strengths', 'Discuss career pathways'],
        latencyMs,
      };
    }

    // Rule 2: Trait context reflection without hallucination
    let traitRef = '';
    if (context?.bigFive) {
      if (context.bigFive.openness >= 70) {
        traitRef = `Given your high Openness (${context.bigFive.openness}%), your curiosity is a strong guide for exploring new perspectives.`;
      } else if (context.bigFive.conscientiousness >= 70) {
        traitRef = `With your high Conscientiousness (${context.bigFive.conscientiousness}%), creating a structured plan will give you confidence.`;
      } else if (context.bigFive.extraversion >= 70) {
        traitRef = `Your social connection and Extraversion (${context.bigFive.extraversion}%) can be a great asset.`;
      }
    }

    const reply = traitRef
      ? `I understand what you're saying. ${traitRef} Taking this one step at a time helps turn big questions into manageable goals. What would you like to explore next?`
      : "I hear you. Taking time to pause and reflect on your thoughts is a valuable strength. What feels like the most important part of this for you right now?";

    return {
      response: reply,
      conversation_id: conversationId || 'local-' + Date.now(),
      sentiment: 'reflective',
      suggested_actions: ['Reflect on my strengths', 'Set a small daily goal'],
      latencyMs,
    };
  }
}
