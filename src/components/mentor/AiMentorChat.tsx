import React, { useState } from 'react';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { validateSessionCreation, SessionConfig } from '../../engine/consent/sessionGate';
import { sendMessageToLLM, ChatMessage, UserContext } from '../../ai/llmClient';
import { useI18n } from '../../engine/localization/i18n';

interface AiMentorChatProps {
  userId: string;
  userContext: UserContext;
}

export const AiMentorChat: React.FC<AiMentorChatProps> = ({ userId, userContext }) => {
  const { language } = useI18n();
  const [disclosureAccepted, setDisclosureAccepted] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const disclosure = CURRENT_DISCLOSURES.ai_mentor;

  const handleStartSession = () => {
    try {
      const config: SessionConfig = {
        userId,
        sessionType: 'ai_mentor',
        disclosureShownId: disclosure.id,
      };
      
      validateSessionCreation(config);
      setIsSessionActive(true);
      
      // Welcome message from AI
      setMessages([
        { role: 'assistant', content: 'Hi there! I am PRERNA’s AI Mentor. I’m here to help you explore your interests. What’s on your mind today?' }
      ]);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg: ChatMessage = { role: 'user', content: input };
    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput('');
    setIsTyping(true);

    try {
      const aiResponseContent = await sendMessageToLLM(userMsg.content, newHistory, userContext);
      const aiMsg: ChatMessage = { role: 'assistant', content: aiResponseContent };
      setMessages([...newHistory, aiMsg]);
    } catch (err) {
      console.error("Failed to get response from AI Mentor", err);
      setMessages([...newHistory, { role: 'assistant', content: 'Sorry, I am having trouble connecting to my brain right now.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  if (!disclosureAccepted) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-md border border-blue-100">
        <h2 className="text-2xl font-bold text-blue-900">AI Mentor</h2>
        <div className="mt-4 bg-blue-100 p-4 rounded-lg">
          <p className="text-sm font-medium text-blue-800">Before we chat:</p>
          <p className="text-teal-900 mt-2">{disclosure.text[language]}</p>
        </div>
        <button
          onClick={() => setDisclosureAccepted(true)}
          className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 hover:-translate-y-0.5 transition-transform"
        >
          I Understand
        </button>
      </div>
    );
  }

  if (!isSessionActive) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-center">
        <button
          onClick={handleStartSession}
          className="py-3 px-6 rounded-full shadow-lg text-lg font-bold text-white bg-blue-600 hover:bg-blue-700 transition-transform hover:scale-105"
        >
          Start Chatting
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 flex flex-col h-[600px] bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="p-4 bg-blue-600 text-white flex justify-between items-center">
        <h2 className="text-lg font-bold">AI Mentor (Artificial Intelligence)</h2>
      </div>
      
      <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-gray-50">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[75%] p-3 rounded-lg ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'}`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="max-w-[75%] p-3 rounded-lg bg-white border border-gray-200 text-gray-500 rounded-bl-none shadow-sm">
              Typing...
            </div>
          </div>
        )}
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-gray-200 flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me anything..."
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isTyping || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md font-medium hover:bg-blue-700 disabled:bg-blue-300"
        >
          Send
        </button>
      </form>
    </div>
  );
};
