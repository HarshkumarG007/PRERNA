import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquareHeart, 
  X, 
  Download, 
  CheckCircle2, 
  Bug, 
  Lightbulb, 
  Heart, 
  ShieldCheck,
  Send,
  Sparkles
} from 'lucide-react';
import { useUser } from '../../store';

interface FeedbackItem {
  id: string;
  category: 'experience' | 'bug' | 'idea' | 'psychometrics' | 'vitality';
  role: string;
  sentiment: 'delighted' | 'neutral' | 'needs_work';
  title: string;
  description: string;
  createdAt: string;
}

interface BetaFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BetaFeedbackModal: React.FC<BetaFeedbackModalProps> = ({ isOpen, onClose }) => {
  const user = useUser();
  const [category, setCategory] = useState<'experience' | 'bug' | 'idea' | 'vitality'>('experience');
  const [sentiment, setSentiment] = useState<'delighted' | 'neutral' | 'needs_work'>('delighted');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Load existing feedbacks from local storage
  const [feedbacks, setFeedbacks] = useState<FeedbackItem[]>(() => {
    try {
      const stored = localStorage.getItem('prerna_beta_feedbacks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    const newItem: FeedbackItem = {
      id: 'fb_' + Date.now(),
      category,
      role: user?.role || 'teen',
      sentiment,
      title: title.trim(),
      description: description.trim(),
      createdAt: new Date().toISOString(),
    };

    const updated = [newItem, ...feedbacks];
    setFeedbacks(updated);
    localStorage.setItem('prerna_beta_feedbacks', JSON.stringify(updated));

    setTitle('');
    setDescription('');
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExport = () => {
    const payload = {
      app: 'PRERNA Sanctuary',
      version: '0.1.0-beta',
      exportedAt: new Date().toISOString(),
      userPersona: user?.role || 'teen',
      totalEntries: feedbacks.length,
      feedbacks,
      dataPrivacyNotice: '100% on-device zero telemetry export per India DPDP Act 2023 Section 9.',
    };

    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prerna-beta-feedback-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-white/10 rounded-2xl backdrop-blur-md">
                <MessageSquareHeart className="w-5 h-5 text-indigo-300" />
              </div>
              <div>
                <h3 className="font-bold text-base flex items-center gap-2">
                  Beta Pilot Feedback Journal
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-amber-400 text-amber-950">
                    Cohort v0.1
                  </span>
                </h3>
                <p className="text-xs text-indigo-200/80">100% On-Device • Zero Telemetry • DPDP §9 Protected</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto space-y-6 flex-grow">
            {/* DPDP Section 9 Invariant Callout */}
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Zero-Cloud Telemetry Guarantee:</span> Feedback entered here is never transmitted to any cloud servers or third parties. It is stored securely on your local device only. You can download the JSON export to share voluntarily with Harsh Kumar Gupta.
              </div>
            </div>

            {/* Submission Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Category</label>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { id: 'experience', label: 'Wellbeing', icon: Heart },
                    { id: 'vitality', label: 'Kaya Kalpa', icon: Sparkles },
                    { id: 'idea', label: 'Suggestion', icon: Lightbulb },
                    { id: 'bug', label: 'Bug / Issue', icon: Bug },
                  ].map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => setCategory(cat.id as any)}
                        className={`p-2.5 rounded-xl border flex flex-col items-center gap-1 text-center transition-all cursor-pointer ${
                          category === cat.id
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span className="text-[11px]">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Experience Tone</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: 'delighted', emoji: '✨', label: 'Harmonious / Loving' },
                    { id: 'neutral', emoji: '🤔', label: 'Thoughtful / Clear' },
                    { id: 'needs_work', emoji: '🛠️', label: 'Needs Polish' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSentiment(s.id as any)}
                      className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                        sentiment === s.id
                          ? 'bg-indigo-50 border-indigo-500 text-indigo-900 font-bold'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      <span className="text-sm">{s.emoji}</span>
                      <div className="text-[10px] text-slate-500 font-medium">{s.label}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Observation Summary</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 90-min sleep alarm was soothing, or question phrasing was easy"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Detailed Feedback</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What worked beautifully? What felt confusing or could be improved for adolescents and families?"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                  required
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold flex items-center gap-2 shadow-sm transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  Save Note to Device
                </button>

                {savedSuccess && (
                  <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" />
                    Saved to local vault!
                  </span>
                )}
              </div>
            </form>

            {/* Saved Observations List */}
            {feedbacks.length > 0 && (
              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Recorded Notes ({feedbacks.length})
                  </h4>
                  <button
                    onClick={handleExport}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 hover:underline cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Feedback JSON
                  </button>
                </div>

                <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                  {feedbacks.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800">{item.title}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{item.category} • {new Date(item.createdAt).toLocaleDateString()}</span>
                      </div>
                      <p className="text-slate-600 leading-relaxed text-[11px]">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
            <span className="text-[11px] text-slate-500">
              PRERNA™ © 2026 Harsh Kumar Gupta
            </span>
            <button
              onClick={handleExport}
              disabled={feedbacks.length === 0}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-40 text-white text-xs font-bold flex items-center gap-2 shadow-2xs transition-colors cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              Download Full Report ({feedbacks.length})
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
