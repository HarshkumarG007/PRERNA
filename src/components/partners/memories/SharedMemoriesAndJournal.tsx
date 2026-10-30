import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  BookHeart, 
  Lock, 
  Eye, 
  Plus, 
  Trash2, 
  Calendar, 
  Send
} from 'lucide-react';
import { usePartnerStore, SharedMemory, PartnerJournalEntry } from '../../../store/partnerStore';
import { somaticAudio } from '../../../utils/audioSynthesis';

export const SharedMemoriesAndJournal: React.FC = () => {
  const { sharedMemories, addMemory, deleteMemory, journalEntries, addJournalEntry, deleteJournalEntry } = usePartnerStore();

  const [activeTab, setActiveTab] = useState<'timeline' | 'shared_journal' | 'private_vault'>('timeline');

  // New Memory state
  const [showAddMemory, setShowAddMemory] = useState(false);
  const [memTitle, setMemTitle] = useState('');
  const [memDate, setMemDate] = useState(new Date().toISOString().split('T')[0]);
  const [memNotes, setMemNotes] = useState('');
  const [memEmoji, setMemEmoji] = useState('✨');
  const [memCategory] = useState<SharedMemory['category']>('milestone');

  // New Journal state
  const [journalText, setJournalText] = useState('');
  const [journalMood, setJournalMood] = useState<PartnerJournalEntry['mood']>('peaceful');

  const EMOJI_OPTIONS = ['✨', '❤️', '🪷', '🌅', '☕', '🏕️', '✈️', '🌟', '🎉', '💍'];

  const MOOD_OPTIONS: { id: PartnerJournalEntry['mood']; label: string; emoji: string }[] = [
    { id: 'radiant', label: 'Radiant', emoji: '✨' },
    { id: 'peaceful', label: 'Peaceful', emoji: '🌿' },
    { id: 'vulnerable', label: 'Vulnerable', emoji: '🕊️' },
    { id: 'reflective', label: 'Reflective', emoji: '🪷' },
    { id: 'struggling', label: 'Struggling', emoji: '🌧️' },
  ];

  const handleCreateMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!memTitle.trim()) return;
    somaticAudio.playStarBeaconChime();
    addMemory({
      title: memTitle.trim(),
      date: memDate,
      notes: memNotes.trim(),
      emoji: memEmoji,
      category: memCategory,
    });
    setMemTitle('');
    setMemNotes('');
    setShowAddMemory(false);
  };

  const handleCreateJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!journalText.trim()) return;
    somaticAudio.playStarBeaconChime();

    const visibility = activeTab === 'shared_journal' ? 'shared_with_partner' : 'private_to_me';

    addJournalEntry({
      content: journalText.trim(),
      visibility,
      mood: journalMood,
    });
    setJournalText('');
  };

  const sharedJournals = journalEntries.filter((j) => j.visibility === 'shared_with_partner');
  const privateJournals = journalEntries.filter((j) => j.visibility === 'private_to_me');

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-sans">
      
      {/* Header Banner */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-teal-500/10 border border-rose-200/60 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-md shadow-rose-500/20 flex-shrink-0">
            <BookHeart size={28} />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
              Memories & Dual Journal Vault
            </span>
            <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight mt-1">
              Timeless Moments & Tender Reflections
            </h3>
            <p className="text-xs text-slate-500 max-w-xl mt-0.5">
              A shared milestone timeline alongside a strictly isolated, encrypted individual journal.
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap gap-1.5 p-1.5 bg-white/80 backdrop-blur-md rounded-2xl border border-slate-200 shadow-2xs">
          {[
            { id: 'timeline', label: 'Milestone Timeline', icon: Calendar },
            { id: 'shared_journal', label: 'Our Shared Journal', icon: Eye },
            { id: 'private_vault', label: 'My Secret Space', icon: Lock },
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

      {/* Tab 1: Milestone Timeline */}
      {activeTab === 'timeline' && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
          <div className="flex items-center justify-between">
            <h4 className="text-base font-black text-slate-900 tracking-tight">
              Shared Chronological Journey
            </h4>
            <button
              onClick={() => setShowAddMemory(true)}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <Plus size={16} /> Add Sacred Memory
            </button>
          </div>

          {/* Add Memory Modal/Box */}
          {showAddMemory && (
            <form onSubmit={handleCreateMemory} className="p-6 rounded-3xl bg-white border border-rose-200 shadow-md space-y-4 animate-fade-in">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h5 className="text-xs font-black uppercase tracking-wider text-rose-800">
                  Record a New Shared Milestone
                </h5>
                <button onClick={() => setShowAddMemory(false)} className="text-xs text-slate-400 hover:text-slate-600">
                  Cancel
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Title</label>
                  <input
                    type="text"
                    value={memTitle}
                    onChange={(e) => setMemTitle(e.target.value)}
                    placeholder="e.g. The night we confessed our dreams"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={memDate}
                    onChange={(e) => setMemDate(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Personal Notes</label>
                <textarea
                  rows={2}
                  value={memNotes}
                  onChange={(e) => setMemNotes(e.target.value)}
                  placeholder="What made this moment unforgettable?"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-rose-500 focus:outline-none"
                />
              </div>

              {/* Emoji Selector */}
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">Memory Emblem</label>
                <div className="flex gap-2">
                  {EMOJI_OPTIONS.map((em) => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setMemEmoji(em)}
                      className={`w-9 h-9 rounded-xl text-base flex items-center justify-center border transition-all cursor-pointer ${
                        memEmoji === em ? 'bg-rose-100 border-rose-400 scale-110' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-xs"
              >
                Save Milestone Forever
              </button>
            </form>
          )}

          {/* Timeline Items */}
          <div className="space-y-4 relative before:absolute before:inset-0 before:left-6 before:w-0.5 before:bg-rose-200/60">
            {sharedMemories.map((mem) => (
              <div key={mem.id} className="relative flex items-start gap-4 pl-3 group">
                <div className="w-8 h-8 rounded-full bg-white border-2 border-rose-400 flex items-center justify-center text-sm shadow-xs z-10 flex-shrink-0">
                  {mem.emoji}
                </div>

                <div className="flex-1 p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs group-hover:border-rose-300 transition-all space-y-1">
                  <div className="flex items-center justify-between">
                    <h5 className="text-sm font-black text-slate-900">{mem.title}</h5>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400 font-bold">
                        {new Date(mem.date).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                      <button
                        onClick={() => deleteMemory(mem.id)}
                        className="text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Delete memory"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  {mem.notes && (
                    <p className="text-xs text-slate-600 leading-relaxed pt-0.5">{mem.notes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Tab 2 & 3: Journal Vault (Shared vs My Secret Space) */}
      {(activeTab === 'shared_journal' || activeTab === 'private_vault') && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6 text-left">
          {/* Isolation Notice for Private Space */}
          {activeTab === 'private_vault' && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-950 flex items-start gap-2.5">
              <Lock size={16} className="text-amber-700 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block">Strict Sovereign Isolation (My Secret Space):</span>
                <span>Entries written here are encrypted locally and are NEVER shared with your partner or AI.</span>
              </div>
            </div>
          )}

          {/* New Journal Form */}
          <form onSubmit={handleCreateJournal} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-4">
            <h5 className="text-xs font-black uppercase tracking-wider text-slate-700">
              {activeTab === 'shared_journal' ? 'Write to Our Shared Journal' : 'Write to My Secret Encrypted Space'}
            </h5>

            <textarea
              rows={3}
              value={journalText}
              onChange={(e) => setJournalText(e.target.value)}
              placeholder={
                activeTab === 'shared_journal'
                  ? 'Share an affectionate reflection or sweet moment for your partner to read...'
                  : 'Write your private vulnerabilities, fears, or raw feelings in complete safety...'
              }
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm focus:ring-2 focus:ring-rose-500 focus:outline-none"
              required
            />

            {/* Mood Selector */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold text-slate-500">Current Mood:</span>
                {MOOD_OPTIONS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setJournalMood(m.id)}
                    className={`px-2.5 py-1 rounded-xl text-xs font-bold border transition-all cursor-pointer flex items-center gap-1 ${
                      journalMood === m.id
                        ? 'bg-rose-50 border-rose-300 text-rose-900 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <span>{m.emoji}</span>
                    <span className="hidden sm:inline">{m.label}</span>
                  </button>
                ))}
              </div>

              <button
                type="submit"
                className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
              >
                <Send size={14} /> Save Entry
              </button>
            </div>
          </form>

          {/* Stored Journal Entries */}
          <div className="space-y-3">
            {(activeTab === 'shared_journal' ? sharedJournals : privateJournals).map((entry) => (
              <div key={entry.id} className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-700 capitalize">Mood: {entry.mood}</span>
                    <span>•</span>
                    <span className="font-mono">{new Date(entry.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                  <button
                    onClick={() => deleteJournalEntry(entry.id)}
                    className="text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                    title="Delete entry"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <p className="text-xs sm:text-sm text-slate-800 whitespace-pre-wrap leading-relaxed">
                  {entry.content}
                </p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

    </div>
  );
};
