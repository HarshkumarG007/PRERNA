import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Sparkles, GraduationCap, Award, Cpu, 
  Activity, Video, ExternalLink, ShieldCheck, Sun, 
  Code, BookOpen, CheckCircle, Globe, Flame
} from 'lucide-react';
import { PrernaEmblem } from './PrernaLogo';

interface AboutDeveloperModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutDeveloperModal: React.FC<AboutDeveloperModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'journey' | 'education' | 'certifications' | 'experience' | 'lineage'>('journey');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto">
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
          className="relative w-full max-w-5xl bg-gradient-to-b from-[#0c1124] via-[#090d1f] to-[#04060e] border border-indigo-500/30 rounded-3xl shadow-2xl shadow-indigo-950/90 overflow-hidden z-10 my-6 max-h-[92vh] flex flex-col"
        >
          {/* Top Decorative Celestial Accent Line */}
          <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-amber-400 via-rose-500 to-indigo-500" />
          <div className="absolute -top-32 left-1/4 w-96 h-96 bg-indigo-500/15 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-32 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />

          {/* Modal Header */}
          <div className="relative z-10 p-6 md:p-8 border-b border-white/10 bg-white/[0.02] flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400/25 via-indigo-600/30 to-purple-600/25 border border-amber-400/40 flex items-center justify-center shadow-xl shadow-amber-500/10 flex-shrink-0">
                <PrernaEmblem size={44} animate={true} />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className="px-3 py-0.5 rounded-full bg-amber-400/20 text-amber-300 text-[11px] font-black uppercase tracking-wider border border-amber-400/40">
                    Architect & Developer
                  </span>
                  <span className="text-xs text-slate-400">Varanasi, Uttar Pradesh, India</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                  Harsh Kumar Gupta
                </h2>
                <p className="text-sm font-medium text-indigo-300 mt-0.5">
                  AI/ML Engineer • Yoga & Behavioral Scholar • Clinical Pharma Bridge • Lifelong Seeker
                </p>
              </div>
            </div>

            {/* Quick Links & Close Button */}
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/HarshkumarG007/PRERNA"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-slate-300 hover:text-white transition-all flex items-center gap-1.5"
                title="View GitHub Repository"
              >
                <Code size={14} className="text-indigo-400" />
                <span className="hidden sm:inline">GitHub</span>
              </a>
              <a
                href="https://www.linkedin.com/in/harshkumarg/"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-xs font-bold text-indigo-200 hover:text-white transition-all flex items-center gap-1.5"
                title="View LinkedIn Profile"
              >
                <Globe size={14} className="text-indigo-400" />
                <span className="hidden sm:inline">LinkedIn</span>
              </a>
              <a
                href="https://www.credly.com/users/harshkumarg"
                target="_blank"
                rel="noreferrer"
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold text-amber-200 hover:text-white transition-all flex items-center gap-1.5"
                title="View Verified Credly Badges"
              >
                <Award size={14} className="text-amber-400" />
                <span className="hidden sm:inline">Credly (11 Badges)</span>
              </a>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="relative z-10 px-6 pt-3 border-b border-white/10 bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'journey', label: 'Polymathic Journey', icon: Sparkles },
              { id: 'lineage', label: 'Spiritual Lineage & Dedication', icon: Sun },
              { id: 'education', label: 'Multi-Disciplinary Education', icon: GraduationCap },
              { id: 'experience', label: 'Experience & Industry', icon: Activity },
              { id: 'certifications', label: '11 Google & IndiaAI Credentials', icon: Award },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 font-bold text-xs whitespace-nowrap transition-all cursor-pointer ${
                    isActive
                      ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                      : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.02]'
                  }`}
                >
                  <Icon size={14} className={isActive ? 'text-amber-400' : 'text-slate-500'} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Scrollable Body */}
          <div className="relative z-10 flex-1 overflow-y-auto p-6 md:p-8 space-y-8 text-slate-200">
            
            {/* ================================================================= */}
            {/* TAB 1: THE POLYMATHIC JOURNEY */}
            {/* ================================================================= */}
            {activeTab === 'journey' && (
              <div className="space-y-8 animate-fade-in-up">
                {/* Hero Genesis Box */}
                <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-indigo-950/70 via-slate-900/90 to-amber-950/40 border border-indigo-500/30 relative overflow-hidden">
                  <div className="relative z-10 space-y-4">
                    <span className="text-xs font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
                      <Flame size={14} /> The Mindset & Driving Purpose
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-white tracking-tight">
                      "A Never-Give-Up Mindset Grounded in Lifelong Learning."
                    </h3>
                    <p className="text-slate-300 text-sm md:text-base leading-relaxed">
                      PRERNA is not just another software utility. It is the crystallization of a lifelong commitment to <strong>learn something new, meaningful, and transformative every single day forever</strong>. It was born as a humble offering of gratefulness to the Divine for bestowing the abilities, intellect, and empathy to help make this world a safer, wiser, and more peaceful sanctuary for human potential.
                    </p>
                    <div className="pt-2 flex flex-wrap gap-3">
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
                        ⚡ Relentless Daily Learning
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
                        🧘 Yogic Equilibrium (समत्वं योग उच्यते)
                      </span>
                      <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-slate-300">
                        🛡️ Clinical & Data Sovereignty
                      </span>
                    </div>
                  </div>
                </div>

                {/* The 5-Pillar Convergence Matrix */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-white/10 pb-2">
                    <Sparkles size={18} className="text-amber-400" />
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-300">
                      Why PRERNA Was Born: The Five-Domain Convergence
                    </h4>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    How an uncommon synthesis of artificial intelligence, yogic science, pharmaceutical clinical awareness, mathematical physics, and visual storytelling shaped every layer of PRERNA:
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Pillar 1: AI & Computing */}
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/50 transition-all space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
                        <Cpu size={20} />
                      </div>
                      <h5 className="font-black text-white text-base">1. AI/ML & Applied Computing</h5>
                      <span className="text-[11px] font-bold text-indigo-300 block">MCA (Grade A) • AI & Robotics Specialist</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Engineered the local-first RAG pipeline, context-aware prompt injection for the AI Mentor, 11-dimensional career vector cosine matching, and strict privacy boundaries that keep adolescent data on-device.
                      </p>
                    </div>

                    {/* Pillar 2: Yoga & Science of Living */}
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/50 transition-all space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                        <Activity size={20} />
                      </div>
                      <h5 className="font-black text-white text-base">2. Yogic Psychology & Mind Balance</h5>
                      <span className="text-[11px] font-bold text-emerald-300 block">MA in Yoga & Science of Living • Yoga Therapist</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Grounded the platform in authentic nervous-system regulation: 432 Hz Pythagorean frequency synthesis, 4-7-8 somatic vagal reset, Box Breathing (Samavritti), and Higgins' Actual vs. Evolved Self-Discrepancy framework.
                      </p>
                    </div>

                    {/* Pillar 3: Clinical Pharmacy & Medical Ethics */}
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-rose-500/50 transition-all space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                        <ShieldCheck size={20} />
                      </div>
                      <h5 className="font-black text-white text-base">3. Pharmacy & Clinical Rigor</h5>
                      <span className="text-[11px] font-bold text-rose-300 block">Diploma in Pharmacy (D.Pharm)</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Infused strict healthcare compliance, clinical vocabulary, pharmacology awareness, and the non-negotiable Rule 0.3 gate: never diagnosing adolescents autonomously, and blocking automated guardian alerts without human clinician review.
                      </p>
                    </div>

                    {/* Pillar 4: Mathematical Physics & Scientific Method */}
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/50 transition-all space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                        <BookOpen size={20} />
                      </div>
                      <h5 className="font-black text-white text-base">4. Maths, Physics & Analytics</h5>
                      <span className="text-[11px] font-bold text-cyan-300 block">B.Sc. (Maths, Physics, Chemistry)</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Ensured empirical validity: normal Gaussian distribution calibration ($\mu, \sigma$) against 1,000,000+ benchmark participants, EMA rolling traits ($\alpha = 0.25$), and mathematical oscillator waveform formulas.
                      </p>
                    </div>

                    {/* Pillar 5: Visual Empathy & Storytelling */}
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/50 transition-all space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/30 flex items-center justify-center text-purple-400">
                        <Video size={20} />
                      </div>
                      <h5 className="font-black text-white text-base">5. Empathy, UX & Storytelling</h5>
                      <span className="text-[11px] font-bold text-purple-300 block">6+ Yrs Creator (Dinesh Kumar Presents) • Google UX</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Crafted an inviting, destigmatized visual sanctuary with soothing twilight celestial palettes, trauma-informed UI micro-copy, and engaging feedback loops that make young minds feel seen, heard, and respected.
                      </p>
                    </div>

                    {/* Pillar 6: Continuous Integration & Google Pedigree */}
                    <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/50 transition-all space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                        <Award size={20} />
                      </div>
                      <h5 className="font-black text-white text-base">6. Industrial Best Practices</h5>
                      <span className="text-[11px] font-bold text-amber-300 block">11 Google Specializations • IBM Faculty</span>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Deep adherence to enterprise software engineering: Agile Scrum, comprehensive test verification suites (126/126 unit tests passing), zero TypeScript compiler errors, and DPDP Section 9 privacy safeguards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 2: SPIRITUAL LINEAGE & DEDICATION */}
            {/* ================================================================= */}
            {activeTab === 'lineage' && (
              <div className="space-y-8 animate-fade-in-up">
                {/* Spiritual Lineage Tribute */}
                <div className="p-8 rounded-3xl bg-gradient-to-br from-amber-500/15 via-slate-900 to-indigo-950 text-white border border-amber-400/40 relative overflow-hidden shadow-2xl">
                  <div className="space-y-4">
                    <span className="text-xs font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
                      <Sun size={15} /> Divine Lineage & Primary Mentors
                    </span>
                    <h3 className="text-2xl md:text-3xl font-black text-white">
                      The Source of Inward Peace: Shri Prem Rawat & Father
                    </h3>
                    <p className="text-amber-200/90 font-serif italic text-sm md:text-base leading-relaxed">
                      "आत्म-साक्षात्कार ही ईश्वर-साक्षात्कार है — स्वयं को जानना ही परमात्मा को जानना है।"
                    </p>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Harsh is a humble disciple of <strong>Shri Prem Rawat</strong>, from whom he received the timeless gift of <em>Knowledge (Atma-Jnana)</em> — the practical ability to turn attention inward, experience the miraculous gift of breath, and access peace that is independent of worldly circumstances.
                    </p>
                    <p className="text-slate-300 text-sm leading-relaxed">
                      Before all worldly institutions, his first reverence belongs to his <strong>Father</strong> — his foundational guide and inspiration. It was under his father's blessing and name, <em>"Dinesh Kumar Presents"</em>, that Harsh spent over six continuous years creating visual educational content, learning perseverance, empathy, and the art of touching human lives.
                    </p>
                  </div>
                </div>

                {/* The Foundational Verses Anchor */}
                <div className="p-6 md:p-8 rounded-2xl bg-white/[0.03] border border-white/10 space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                    <BookOpen size={18} className="text-amber-400" />
                    <h4 className="text-sm font-black uppercase tracking-widest text-white">
                      The Soul of PRERNA: Sant Kabir Das
                    </h4>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-950 font-serif text-base md:text-lg text-amber-100 font-semibold text-center leading-loose border border-amber-400/20">
                    "आत्मज्ञान बिना नर भटके, कोई मथुरा कोई काशी। जैसे मृगा नाभि कस्तूरी, वन-वन फिरत उदासी।।<br />
                    विधि हरि हर जाको ध्यान धरत हैं, मुनिजन सहज अठ्ठासी। सोई हंस तेरे घट माहि, अलख पुरुष अविनाशी!"
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    This ancient Sant Vani realization is the exact engine behind PRERNA: every young person is already the sanctuary of the Divine Swan (*सोई हंस*). They do not need to be 'fixed' or pathologized; they only need a compass to stop external wandering and remember their intrinsic brilliance.
                  </p>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 3: MULTI-DISCIPLINARY EDUCATION */}
            {/* ================================================================= */}
            {activeTab === 'education' && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <GraduationCap size={18} className="text-indigo-400" />
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-300">
                    Formal Academic Qualifications
                  </h4>
                </div>

                <div className="space-y-4">
                  {/* MCA */}
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/40 transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h5 className="text-lg font-black text-white">Master of Computer Applications (MCA)</h5>
                      <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 self-start sm:self-auto">
                        Grade: A • Sep 2023 – Aug 2025
                      </span>
                    </div>
                    <div className="text-xs font-bold text-indigo-300">Kashi Institute of Technology, Varanasi</div>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">
                      Postgraduate focus on computer applications, software engineering, databases, machine learning, and artificial intelligence. Hands-on applied computing, high-performance algorithms, and production architectures.
                    </p>
                  </div>

                  {/* MA Yoga & Science of Living */}
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h5 className="text-lg font-black text-white">Master of Arts (MA) — Yoga & Science of Living</h5>
                      <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 self-start sm:self-auto">
                        Sep 2023 – Nov 2025
                      </span>
                    </div>
                    <div className="text-xs font-bold text-emerald-300">Jain Vishva Bharati Institute</div>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">
                      Interdisciplinary postgraduate study integrating Yoga, Science of Living (जीवन विज्ञान), psychology, behavioral self-management, health sciences, and research methodology. Practical implementation of emotional balance, somatic regulation, and holistic wellbeing.
                    </p>
                  </div>

                  {/* D.Pharm */}
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-rose-500/40 transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h5 className="text-lg font-black text-white">Diploma in Pharmacy (D.Pharm)</h5>
                      <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 self-start sm:self-auto">
                        Oct 2022 – Feb 2025 • Grade: 63.5%
                      </span>
                    </div>
                    <div className="text-xs font-bold text-rose-300">Board of Technical Education, Uttar Pradesh (BTEUP)</div>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">
                      Clinical and pharmaceutical domain foundation. Provides critical domain translation between clinical healthcare stakeholders and engineering teams. Deep understanding of pharmacology, clinical safety boundaries, bioinformatics, and regulatory ethics in HealthTech.
                    </p>
                  </div>

                  {/* BSc Maths Physics Chem */}
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-cyan-500/40 transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h5 className="text-lg font-black text-white">Bachelor of Science (B.Sc.) — Maths, Physics, Chemistry</h5>
                      <span className="px-3 py-0.5 rounded-full bg-white/10 text-slate-300 text-xs font-bold border border-white/20 self-start sm:self-auto">
                        2019 – 2022 • Grade: B
                      </span>
                    </div>
                    <div className="text-xs font-bold text-cyan-300">Jagatpur P.G. College, Varanasi</div>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">
                      Foundational scientific and mathematical training: differential equations, statistical mechanics, logical modeling, and empirical experimental verification.
                    </p>
                  </div>

                  {/* Diploma in Yoga and Naturopathy */}
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h5 className="text-lg font-black text-white">Diploma in Yoga and Naturopathy (Teacher Training & Therapy)</h5>
                      <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 self-start sm:self-auto">
                        Grade: Instructor • May 2018 – Jan 2019
                      </span>
                    </div>
                    <div className="text-xs font-bold text-emerald-400">Mahayogi Gorakhnath Maharishi Patanjali Yog Sansthan Bharatvarsh</div>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">
                      Certified Yoga instructor training, therapeutic asana alignments, pranayama breath control, and naturopathic lifestyle restoration.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 4: EXPERIENCE & INDUSTRY */}
            {/* ================================================================= */}
            {activeTab === 'experience' && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center gap-2 pb-2 border-b border-white/10">
                  <Activity size={18} className="text-indigo-400" />
                  <h4 className="text-sm font-black uppercase tracking-widest text-slate-300">
                    Professional Experience & Applied Work
                  </h4>
                </div>

                <div className="space-y-4">
                  {/* Arque Technologies - Specialist */}
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/40 transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h5 className="text-lg font-black text-white">AI & Robotics Specialist</h5>
                      <span className="px-3 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30 self-start sm:self-auto">
                        Mar 2026 – Present • Kathmandu, Nepal
                      </span>
                    </div>
                    <div className="text-xs font-bold text-indigo-400">Arque Technologies • Full-time (On-site)</div>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">
                      Architecting intelligent systems, Generative AI models, and robotics automation. Developing and integrating production-grade neural pipelines, RAG implementations, and agentic workflows.
                    </p>
                  </div>

                  {/* Arque Technologies - Trainer */}
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-indigo-500/40 transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h5 className="text-lg font-black text-white">AI Trainer</h5>
                      <span className="px-3 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold border border-white/10 self-start sm:self-auto">
                        Mar 2025 – Mar 2026 (1 yr 1 mo) • Fatehpur, UP
                      </span>
                    </div>
                    <div className="text-xs font-bold text-indigo-400">Arque Technologies</div>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">
                      Mentored students and educators in Machine Learning, Artificial Intelligence, and computational problem-solving, designing curriculum and hands-on laboratory exercises.
                    </p>
                  </div>

                  {/* FitnessMana */}
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-emerald-500/40 transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h5 className="text-lg font-black text-white">Yoga Instructor & Mental-Emotional Fitness Counselor</h5>
                      <span className="px-3 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 self-start sm:self-auto">
                        Feb 2022 – Jan 2023 (1 yr) • Remote
                      </span>
                    </div>
                    <div className="text-xs font-bold text-emerald-400">FitnessMana — In-App Wellness</div>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">
                      Provided guided yoga, power yoga, nutrition awareness, and mental-emotional fitness counseling. Empowered users with personalized breathwork and behavioral balance practices.
                    </p>
                  </div>

                  {/* Dinesh Kumar Presents YouTube */}
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-amber-500/40 transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h5 className="text-lg font-black text-white">Visual Creator & Storyteller ("Dinesh Kumar Presents")</h5>
                      <span className="px-3 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-bold border border-amber-500/30 self-start sm:self-auto">
                        Dec 2016 – Jan 2023 (6 yrs 2 mos) • Varanasi
                      </span>
                    </div>
                    <div className="text-xs font-bold text-amber-300">YouTube Channel • Dedicated to Father</div>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">
                      Six years of continuous visual media creation, video editing, sound design, and digital engagement, honoring his father Dinesh Kumar. Mastered visual empathy, pacing, and emotional communication.
                    </p>
                  </div>

                  {/* Youth India Foundation */}
                  <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 hover:border-purple-500/40 transition-all space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                      <h5 className="text-lg font-black text-white">Head Video Editor & Motion Graphic Designer</h5>
                      <span className="px-3 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30 self-start sm:self-auto">
                        Jan 2022 – Jan 2023 (1 yr 1 mo) • Remote
                      </span>
                    </div>
                    <div className="text-xs font-bold text-purple-300">Youth India Foundation (also TBH Circle & Media FleetBlue)</div>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1">
                      Led post-production visual teams, after effects, visual storytelling, and social campaigns reaching hundreds of thousands of youth across India.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ================================================================= */}
            {/* TAB 5: 11 GOOGLE SPECIALIZATIONS & VERIFIED CREDENTIALS */}
            {/* ================================================================= */}
            {activeTab === 'certifications' && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <Award size={18} className="text-amber-400" />
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-300">
                      Verified Certifications & Credly Badges
                    </h4>
                  </div>
                  <a
                    href="https://www.credly.com/users/harshkumarg"
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-amber-300 hover:text-amber-200 flex items-center gap-1"
                  >
                    <span>View Public Credly Profile</span>
                    <ExternalLink size={12} />
                  </a>
                </div>

                {/* IndiaAI & IBM Highlights */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-indigo-300 bg-indigo-500/20 px-2 py-0.5 rounded-full border border-indigo-500/30">
                      India AI Mission • FutureSkills Prime
                    </span>
                    <h5 className="font-black text-white text-base">LLM for Young Developers & Yuva AI for All</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Transformer architecture, NLP, tokenization, zero/few-shot prompt design, and ethical AI deployment on LLaMA and Mistral models.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full border border-amber-500/30">
                      IBM SkillsBuild • PBEL AI
                    </span>
                    <h5 className="font-black text-white text-base">IBM PBEL AI & NOVELia Emotion Bot</h5>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Developed NOVELia, an emotion-aware chatbot on IBM Watsonx Assistant with sentiment NLP. Recognized with IBM SkillsBuild Faculty credentials.
                    </p>
                  </div>
                </div>

                {/* 11 Google Specializations Grid */}
                <div className="space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                    The 11 Google Professional Certifications Suite:
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { title: 'Google Advanced Data Analytics', id: '5QSTRLXIOFH9', desc: 'Python, Machine Learning, Statistical Inference, Predictive Modeling' },
                      { title: 'Google Cybersecurity Professional', id: 'SN3N0XYDO00K', desc: 'SIEM Tools, Network Security, Incident Response, NIST Framework' },
                      { title: 'Google Business Intelligence', id: '5S4CT26Z8LRP', desc: 'Data Modeling, BigQuery SQL, ETL Pipelines, Tableau Dashboards' },
                      { title: 'Google Data Analytics Professional', id: 'TG6QWR68V7UX', desc: 'Spreadsheets, R Programming, Data Cleaning, Analytical Thinking' },
                      { title: 'Google UX Design Professional', id: '6SU2TSZZ6QNH', desc: 'User Research, Figma Prototyping, Design Systems, Empathy Maps' },
                      { title: 'Google IT Automation with Python', id: 'FF8MNOPUAS8F', desc: 'Git/GitHub, Cloud Deployment, OS Automation, Debugging Techniques' },
                      { title: 'Google Project Management', id: 'LXNE3KDGPZVE', desc: 'Agile & Scrum, Project Charters, Risk Mitigation, Stakeholder Alignment' },
                      { title: 'Google Digital Marketing & E-Commerce', id: '5INWB48N6QP8', desc: 'Customer Journey, Google Analytics, SEO/SEM, Marketing Strategy' },
                      { title: 'Google IT Support Professional', id: 'SI11IKP5G4XI', desc: 'Networking, Linux/Windows Administration, Encryption Protocols' },
                      { title: 'Google AI Essentials & Prompting', id: 'KO2DOGM9SUPT', desc: 'Generative AI Prompt Design, Chain-of-Thought, Responsible AI' },
                      { title: 'HackerRank & Accenture AI ASCEND', id: 'FSP/4255458', desc: 'Advanced SQL Querying, Data Engineering, AI Fundamental Workflows' },
                    ].map((cert, idx) => (
                      <div key={idx} className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-1.5 hover:bg-white/[0.04] transition-colors">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-amber-400">ID: {cert.id}</span>
                          <CheckCircle size={12} className="text-emerald-400" />
                        </div>
                        <h6 className="font-bold text-xs text-white">{cert.title}</h6>
                        <p className="text-[11px] text-slate-400 leading-snug">{cert.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Modal Footer */}
          <div className="p-6 border-t border-white/10 bg-white/[0.02] flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Created with gratitude to God • Dedicated to every adolescent seeker</span>
            </div>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com/HarshkumarG007/PRERNA"
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-colors"
              >
                GitHub Repo
              </a>
              <button
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-indigo-600 hover:from-amber-400 hover:to-indigo-500 font-black text-white text-xs transition-all shadow-lg shadow-indigo-600/20 cursor-pointer"
              >
                Return to Sanctuary
              </button>
            </div>
          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
