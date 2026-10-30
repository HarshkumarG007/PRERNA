import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Brain,
  Activity,
  Lock,
  Sparkles,
  Download,
  Sun,
  Flame,
  Award,
  Layers,
  Smartphone,
  Volume2
} from 'lucide-react';
import { somaticAudio } from '../../utils/audioSynthesis';
import { PrernaEmblem } from '../common/PrernaLogo';

interface ProductShowcaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialSlide?: number;
}

interface ShowcaseSlide {
  id: string;
  badge: string;
  badgeColor: string;
  title: string;
  subtitle: string;
  quote?: {
    sanskrit: string;
    translation: string;
  };
  highlights: {
    icon: any;
    label: string;
    desc: string;
    tag?: string;
  }[];
  interactivePillars: {
    title: string;
    description: string;
    metrics?: string;
  }[];
  visualAccent: string;
}

const SLIDES: ShowcaseSlide[] = [
  {
    id: 'mission',
    badge: 'Vision & Atma-Jnana',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
    title: 'The Adolescent Sanctuary Paradigm',
    subtitle: 'Reclaiming sovereign teenage mental health through ancient wisdom and zero-knowledge local intelligence.',
    quote: {
      sanskrit: 'सोई हंस तेरे घट माहि, अलख पुरुष अविनाशी! — संत कबीर',
      translation: 'That supreme divine consciousness resides within your own heart, imperishable and boundless.',
    },
    highlights: [
      {
        icon: Flame,
        label: 'The Adolescent Crisis',
        desc: 'Over 1 in 7 teens suffer from anxiety, isolation, and digital burnout. Existing platforms monetize engagement through algorithmic vulnerability.',
        tag: 'The Reality',
      },
      {
        icon: Sun,
        label: 'Self-Realisation as Sacred Foundation',
        desc: 'आत्म-साक्षात्कार ही ईश्वर-साक्षात्कार है. PRERNA provides an unjudged inner space where youth discover their authentic swadharma.',
        tag: 'Kabir Philosophy',
      },
      {
        icon: ShieldCheck,
        label: 'Absolute Psychological Safety',
        desc: 'No social comparison, no addictive dopamine loops, no behavioral exploitation. Pure introspection and empowerment.',
        tag: 'Sanctuary Ethos',
      },
    ],
    interactivePillars: [
      {
        title: 'Zero Algorithmic Bias',
        description: 'Empowers teenagers to author their own identity rather than having algorithms feed them an echo chamber.',
        metrics: '100% On-Device',
      },
      {
        title: 'Holistic Swadharma',
        description: 'Blends Indian psychology, Kabir philosophy, and modern positive psychometrics for deep self-actualization.',
        metrics: 'Ethical Core',
      },
    ],
    visualAccent: 'from-amber-500/20 via-orange-500/10 to-indigo-900/10',
  },
  {
    id: 'psychometrics',
    badge: '5-Domain Psychometrics',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
    title: 'Empirical Self-Discovery Engine',
    subtitle: 'Five rigorous, scientifically grounded psychological frameworks synthesized into an actionable life blueprint.',
    highlights: [
      {
        icon: Brain,
        label: 'Big Five Personality (OCEAN)',
        desc: 'Measures Openness, Conscientiousness, Extraversion, Agreeableness, and Emotional Stability with adolescent-tuned norms.',
        tag: 'Personality Core',
      },
      {
        icon: Layers,
        label: 'RIASEC Vocational Themes',
        desc: "Maps authentic career resonance across Holland's Realistic, Investigative, Artistic, Social, Enterprising, and Conventional archetypes.",
        tag: 'Career Calling',
      },
      {
        icon: Sparkles,
        label: '16 Personalities Typology',
        desc: 'Jungian cognitive style derivation uncovering individual information processing, decision-making, and communication strengths.',
        tag: 'Cognitive Architecture',
      },
      {
        icon: Award,
        label: "Maslow's Hierarchical Compass",
        desc: 'Tracks physiological security, emotional safety, belonging, self-esteem, self-actualization, and transcendence.',
        tag: 'Needs Hierarchy',
      },
    ],
    interactivePillars: [
      {
        title: 'Cognitive Agility Suite',
        description: 'Working memory, verbal fluency, spatial awareness, and creative divergence assessments without academic grading pressure.',
        metrics: '6 Cognitive Facets',
      },
      {
        title: 'Somatic Life Blueprint',
        description: 'Generates an unforgeable, private cryptographic JSON and PDF report of strengths, blindspots, and growth opportunities.',
        metrics: '100% Exportable',
      },
    ],
    visualAccent: 'from-indigo-500/20 via-violet-500/10 to-sky-900/10',
  },
  {
    id: 'vitality',
    badge: 'Kaya Kalpa & Circadian Rhythm',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-300',
    title: 'Physical Vitality & Somatic Architecture',
    subtitle: 'Nourishing the temple of the body: height, weight, BMI, 90-min sleep cycles, smart alarms, and sensor telemetry.',
    highlights: [
      {
        icon: Activity,
        label: 'Kaya Kalpa Physical Metrics',
        desc: 'WHO adolescent growth trajectory tracking with BMI percentiles, hydration pacing, and nutritional mindfulness.',
        tag: 'Physical Growth',
      },
      {
        icon: Sun,
        label: '90-Min Ultradian Sleep Calculator',
        desc: 'Calculates optimal sleep windows aligned with natural REM/NREM architecture (4 to 6 full 90-minute restorative cycles).',
        tag: 'Sleep Science',
      },
      {
        icon: Volume2,
        label: 'Smart Wake-Up Alarm',
        desc: 'Awakens youth gently at sleep cycle boundaries with 432 Hz Pythagorean frequencies and classical Indian raga harmonies.',
        tag: 'Peak Alertness',
      },
      {
        icon: Smartphone,
        label: 'Smartband & Sensor Integration',
        desc: 'Ingests real-time Pulse BPM, SpO2, and Step counts via Web Bluetooth and smartphone accelerometer sensors with zero cloud leak.',
        tag: 'BLE & Device Sensors',
      },
    ],
    interactivePillars: [
      {
        title: '432 Hz Coherence Pacer',
        description: 'Interactive Box & Pranayama somatic breathing companion that calms the central nervous system within 3 minutes.',
        metrics: 'Somatic Vagal Tone',
      },
      {
        title: 'Circadian Sleep Journal',
        description: 'Auto-calculates sleep duration, cycle quality, and awakening morning sentiment for long-term emotional resilience.',
        metrics: 'Zero Tracking',
      },
    ],
    visualAccent: 'from-emerald-500/20 via-teal-500/10 to-emerald-950/10',
  },
  {
    id: 'security',
    badge: 'Multi-Modal Persona Vault',
    badgeColor: 'bg-violet-100 text-violet-900 border-violet-300',
    title: 'Zero-Knowledge Security & Privacy Vault',
    subtitle: 'Multi-factor verification for teen sanctuary, parent linking, educator analytics, and clinical oversight.',
    highlights: [
      {
        icon: Lock,
        label: 'Biometric WebAuthn Authentication',
        desc: 'Hardware-backed Windows Hello, Touch ID, Face ID, and Android Biometrics with zero biometric data ever leaving the device enclave.',
        tag: 'Hardware Enclave',
      },
      {
        icon: ShieldCheck,
        label: 'Argon2id + AES-256 Cryptography',
        desc: 'Custom alphanumeric passwords, 4-6 digit numeric PINs, and tactile 3x3 pattern locks hashed with Argon2id parameters.',
        tag: 'Military-Grade Crypto',
      },
      {
        icon: Layers,
        label: 'Role-Segmented Persona Firewall',
        desc: 'Strict boundary separation between Teen Sanctuary, Parent Mirror, Educator Dashboard, and Clinician Portal.',
        tag: 'Zero Privilege Creep',
      },
      {
        icon: Sparkles,
        label: 'Privacy-Preserving Crisis Detection',
        desc: 'Heuristic on-device distress identification triggering immediate, gentle helpline surfaces without non-consensual surveillance.',
        tag: 'Ethical Guardian',
      },
    ],
    interactivePillars: [
      {
        title: 'DPDP Act 2023 §9 Strict Compliance',
        description: 'Zero commercial profiling, zero behavioral tracking, zero targeted advertising. Full compliance with Indian law.',
        metrics: '100% Verified',
      },
      {
        title: 'Zero-Knowledge Parent Mirror',
        description: 'Parents view supportive growth themes without reading raw private journals or sensitive teen self-reflections.',
        metrics: 'Preserves Trust',
      },
    ],
    visualAccent: 'from-violet-500/20 via-indigo-500/10 to-slate-900/10',
  },
  {
    id: 'architecture',
    badge: 'Local-First Native Architecture',
    badgeColor: 'bg-sky-100 text-sky-900 border-sky-300',
    title: 'Offline-First Cross-Platform Deployment',
    subtitle: 'Engineered for absolute resilience: Native Windows `.msi`/`.exe`, Android APK, and zero-network PWA.',
    highlights: [
      {
        icon: Brain,
        label: 'Local LLM Inference Engine',
        desc: 'Rust Tauri backend with embedded llama.cpp runtime. Runs intelligent self-discovery guidance completely offline.',
        tag: 'Zero Cloud Token Cost',
      },
      {
        icon: Smartphone,
        label: 'Native Android & Windows Packaging',
        desc: 'Verified builds for Android arm64/x86_64 APK and Windows desktop application with native hardware access.',
        tag: 'Tauri 2.0 + Rust',
      },
      {
        icon: ShieldCheck,
        label: 'Local-First Service Worker (PWA)',
        desc: 'Cryptographic offline caching via Service Worker (`sw.js`) and standalone Web App Manifest (`manifest.webmanifest`).',
        tag: '100% Offline Resilience',
      },
      {
        icon: Award,
        label: 'Built by Harsh Kumar Gupta',
        desc: 'AI & Robotics Specialist, Scholar of Yoga & Science of Living (Varanasi), Author of 22 open-source repositories.',
        tag: 'Architect & Creator',
      },
    ],
    interactivePillars: [
      {
        title: 'SQLCipher On-Device DB',
        description: 'Local SQLite encrypted database ensuring adolescents maintain total ownership and exportability of their data.',
        metrics: 'Zero Network Required',
      },
      {
        title: 'Zero Third-Party SDKs',
        description: 'No Google Analytics, no Facebook Pixel, no Mixpanel, no cloud telemetry. Pure, uncompromised digital sovereignty.',
        metrics: '0 Remote Trackers',
      },
    ],
    visualAccent: 'from-sky-500/20 via-blue-500/10 to-slate-900/10',
  },
];

export const ProductShowcaseModal: React.FC<ProductShowcaseModalProps> = ({
  isOpen,
  onClose,
  initialSlide = 0,
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(initialSlide);
  const [isExporting, setIsExporting] = useState(false);

  const goToSlide = useCallback((index: number) => {
    somaticAudio.playSoftChime();
    setCurrentSlideIndex(Math.max(0, Math.min(index, SLIDES.length - 1)));
  }, []);

  const nextSlide = useCallback(() => {
    if (currentSlideIndex < SLIDES.length - 1) {
      goToSlide(currentSlideIndex + 1);
    } else {
      somaticAudio.playStarBeaconChime();
    }
  }, [currentSlideIndex, goToSlide]);

  const prevSlide = useCallback(() => {
    if (currentSlideIndex > 0) {
      goToSlide(currentSlideIndex - 1);
    }
  }, [currentSlideIndex, goToSlide]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, nextSlide, prevSlide, onClose]);

  if (!isOpen) return null;

  const currentSlide = SLIDES[currentSlideIndex];

  const handleExportPitchDeck = () => {
    setIsExporting(true);
    somaticAudio.playStarBeaconChime();

    const markdownDeck = `# PRERNA™ • प्रेरणा • Psychological & Somatic Sanctuary for Adolescents
**Executive Product Showcase & Technical Architecture Pitch Deck**
*Architect & Lead Developer:* Harsh Kumar Gupta
*Copyright:* PRERNA™ © 2026 Harsh Kumar Gupta. All Rights Reserved.
*Legal Sovereign Framework:* India Digital Personal Data Protection (DPDP) Act 2023 §9 Strict Compliance
*Exported At:* ${new Date().toISOString()}

---

## 1. Vision & Core Philosophy (Atma-Jnana)
- **Sanctuary Creed:** "सोई हंस तेरे घट माहि, अलख पुरुष अविनाशी!" — Sant Kabir Das
- **Core Truth:** Self-Realisation is God's Realisation (आत्म-साक्षात्कार ही ईश्वर-साक्षात्कार है).
- **The Problem:** 1 in 7 adolescents suffer from mental health struggles, academic burnout, and loneliness. Mainstream platforms exploit vulnerabilities through addictive algorithms and surveillance capitalism.
- **The Solution:** PRERNA provides an on-device, unjudged psychological sanctuary where adolescents discover their authentic self without surveillance or peer comparison.

---

## 2. 5-Domain Empirical Psychometrics Engine
1. **Big Five Personality Factors (OCEAN):** Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism with adolescent calibration.
2. **RIASEC Vocational Archetypes (Holland):** Realistic, Investigative, Artistic, Social, Enterprising, Conventional.
3. **16 Personalities Cognitive Typology:** Derived Myers-Briggs/Jungian cognitive preferences.
4. **Maslow's Hierarchical Compass:** Dynamic tracking across Physiological, Safety, Belonging, Esteem, Self-Actualization, and Transcendence.
5. **Cognitive Agility Suite:** Working memory, spatial cognition, verbal fluency, and creative divergence.

---

## 3. Kaya Kalpa Physical Vitality & Sleep Architecture
- **Adolescent Physical Growth:** Height, Weight, BMI tracking based on WHO growth percentiles.
- **90-Minute Ultradian Sleep Cycle Calculator:** Aligns bedtimes and wake times with REM/NREM boundaries (4-6 restorative 90-min cycles).
- **Smart Wake-Up Alarm:** Soothing morning awakening at cycle boundaries with 432 Hz Pythagorean chimes and Indian ragas.
- **Sensor & Smartband Telemetry:** Pulse BPM, SpO2, and Step count ingestion via Web Bluetooth and phone sensors with 100% on-device processing.
- **Somatic Coherence Breathing Companion:** 432 Hz box and pranayama pacing for autonomic nervous system regulation.

---

## 4. Zero-Knowledge Multi-Modal Security Vault
- **Multi-Factor Vault:** Hardware WebAuthn biometrics (Fingerprint / Face ID), 4-6 digit cryptographic PINs, and tactile 3x3 pattern locks.
- **Argon2id + AES-256-GCM:** Hardened on-device credential encryption.
- **Four-Persona Firewall:** Teen Sanctuary, Parent Mirror, Educator Analytics, and Clinical Review.
- **DPDP Act 2023 §9:** No cloud behavioral profiling, zero targeted ads, zero tracking pixels.

---

## 5. Technical Architecture & Native Deployment
- **Local LLM Engine:** Rust Tauri 2.0 backend with embedded llama.cpp runtime for offline mentor chats.
- **Database:** Local SQLite / SQLCipher encrypted storage.
- **Platform Deployments:**
  - Windows Desktop (.exe / .msi) installer with native hardware acceleration.
  - Android native APK (arm64-v8a / x86_64).
  - Progressive Web App (PWA) with zero-cloud Service Worker (\`sw.js\`) and Web Manifest.

---

*PRERNA™ is a trademark of Harsh Kumar Gupta. All Rights Reserved.*
*LinkedIn: https://www.linkedin.com/in/harshkumarg/ | GitHub: https://github.com/HarshkumarG007*
`;

    const blob = new Blob([markdownDeck], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PRERNA_Product_Showcase_Pitch_Deck_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setTimeout(() => setIsExporting(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-5xl bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Top Header Bar */}
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/80">
          <div className="flex items-center gap-3">
            <PrernaEmblem size={26} animate={false} />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-slate-900">
                  PRERNA™ Showcase & Pitch Deck
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200">
                  Slide {currentSlideIndex + 1} of {SLIDES.length}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Psychological Sanctuary • Somatic Vitality • Local Sovereign Architecture
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPitchDeck}
              disabled={isExporting}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 text-xs font-bold border border-slate-200 transition-colors cursor-pointer shadow-2xs"
              title="Download Executive Pitch Deck Markdown"
            >
              <Download size={14} className={isExporting ? 'animate-bounce text-indigo-600' : ''} />
              <span className="hidden md:inline">{isExporting ? 'Exporting...' : 'Export Deck'}</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-full transition-colors cursor-pointer"
              title="Close Showcase"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Slide Selector Stepper Tabs */}
        <div className="px-6 py-2 bg-slate-100/60 border-b border-slate-200/60 flex items-center justify-between gap-1 overflow-x-auto text-xs">
          {SLIDES.map((slide, idx) => (
            <button
              key={slide.id}
              onClick={() => goToSlide(idx)}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                idx === currentSlideIndex
                  ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200 scale-102'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
              }`}
            >
              <span className="text-[10px] font-mono opacity-70">0{idx + 1}</span>
              <span>{slide.badge.split('&')[0].trim()}</span>
            </button>
          ))}
        </div>

        {/* Slide Content Body */}
        <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              {/* Header section with quote or badge */}
              <div className={`p-6 rounded-3xl bg-gradient-to-br ${currentSlide.visualAccent} border border-slate-200/60 relative overflow-hidden`}>
                <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                  <span className={`text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full border ${currentSlide.badgeColor}`}>
                    {currentSlide.badge}
                  </span>
                  <span className="text-xs font-semibold text-slate-500">
                    PRERNA Sanctuary • Product Deck
                  </span>
                </div>

                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight mb-2">
                  {currentSlide.title}
                </h2>
                <p className="text-sm md:text-base text-slate-600 font-medium leading-relaxed max-w-3xl">
                  {currentSlide.subtitle}
                </p>

                {currentSlide.quote && (
                  <div className="mt-4 pt-4 border-t border-amber-300/40 bg-amber-500/10 p-4 rounded-2xl">
                    <p className="text-sm font-black text-amber-950 font-serif italic mb-1">
                      "{currentSlide.quote.sanskrit}"
                    </p>
                    <p className="text-xs text-amber-900/80 font-medium">
                      {currentSlide.quote.translation}
                    </p>
                  </div>
                )}
              </div>

              {/* Highlights Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {currentSlide.highlights.map((h, i) => {
                  const Icon = h.icon;
                  return (
                    <div
                      key={i}
                      className="p-5 rounded-2xl bg-slate-50/80 border border-slate-200/80 hover:border-indigo-300 transition-all hover:shadow-sm space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                          <Icon size={18} />
                        </div>
                        {h.tag && (
                          <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-700">
                            {h.tag}
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-black text-slate-900">{h.label}</h4>
                      <p className="text-xs text-slate-600 leading-relaxed">{h.desc}</p>
                    </div>
                  );
                })}
              </div>

              {/* Interactive Pillars Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                {currentSlide.interactivePillars.map((p, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-2xl bg-indigo-950/[0.03] border border-indigo-200/60 flex items-start justify-between gap-3"
                  >
                    <div>
                      <h5 className="text-xs font-black text-indigo-950 mb-1">{p.title}</h5>
                      <p className="text-xs text-slate-600 leading-snug">{p.description}</p>
                    </div>
                    {p.metrics && (
                      <span className="text-[10px] font-mono font-bold px-2 py-1 rounded-lg bg-indigo-100 text-indigo-800 whitespace-nowrap">
                        {p.metrics}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom Navigation & Controls */}
        <div className="px-6 py-4 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <button
              onClick={prevSlide}
              disabled={currentSlideIndex === 0}
              className={`flex items-center gap-1 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                currentSlideIndex === 0
                  ? 'opacity-40 cursor-not-allowed border-slate-200 text-slate-400'
                  : 'bg-white hover:bg-slate-100 border-slate-300 text-slate-700 shadow-2xs'
              }`}
            >
              <ChevronLeft size={16} />
              <span>Previous</span>
            </button>

            <button
              onClick={nextSlide}
              className={`flex items-center gap-1 px-5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                currentSlideIndex === SLIDES.length - 1
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700 shadow-xs'
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white border-indigo-700 shadow-xs'
              }`}
            >
              <span>{currentSlideIndex === SLIDES.length - 1 ? '✨ Completed Deck' : 'Next Slide'}</span>
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="flex items-center gap-3 text-xs text-slate-500">
            <span className="hidden sm:inline font-medium">Use arrow keys (← →) or spacebar to navigate</span>
            <div className="flex gap-1.5">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i)}
                  className={`h-2 rounded-full transition-all cursor-pointer ${
                    i === currentSlideIndex ? 'w-6 bg-indigo-600' : 'w-2 bg-slate-300 hover:bg-slate-400'
                  }`}
                  title={`Go to slide ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
