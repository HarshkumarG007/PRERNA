use serde::{Serialize, Deserialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct Message {
    pub role: String,
    pub content: String,
}

pub struct ConversationContext {
    pub user_id: String,
    pub recent_messages: Vec<Message>,
}
