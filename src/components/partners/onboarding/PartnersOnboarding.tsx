import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Sparkles, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Eye, 
  EyeOff, 
  Users2, 
  Smile, 
  ShieldCheck, 
  Calendar 
} from 'lucide-react';
import { usePartnerStore, RelationshipMode, RelationshipType } from '../../../store/partnerStore';
import { somaticAudio } from '../../../utils/audioSynthesis';

interface PartnersOnboardingProps {
  onComplete: () => void;
}

export const PartnersOnboarding: React.FC<PartnersOnboardingProps> = ({ onComplete }) => {
  const { profile, updateProfile, setRelationshipMode } = usePartnerStore();

  const [step, setStep] = useState(1);
  const [mode, setMode] = useState<RelationshipMode>(profile.mode);
  const [relationshipType, setRelationshipType] = useState<RelationshipType>(profile.relationshipType);
  const [nickname, setNickname] = useState(profile.nickname || '');
  const [pronouns, setPronouns] = useState(profile.pronouns || 'They/Them');
  const [anniversaryDate, setAnniversaryDate] = useState(profile.anniversaryDate || '');

  // Love language scores
  const [loveScores, setLoveScores] = useState(profile.loveLanguageScores);
  const [loveLangVisibility, setLoveLangVisibility] = useState(profile.visibility.loveLanguages);

  // Emotional needs
  const [selectedNeeds, setSelectedNeeds] = useState<string[]>(profile.emotionalNeeds);
  const [needsVisibility, setNeedsVisibility] = useState(profile.visibility.emotionalNeeds);

  // Boundaries
  const [boundaries, setBoundaries] = useState<string[]>(profile.comfortBoundaries);
  const [newBoundary, setNewBoundary] = useState('');
  const [boundariesVisibility, setBoundariesVisibility] = useState(profile.visibility.boundaries);

  const EMOTIONAL_NEEDS_LIST = [
    'Deep Active Listening',
    'Unconditional Warmth',
    'Safe Space for Vulnerability',
    'Playful Spontaneity & Laughter',
    'Physical Affection & Closeness',
    'Shared Intellectual Curiosity',
    'Space to Decompress in Silence',
    'Words of Gentle Reassurance',
  ];

  const handleToggleNeed = (need: string) => {
    somaticAudio.playSoftChime();
    setSelectedNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const handleAddBoundary = () => {
    if (!newBoundary.trim()) return;
    somaticAudio.playSoftChime();
    setBoundaries([...boundaries, newBoundary.trim()]);
    setNewBoundary('');
  };

  const handleFinish = () => {
    somaticAudio.playStarBeaconChime();
    updateProfile({
      mode,
      relationshipType,
      nickname: nickname.trim() || (mode === 'lovers' ? 'My Beloved' : 'My Bestie'),
      pronouns,
      anniversaryDate: anniversaryDate || undefined,
      loveLanguageScores: loveScores,
      emotionalNeeds: selectedNeeds,
      comfortBoundaries: boundaries,
      visibility: {
        loveLanguages: loveLangVisibility,
        emotionalNeeds: needsVisibility,
        boundaries: boundariesVisibility,
      },
    });
    setRelationshipMode(mode);
    onComplete();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-2xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-10 shadow-2xl border border-slate-200/80 relative overflow-hidden">
        
        {/* Step Indicator Top Bar */}
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-sm">
              {mode === 'lovers' ? <Heart size={20} className="fill-white" /> : <Users2 size={20} />}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {mode === 'lovers' ? 'Couples Onboarding' : 'Besties Onboarding'}
              </h3>
              <p className="text-[11px] text-slate-400">Step {step} of 3 • Relationship Architecture</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`h-2 rounded-full transition-all ${
                  s === step ? 'w-8 bg-rose-500' : s < step ? 'w-3 bg-emerald-500' : 'w-2 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Mode & Identity */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-left">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                Identity & Connection
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">How do you define your bond?</h2>
              <p className="text-xs text-slate-500 mt-1">
                PRERNA adapts its vocabulary, reflection cards, and exercises to your relationship essence.
              </p>
            </div>

            {/* Mode Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setMode('lovers');
                  setRelationshipType('romantic_partner');
                }}
                className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  mode === 'lovers'
                    ? 'border-rose-500 bg-rose-50/60 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center text-rose-600 mb-3">
                  <Heart size={20} className={mode === 'lovers' ? 'fill-rose-600' : ''} />
                </div>
                <h4 className="font-black text-sm text-slate-900">Lovers & Couples ❤️</h4>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  Romance, emotional intimacy, sensual vitality, and shared lifetime dreaming.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode('besties');
                  setRelationshipType('best_friend');
                }}
                className={`p-5 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  mode === 'besties'
                    ? 'border-amber-500 bg-amber-50/60 shadow-sm'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                }`}
              >
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 mb-3">
                  <Users2 size={20} />
                </div>
                <h4 className="font-black text-sm text-slate-900">Besties & Soul Friends 🪷</h4>
                <p className="text-xs text-slate-500 mt-1 leading-snug">
                  Unbreakable platonic friendship, shared laughter, life quests, and mutual honesty.
                </p>
              </button>
            </div>

            {/* Names & Dates */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  How do you address them?
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder={mode === 'lovers' ? 'e.g., My Jaan, Priye' : 'e.g., Bestie, Dost'}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Pronouns
                </label>
                <input
                  type="text"
                  value={pronouns}
                  onChange={(e) => setPronouns(e.target.value)}
                  placeholder="They/Them, She/Her, He/Him"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Anniversary / Met Date
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={anniversaryDate}
                    onChange={(e) => setAnniversaryDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  />
                  <Calendar size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                somaticAudio.playSoftChime();
                setStep(2);
              }}
              className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <span>Continue to Love Languages</span>
              <ArrowRight size={18} />
            </button>
          </motion.div>
        )}

        {/* Step 2: 5 Love Languages / Connection Styles */}
        {step === 2 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-left flex items-start justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                  Affection & Resonance
                </span>
                <h2 className="text-2xl font-black text-slate-900 mt-2">What makes your heart feel full?</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Rate how deeply you resonate with each connection style (0 to 100).
                </p>
              </div>

              {/* Granular Visibility Toggle */}
              <button
                type="button"
                onClick={() => {
                  setLoveLangVisibility(
                    loveLangVisibility === 'shared_partner' ? 'private' : 'shared_partner'
                  );
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700"
                title="Toggle visibility"
              >
                {loveLangVisibility === 'shared_partner' ? <Eye size={14} className="text-emerald-600" /> : <EyeOff size={14} className="text-slate-400" />}
                <span>{loveLangVisibility === 'shared_partner' ? 'Shared with Partner' : 'Private to Me'}</span>
              </button>
            </div>

            <div className="space-y-3.5 text-left">
              {[
                { key: 'wordsOfAffirmation', label: 'Words of Affirmation', desc: 'Verbal praise, love letters, gratitude, and reassurance.' },
                { key: 'qualityTime', label: 'Quality Time', desc: 'Undivided presence, deep eye contact, and distraction-free moments.' },
                { key: 'actsOfService', label: 'Acts of Service', desc: 'Easing burdens, thoughtful help, and caring actions.' },
                { key: 'receivingGifts', label: 'Thoughtful Tokens & Gifts', desc: 'Symbols of remembrance, surprise flowers, or meaningful tokens.' },
                { key: 'physicalTouch', label: 'Physical Affection & Warmth', desc: 'Hugs, holding hands, touch, and comforting somatic proximity.' },
              ].map((item) => (
                <div key={item.key} className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-slate-900">{item.label}</span>
                      <p className="text-[10px] text-slate-400">{item.desc}</p>
                    </div>
                    <span className="font-mono font-bold text-rose-600 text-sm">
                      {(loveScores as any)[item.key]}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={(loveScores as any)[item.key]}
                    onChange={(e) => {
                      setLoveScores({
                        ...loveScores,
                        [item.key]: parseInt(e.target.value),
                      });
                    }}
                    className="w-full accent-rose-500 cursor-pointer"
                  />
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="py-4 px-6 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-sm cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={() => {
                  somaticAudio.playSoftChime();
                  setStep(3);
                }}
                className="flex-1 py-4 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
              >
                <span>Continue to Emotional Needs</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Emotional Needs & Comfort Boundaries */}
        {step === 3 && (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
            <div className="text-left">
              <span className="text-[11px] font-black uppercase tracking-wider text-rose-600 bg-rose-50 px-3 py-1 rounded-full border border-rose-200">
                Emotional Sovereignty & Safety
              </span>
              <h2 className="text-2xl font-black text-slate-900 mt-2">Needs & Healthy Boundaries</h2>
              <p className="text-xs text-slate-500 mt-1">
                Healthy relationships thrive on clarity. Choose the needs and boundaries that matter most to you.
              </p>
            </div>

            {/* Emotional Needs Selection */}
            <div className="text-left space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Select Your Top Emotional Needs:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setNeedsVisibility(
                      needsVisibility === 'shared_partner' ? 'private' : 'shared_partner'
                    );
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700"
                  title="Toggle visibility"
                >
                  {needsVisibility === 'shared_partner' ? <Eye size={12} className="text-emerald-600" /> : <EyeOff size={12} className="text-slate-400" />}
                  <span>{needsVisibility === 'shared_partner' ? 'Shared with Partner' : 'Private to Me'}</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {EMOTIONAL_NEEDS_LIST.map((need) => {
                  const isSelected = selectedNeeds.includes(need);
                  return (
                    <button
                      key={need}
                      type="button"
                      onClick={() => handleToggleNeed(need)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                        isSelected
                          ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {isSelected ? <Check size={14} className="text-rose-600" /> : <Smile size={14} className="text-slate-400" />}
                      <span>{need}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Boundaries Setup */}
            <div className="text-left space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 block">
                  Personal Comfort Boundaries:
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setBoundariesVisibility(
                      boundariesVisibility === 'shared_partner' ? 'private' : 'shared_partner'
                    );
                  }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl border text-[11px] font-bold transition-colors cursor-pointer bg-slate-100 hover:bg-slate-200 text-slate-700"
                  title="Toggle visibility"
                >
                  {boundariesVisibility === 'shared_partner' ? <Eye size={12} className="text-emerald-600" /> : <EyeOff size={12} className="text-slate-400" />}
                  <span>{boundariesVisibility === 'shared_partner' ? 'Shared with Partner' : 'Private to Me'}</span>
                </button>
              </div>
              <div className="space-y-1.5">
                {boundaries.map((b, i) => (
                  <div key={i} className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                    <span className="text-slate-800 font-medium">🛡️ {b}</span>
                    <button
                      onClick={() => setBoundaries(boundaries.filter((_, idx) => idx !== i))}
                      className="text-slate-400 hover:text-rose-600 text-[10px] font-bold cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex gap-2 pt-1">
                <input
                  type="text"
                  value={newBoundary}
                  onChange={(e) => setNewBoundary(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddBoundary()}
                  placeholder="e.g. Need 30 min solitude after travel"
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={handleAddBoundary}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold cursor-pointer transition-colors"
                >
                  Add
                </button>
              </div>
            </div>

            {/* Privacy Guarantee Notice */}
            <div className="flex items-start gap-2 bg-emerald-50/80 p-3 rounded-2xl border border-emerald-200 text-left text-[11px] text-emerald-950">
              <ShieldCheck size={16} className="text-emerald-700 flex-shrink-0 mt-0.5" />
              <span>
                <strong>DPDP Act 2023 §9 Protection:</strong> All answers remain 100% on-device in your private local vault. Nothing is uploaded to remote cloud databases.
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setStep(2)}
                className="py-4 px-6 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 font-bold text-sm cursor-pointer"
              >
                <ArrowLeft size={18} />
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-4 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-rose-500/25"
              >
                <span>Enter Partners Sanctuary</span>
                <Sparkles size={18} />
              </button>
            </div>
          </motion.div>
        )}

      </div>
    </div>
  );
};
