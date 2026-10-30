import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Heart, Compass, BookOpen, Quote, Shield, Sun } from 'lucide-react';
import { PrernaEmblem } from './PrernaLogo';

interface AtmaJnanaOriginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AtmaJnanaOriginModal: React.FC<AtmaJnanaOriginModalProps> = ({ isOpen, onClose }) => {
  const [activeLang, setActiveLang] = useState<'both' | 'hi' | 'en'>('both');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/85 backdrop-blur-md"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-4xl bg-gradient-to-b from-[#0e1328] via-[#090d1f] to-[#04060f] border border-indigo-500/30 rounded-3xl shadow-2xl shadow-indigo-950/80 overflow-hidden z-10 my-8 max-h-[90vh] flex flex-col"
        >
          {/* Top Decorative Celestial Glow */}
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500" />
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-indigo-500/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute -bottom-24 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

          {/* Header */}
          <div className="relative z-10 flex items-center justify-between p-6 border-b border-white/10 bg-white/[0.02]">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 via-indigo-500/20 to-purple-500/20 border border-amber-400/30 flex items-center justify-center shadow-lg shadow-amber-500/10">
                <PrernaEmblem size={34} animate={true} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-300 text-[11px] font-bold tracking-wider uppercase">
                    The Soul of PRERNA
                  </span>
                  <span className="text-xs text-slate-400">• Genesis & Philosophy</span>
                </div>
                <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2 mt-0.5">
                  आत्मज्ञान • Self-Knowledge
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* Language filter pills */}
              <div className="hidden sm:flex items-center bg-white/5 border border-white/10 rounded-xl p-1 text-xs font-bold text-slate-300">
                <button
                  onClick={() => setActiveLang('both')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${activeLang === 'both' ? 'bg-indigo-600 text-white' : 'hover:text-white'}`}
                >
                  Both
                </button>
                <button
                  onClick={() => setActiveLang('hi')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${activeLang === 'hi' ? 'bg-indigo-600 text-white' : 'hover:text-white'}`}
                >
                  हिंदी
                </button>
                <button
                  onClick={() => setActiveLang('en')}
                  className={`px-2.5 py-1 rounded-lg transition-colors ${activeLang === 'en' ? 'bg-indigo-600 text-white' : 'hover:text-white'}`}
                >
                  English
                </button>
              </div>

              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Scrollable Body */}
          <div className="relative z-10 flex-1 overflow-y-auto p-6 md:p-8 space-y-8 text-slate-200">
            {/* Creator's Foundational Motto Banner */}
            <div className="relative p-6 rounded-2xl bg-gradient-to-r from-amber-500/15 via-rose-500/10 to-indigo-500/15 border border-amber-400/30 overflow-hidden">
              <div className="absolute top-2 right-3 opacity-10">
                <Quote size={80} />
              </div>
              <div className="flex items-center gap-2 text-amber-300 text-xs font-black uppercase tracking-widest mb-1.5">
                <Sparkles size={14} />
                <span>The Core Ideology & Guiding Flame</span>
              </div>
              <h3 className="text-xl md:text-2xl font-black text-white tracking-tight">
                "Self-Realisation is God's Realisation."
              </h3>
              <p className="text-amber-200/90 text-sm md:text-base font-semibold mt-1">
                आत्म-साक्षात्कार ही ब्रह्म-साक्षात्कार है — स्वयं को जानना ही परमात्मा को जानना है।
              </p>
              <p className="text-slate-300 text-xs md:text-sm mt-3 leading-relaxed max-w-3xl">
                PRERNA was not created merely as an algorithm or assessment tool; it was born from the timeless realization that true purpose, strength, and tranquility are not found in the noisy external world. They are already dormant within the sanctum of your own consciousness.
              </p>
            </div>

            {/* Sacred Verses Side-by-Side Cards */}
            <div className="space-y-6">
              <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                <BookOpen size={18} className="text-indigo-400" />
                <h4 className="text-sm font-black uppercase tracking-widest text-slate-300">
                  The Eternal Dohas (Foundational Quotes)
                </h4>
              </div>

              {/* Verse 1: The Human Dilemma / External Wandering */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/40 transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 text-xs font-bold border border-rose-500/30 flex items-center gap-1.5">
                    <Compass size={13} /> The Question: The External Wandering
                  </span>
                  <span className="text-xs font-bold text-amber-400/90 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                    Quote by: संत कबीर दास (Sant Kabir Das)
                  </span>
                </div>

                {/* Original Doha */}
                {(activeLang === 'both' || activeLang === 'hi') && (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 font-serif text-lg md:text-xl text-amber-100 font-semibold leading-relaxed tracking-wide">
                    <p className="text-center">
                      "आत्मज्ञान बिना नर भटके, कोई मथुरा कोई काशी।<br />
                      जैसे मृगा नाभि कस्तूरी, वन-वन फिरत उदासी।।<br />
                      जल में मीन प्यासी, मोहे सुन-सुन आवत हाँसि।।"
                    </p>
                  </div>
                )}

                {/* Roman Transliteration & English */}
                {(activeLang === 'both' || activeLang === 'en') && (
                  <div className="space-y-2 text-sm">
                    <div className="text-xs font-mono text-slate-400 italic">
                      "Aatma-Jnaana binaa nar bhatke, koyi Mathuraa koyi Kaashi.<br />
                      Jaise mrigaa naabhi kastoori, van-van phirat udaasi..<br />
                      Jal mein meen pyaasi, mohe sun-sun aawat haansi.."
                    </div>
                    <div className="text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5">
                      <strong className="text-white">Profound Meaning:</strong> Without Self-Knowledge (<em className="text-amber-300">Atma-Jnana</em>), humanity wanders restlessly from Mathura to Kashi seeking the sacred outside. Just as the musk deer carries the celestial musk inside its own navel yet scours the dense forest in melancholy searching for the fragrance, and just as a fish living inside the ocean complains of thirst — hearing of humanity's external search fills the enlightened sage with gentle, compassionate irony.
                    </div>
                  </div>
                )}
              </div>

              {/* Verse 2: The Inner Awakening / The Supreme Indwelling Reality */}
              <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition-all space-y-4">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30 flex items-center gap-1.5">
                    <Sun size={13} /> The Answer: The Indwelling Light
                  </span>
                  <span className="text-xs font-bold text-amber-400/90 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                    Quote by: संत कबीर दास / संत वाणी परम्परा (Sant Kabir Das)
                  </span>
                </div>

                {/* Original Doha */}
                {(activeLang === 'both' || activeLang === 'hi') && (
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-white/5 font-serif text-lg md:text-xl text-emerald-100 font-semibold leading-relaxed tracking-wide">
                    <p className="text-center">
                      "विधि हरि हर जाको ध्यान धरत हैं, मुनिजन सहज अठ्ठासी।<br />
                      सोई हंस तेरे घट माहि, अलख पुरुष अविनाशी!"
                    </p>
                  </div>
                )}

                {/* Roman Transliteration & English */}
                {(activeLang === 'both' || activeLang === 'en') && (
                  <div className="space-y-2 text-sm">
                    <div className="text-xs font-mono text-slate-400 italic">
                      "Vidhi Hari Har jaako dhyaan dharat hain, munijan sahaj aththaasi.<br />
                      Soyi hansa tere ghat maahi, alakh purush avinaashi!"
                    </div>
                    <div className="text-slate-300 leading-relaxed bg-white/[0.02] p-3 rounded-lg border border-white/5">
                      <strong className="text-white">Profound Meaning:</strong> That Supreme Consciousness upon which Brahma (<em className="text-indigo-300">Vidhi</em>), Vishnu (<em className="text-indigo-300">Hari</em>), and Shiva (<em className="text-indigo-300">Hara</em>) meditate, and which eighty-eight thousand ancient sages contemplate in pure equanimity — that very divine Swan (<em className="text-emerald-300">Sohi Hansa</em> / the Pure Atman), the imperceptible and indestructible Divine (<em className="text-emerald-300">Alakh Purush Avinashi</em>), resides right inside your own heart-vessel (<em className="text-emerald-300">Ghat Maahi</em>)!
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Why This Project Came Into Existence (Developer's Intent & Creed) */}
            <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900/60 to-purple-950/60 border border-indigo-500/20 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300">
                  <Heart size={20} />
                </div>
                <div>
                  <h4 className="text-lg font-black text-white">The Genesis & Developer's Intent</h4>
                  <p className="text-xs text-indigo-300 font-medium">Why PRERNA exists in a world of distraction</p>
                </div>
              </div>

              <div className="space-y-3 text-slate-300 text-sm leading-relaxed">
                <p>
                  In modern life, adolescents are constantly pushed outward. Social feeds tell them who they should look like; algorithms push synthetic wants; exams and peer pressure tell them who they must become. They wander like the musk deer, despondent and exhausted, seeking identity, peace, and validation outside themselves.
                </p>
                <p>
                  <strong>PRERNA was architected as the antidote to this external wandering.</strong> Every feature in this platform is built to turn the mirror inward:
                </p>
                <div className="grid md:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                      <Sparkles size={12} /> Big Five & 16 Personalities
                    </div>
                    <p className="text-xs text-slate-400">
                      Not to label or box you, but to give you a scientific lens to appreciate your inherent, unrepeatable cognitive temperament.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="text-xs font-bold text-cyan-300 flex items-center gap-1.5">
                      <Compass size={12} /> The Mirror (Actual vs. Evolved Self)
                    </div>
                    <p className="text-xs text-slate-400">
                      Grounded in self-compassion — showing you that your highest potential is not a distant stranger, but the natural blossoming of the light already within.
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                      <Shield size={12} /> Maslow's Needs vs. Desires Compass
                    </div>
                    <p className="text-xs text-slate-400">
                      Freeing your mind from superficial dopamine traps so you can honor your real foundational needs (sleep, security, love, mastery).
                    </p>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                    <div className="text-xs font-bold text-purple-300 flex items-center gap-1.5">
                      <Sun size={12} /> Local-First Sovereign Privacy
                    </div>
                    <p className="text-xs text-slate-400">
                      Your thoughts, journals, and psychometrics stay 100% on your device, because your inner temple belongs to you and no external corporate cloud.
                    </p>
                  </div>
                </div>
                <p className="pt-2 text-indigo-200 font-medium italic border-t border-white/5">
                  "When a person realizes their true Self, they realize the Divine presence that animates all existence. Self-realization is God-realization. May PRERNA guide you home to your own inner sanctuary."
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Dedicated to the eternal seekers • Founded by Harshkumar G.</span>
            </div>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 font-bold text-white text-sm transition-all shadow-lg shadow-indigo-600/25 cursor-pointer"
            >
              Enter With Inner Clarity →
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
