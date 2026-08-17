use crate::ai::prompts::Message;
use crate::ai::safety::SafetyFilter;
use crate::ai::LLMState;
use crate::db::DbState;
use crate::{ActiveSession, ConversationStore};
use serde::{Deserialize, Serialize};
use tauri::State;

#[derive(Debug, Deserialize)]
pub struct ChatRequest {
    // T7: user_id and recent_messages removed from client payload.
    // Identity is derived from the backend ActiveSession.
    // Conversation history is managed by the backend ring buffer (future sprint).
    pub message: String,
    pub conversation_id: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct ChatResponse {
    pub response: String,
    pub conversation_id: String,
    pub sentiment: String,
    pub suggested_actions: Vec<String>,
}

#[derive(Debug, Serialize)]
pub struct ModelStatus {
    pub loaded: bool,
    pub model_name: String,
    pub vram_usage_mb: u32,
    pub temperature: f32,
}

#[tauri::command]
pub fn chat_with_mentor(
    llm_state: State<LLMState>,
    db_state: State<DbState>,
    session: State<ActiveSession>,
    store: State<ConversationStore>,
    request: ChatRequest,
) -> Result<ChatResponse, String> {
    execute_mentor_chat(&llm_state, &db_state, &session, &store, request)
}

pub fn execute_mentor_chat(
    llm_state: &LLMState,
    db_state: &DbState,
    session: &ActiveSession,
    store: &ConversationStore,
    request: ChatRequest,
) -> Result<ChatResponse, String> {
    // T1: Derive user identity from backend session, never from renderer
    let user_id = session.get_user_id()?;

    // T6 & T15: Input-side SafetyFilter check.
    // If the user's message contains crisis-level language, route to crisis
    // protocol path, explicitly persisting the CrisisEvent.
    if let Some(response) = handle_crisis_detection(db_state, &user_id, &request)? {
        return Ok(response);
    }

    let mut guard = llm_state.0.lock().map_err(|e| e.to_string())?;

    if guard.is_none() {
        return Err("AI model is not loaded. Please download it first.".to_string());
    }

    let llm = guard.as_mut().unwrap();

    let db = db_state.0.lock().map_err(|e| e.to_string())?;

    // Get user's trait profile
    let profile = db
        .get_latest_snapshot(&user_id)
        .map_err(|e| e.to_string())?;

    let trait_json = match profile {
        Some(p) => serde_json::json!({
            "bigFive": p.big_five,
            "riasec": p.riasec,
            "emotional": p.emotional_profile,
        }),
        None => serde_json::json!({}),
    };

    // T7b: Retrieve backend-owned conversation history
    let mut history = {
        let guard = store.0.lock().map_err(|e| e.to_string())?;
        guard.get(&user_id).cloned().unwrap_or_default()
    };

    // Build conversation context
    let context = crate::ai::prompts::ConversationContext {
        user_id: user_id.clone(),
        recent_messages: history.clone(), // Context sees previous messages
    };

    // Generate response (output-side SafetyFilter is called inside generate_response)
    let response = llm
        .generate_response(&context, &request.message, &trait_json)
        .map_err(|e| e.to_string())?;

    // Update store with new messages and enforce bounds (max 10 recent messages)
    history.push(Message {
        role: "user".to_string(),
        content: request.message.clone(),
    });
    history.push(Message {
        role: "assistant".to_string(),
        content: response.clone(),
    });
    if history.len() > 10 {
        let skip = history.len() - 10;
        history = history.into_iter().skip(skip).collect();
    }

    {
        let mut guard = store.0.lock().map_err(|e| e.to_string())?;
        guard.insert(user_id.clone(), history);
    }

    let sentiment = analyze_sentiment(&request.message);
    let suggested_actions = suggest_actions(&request.message, &sentiment);

    // Log interaction (Data Minimization: Do NOT store raw text)
    let _ = db.log_micro_interaction(&crate::db::models::MicroInteraction {
        id: String::new(),
        user_id: user_id.clone(),
        interaction_type: "ai_chat_ephemeral".to_string(),
        metadata: serde_json::json!({
            "message_length": request.message.len(),
            "response_length": response.len(),
            "sentiment": &sentiment,
            "suggested_actions_count": suggested_actions.len(),
            "data_policy": "minimized_ephemeral",
        })
        .to_string(),
        emotional_signal: sentiment_score(&sentiment),
        timestamp: chrono::Utc::now().to_rfc3339(),
    });

    Ok(ChatResponse {
        response,
        conversation_id: request
            .conversation_id
            .unwrap_or_else(|| uuid::Uuid::new_v4().to_string()),
        sentiment,
        suggested_actions,
    })
}

#[tauri::command]
pub fn get_model_status(llm_state: State<LLMState>) -> Result<ModelStatus, String> {
    let guard = llm_state.0.lock().map_err(|e| e.to_string())?;

    if let Some(llm) = guard.as_ref() {
        Ok(ModelStatus {
            loaded: llm.is_ready(),
            model_name: "Mistral-7B-Instruct-Q4".to_string(),
            vram_usage_mb: 4500, // Approximate for 4-bit 7B
            temperature: 0.7,
        })
    } else {
        Ok(ModelStatus {
            loaded: false,
            model_name: "Not Loaded".to_string(),
            vram_usage_mb: 0,
            temperature: 0.7,
        })
    }
}

#[tauri::command]
pub fn unload_model(llm_state: State<LLMState>) -> Result<(), String> {
    let mut guard = llm_state.0.lock().map_err(|e| e.to_string())?;
    // By setting it to None, we drop the LocalLLM which drops the Arc to LlamaBackend,
    // freeing VRAM memory safely.
    *guard = None;
    log::info!("AI Model explicitly unloaded to free VRAM.");
    Ok(())
}

#[tauri::command]
pub fn generate_career_insight(
    llm_state: State<LLMState>,
    db_state: State<DbState>,
    session: State<ActiveSession>,
) -> Result<String, String> {
    let user_id = session.get_user_id()?;

    let mut guard = llm_state.0.lock().map_err(|e| e.to_string())?;
    if guard.is_none() {
        return Err("AI model is not loaded. Please download it first.".to_string());
    }

    let llm = guard.as_mut().unwrap();
    let db = db_state.0.lock().map_err(|e| e.to_string())?;

    let profile = db
        .get_latest_snapshot(&user_id)
        .map_err(|e| e.to_string())?
        .ok_or("No profile found")?;

    let prompt = format!(
        r#"Based on this personality profile, suggest 3 career paths for an Indian teenager:

Big Five Traits:
- Openness: {:.0}%
- Conscientiousness: {:.0}%
- Extraversion: {:.0}%
- Agreeableness: {:.0}%
- Neuroticism: {:.0}%

RIASEC Interests (highest 3):
{}

Provide specific, realistic career suggestions for India with brief reasoning for each."#,
        profile.big_five.openness,
        profile.big_five.conscientiousness,
        profile.big_five.extraversion,
        profile.big_five.agreeableness,
        profile.big_five.neuroticism,
        format_riasec(&profile.riasec),
    );

    let context = crate::ai::prompts::ConversationContext {
        user_id,
        recent_messages: vec![],
    };

    llm.generate_response(&context, &prompt, &serde_json::json!({}))
        .map_err(|e| e.to_string())
}

fn analyze_sentiment(message: &str) -> String {
    let lower = message.to_lowercase();
    if lower.contains("sad") || lower.contains("depressed") || lower.contains("hopeless") {
        "negative_concern".to_string()
    } else if lower.contains("happy") || lower.contains("excited") || lower.contains("great") {
        "positive".to_string()
    } else if lower.contains("anxious") || lower.contains("worried") || lower.contains("stress") {
        "anxious".to_string()
    } else {
        "neutral".to_string()
    }
}

fn sentiment_score(sentiment: &str) -> f32 {
    match sentiment {
        "positive" => 0.8,
        "neutral" => 0.5,
        "anxious" => 0.3,
        "negative_concern" => 0.2,
        _ => 0.5,
    }
}

fn suggest_actions(message: &str, sentiment: &str) -> Vec<String> {
    let mut actions = vec![];

    if sentiment == "negative_concern" {
        actions.push("Try Mood Mirror mini-game".to_string());
        actions.push("Connect with counselor".to_string());
    }

    if message.to_lowercase().contains("career") || message.to_lowercase().contains("future") {
        actions.push("Explore Career Pathways".to_string());
        actions.push("Take Skill Arena assessment".to_string());
    }

    if actions.is_empty() {
        actions.push("Play today's Life Quest".to_string());
    }

    actions
}

fn format_riasec(riasec: &crate::db::models::Riasec) -> String {
    let mut scores = [
        ("Realistic", riasec.realistic),
        ("Investigative", riasec.investigative),
        ("Artistic", riasec.artistic),
        ("Social", riasec.social),
        ("Enterprising", riasec.enterprising),
        ("Conventional", riasec.conventional),
    ];
    // We reverse the compare block to get highest first. We can't use partial_cmp().unwrap() safely if NaN is possible, but this is a simplified example.
    scores.sort_by(|a, b| b.1.partial_cmp(&a.1).unwrap_or(std::cmp::Ordering::Equal));

    scores
        .iter()
        .take(3)
        .map(|(name, score)| format!("- {}: {:.0}%", name, score))
        .collect::<Vec<_>>()
        .join("\n")
}

pub(crate) fn handle_crisis_detection(
    db_state: &DbState,
    user_id: &str,
    request: &ChatRequest,
) -> Result<Option<ChatResponse>, String> {
    let input_filter = SafetyFilter::new();
    if input_filter.detect_crisis(&request.message) {
        let db = db_state.0.lock().map_err(|e| e.to_string())?;

        let crisis_event = crate::db::models::CrisisEvent {
            id: uuid::Uuid::new_v4().to_string(),
            user_id: user_id.to_string(),
            detected_at: chrono::Utc::now().timestamp(),
            severity: "high".to_string(),
            human_review_status: "pending".to_string(),
            reviewer_id: None,
            reviewer_credentials_ref: None,
            decision: None,
            teen_informed_at: None,
        };

        // If this fails, we return the error rather than silently swallowing it.
        db.create_crisis_event(&crisis_event)
            .map_err(|e| e.to_string())?;

        return Ok(Some(ChatResponse {
            response: "It sounds like you might be going through something really difficult. You are not alone. Please reach out to the KIRAN Mental Health Helpline: 1800-599-0019 (free, 24/7, multilingual).".to_string(),
            conversation_id: request
                .conversation_id
                .clone()
                .unwrap_or_else(|| uuid::Uuid::new_v4().to_string()),
            sentiment: "crisis".to_string(),
            suggested_actions: vec!["Call KIRAN 1800-599-0019".to_string()],
        }));
    }
    Ok(None)
}


