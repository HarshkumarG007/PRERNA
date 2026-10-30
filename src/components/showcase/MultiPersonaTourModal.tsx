import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import { somaticAudio } from '../../utils/audioSynthesis';
import { PrernaEmblem } from '../common/PrernaLogo';

interface MultiPersonaTourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPersona: (role: 'teen' | 'parent' | 'adult' | 'educator') => void;
  currentRole?: 'teen' | 'parent' | 'adult' | 'educator';
}

interface PersonaSlide {
  role: 'teen' | 'parent' | 'adult' | 'educator';
  badge: string;
  badgeColor: string;
  title: string;
  hindiTitle: string;
  tagline: string;
  philosophy: {
    quote: string;
    author: string;
  };
  accentGradient: string;
  cardBorder: string;
  features: {
    title: string;
    description: string;
    tag: string;
  }[];
  privacyGuarantee: string;
  targetAudience: string;
}

const PERSONA_SLIDES: PersonaSlide[] = [
  {
    role: 'teen',
    badge: 'Adolescent Sanctuary • 13–19 Years',
    badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-200',
    title: 'Teen Explorer Sanctuary',
    hindiTitle: 'किशोर अन्वेषक साधना',
    tagline: 'Sovereign self-discovery, cognitive strengths, and emotional resilience without surveillance or social judgment.',
    philosophy: {
      quote: 'संत कबीर: "मोको कहाँ ढूँढे रे बन्दे, मैं तो तेरे पास में।" (Sant Kabir: True wisdom resides within your own quiet self, not in external noise).',
      author: 'Sant Kabir Das'
    },
    accentGradient: 'from-indigo-600 via-indigo-700 to-sky-700',
    cardBorder: 'border-indigo-200',
    features: [
      {
        title: '5-Domain Psychometric Profiling',
        description: 'Big Five personality mapping with exponential moving average (α=0.25) plus Holland RIASEC vocational inclinations.',
        tag: 'Psychometrics'
      },
      {
        title: 'Life Quests & Cognitive Mini-Games',
        description: 'Reaction timing, spatial puzzle reasoning, word bridge coherence, and scenario-based decision arenas.',
        tag: 'Cognition'
      },
      {
        title: 'Kaya Kalpa Circadian Alignment',
        description: '90-minute ultradian focus rhythms, hydration intervals, and 432 Hz Pythagorean binaural sleep somatics.',
        tag: 'Vitality'
      },
      {
        title: 'Socratic Encrypted Reflection Diary',
        description: 'Completely private journal with on-device SQLCipher keying. Zero behavioral profiling or cloud surveillance.',
        tag: 'DPDP §9 Compliant'
      }
    ],
    privacyGuarantee: '100% Private to Teen. Parents and schools CANNOT view personal diaries, scores, or thoughts.',
    targetAudience: 'Secondary & High School Students (Ages 13–19)'
  },
  {
    role: 'parent',
    badge: 'Family Bridge • Zero-Surveillance',
    badgeColor: 'bg-emerald-100 text-emerald-900 border-emerald-200',
    title: 'Parent Sanctuary Hub',
    hindiTitle: 'अभिभावक संगम',
    tagline: 'Empowering parents to build bridges of authentic connection through empathy rather than intrusive surveillance.',
    philosophy: {
      quote: 'रवीन्द्रनाथ ठाकुर: "Don\'t limit a child to your own learning, for he was born in another time."',
      author: 'Rabindranath Tagore'
    },
    accentGradient: 'from-emerald-700 via-teal-700 to-emerald-900',
    cardBorder: 'border-emerald-200',
    features: [
      {
        title: 'Verifiable Parental Consent (DPDP §9)',
        description: 'Full legal compliance with India’s Digital Personal Data Protection Act 2023 with cryptographic consent logging.',
        tag: 'Legal Vault'
      },
      {
        title: 'Socratic Dinner Conversation Starters',
        description: 'AI-generated bridge prompts grounded in adolescent developmental psychology to spark loving family dialogue.',
        tag: 'Connection'
      },
      {
        title: 'Sovereign QR Peer Pairing',
        description: 'Peer-to-peer linking via 15-minute time-bounded QR token handshake directly over camera without middleman servers.',
        tag: 'P2P Handshake'
      },
      {
        title: 'Non-Punitive Early Awareness',
        description: 'Gentle systemic indicators of emotional distress without exposing teen journal entries or invading boundaries.',
        tag: 'Empathy'
      }
    ],
    privacyGuarantee: 'Boundary-respecting: Provides guidance prompts and consent controls without snooping on teen private journals.',
    targetAudience: 'Parents, Guardians, and Family Mentors'
  },
  {
    role: 'adult',
    badge: 'Vocational Mastery & Sacred Intimacy',
    badgeColor: 'bg-rose-100 text-rose-900 border-rose-200',
    title: 'Adult Sanctuary & Secret Partners ❤️',
    hindiTitle: 'वयस्क साधना & युगल संगम',
    tagline: 'Cultivate personal Swadharma vocation, Maslow transcendence, and an encrypted sanctuary for Lovers & Besties.',
    philosophy: {
      quote: 'रूमी: "The minute I heard my first love story, I started looking for you, not knowing how blind that was."',
      author: 'Jalal al-Din Muhammad Rumi'
    },
    accentGradient: 'from-rose-600 via-pink-700 to-amber-700',
    cardBorder: 'border-rose-200',
    features: [
      {
        title: 'Swadharma & Maslow Cosmic Compass',
        description: 'Align daily career vocation with inner nature. Progression from physiological safety to self-actualization.',
        tag: 'Swadharma'
      },
      {
        title: 'PRERNA for Partners ❤️ (Secret Gateway)',
        description: 'Dedicated lovers & besties vault completely hidden from Teens, Parents, and Schools with PIN/biometric isolation.',
        tag: 'Partners Vault'
      },
      {
        title: 'Preeti (प्रेरणा साथी) Voice & Somatic Audio',
        description: '3-Mode AI companion with pure Web Audio synthesis (Monsoon, Temple Bells, 432Hz Drone) and soothing voice narration.',
        tag: 'Somatic Soundscapes'
      },
      {
        title: 'Communication Studio & Sacred Memories',
        description: 'Compassionate NVC Re-framer, Daily Heart Cards, Date Planner, and Dual Encrypted Secret Journal.',
        tag: 'Sacred Intimacy'
      }
    ],
    privacyGuarantee: 'Secret Gateway isolated completely from teens and parents. Guarded by biometric/passcode locking.',
    targetAudience: 'Adults (18+), Career Seekers, Couples & Lifelong Besties'
  },
  {
    role: 'educator',
    badge: 'Institutional Care • k ≥ 5 Anonymized',
    badgeColor: 'bg-amber-100 text-amber-900 border-amber-200',
    title: 'School & Educator Flourishing Hub',
    hindiTitle: 'विद्यापीठ दर्पण',
    tagline: 'Actionable cohort wellbeing intelligence, proactive institutional care, and educator vitality without student surveillance.',
    philosophy: {
      quote: 'डॉ. सर्वपल्ली राधाकृष्णन: "Teachers should be the best minds in the country."',
      author: 'Dr. Sarvepalli Radhakrishnan'
    },
    accentGradient: 'from-slate-900 via-indigo-950 to-slate-900',
    cardBorder: 'border-amber-200',
    features: [
      {
        title: 'k-Anonymized Cohort Flourishing Index',
        description: 'Aggregate mathematical indicators (k ≥ 5) measuring collective emotional climate across classes and grades.',
        tag: 'Zero-PII Analytics'
      },
      {
        title: 'Institutional Care & Non-Punitive Playbooks',
        description: 'Proactive detection of exam stress spikes and early seasonal anxiety with Tele-MANAS (14416) escalation playbooks.',
        tag: 'Care Vectors'
      },
      {
        title: 'Teacher Vitality Corner',
        description: 'Tagore-inspired educator breathwork, 432 Hz mindfulness bells, and teacher self-compassion recharge drills.',
        tag: 'Educator Care'
      },
      {
        title: 'One-Click Batch JSON Export',
        description: 'Export anonymized compliance audit reports for school boards, counselors, and education department reviews.',
        tag: 'Board Reporting'
      }
    ],
    privacyGuarantee: 'Mathematical k-anonymity guarantee (k ≥ 5). Zero individual student identification or diary surveillance.',
    targetAudience: 'School Principals, Academic Counselors, & Teachers'
  }
];

export const MultiPersonaTourModal: React.FC<MultiPersonaTourModalProps> = ({
  isOpen,
  onClose,
  onSelectPersona,
  currentRole = 'teen'
}) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  // Initialize slide based on currently active role
  useEffect(() => {
    if (isOpen) {
      const idx = PERSONA_SLIDES.findIndex((s) => s.role === currentRole);
      if (idx !== -1) {
        setCurrentSlideIndex(idx);
      }
    }
  }, [isOpen, currentRole]);

  const slide = PERSONA_SLIDES[currentSlideIndex];

  const handleNext = useCallback(() => {
    somaticAudio.playSoftChime();
    setCurrentSlideIndex((prev) => (prev + 1) % PERSONA_SLIDES.length);
  }, []);

  const handlePrev = useCallback(() => {
    somaticAudio.playSoftChime();
    setCurrentSlideIndex((prev) => (prev - 1 + PERSONA_SLIDES.length) % PERSONA_SLIDES.length);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleNext, handlePrev, onClose]);

  const handleSelectRole = (role: 'teen' | 'parent' | 'adult' | 'educator') => {
    somaticAudio.playStarBeaconChime();
    onSelectPersona(role);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md font-sans">
        
        {/* Modal Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-5xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        >
          {/* Header Bar */}
          <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <PrernaEmblem size={28} className="text-amber-400" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-black tracking-tight text-white">
                    PRERNA Ecosystem Tour • चतुर्विध साधना
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    4 Sovereign Personas
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Interactive multi-modal walkthrough of India’s first sovereign local-first guidance ecosystem
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close tour"
            >
              <X size={20} />
            </button>
          </div>

          {/* Persona Tabs Navigation Strip */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2 overflow-x-auto text-xs">
            <div className="flex items-center gap-2">
              {PERSONA_SLIDES.map((s, idx) => {
                const isActive = idx === currentSlideIndex;
                const isCurrent = s.role === currentRole;
                return (
                  <button
                    key={s.role}
                    type="button"
                    onClick={() => {
                      somaticAudio.playSoftChime();
                      setCurrentSlideIndex(idx);
                    }}
                    className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap text-xs ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-sm scale-102'
                        : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <span>{idx + 1}. {s.title.split(' ')[0]}</span>
                    {isCurrent && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-300 font-normal">
                        Active
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-400 font-mono">
              <span>{currentSlideIndex + 1} / {PERSONA_SLIDES.length}</span>
            </div>
          </div>

          {/* Main Slide Content Area */}
          <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6">
            
            {/* Top Persona Hero Banner */}
            <div className={`p-6 md:p-8 rounded-3xl bg-gradient-to-r ${slide.accentGradient} text-white shadow-lg relative overflow-hidden text-left`}>
              <div className="relative z-10 space-y-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full ${slide.badgeColor} border`}>
                    {slide.badge}
                  </span>
                  <span className="text-xs text-white/70">• {slide.targetAudience}</span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold text-amber-300 block">{slide.hindiTitle}</span>
                  <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white">
                    {slide.title}
                  </h2>
                </div>

                <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-medium">
                  {slide.tagline}
                </p>

                {/* Ancient Wisdom / Philosophy Quote */}
                <div className="p-3.5 rounded-2xl bg-black/20 backdrop-blur-xs border border-white/10 text-xs italic text-amber-200 leading-snug">
                  "{slide.philosophy.quote}"
                </div>
              </div>
            </div>

            {/* 4 Feature Pillars Grid */}
            <div className="space-y-3 text-left">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                  Core Capabilities & Psychological Architecture
                </h4>
                <span className="text-[11px] font-bold text-slate-400">
                  DPDP Act 2023 §9 Sovereign Design
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {slide.features.map((feat, idx) => (
                  <div
                    key={idx}
                    className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900 tracking-tight">
                        {feat.title}
                      </span>
                      <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        {feat.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cryptographic Privacy Invariant Card */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 flex items-start gap-3 text-left">
              <ShieldCheck size={20} className="text-amber-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-amber-950 block">
                  Cryptographic Isolation & Zero-Knowledge Guarantee:
                </span>
                <p className="text-amber-800 leading-relaxed">
                  {slide.privacyGuarantee}
                </p>
              </div>
            </div>

          </div>

          {/* Footer Controls Strip */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
            
            {/* Prev / Next Buttons */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrev}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ChevronLeft size={16} /> Previous
              </button>

              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold hover:bg-slate-100 transition-colors flex items-center gap-1 cursor-pointer"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>

            {/* Direct Switch to This Persona Action Button */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleSelectRole(slide.role)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-indigo-950 text-white text-xs font-black shadow-md transition-all flex items-center gap-2 cursor-pointer"
              >
                <span>Switch to {slide.title.split(' ')[0]} Sanctuary</span>
                <ArrowRight size={15} />
              </button>
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
