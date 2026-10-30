import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Sparkles, 
  Check, 
  Plus, 
  Feather, 
  Copy, 
  MapPin, 
  Calendar
} from 'lucide-react';
import { usePartnerStore, DateIdea } from '../../../store/partnerStore';
import { somaticAudio } from '../../../utils/audioSynthesis';

export const RomanceAndHangoutStudio: React.FC = () => {
  const { profile, dateIdeas, toggleDateCompleted, addDateIdea, bucketList, toggleBucketItem, addBucketItem } = usePartnerStore();
  const [activeSubTab, setActiveSubTab] = useState<'dates' | 'love_letters' | 'bucket_list' | 'love_languages'>('dates');

  const isLovers = profile.mode === 'lovers';

  // New Date Modal/Input
  const [newDateTitle, setNewDateTitle] = useState('');
  const [newDateDesc, setNewDateDesc] = useState('');
  const [newDateCategory, setNewDateCategory] = useState<DateIdea['category']>('cozy');

  // Bucket list input
  const [newBucketTitle, setNewBucketTitle] = useState('');

  // Love Letter Generator State
  const [letterTone, setLetterTone] = useState<'poetic' | 'playful' | 'vulnerable' | 'grateful'>('poetic');
  const [letterPrompt, setLetterPrompt] = useState('');
  const [generatedLetter, setGeneratedLetter] = useState<string | null>(null);

  const handleGenerateLetter = () => {
    somaticAudio.playStarBeaconChime();
    const partner = profile.nickname || (isLovers ? 'My Dearest' : 'My Dear Friend');

    let text = '';
    if (letterTone === 'poetic') {
      text = `To ${partner},\n\nIn a world rushing at dizzying speeds, being beside you feels like stepping into a tranquil temple garden. Like Kabir's eternal song, the light within your eyes reminds me that love is not something to be sought outside—it is discovered, nurtured, and celebrated in every quiet breath we share together.\n\nAlways yours,\nWith boundless devotion.`;
    } else if (letterTone === 'playful') {
      text = `Hey ${partner}!\n\nJust dropping this note to remind you that you are officially my favorite human to do absolutely nothing with. Let's steal an hour tonight, grab midnight snacks, and forget the rest of the world exists!\n\nCan't wait to see your smile.`;
    } else if (letterTone === 'vulnerable') {
      text = `Dearest ${partner},\n\nSometimes I struggle to put how much you mean to me into everyday words. Your kindness creates a safe harbor where I never have to wear a mask. Thank you for loving all of me—even the messy, quiet parts. I am so grateful to walk this journey with you.`;
    } else {
      text = `To ${partner},\n\nToday my heart is brimming with gratitude for you. For the way you laugh, for how you remember the small things, and for the peace your presence brings to my spirit. Thank you for being my steadfast anchor and my greatest joy.`;
    }

    if (letterPrompt.trim()) {
      text += `\n\nP.S. Remembering ${letterPrompt.trim()} always brings the warmest light to my day.`;
    }

    setGeneratedLetter(text);
  };

  const handleCreateDate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDateTitle.trim()) return;
    somaticAudio.playStarBeaconChime();
    addDateIdea({
      title: newDateTitle.trim(),
      description: newDateDesc.trim() || 'A soulful shared memory waiting to be created.',
      category: newDateCategory,
    });
    setNewDateTitle('');
    setNewDateDesc('');
  };

  const handleAddBucket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBucketTitle.trim()) return;
    somaticAudio.playStarBeaconChime();
    addBucketItem(newBucketTitle.trim(), 'lifestyle');
    setNewBucketTitle('');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      
      {/* Studio Header */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 border border-rose-200/60 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 flex-shrink-0">
            {isLovers ? <Heart size={28} className="fill-white" /> : <Sparkles size={28} />}
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              {isLovers ? 'Romance & Love Life Studio' : 'Hangout & Adventure Studio'}
            </span>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
              {isLovers ? 'Nurturing Passion & Thoughtful Romance' : 'Adventures & Unforgettable Hangouts'}
            </h3>
            <p className="text-xs text-slate-500 max-w-xl mt-0.5">
              Personalized dates, love letter assistant, shared bucket lists, and love languages explorer.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xs">
          {[
            { id: 'dates', label: isLovers ? 'Date Planner' : 'Hangout Ideas', icon: Calendar },
            { id: 'love_letters', label: isLovers ? 'Love Letter AI' : 'Heart Notes', icon: Feather },
            { id: 'bucket_list', label: 'Bucket List', icon: MapPin },
            { id: 'love_languages', label: 'Love Languages', icon: Heart },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  somaticAudio.playSoftChime();
                  setActiveSubTab(tab.id as any);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeSubTab === tab.id
                    ? 'bg-rose-600 text-white shadow-xs'
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

      {/* Tab 1: Date & Hangout Ideas */}
      {activeSubTab === 'dates' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
          {/* Add Date Box */}
          <form onSubmit={handleCreateDate} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={newDateTitle}
              onChange={(e) => setNewDateTitle(e.target.value)}
              placeholder={isLovers ? 'Add a new romantic date idea...' : 'Add a new hangout quest...'}
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
            <select
              value={newDateCategory}
              onChange={(e) => setNewDateCategory(e.target.value as any)}
              className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 cursor-pointer"
            >
              <option value="cozy">Cozy & At-Home</option>
              <option value="adventurous">Adventurous</option>
              <option value="deep_conversation">Deep Talk</option>
              <option value="budget_friendly">Budget-Friendly</option>
              <option value="wellness">Wellness & Stargazing</option>
            </select>
            <button
              type="submit"
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-shrink-0"
            >
              <Plus size={16} /> Add Idea
            </button>
          </form>

          {/* Date List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {dateIdeas.map((date) => (
              <div
                key={date.id}
                onClick={() => {
                  somaticAudio.playSoftChime();
                  toggleDateCompleted(date.id);
                }}
                className={`p-5 rounded-3xl border-2 transition-all cursor-pointer flex items-start gap-4 ${
                  date.completed
                    ? 'bg-emerald-50/60 border-emerald-300 opacity-80'
                    : 'bg-white border-slate-200 hover:border-rose-300 hover:shadow-sm'
                }`}
              >
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5 border ${
                  date.completed
                    ? 'bg-emerald-500 text-white border-emerald-600'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {date.completed ? <Check size={16} /> : <div className="w-2.5 h-2.5 rounded-full bg-slate-300" />}
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-sm font-black ${date.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {date.title}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 uppercase">
                      {date.category.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{date.description}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tab 2: Love Letter & Heart Note Assistant */}
      {activeSubTab === 'love_letters' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md text-left space-y-6">
          <div>
            <h4 className="text-lg font-black text-slate-900 tracking-tight">
              {isLovers ? 'Soulful Love Letter Assistant' : 'Heartfelt Note Assistant'} 💌
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Select an emotional tone and let the assistant craft a beautiful, timeless letter to surprise your partner.
            </p>
          </div>

          {/* Tone Selector */}
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'poetic', label: 'Poetic & Soulful', icon: '🪷' },
              { id: 'playful', label: 'Playful & Flirty', icon: '✨' },
              { id: 'vulnerable', label: 'Tender & Vulnerable', icon: '🕊️' },
              { id: 'grateful', label: 'Grounded Gratitude', icon: '🌿' },
            ].map((tone) => (
              <button
                key={tone.id}
                onClick={() => setLetterTone(tone.id as any)}
                className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1.5 ${
                  letterTone === tone.id
                    ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
              >
                <span>{tone.icon}</span>
                <span>{tone.label}</span>
              </button>
            ))}
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Specific memory or detail to weave in (optional):
            </label>
            <input
              type="text"
              value={letterPrompt}
              onChange={(e) => setLetterPrompt(e.target.value)}
              placeholder="e.g. That quiet monsoon tea, laughing in the library, star-gazing..."
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
            />
          </div>

          <button
            onClick={handleGenerateLetter}
            className="px-6 py-3 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-2xl text-xs font-bold transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <Feather size={16} />
            <span>Generate Heartfelt Letter</span>
          </button>

          {/* Generated Letter Canvas */}
          {generatedLetter && (
            <div className="p-6 md:p-8 rounded-3xl bg-amber-50/50 border-2 border-amber-200/80 space-y-4 font-serif text-slate-800 leading-relaxed shadow-sm animate-fade-in relative">
              <span className="text-[10px] font-sans font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-3 py-1 rounded-full border border-amber-300">
                Crafted with Soul
              </span>
              <p className="text-sm md:text-base whitespace-pre-wrap italic">
                {generatedLetter}
              </p>
              <div className="pt-2 flex items-center gap-2 font-sans">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generatedLetter);
                    somaticAudio.playSoftChime();
                    alert('Copied love letter to clipboard!');
                  }}
                  className="px-4 py-2 bg-white border border-amber-300 rounded-xl text-xs font-bold text-amber-900 hover:bg-amber-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Copy size={14} /> Copy Letter
                </button>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* Tab 3: Shared Bucket List */}
      {activeSubTab === 'bucket_list' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
          <form onSubmit={handleAddBucket} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-sm flex gap-3">
            <input
              type="text"
              value={newBucketTitle}
              onChange={(e) => setNewBucketTitle(e.target.value)}
              placeholder="What dream or adventure do you want to accomplish together?"
              className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />
            <button
              type="submit"
              className="px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} /> Add to Bucket List
            </button>
          </form>

          <div className="space-y-2">
            {bucketList.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  somaticAudio.playSoftChime();
                  toggleBucketItem(item.id);
                }}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                  item.completed
                    ? 'bg-emerald-50 border-emerald-300 opacity-80'
                    : 'bg-white border-slate-200 hover:border-rose-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border ${
                    item.completed ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-slate-100 border-slate-300'
                  }`}>
                    {item.completed && <Check size={14} />}
                  </div>
                  <span className={`text-sm font-bold ${item.completed ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                    {item.title}
                  </span>
                </div>
                <span className="text-[10px] uppercase font-bold text-slate-400">
                  {item.category}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tab 4: Love Languages Explorer */}
      {activeSubTab === 'love_languages' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md text-left space-y-6">
          <div>
            <h4 className="text-lg font-black text-slate-900 tracking-tight">
              5 Love Languages Explorer & Radar 🧭
            </h4>
            <p className="text-xs text-slate-500 mt-1">
              Gary Chapman's 5 Love Languages calibrated for Indian relational harmony and emotional presence.
            </p>
          </div>

          <div className="space-y-4">
            {[
              { key: 'wordsOfAffirmation', label: 'Words of Affirmation', score: profile.loveLanguageScores.wordsOfAffirmation, color: 'from-rose-500 to-pink-500' },
              { key: 'qualityTime', label: 'Quality Time', score: profile.loveLanguageScores.qualityTime, color: 'from-amber-500 to-orange-500' },
              { key: 'actsOfService', label: 'Acts of Service', score: profile.loveLanguageScores.actsOfService, color: 'from-teal-500 to-emerald-500' },
              { key: 'receivingGifts', label: 'Thoughtful Tokens & Gifts', score: profile.loveLanguageScores.receivingGifts, color: 'from-indigo-500 to-violet-500' },
              { key: 'physicalTouch', label: 'Physical Affection & Proximity', score: profile.loveLanguageScores.physicalTouch, color: 'from-fuchsia-500 to-rose-500' },
            ].map((lang) => (
              <div key={lang.key} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700">
                  <span>{lang.label}</span>
                  <span className="font-mono text-rose-600">{lang.score}%</span>
                </div>
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${lang.color} rounded-full transition-all duration-700`}
                    style={{ width: `${lang.score}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

    </div>
  );
};
