import React, { useState } from 'react';
import { 
  Wind, 
  ShieldCheck, 
  Coffee, 
  Volume2, 
  BookOpen, 
  CheckCircle2
} from 'lucide-react';
import { somaticAudio } from '../../utils/audioSynthesis';

export const TeacherVitalityCorner: React.FC = () => {
  const [bellActive, setBellActive] = useState(false);
  const [completedDrills, setCompletedDrills] = useState<string[]>([]);
  const [selectedTip, setSelectedTip] = useState<number | null>(0);

  const handlePlayBell = () => {
    somaticAudio.playSingingBowl(432, 4.5);
    setBellActive(true);
    setTimeout(() => setBellActive(false), 4500);
  };

  const toggleDrill = (id: string) => {
    somaticAudio.playSoftChime();
    setCompletedDrills(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const PEDAGOGY_TIPS = [
    {
      title: 'The 60-Second Transition Pause',
      context: 'Between subjects or after lunch break',
      guidance: 'Before opening textbooks, invite the room to close their eyes for three slow breaths. Acknowledging fatigue resets the collective nervous system from sympathetic fight-or-flight to parasympathetic receptive calm.',
      quote: '“चित्त की स्थिरता ही विद्या का मूल है।”'
    },
    {
      title: 'Socratic Inquiry over Correction',
      context: 'When a student is disengaged or defensive',
      guidance: 'Instead of “Why didn’t you finish your assignment?”, try “What felt most confusing or heavy when you sat down with this?” Shifting from accusation to curiosity removes shame triggers.',
      quote: '“जिज्ञासा भय से नहीं, प्रेम से उत्पन्न होती है।”'
    },
    {
      title: 'Teacher Energy Boundaries',
      context: 'End-of-day decompression',
      guidance: 'Give yourself permission to mentally set down student struggles when you leave the campus gates. Compassion fatigue occurs when we carry the load that only time, families, and communities can resolve together.',
      quote: '“जो दीपक स्वयं प्रकाशित है, वही दूसरों को प्रकाशित कर सकता है।”'
    }
  ];

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Top Educator Sanctuary Card */}
      <div className="p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-600/15 border border-amber-200/80 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                गुरु स्वास्थ्य एवं विश्राम • Educator Vitality
              </span>
              <span className="text-xs text-slate-500 font-medium">Sant Kabir & Tagore Wisdom</span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
              Honoring the Light of the Teacher
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
              "The teacher who merely dispenses information feeds the mind with cold scraps. The true teacher awakens the inner light." — Rabindranath Tagore
            </p>
          </div>

          <button
            onClick={handlePlayBell}
            disabled={bellActive}
            className="px-6 py-4 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2.5 transition-all shadow-md shadow-amber-500/20 cursor-pointer disabled:opacity-75 flex-shrink-0"
          >
            {bellActive ? <Volume2 size={18} className="animate-pulse" /> : <Wind size={18} />}
            <span>{bellActive ? '432 Hz Resonating...' : 'Ring 432 Hz Mindful Bell'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Compassionate Pedagogy & Reflection */}
        <div className="lg:col-span-2 space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                <BookOpen size={18} className="text-amber-600" />
                <span>Compassionate Pedagogy Playbook</span>
              </h4>
              <span className="text-[11px] font-bold text-slate-400">Classroom Wisdom</span>
            </div>

            <div className="space-y-3">
              {PEDAGOGY_TIPS.map((tip, idx) => (
                <div
                  key={idx}
                  onClick={() => setSelectedTip(idx)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                    selectedTip === idx 
                      ? 'bg-amber-50/60 border-amber-300 shadow-2xs' 
                      : 'bg-slate-50 border-slate-200/80 hover:bg-slate-100/60'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-900">{tip.title}</span>
                    <span className="text-[10px] text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full font-semibold">
                      {tip.context}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                    {tip.guidance}
                  </p>
                  <div className="mt-2 pt-2 border-t border-amber-200/40 text-[11px] font-serif text-amber-900 italic">
                    {tip.quote}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Daily Educator Decompression Drills */}
        <div className="space-y-4">
          <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-black text-sm">
              <Coffee size={18} className="text-amber-600" />
              <span>Educator Self-Care Drills</span>
            </div>

            <div className="space-y-2.5">
              {[
                { id: 'd1', label: '3-Min Silence Before 1st Period', desc: 'Center breath before the morning bell.' },
                { id: 'd2', label: 'Hydration Reset at Recess', desc: 'Drink a glass of water without screens.' },
                { id: 'd3', label: 'Praise a Reluctant Learner', desc: 'Spot quiet effort, not just grades.' },
                { id: 'd4', label: 'Campus Walk at Sunset', desc: 'Shake off secondary trauma before going home.' },
              ].map(drill => {
                const isDone = completedDrills.includes(drill.id);
                return (
                  <div
                    key={drill.id}
                    onClick={() => toggleDrill(drill.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isDone 
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-900' 
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70 text-slate-700'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-lg flex items-center justify-center mt-0.5 border ${
                      isDone ? 'bg-emerald-500 text-white border-emerald-600' : 'border-slate-300 bg-white'
                    }`}>
                      {isDone && <CheckCircle2 size={14} />}
                    </div>
                    <div>
                      <div className={`text-xs font-bold ${isDone ? 'line-through text-emerald-800' : 'text-slate-800'}`}>
                        {drill.label}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5">{drill.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-center gap-2 text-[11px] text-emerald-950">
              <ShieldCheck size={16} className="text-emerald-700 flex-shrink-0" />
              <span>100% Private local self-care. Not shared with school management.</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
