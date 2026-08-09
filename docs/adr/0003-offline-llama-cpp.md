# ADR 0003: Offline LLaMA inference

## Context
PRERNA utilizes an "AI Mentor" to engage teens in reflective conversation. Using a cloud-based LLM (like OpenAI's GPT-4 or Anthropic's Claude) would provide high intelligence but fundamentally break our Zero-Knowledge privacy promise, as chat logs would be transmitted to a third-party server.

## Decision
We will use **Local, Offline AI Inference**.
- We use `llama-cpp-2` bindings in Rust to run quantized GGUF models directly on the user's CPU/GPU.
- The model files are downloaded once and run entirely disconnected from the internet.
- We enforce input and output safety filters via Rust before any prompt reaches the model, or any completion reaches the UI.

## Consequences
**Positive:**
- Cryptographically guarantees that AI conversations are completely private.
- Avoids recurring API token costs for the platform.
- Functions offline.

**Negative:**
- Requires the user's desktop hardware to have sufficient RAM (minimum 8GB for a decent quantized 7B/8B model).
- Increases the initial download size of the application (model weights are multiple gigabytes).
- Quantized models may lack the nuance of frontier cloud models, requiring careful prompt engineering and safety rails.
