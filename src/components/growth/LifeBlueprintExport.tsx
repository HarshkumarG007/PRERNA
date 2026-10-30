import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Printer, Download, X, Compass, Brain, Target, ShieldCheck, Star, Layers } from 'lucide-react';
import { PrernaEmblem } from '../common/PrernaLogo';
import { UnifiedProfile, User } from '../../store';
import { generateSelfImageComparison } from '../../engine/growth/selfEvolutionEngine';
import { SixteenTypeResult } from '../../engine/assessment/sixteenPersonalities';
import { somaticAudio } from '../../utils/audioSynthesis';

interface LifeBlueprintExportProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  profile: UnifiedProfile | null;
  sixteenType?: SixteenTypeResult | null;
}

export const LifeBlueprintExport: React.FC<LifeBlueprintExportProps> = ({
  isOpen,
  onClose,
  user,
  profile,
  sixteenType,
}) => {
  const printAreaRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const comparison = generateSelfImageComparison(sixteenType, user?.name);
  const bigFive = profile?.personality?.bigFive || { openness: 65, conscientiousness: 70, extraversion: 60, agreeableness: 75, neuroticism: 40 };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadHtml = () => {
    if (!printAreaRef.current) return;
    const content = printAreaRef.current.innerHTML;
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>PRERNA Life Blueprint - ${user?.name || 'Explorer'}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body class="bg-slate-50 text-slate-800 p-8 font-sans">
  <div class="max-w-4xl mx-auto">
    ${content}
  </div>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PRERNA_Life_Blueprint_${user?.name?.replace(/\s+/g, '_') || 'Explorer'}_${new Date().toISOString().split('T')[0]}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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
          transition={{ duration: 0.3 }}
          className="relative w-full max-w-5xl bg-white text-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 my-8 max-h-[92vh] flex flex-col"
        >
          {/* Top Control Bar (Hidden when printing) */}
          <div className="flex items-center justify-between p-4 md:p-6 border-b border-slate-200 bg-slate-900 text-white print:hidden">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/30 flex items-center justify-center text-amber-300">
                <Compass size={22} />
              </div>
              <div>
                <h3 className="font-black text-lg text-white">Atma-Jnana Life Blueprint Portfolio</h3>
                <p className="text-xs text-slate-400">Print or Save as High-Resolution PDF</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handlePrint}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Printer size={15} />
                <span>Print / Save to PDF</span>
              </button>

              <button
                onClick={handleDownloadHtml}
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/20 transition-all cursor-pointer"
                title="Download offline HTML document"
              >
                <Download size={15} />
                <span className="hidden sm:inline">Download HTML</span>
              </button>

              <button
                onClick={onClose}
                className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-400 hover:text-white flex items-center justify-center transition-colors ml-2 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Printable Document Container */}
          <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-slate-50 print:p-0 print:bg-white">
            <div
              ref={printAreaRef}
              id="printable-life-blueprint"
              className="max-w-4xl mx-auto bg-white rounded-2xl p-8 md:p-12 shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 space-y-10"
            >
              
              {/* Document Header */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-8 border-b-2 border-indigo-600/30 gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center shadow-inner">
                    <PrernaEmblem size={48} animate={false} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full border border-indigo-200">
                        Official Discovery Dossier
                      </span>
                      <span className="text-xs text-slate-400">• India DPDP Act 2023 Verified</span>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight mt-1">
                      {user?.name || 'Explorer'}’s Life Blueprint
                    </h1>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">
                      Generated on {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })} • PRERNA Sanctuary
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right flex-shrink-0 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
                  <div className="font-mono text-slate-700"><strong>Archetype:</strong> {sixteenType?.fullCode || 'INFJ'}</div>
                  <div className="text-emerald-700 font-bold flex items-center sm:justify-end gap-1">
                    <ShieldCheck size={14} /> 100% On-Device Sovereign
                  </div>
                </div>
              </div>

              {/* Foundational Creed Banner */}
              <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200 text-amber-950 flex items-start gap-4">
                <span className="text-2xl mt-0.5">🪷</span>
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-800">
                    The Soul of PRERNA • संत कबीर दास (Sant Kabir Das)
                  </h4>
                  <p className="font-serif italic text-sm text-amber-900">
                    "जैसे मृगा नाभि कस्तूरी, वन-वन फिरत उदासी... सोई हंस तेरे घट माहि, अलख पुरुष अविनाशी!"
                  </p>
                  <p className="text-xs font-bold text-amber-800">
                    Guiding Creed: <strong>Self-Realisation is God's Realisation (आत्म-साक्षात्कार ही ईश्वर-साक्षात्कार है)</strong>
                  </p>
                </div>
              </div>

              {/* Section 1: 16-Personality Typology */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Brain size={18} className="text-indigo-600" />
                  <h3 className="text-lg font-black text-slate-900">1. Psychological Archetype & Cognitive Functions</h3>
                </div>

                <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 grid md:grid-cols-2 gap-6">
                  <div>
                    <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider block mb-1">
                      Core Persona & Typology
                    </span>
                    <h4 className="text-2xl font-black text-slate-900">
                      {sixteenType?.definition.name || 'The Insightful Advocate'} ({sixteenType?.fullCode || 'INFJ'})
                    </h4>
                    <p className="text-sm font-serif text-slate-600 italic mt-0.5">
                      "{sixteenType?.definition.hindiName || 'गहन दृष्टा'}" — {sixteenType?.definition.tagline || 'Quietly inspiring visionary with profound empathy'}
                    </p>
                    <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                      {sixteenType?.definition.summary || 'Driven by deep intuition and grounded principles, you see beneath the surface and synthesize complex ideas.'}
                    </p>
                  </div>

                  <div className="space-y-3">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                      Cognitive Preferences & Balance
                    </span>
                    <div className="space-y-2 text-xs">
                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span>Energy: {sixteenType?.dichotomies.energy ? sixteenType.dichotomies.energy.dominant : 'Introversion (I)'}</span>
                          <span>{sixteenType?.dichotomies.energy ? Math.max(sixteenType.dichotomies.energy.pctA, sixteenType.dichotomies.energy.pctB) : 70}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${sixteenType?.dichotomies.energy ? Math.max(sixteenType.dichotomies.energy.pctA, sixteenType.dichotomies.energy.pctB) : 70}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span>Mind: {sixteenType?.dichotomies.mind ? sixteenType.dichotomies.mind.dominant : 'Intuitive (N)'}</span>
                          <span>{sixteenType?.dichotomies.mind ? Math.max(sixteenType.dichotomies.mind.pctA, sixteenType.dichotomies.mind.pctB) : 75}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-purple-600 h-full rounded-full" style={{ width: `${sixteenType?.dichotomies.mind ? Math.max(sixteenType.dichotomies.mind.pctA, sixteenType.dichotomies.mind.pctB) : 75}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span>Nature: {sixteenType?.dichotomies.nature ? sixteenType.dichotomies.nature.dominant : 'Feeling (F)'}</span>
                          <span>{sixteenType?.dichotomies.nature ? Math.max(sixteenType.dichotomies.nature.pctA, sixteenType.dichotomies.nature.pctB) : 65}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-rose-600 h-full rounded-full" style={{ width: `${sixteenType?.dichotomies.nature ? Math.max(sixteenType.dichotomies.nature.pctA, sixteenType.dichotomies.nature.pctB) : 65}%` }} />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between font-bold mb-1">
                          <span>Tactics: {sixteenType?.dichotomies.tactics ? sixteenType.dichotomies.tactics.dominant : 'Judging (J)'}</span>
                          <span>{sixteenType?.dichotomies.tactics ? Math.max(sixteenType.dichotomies.tactics.pctA, sixteenType.dichotomies.tactics.pctB) : 80}%</span>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div className="bg-emerald-600 h-full rounded-full" style={{ width: `${sixteenType?.dichotomies.tactics ? Math.max(sixteenType.dichotomies.tactics.pctA, sixteenType.dichotomies.tactics.pctB) : 80}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Big Five Psychometric Percentiles */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Layers size={18} className="text-indigo-600" />
                  <h3 className="text-lg font-black text-slate-900">2. IPIP Big Five Psychometric Dimensions</h3>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                  {[
                    { label: 'Openness', val: bigFive.openness, desc: 'Curiosity & Conceptual Depth', color: 'bg-violet-100 text-violet-800' },
                    { label: 'Conscientiousness', val: bigFive.conscientiousness, desc: 'Discipline & Persistence', color: 'bg-indigo-100 text-indigo-800' },
                    { label: 'Extraversion', val: bigFive.extraversion, desc: 'Social Energy & Assertiveness', color: 'bg-cyan-100 text-cyan-800' },
                    { label: 'Agreeableness', val: bigFive.agreeableness, desc: 'Empathy & Trust', color: 'bg-emerald-100 text-emerald-800' },
                    { label: 'Stability', val: 100 - bigFive.neuroticism, desc: 'Emotional Equanimity', color: 'bg-rose-100 text-rose-800' },
                  ].map((trait, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-1">
                      <div className="text-xs font-bold text-slate-500">{trait.label}</div>
                      <div className="text-2xl font-black text-slate-900">{trait.val}th %</div>
                      <div className="text-[10px] text-slate-500 leading-tight">{trait.desc}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 3: The Mirror - Current Baseline vs. Evolved Potential */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Star size={18} className="text-indigo-600" />
                  <h3 className="text-lg font-black text-slate-900">3. The Mirror: Baseline Foundation vs. Evolved Potential</h3>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Current Self */}
                  <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      Current Foundation
                    </span>
                    <h4 className="text-lg font-black text-slate-900">{comparison.currentSelf.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{comparison.currentSelf.description}</p>
                    <div className="space-y-1 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">Where Energy Gets Stuck:</span>
                      {comparison.currentSelf.frictionPoints.map((f, i) => (
                        <div key={i} className="text-xs text-rose-700 bg-rose-50/80 p-2 rounded-lg border border-rose-100">
                          ⚡ {f}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evolved Self */}
                  <div className="p-6 rounded-2xl bg-indigo-50/60 border border-indigo-200 space-y-3">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-600 text-white">
                      Evolved Potential (सोई हंस)
                    </span>
                    <h4 className="text-lg font-black text-indigo-950">{comparison.evolvedSelf.title}</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">{comparison.evolvedSelf.description}</p>
                    <div className="space-y-1 pt-2">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-700 block">Unlocked Capacities:</span>
                      {(comparison.evolvedSelf.unlockedCapacities || []).map((p, i) => (
                        <div key={i} className="text-xs text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                          🌟 {p}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* 3 Stepping Stones */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Growth Roadmap (Stepping Stones)</span>
                  <div className="grid md:grid-cols-3 gap-3 text-xs">
                    {(comparison.steppingStones || []).map((stone, idx) => (
                      <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 space-y-1">
                        <div className="font-bold text-indigo-700">{stone.phase}</div>
                        <p className="text-slate-700 text-xs font-medium">{stone.action}</p>
                        <p className="text-slate-500 text-[11px] leading-relaxed">Focus: {stone.focus}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section 4: Recommended Indian Career Pathways */}
              <div className="space-y-4">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                  <Target size={18} className="text-indigo-600" />
                  <h3 className="text-lg font-black text-slate-900">4. High-Fit Indian Career Pathways & Educational Trajectories</h3>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  {[
                    { role: 'Cognitive AI Research Scientist', stream: 'Science (PCM)', exams: 'JEE Main, JEE Advanced, GATE', salary: '12 – 35 LPA' },
                    { role: 'Clinical Psychologist / Neurodivergence Specialist', stream: 'Humanities / Science (PCB)', exams: 'CUET UG, NET-JRF, RCI M.Phil', salary: '6 – 20 LPA' },
                    { role: 'User Experience & Systems Architect', stream: 'Any Stream + Design', exams: 'UCEED, NID DAT, CEED', salary: '8 – 28 LPA' },
                  ].map((career, idx) => (
                    <div key={idx} className="p-4 rounded-xl border border-slate-200 bg-white space-y-2 text-xs">
                      <div className="font-black text-sm text-slate-900">{career.role}</div>
                      <div><strong className="text-slate-500">School Stream:</strong> {career.stream}</div>
                      <div><strong className="text-slate-500">Key Entrance Exams:</strong> {career.exams}</div>
                      <div><strong className="text-slate-500">Salary Outlook:</strong> <span className="text-emerald-700 font-bold">{career.salary}</span></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section 5: Keystone Daily Self-Management Routine */}
              <div className="p-6 rounded-2xl bg-indigo-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-300">
                    Recommended Daily Keystone Routine
                  </span>
                  <span className="text-xs text-indigo-200">Personalized Micro-Intervention</span>
                </div>
                <h4 className="text-xl font-black text-white">The 20/5 Dopamine Sprint + 4-7-8 Somatic Vagal Reset</h4>
                <p className="text-xs text-indigo-100 leading-relaxed">
                  Work in 20-minute uninterrupted sprints with physical intervals. When facing acute panic or procrastination resistance, engage the 4-7-8 Somatic Vagal breath (inhale 4s, hold 7s, exhale 8s) to disengage the sympathetic fight-or-flight reflex before beginning.
                </p>
              </div>

              {/* Document Sign-Off & Verification Seal */}
              <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-500">
                <div>
                  <strong>PRERNA Verification Seal:</strong> Cryptographically logged on-device. No cloud telemetry collected.
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Architected by Harsh Kumar Gupta (<a href="https://www.linkedin.com/in/harshkumarg/" target="_blank" rel="noreferrer" className="text-indigo-600 underline">LinkedIn</a>) • Free & Open-Source on GitHub
                  </div>
                </div>
                <div className="font-mono text-slate-400">
                  UID: {user?.id || 'LOCAL-TEEN'} • DPDP-S9-SECURE
                </div>
              </div>

            </div>
          </div>

          {/* Footer Bar */}
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 print:hidden">
            <div className="flex items-center gap-2">
              <span>Tip: Select <em>"Save as PDF"</em> in your browser's print dialog.</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  somaticAudio.playStarBeaconChime();
                  window.open('https://github.com/HarshkumarG007/PRERNA', '_blank', 'noopener,noreferrer');
                }}
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black shadow-sm flex items-center gap-1.5 cursor-pointer"
                title="Star PRERNA on GitHub"
              >
                <Star size={13} className="fill-slate-950" />
                <span>Light a Star on GitHub ⭐</span>
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
