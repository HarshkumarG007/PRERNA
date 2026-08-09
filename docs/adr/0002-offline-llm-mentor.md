# ADR 0002: Offline LLM Mentor

## Status
Accepted

## Context
The application features an AI Mentor capable of contextual, psychometrically-aware conversations. Traditionally, this is achieved by sending conversation data to cloud APIs (e.g., OpenAI, Anthropic). However, transmitting a minor's raw emotional and psychometric data to third-party APIs violates our strict data minimization and privacy guarantees.

## Decision
We will execute the LLM inferences completely offline using a local sidecar powered by `llama.cpp` (Rust bindings) running quantized GGUF models. 
- The Tauri Rust backend acts as the host, loading the model into memory and serving inference requests natively.
- The frontend (React) communicates with the LLM strictly via Tauri IPC commands (`chat_with_mentor`).

## Consequences
- **Positive:** Total privacy. No conversation data ever leaves the user's device.
- **Negative:** Increased application bundle size (~2-4GB for a quantized model) and higher local hardware requirements (RAM/CPU/GPU) for the user. We mitigate this by supporting smaller, highly quantized models tailored to counseling contexts.
