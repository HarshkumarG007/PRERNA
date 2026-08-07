# PRERNA AI Engineering Whitepaper
## Transforming Domain Expertise into Empathetic, Safe Local AI

### 1. The Challenge
PRERNA requires an AI assistant that can deeply understand the emotional nuances of Indian adolescents, draw upon evidence-based Yoga and Naturopathy techniques for stress regulation, and provide general educational pharmacy/biology guidance—all without ever crossing the line into medical diagnosis or unsupported clinical advice.

Generic foundational models (like Llama-3-8B or Qwen-2.5) are not aligned out-of-the-box for this specific, highly constrained educational tone. They tend to either over-diagnose (playing doctor) or give generic, unhelpful safety refusals that alienate the user.

### 2. The AI Engineering Solution
To solve this, we implemented a complete end-to-end MLOps pipeline to fine-tune a local model. This pipeline translates multidisciplinary domain expertise (Yoga, Naturopathy, Pharmacy) into a strict, reproducible safety alignment.

#### A. Synthetic Dataset Generation
We used a "Teacher-Student" distillation approach. By feeding raw academic texts and thesis papers (from the M.A. Yoga & Science of Living curriculum) into a larger teacher model, we programmatically generated thousands of high-quality "Instruction-Response" pairs.

These pairs strictly enforce PRERNA's core constraints:
- **Empathetic Mirroring:** Acknowledging the teen's feelings before offering guidance.
- **Evidence-Based Nudges:** Recommending specific breathing (e.g., 4-7-8) or mindfulness techniques instead of generic platitudes.
- **Clinical Boundaries:** Explicitly refusing to diagnose conditions (e.g., rashes, depression) and redirecting to human pharmacists, clinicians, or parents.

#### B. QLoRA Fine-Tuning Pipeline
To train efficiently on consumer GPU hardware while preserving the base model's knowledge, we implemented 4-bit Quantized Low-Rank Adaptation (QLoRA) using HuggingFace `PEFT` and `TRL`.
- **Base Model:** Meta-Llama-3-8B-Instruct
- **Quantization:** nf4 with double quantization (via `bitsandbytes`)
- **Target Modules:** Attention layers (`q_proj`, `k_proj`, `v_proj`, `o_proj`)
- **Loss Monitoring:** Integrated with Weights & Biases (wandb).

#### C. Automated Safety Evaluation
Safety in PRERNA is not assumed; it is proven. We built an adversarial evaluation test suite (`mlops/evaluation/evaluate_safety.py`) that bombards the fine-tuned adapter with extreme edge cases (suicidal ideation, direct requests for medication dosage). 

The pipeline guarantees a 100% refusal/escalation rate on these prompts before any weight file is permitted to be bundled into the application.

### 3. Tauri Integration & Deployment
Once fine-tuned, the LoRA weights are merged and exported to the highly optimized `.gguf` format. PRERNA's Rust backend (`llama-cpp-2` bindings) natively loads these quantized weights, allowing inference to run completely offline on the user's local CPU/GPU, ensuring absolute data privacy.
