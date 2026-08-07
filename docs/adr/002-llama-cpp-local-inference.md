# ADR 002: llama.cpp for Local AI Inference

## Status
Accepted

## Context
The AI Mentor component requires an LLM to interpret adolescent text, empathize, and recommend coping strategies. The standard industry approach is to send these prompts to cloud APIs like OpenAI (GPT-4) or Anthropic (Claude). However, streaming real-time, unfiltered emotional distress logs from teenagers to third-party commercial APIs violates PRERNA's core privacy guarantees and poses severe ethical and legal risks.

## Decision
We decided to use the `llama-cpp-2` Rust bindings to run heavily quantized (4-bit), domain-specific `.gguf` models directly on the user's device. The application will leverage CPU/GPU acceleration natively without ever transmitting a single token over the internet.

## Consequences
- **Positive:** Complete data sovereignty. The teen's conversations exist only in their RAM and are immediately discarded or encrypted locally after inference.
- **Positive:** Zero recurring API inference costs, making the app viable for lower-income demographics.
- **Negative:** Bound by the user's hardware constraints. We must aggressively compress models (e.g., Llama-3-8B-Instruct via QLoRA nf4) to ensure they run smoothly on standard student laptops with limited VRAM.
