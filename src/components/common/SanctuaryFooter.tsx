import React, { useState } from 'react';
import { Star, Heart, ExternalLink, ShieldCheck, Sun } from 'lucide-react';
import { somaticAudio } from '../../utils/audioSynthesis';
import { PrernaEmblem } from './PrernaLogo';

export const SanctuaryFooter: React.FC = () => {
  const [litStar, setLitStar] = useState(false);

  const handleLightStar = () => {
    somaticAudio.playStarBeaconChime();
    setLitStar(true);
    setTimeout(() => {
      window.open('https://github.com/HarshkumarG007/PRERNA', '_blank', 'noopener,noreferrer');
    }, 600);
    setTimeout(() => {
      setLitStar(false);
    }, 6000);
  };

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/70 backdrop-blur-md text-slate-600 transition-colors">
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-10">
        
        {/* Top Highlight Banner: The Ethereal "Light a Star" Psychological Sanctuary Anchor */}
        <div className="mb-8 p-6 rounded-3xl bg-gradient-to-r from-amber-500/10 via-indigo-950/[0.04] to-violet-500/10 border border-amber-400/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400/20 to-indigo-500/20 border border-amber-400/30 flex items-center justify-center text-amber-500 flex-shrink-0 shadow-sm">
              <Star size={24} className={litStar ? 'animate-spin text-amber-400 fill-amber-400' : 'text-amber-500 fill-amber-400/30'} />
            </div>
            <div>
              <div className="flex items-center justify-center md:justify-start gap-2 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-700 border border-amber-400/30">
                  दीपक से दीपक जले • Hold the Light
                </span>
                <span className="text-xs text-slate-400 hidden sm:inline">• Free & Local Sanctuary</span>
              </div>
              <h4 className="text-base md:text-lg font-black text-slate-900 tracking-tight">
                Help another searching teenager find this sanctuary.
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed max-w-xl">
                PRERNA has zero ads, zero trackers, and zero commercial fees. A single star on GitHub teaches the algorithms that adolescent mental sanctuary matters — helping this project reach the parent, teacher, or teen who needs it tonight.
              </p>
            </div>
          </div>

          <button
            onClick={handleLightStar}
            className={`group relative px-6 py-3 rounded-2xl font-black text-xs transition-all shadow-lg flex items-center gap-2 cursor-pointer flex-shrink-0 ${
              litStar
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-emerald-500/25 scale-105'
                : 'bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 shadow-amber-500/25 hover:shadow-amber-500/40 hover:scale-102'
            }`}
            title="Star PRERNA on GitHub"
          >
            <Star size={16} className={`transition-transform ${litStar ? 'fill-white rotate-45' : 'group-hover:rotate-12 fill-slate-950'}`} />
            <span>{litStar ? '✨ Beacon Lit! Opening GitHub...' : 'Light a Star on GitHub ⭐'}</span>
            <span className="hidden sm:inline text-[10px] opacity-70 font-mono">/HarshkumarG007</span>
          </button>
        </div>

        {/* Middle Meta Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-200/80 text-xs">
          {/* Col 1: Identity & Creed */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <PrernaEmblem size={28} animate={false} />
              <span className="font-black text-base text-slate-900 tracking-tight">
                प्रेरणा • PRERNA
              </span>
            </div>
            <p className="text-slate-500 text-xs leading-relaxed max-w-md">
              A privacy-preserving, local-first adolescent self-discovery sanctuary. Anchored in the eternal truth of Sant Kabir Das: <em>"सोई हंस तेरे घट माहि, अलख पुरुष अविनाशी!"</em>
            </p>
            <div className="flex items-center gap-2 text-[11px] text-amber-700 font-semibold">
              <Sun size={13} className="text-amber-500" />
              <span>Self-Realisation is God's Realisation (आत्म-साक्षात्कार ही ईश्वर-साक्षात्कार है)</span>
            </div>
          </div>

          {/* Col 2: The Architect */}
          <div className="space-y-2">
            <span className="font-black uppercase tracking-wider text-slate-800 text-[11px] block">
              Architect & Developer
            </span>
            <div className="space-y-1">
              <a
                href="https://www.linkedin.com/in/harshkumarg/"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5 transition-colors"
              >
                <span>Harsh Kumar Gupta</span>
                <ExternalLink size={11} />
              </a>
              <p className="text-[11px] text-slate-400">
                AI & Robotics Specialist • Yoga & Science of Living Scholar (Varanasi)
              </p>
              <div className="pt-1 flex items-center gap-3">
                <a
                  href="https://www.linkedin.com/in/harshkumarg/"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  LinkedIn
                </a>
                <span>•</span>
                <a
                  href="https://www.credly.com/users/harshkumarg"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-slate-500 hover:text-amber-600 transition-colors"
                >
                  Credly (11 Badges)
                </a>
                <span>•</span>
                <a
                  href="https://github.com/HarshkumarG007/PRERNA"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                >
                  GitHub
                </a>
              </div>
            </div>
          </div>

          {/* Col 3: Legal & Sovereignty */}
          <div className="space-y-2">
            <span className="font-black uppercase tracking-wider text-slate-800 text-[11px] block">
              Data Sovereignty
            </span>
            <div className="flex items-center gap-1.5 text-emerald-700 font-bold">
              <ShieldCheck size={14} />
              <span>DPDP Act 2023 §9 Compliant</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-snug">
              100% on-device cryptographic storage. Zero behavioral tracking, zero commercial advertising.
            </p>
          </div>
        </div>

        {/* Bottom Line */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <div>
            Dedicated with gratefulness to God • Disciple of Shri Prem Rawat • Honoring Father Dinesh Kumar
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <span>Crafted with</span>
            <Heart size={12} className="text-rose-500 fill-rose-500 inline" />
            <span>for adolescents across Bharat & the world</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
