import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  MessageSquareHeart, 
  Sparkles, 
  Heart, 
  Clock, 
  Send, 
  Flame,
  Volume2,
  VolumeX,
  ShieldAlert,
  PhoneCall
} from 'lucide-react';
import { usePartnerStore } from '../../../store/partnerStore';
import { somaticAudio } from '../../../utils/audioSynthesis';
import { evaluateCrisisPatterns } from '../../../engine/crisis/patternDetection';

export interface NvcBreakdown {
  isCrisis: boolean;
  crisisMessage?: string;
  observation: string;
  feeling: string;
  need: string;
  request: string;
  fullMessage: string;
}

/**
 * Context-preserving Nonviolent Communication (NVC) generator per Marshall Rosenberg & Gottman principles.
 * Strictly checks for clinical distress, abuse, or domestic threats first (Audit M-07 / Rule 0.1).
 */
export function generateNvcReframe(rawText: string): NvcBreakdown {
  const trimmed = rawText.trim();
  const distress = evaluateCrisisPatterns(trimmed);

  if (distress.flagged) {
    const isAbuse = distress.reason?.toLowerCase().includes('abuse') || distress.reason?.toLowerCase().includes('threat');
    return {
      isCrisis: true,
      crisisMessage: isAbuse
        ? 'Clinical Safety Notice: If you are experiencing domestic intimidation, violence, coercion, or relationship abuse, nonviolent reframing is not safe or suitable. Your physical and emotional safety is the absolute priority. Please reach out to emergency helplines immediately: National Emergency 112, National Commission for Women (NCW) Helpline 7827170170 / 1091, or Tele-MANAS 14416.'
        : 'Crisis Safety Notice: Severe distress or self-harm indicators were detected. Please know you are not alone and professional support is available right now: call National Emergency 112 or Tele-MANAS 14416 / 1800-891-4416 (24/7 free mental health counseling).',
      observation: '',
      feeling: '',
      need: '',
      request: '',
      fullMessage: '',
    };
  }

  const lower = trimmed.toLowerCase();
  let observation = '';
  let feeling = '';
  let need = '';
  let request = '';

  if (lower.includes('phone') || lower.includes('screen') || lower.includes('scroll') || lower.includes('instagram')) {
    observation = 'When we are spending time together and our phones or screens are out';
    feeling = 'I feel disconnected and lonely';
    need = 'because having undivided, focused presence with you matters so much to me';
    request = 'Would you be open to putting our phones on silent and enjoying 30 minutes of uninterrupted connection together?';
  } else if (lower.includes('clean') || lower.includes('chore') || lower.includes('mess') || lower.includes('dish') || lower.includes('laundry')) {
    observation = 'When chores and household tasks accumulate without a shared plan';
    feeling = 'I feel exhausted and overwhelmed';
    need = 'because I need equal teamwork and mutual consideration to feel relaxed in our shared home';
    request = 'Could we put on some music and spend 15 minutes tackling these tasks together as partners?';
  } else if (lower.includes('late') || lower.includes('cancel') || lower.includes('delay') || lower.includes('plan')) {
    observation = 'When plans we made are changed or delayed at the last minute';
    feeling = 'I feel unsettled and anxious';
    need = 'because predictability and honoring commitments help me feel secure and valued in our relationship';
    request = 'In the future, could you give me a brief heads-up as soon as you know your schedule might shift?';
  } else if (lower.includes('listen') || lower.includes('interrupt') || lower.includes('talk over') || lower.includes('hear me')) {
    observation = 'When I am sharing something on my mind and get interrupted or feel unheard';
    feeling = 'I feel frustrated and invisible';
    need = 'because feeling emotionally heard and received is essential for my sense of closeness with you';
    request = 'Would you be willing to listen to me for just 3 minutes without giving advice, just letting me know you hear me?';
  } else if (lower.includes('money') || lower.includes('spend') || lower.includes('budget') || lower.includes('cost') || lower.includes('expense')) {
    observation = 'When unexpected expenses or financial decisions happen without a joint discussion';
    feeling = 'I feel anxious and uncertain about our future';
    need = 'because transparency and mutual agreement around finances give me a sense of security and trust';
    request = 'Could we sit down this weekend with a warm drink and do a gentle 20-minute financial alignment check-in?';
  } else if (lower.includes('tone') || lower.includes('yell') || lower.includes('shout') || lower.includes('snap') || lower.includes('harsh')) {
    observation = 'When our voices get raised or harsh tones are used in our conversation';
    feeling = 'I feel guarded, frightened, and shut down';
    need = 'because I need gentleness and emotional safety in order to stay open and communicative with you';
    request = 'Can we take a 10-minute pause to take some deep breaths, and then resume talking in a calmer tone?';
  } else {
    // Dynamic context preservation: cleanse accusatory absolutes while retaining substantive core
    let sanitizedContext = trimmed
      .replace(/\b(you always|you never|you constantly|you only|why do you always|why do you never|you don't even)\b/gi, '')
      .replace(/\b(you are|you're)\b/gi, 'there is')
      .replace(/\b(me)\b/gi, 'us')
      .replace(/[!]+/g, '.')
      .trim();
    if (!sanitizedContext.endsWith('.')) sanitizedContext += '.';

    observation = `When ${sanitizedContext.toLowerCase().replace(/^\./, '').trim() || 'situations like this occur'}`;
    feeling = 'I feel vulnerable, heavy, and a little distant';
    need = 'because emotional safety, mutual understanding, and clear communication are deeply important to me';
    request = 'Would you be willing to sit down with me tonight for a quiet, gentle conversation so we can understand each other better?';
  }

  const fullMessage = `${observation}, ${feeling.toLowerCase()} ${need}. ${request}`;

  return {
    isCrisis: false,
    observation,
    feeling,
    need,
    request,
    fullMessage,
  };
}

export const CommunicationStudio: React.FC = () => {
  const { conversationPrompts, answerPrompt } = usePartnerStore();
  const [activeTab, setActiveTab] = useState<'daily_cards' | 'nvc_reframe' | 'gratitude_jar' | 'listening_drill'>('daily_cards');
  const [isSpeakingPrompt, setIsSpeakingPrompt] = useState(false);
  const [isSpeakingReframe, setIsSpeakingReframe] = useState(false);

  useEffect(() => {
    return () => {
      somaticAudio.stopSpeaking();
    };
  }, []);

  // Daily cards state
  const [selectedPromptIndex, setSelectedPromptIndex] = useState(0);
  const [answerText, setAnswerText] = useState('');
  const [showSavedFeedback, setShowSavedFeedback] = useState(false);

  // NVC Re-framer state
  const [rawImpulsiveText, setRawImpulsiveText] = useState('');
  const [nvcBreakdown, setNvcBreakdown] = useState<NvcBreakdown | null>(null);

  // Gratitude Jar state
  const [gratitudes, setGratitudes] = useState<string[]>([
    'Loved how gently you greeted me this morning.',
    'Thank you for holding space when I was stressed about my project.',
  ]);
  const [newGratitude, setNewGratitude] = useState('');

  // Active Listening Drill state
  const [timerRunning, setTimerRunning] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(180); // 3 minutes

  const activePrompt = conversationPrompts[selectedPromptIndex] || conversationPrompts[0];

  const handleSaveAnswer = () => {
    if (!answerText.trim() || !activePrompt) return;
    somaticAudio.playStarBeaconChime();
    answerPrompt(activePrompt.id, answerText.trim());
    setAnswerText('');
    setShowSavedFeedback(true);
    setTimeout(() => setShowSavedFeedback(false), 3000);
  };

  const handleReframing = () => {
    if (!rawImpulsiveText.trim()) return;
    somaticAudio.playSoftChime();
    const result = generateNvcReframe(rawImpulsiveText);
    setNvcBreakdown(result);
  };

  const handleAddGratitude = () => {
    if (!newGratitude.trim()) return;
    somaticAudio.playStarBeaconChime();
    setGratitudes([newGratitude.trim(), ...gratitudes]);
    setNewGratitude('');
  };

  const toggleListeningTimer = () => {
    if (timerRunning) {
      setTimerRunning(false);
    } else {
      somaticAudio.playSoftChime();
      setSecondsLeft(180);
      setTimerRunning(true);
    }
  };

  React.useEffect(() => {
    let interval: any;
    if (timerRunning && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            somaticAudio.playStarBeaconChime();
            setTimerRunning(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerRunning, secondsLeft]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      
      {/* Studio Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-teal-500/10 border border-rose-200/60 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 flex-shrink-0">
            <MessageSquareHeart size={28} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              Couple Communication Studio
            </span>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Speak with Heart, Listen with Soul
            </h3>
            <p className="text-xs text-slate-500 max-w-xl mt-0.5">
              Tools to transform misunderstandings into intimacy, practice non-violent communication, and share daily gratitude.
            </p>
          </div>
        </div>

        {/* Sub-tab Switchers */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xs">
          {[
            { id: 'daily_cards', label: 'Heart Cards', icon: Heart },
            { id: 'nvc_reframe', label: 'NVC Re-framer', icon: Sparkles },
            { id: 'gratitude_jar', label: 'Gratitude Jar', icon: Flame },
            { id: 'listening_drill', label: '3-Min Listening', icon: Clock },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  somaticAudio.playSoftChime();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab 1: Daily Heart Cards */}
      {activeTab === 'daily_cards' && activePrompt && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card Visualizer */}
          <div className="md:col-span-2 p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-6 text-left relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                Category: {activePrompt.category}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Card {selectedPromptIndex + 1} of {conversationPrompts.length}
              </span>
            </div>

            <div className="p-6 rounded-2xl bg-gradient-to-br from-rose-50 via-white to-amber-50 border border-rose-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <p className="text-lg md:text-xl font-black text-slate-900 leading-snug flex-1">
                "{activePrompt.question}"
              </p>

              <button
                type="button"
                onClick={() => {
                  if (isSpeakingPrompt) {
                    somaticAudio.stopSpeaking();
                    setIsSpeakingPrompt(false);
                  } else {
                    setIsSpeakingPrompt(true);
                    somaticAudio.speakText(activePrompt.question, () => setIsSpeakingPrompt(false));
                  }
                }}
                className={`p-2.5 rounded-xl border flex items-center gap-1.5 text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                  isSpeakingPrompt
                    ? 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                    : 'bg-white text-slate-600 hover:text-rose-600 hover:bg-rose-50/50 border-slate-200'
                }`}
                title={isSpeakingPrompt ? 'Stop reading' : 'Listen with Preeti voice'}
              >
                {isSpeakingPrompt ? <VolumeX size={15} /> : <Volume2 size={15} />}
                <span>{isSpeakingPrompt ? 'Stop' : 'Read Aloud'}</span>
              </button>
            </div>

            {/* Answer Input */}
            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-700 block">
                Your Heart’s Reflection:
              </label>
              <textarea
                rows={3}
                value={answerText}
                onChange={(e) => setAnswerText(e.target.value)}
                placeholder="Write your genuine, unhurried reflection..."
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              />

              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {showSavedFeedback ? '✨ Reflection saved to your shared sanctuary!' : 'Take all the time you need.'}
                </span>

                <button
                  onClick={handleSaveAnswer}
                  disabled={!answerText.trim()}
                  className="px-6 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Send size={14} /> Save Reflection
                </button>
              </div>
            </div>

            {/* Existing Answer Display */}
            {activePrompt.myAnswer && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Your Stored Reflection:</span>
                <p className="text-slate-600 italic">"{activePrompt.myAnswer}"</p>
              </div>
            )}
          </div>

          {/* Card Carousel Navigation */}
          <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-3 text-left">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 mb-2">
              All Available Cards
            </h4>
            <div className="space-y-2">
              {conversationPrompts.map((p, idx) => (
                <button
                  key={p.id}
                  onClick={() => {
                    somaticAudio.playSoftChime();
                    setSelectedPromptIndex(idx);
                  }}
                  className={`w-full p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                    selectedPromptIndex === idx
                      ? 'bg-white border-rose-300 shadow-xs'
                      : 'bg-white/60 border-slate-200/60 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1">
                    <span className="uppercase">{p.category}</span>
                    {p.myAnswer && <span className="text-emerald-600">✓ Answered</span>}
                  </div>
                  <p className="text-xs font-bold text-slate-800 line-clamp-2">{p.question}</p>
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {/* Tab 2: Nonviolent Communication (NVC) Re-framer */}
      {activeTab === 'nvc_reframe' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md text-left space-y-6">
          <div>
            <h4 className="text-lg font-black text-slate-900 tracking-tight">
              Compassionate NVC Re-framer (अहिंसक सम्प्रेषण)
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              When triggered, we often speak in generalizations ("You always ignore me"). Type your unfiltered frustration below, and let the assistant reframe it using Marshall Rosenberg's 4-step framework: <em>Observation → Feeling → Need → Gentle Request</em>.
            </p>
          </div>

          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              What do you want to say right now? (Raw & unfiltered):
            </label>
            <textarea
              rows={3}
              value={rawImpulsiveText}
              onChange={(e) => setRawImpulsiveText(e.target.value)}
              placeholder="e.g., You are always on your phone and never make time for me!"
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <button
              onClick={handleReframing}
              disabled={!rawImpulsiveText.trim()}
              className="px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles size={14} /> Reframe with Compassion
            </button>
          </div>

          {/* Clinical Distress / Abuse Emergency Warning Banner */}
          {nvcBreakdown?.isCrisis && (
            <div className="p-6 rounded-3xl bg-rose-50 border-2 border-rose-300 space-y-4 animate-fade-in text-rose-950">
              <div className="flex items-center gap-2.5 text-rose-800">
                <ShieldAlert size={22} className="flex-shrink-0" />
                <h5 className="text-sm font-black uppercase tracking-wider">
                  Safety & Emergency Protocol Alert
                </h5>
              </div>
              <p className="text-xs leading-relaxed font-medium">
                {nvcBreakdown.crisisMessage}
              </p>
              <div className="pt-2 flex flex-wrap gap-2 text-xs font-bold">
                <a
                  href="tel:112"
                  className="px-4 py-2 bg-rose-600 text-white rounded-xl flex items-center gap-1.5 shadow-sm hover:bg-rose-700 transition-colors"
                >
                  <PhoneCall size={14} /> Call 112 (National Emergency)
                </a>
                <a
                  href="tel:14416"
                  className="px-4 py-2 bg-white border border-rose-300 text-rose-900 rounded-xl flex items-center gap-1.5 hover:bg-rose-100 transition-colors"
                >
                  <PhoneCall size={14} /> Tele-MANAS (14416)
                </a>
                <a
                  href="tel:7827170170"
                  className="px-4 py-2 bg-white border border-rose-300 text-rose-900 rounded-xl flex items-center gap-1.5 hover:bg-rose-100 transition-colors"
                >
                  <PhoneCall size={14} /> NCW Helpline (7827170170)
                </a>
              </div>
            </div>
          )}

          {/* Genuine 4-Step OFNR Breakdown & Reframed Message */}
          {nvcBreakdown && !nvcBreakdown.isCrisis && (
            <div className="space-y-4 animate-fade-in">
              {/* 4-Step OFNR Model Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-amber-900 font-black text-[11px] uppercase tracking-wider">
                    <span>🌿 Step 1: Observation (तथ्य)</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {nvcBreakdown.observation}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-rose-900 font-black text-[11px] uppercase tracking-wider">
                    <span>🕊️ Step 2: Feeling (संवेदना)</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {nvcBreakdown.feeling}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-teal-900 font-black text-[11px] uppercase tracking-wider">
                    <span>⚓ Step 3: Universal Need (मूल आवश्यकता)</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {nvcBreakdown.need}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-200/80 space-y-1">
                  <div className="flex items-center gap-1.5 text-indigo-900 font-black text-[11px] uppercase tracking-wider">
                    <span>🤝 Step 4: Actionable Request (अनुरोध)</span>
                  </div>
                  <p className="text-slate-700 leading-relaxed text-[11px]">
                    {nvcBreakdown.request}
                  </p>
                </div>
              </div>

              {/* Complete Reframed Compassionate Statement */}
              <div className="p-6 rounded-3xl bg-emerald-50 border-2 border-emerald-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    Reframed Compassionate Message (OFNR):
                  </span>
                  <span className="text-[10px] text-emerald-700 font-semibold hidden sm:inline">
                    Marshall Rosenberg Model
                  </span>
                </div>
                <p className="text-sm font-semibold text-emerald-950 italic leading-relaxed">
                  "{nvcBreakdown.fullMessage}"
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-2 text-xs">
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(nvcBreakdown.fullMessage);
                      somaticAudio.playSoftChime();
                      alert('Copied reframed message to clipboard!');
                    }}
                    className="px-3.5 py-1.5 bg-white border border-emerald-300 rounded-xl text-emerald-800 font-bold hover:bg-emerald-100 transition-colors cursor-pointer shadow-2xs"
                  >
                    Copy to Share
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (isSpeakingReframe) {
                        somaticAudio.stopSpeaking();
                        setIsSpeakingReframe(false);
                      } else {
                        setIsSpeakingReframe(true);
                        somaticAudio.speakText(nvcBreakdown.fullMessage, () => setIsSpeakingReframe(false));
                      }
                    }}
                    className={`px-3.5 py-1.5 rounded-xl border font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs ${
                      isSpeakingReframe
                        ? 'bg-emerald-200 text-emerald-900 border-emerald-400 animate-pulse'
                        : 'bg-white border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                    }`}
                    title={isSpeakingReframe ? 'Stop audio' : 'Listen with Preeti voice'}
                  >
                    {isSpeakingReframe ? <VolumeX size={14} /> : <Volume2 size={14} />}
                    <span>{isSpeakingReframe ? 'Stop Audio' : 'Listen Cadence'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Tab 3: Gratitude Jar */}
      {activeTab === 'gratitude_jar' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md text-left space-y-6">
          <div>
            <h4 className="text-lg font-black text-slate-900 tracking-tight">
              Shared Gratitude & Appreciation Jar 🍯
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xl">
              Research shows that couples who verbalize 5 positive appreciations for every 1 critique thrive with lifelong stability and joy.
            </p>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={newGratitude}
              onChange={(e) => setNewGratitude(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddGratitude()}
              placeholder="What made you appreciate your partner today?"
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
            <button
              onClick={handleAddGratitude}
              disabled={!newGratitude.trim()}
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-2xl text-xs font-bold transition-all shadow-sm cursor-pointer flex-shrink-0"
            >
              Drop in Jar
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {gratitudes.map((item, idx) => (
              <div key={idx} className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-xs text-amber-950 space-y-1">
                <span className="text-[10px] text-amber-700 font-mono font-bold block">✨ Gratitude Note</span>
                <p className="font-medium italic leading-relaxed">"{item}"</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tab 4: 3-Minute Active Listening Drill */}
      {activeTab === 'listening_drill' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md text-left space-y-6">
          <div>
            <h4 className="text-lg font-black text-slate-900 tracking-tight">
              3-Minute Sacred Listening Practice (श्रोता योग)
            </h4>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
              Rules: One person speaks for 3 minutes without interruption, advice, or debate. The listener simply maintains warm eye contact and breathes. When the bell sounds, the listener summarizes what they felt, not to argue, but to validate.
            </p>
          </div>

          <div className="flex flex-col items-center justify-center p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-4">
            <div className="w-32 h-32 rounded-full border-4 border-rose-500 flex items-center justify-center text-3xl font-black font-mono text-slate-900 shadow-inner">
              {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
            </div>

            <button
              onClick={toggleListeningTimer}
              className={`px-8 py-3.5 rounded-2xl font-bold text-xs transition-all shadow-md cursor-pointer ${
                timerRunning
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-slate-900 text-white hover:bg-slate-800'
              }`}
            >
              {timerRunning ? 'Pause Drill' : secondsLeft === 0 ? 'Restart Drill' : 'Start 3-Minute Listening'}
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
};
