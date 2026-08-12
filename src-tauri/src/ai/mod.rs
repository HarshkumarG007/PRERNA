//! Local LLM inference using llama.cpp
//! Optimized for RTX 4060 (8GB VRAM)

use anyhow::{Context, Result};
use llama_cpp_2::llama_backend::LlamaBackend;
use llama_cpp_2::model::{params::LlamaModelParams, LlamaModel};
use log::info;
use std::path::PathBuf;
use std::sync::{Arc, Mutex};
use tauri::Manager;

pub mod prompts;
pub mod rag;
pub mod safety;

use prompts::ConversationContext;
use rag::DomainRag;
use safety::SafetyFilter;

pub enum MentorModel {
    BaseGGUF(PathBuf),
    FineTunedGGUF(PathBuf),
    RagHybrid {
        base: PathBuf,
        retrieval: Arc<DomainRag>,
    },
}

pub struct LocalLLM {
    _model_variant: MentorModel,
    _model: Arc<LlamaModel>,
    _backend: Arc<LlamaBackend>,
    safety_filter: SafetyFilter,
    rag_engine: Arc<DomainRag>,
    _max_tokens: i32,
    mock_mode: bool,
}

impl LocalLLM {
    /// Initialize local LLM with quantized model
    pub fn new(app_handle: &tauri::AppHandle) -> Result<Self> {
        info!("Initializing local LLM...");

        let backend = Arc::new(LlamaBackend::init()?);

        // Model path - will download on first run
        let model_path = get_model_path(app_handle)?;

        // RTX 4060 optimized: 8GB VRAM, use 4-bit quantization
        let model_params = LlamaModelParams::default()
            // .with_n_gpu_layers(35) // Commented out to ensure it works without CUDA installed locally
            ;

        // NOTE: In production, we would check if the model file exists, and if not, we would download it.
        // For testing/development where the 4GB file is missing, we will bypass the actual model loading
        // to avoid crashing the app immediately, but ideally we load it here.
        if !model_path.exists() {
            info!(
                "Model file not found at {:?}. Creating placeholder model state.",
                model_path
            );
            // We return a mock state or panic.
            // In our Tauri app context, we don't want to panic if the user hasn't downloaded it yet.
            // Let's create a placeholder/mock that simply fails to generate.

            // To make the compiler happy, we need to return something, or we change the signature.
            // But we're returning `Result<Self>`, so we can just return an error if it doesn't exist.
            anyhow::bail!(
                "Model file not found. Please download the GGUF model to {:?}",
                model_path
            );
        }

        let model = Arc::new(
            LlamaModel::load_from_file(&backend, &model_path, &model_params)
                .context("Failed to load LLM model")?,
        );

        info!("LLM loaded successfully: {} tokens vocab", model.n_vocab());

        Ok(Self {
            _model_variant: MentorModel::RagHybrid {
                base: model_path.clone(),
                retrieval: Arc::new(DomainRag::new()),
            },
            _model: model,
            _backend: backend,
            safety_filter: SafetyFilter::new(),
            rag_engine: Arc::new(DomainRag::new()),
            _max_tokens: 512, // Keep responses concise for teens
            mock_mode: true,
        })
    }

    pub fn generate_response(
        &self,
        context: &ConversationContext,
        user_message: &str,
        trait_profile: &serde_json::Value,
    ) -> Result<String> {
        if self.mock_mode {
            return Err(anyhow::anyhow!("AI inference is not available yet: the model runs in mock mode. Set mock_mode to false once llama-cpp-2 inference is wired."));
        }

        // 1. Retrieve Domain Context via RAG
        let rag_context = self
            .rag_engine
            .retrieve_context(user_message, trait_profile)?;

        // 2. Build contextualized prompt
        let _prompt = self.build_prompt(context, user_message, trait_profile, &rag_context);

        // Bypass actual model inference to avoid compilation errors
        // with the older llama-cpp-2 v0.1.154 API mismatch.
        // For production, the LlamaSampler API would be used here.
        let response = format!(
            "I am PRERNA's AI Mentor (Offline Mock Mode). I heard: '{}'",
            user_message
        );

        // Apply safety filter
        self.safety_filter.check(&response)?;

        Ok(response)
    }

    fn sanitize_untrusted_input(input: &str) -> String {
        input
            .replace("<|system|>", "<\\|system\\|>")
            .replace("<|user|>", "<\\|user\\|>")
            .replace("<|assistant|>", "<\\|assistant\\|>")
            .replace("<|end|>", "<\\|end\\|>")
            .replace("System message:", "System message_escaped:")
            .replace("Developer message:", "Developer message_escaped:")
    }

    fn build_prompt(
        &self,
        context: &ConversationContext,
        user_message: &str,
        traits: &serde_json::Value,
        rag_context: &rag::RagContext,
    ) -> String {
        let big_five = traits.get("bigFive").and_then(|v| v.as_object());
        let emotional = traits.get("emotional").and_then(|v| v.as_object());

        // Extract dominant traits for personalization
        let openness = big_five
            .and_then(|o| o.get("openness"))
            .and_then(|v| v.as_f64())
            .unwrap_or(50.0);
        let extraversion = big_five
            .and_then(|o| o.get("extraversion"))
            .and_then(|v| v.as_f64())
            .unwrap_or(50.0);
        let resilience = emotional
            .and_then(|o| o.get("resilience"))
            .and_then(|v| v.as_f64())
            .unwrap_or(50.0);

        // Adapt tone based on traits
        let tone = if openness > 70.0 {
            "creative, exploratory, using metaphors and possibilities"
        } else if extraversion > 70.0 {
            "energetic, direct, encouraging action and social connection"
        } else if resilience < 40.0 {
            "gentle, supportive, validating emotions while building confidence"
        } else {
            "balanced, thoughtful, practical with warmth"
        };

        // Build conversation history (Sanitized)
        let history: String = context
            .recent_messages
            .iter()
            .map(|m| format!("{}: {}", m.role, Self::sanitize_untrusted_input(&m.content)))
            .collect::<Vec<_>>()
            .join("\n");

        let openness_level = if openness > 60.0 {
            "High"
        } else if openness > 40.0 {
            "Moderate"
        } else {
            "Lower"
        };
        let extraversion_level = if extraversion > 60.0 {
            "Outgoing"
        } else if extraversion > 40.0 {
            "Balanced"
        } else {
            "Reserved"
        };
        let resilience_level = if resilience > 60.0 {
            "Strong"
        } else if resilience > 40.0 {
            "Developing"
        } else {
            "Building"
        };

        // Build RAG knowledge insertion (Sanitized)
        let knowledge = if rag_context.relevant_documents.is_empty() {
            "No specific domain knowledge retrieved for this query.".to_string()
        } else {
            let sanitized_docs: Vec<String> = rag_context.relevant_documents
                .iter()
                .map(|d| Self::sanitize_untrusted_input(d))
                .collect();
            format!(
                "RELEVANT DOMAIN KNOWLEDGE:\n- {}",
                sanitized_docs.join("\n- ")
            )
        };

        let sanitized_user_message = Self::sanitize_untrusted_input(user_message);

        format!(
            r#"<|system|>
You are PRERNA, a wise AI mentor for Indian teenagers. Your personality adapts to each user.

YOUR TONE: {tone}

RULES:
1. Be culturally sensitive to Indian context (family respect, academic pressure, career expectations)
2. Never judge - validate their feelings first
3. Ask one thoughtful question at a time
4. Keep responses under 3 sentences for chat
5. If crisis detected, gently suggest human help
6. Use Hinglish occasionally if user does
7. Be conversational, not clinical
8. NEVER claim to be a doctor, therapist, or clinical diagnostician.
9. NEVER provide medical advice.

<|user|>
<UNTRUSTED_CONTEXT>
USER PROFILE:
- Openness: {openness:.0}% ({openness_level})
- Extraversion: {extraversion:.0}% ({extraversion_level})
- Resilience: {resilience:.0}% ({resilience_level})

{knowledge}

CONVERSATION HISTORY:
{history}
</UNTRUSTED_CONTEXT>

<UNTRUSTED_INPUT>
{sanitized_user_message}
</UNTRUSTED_INPUT>

<|assistant|>"#,
        )
    }

    /// Quick check if model is loaded
    pub fn is_ready(&self) -> bool {
        !self.mock_mode
    }
}

pub fn get_model_path(app_handle: &tauri::AppHandle) -> Result<PathBuf> {
    let app_dir = app_handle
        .path()
        .app_data_dir()
        .context("Failed to get app data dir")?;
    let models_dir = app_dir.join("models");
    std::fs::create_dir_all(&models_dir)?;

    Ok(models_dir.join("mistral-7b-instruct-v0.2.Q4_K_M.gguf"))
}

// Thread-safe wrapper
// We use Option because it might fail to load if the file doesn't exist.
pub struct LLMState(pub Arc<Mutex<Option<LocalLLM>>>);
