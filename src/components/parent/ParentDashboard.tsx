import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Shield, 
  MessageCircle, 
  ChevronRight, 
  Sparkles, 
  Wind, 
  Printer, 
  PhoneCall, 
  ShieldCheck,
  Camera,
  QrCode,
  Unlink,
  CheckCircle2
} from 'lucide-react';
import { ParentSafeProfile } from '../../parent/permissions';
import { DisclosureGate } from '../consent/DisclosureGate';
import { safeInvoke as invoke } from '../../utils/mockBackend';
import { ConversationGuides } from './ConversationGuides';
import { ParentingGuide } from './ParentingGuide';
import { ParentGuideView } from './ParentGuideView';
import { useAppStore } from '../../store';
import { SomaticBreathingCompanion } from '../growth/SomaticBreathingCompanion';
import { LifeBlueprintExport } from '../growth/LifeBlueprintExport';
import { AtmaJnanaOriginModal } from '../common/AtmaJnanaOriginModal';
import { AboutDeveloperModal } from '../common/AboutDeveloperModal';
import { deriveSixteenType } from '../../engine/assessment/sixteenPersonalities';
import { QrCameraScanner } from '../scanner/QrCameraScanner';
import { 
  getPairedTeenInfo, 
  unpairTeen, 
  parseAndVerifyPairingPayload, 
  confirmPairingHandshake 
} from '../../utils/pairingProtocol';
import { somaticAudio } from '../../utils/audioSynthesis';

interface ParentDashboardProps {
  onExit?: () => void;
}

export const ParentDashboard: React.FC<ParentDashboardProps> = ({ onExit }) => {
  const storeUser = useAppStore(state => state.user);
  const storeProfile = useAppStore(state => state.profile);

  const [profile, setProfile] = useState<ParentSafeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'conversations' | 'settings'>('overview');
  
  // Modals
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);
  const [showAtmaModal, setShowAtmaModal] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [pairedRecord, setPairedRecord] = useState(() => getPairedTeenInfo());

  const sixteenType = React.useMemo(() => {
    if (storeProfile?.sixteenType) return storeProfile.sixteenType;
    if (storeProfile?.personality?.bigFive) {
      try {
        return deriveSixteenType(storeProfile.personality.bigFive);
      } catch {
        return null;
      }
    }
    return null;
  }, [storeProfile]);

  useEffect(() => {
    loadParentView();
  }, [storeProfile, storeUser]);

  const loadParentView = async () => {
    try {
      const response: any = await invoke('get_parent_view');

      if (response?.has_access && response?.profile) {
        const safeProfile: ParentSafeProfile = {
          lastUpdated: response.profile.last_active,
          teenName: storeUser?.name ? storeUser.name.split(' ')[0] : 'Your Teen',
          wellbeing: {
            score: response.profile.wellbeing_score || (storeProfile?.wellbeingScore || 78),
            trend: 'stable',
            interpretation: (response.profile.wellbeing_score || 78) > 60 ? 'Doing well' : 'Needs support'
          },
          careerInterests: response.profile.career_interests?.map((c: string) => ({
            field: c,
            role: 'Explorer',
            why: 'Aligned with strengths'
          })) || [
            { field: 'Technology', role: 'Developer', why: 'Loves problem solving' },
            { field: 'Design', role: 'UX Designer', why: 'Creative and empathetic' }
          ],
          strengths: response.profile.strengths || storeProfile?.strengths || ['Resilience', 'Curiosity', 'Empathy'],
          lastActive: response.profile.last_active || new Date().toISOString(),
          checkInStreak: 5,
          bigFive: {
            Openness: storeProfile?.personality?.bigFive?.openness || 85,
            Conscientiousness: storeProfile?.personality?.bigFive?.conscientiousness || 70,
            Extraversion: storeProfile?.personality?.bigFive?.extraversion || 60,
            Agreeableness: storeProfile?.personality?.bigFive?.agreeableness || 80,
            Neuroticism: storeProfile?.personality?.bigFive?.neuroticism || 40
          },
          riasec: {
            Investigative: storeProfile?.personality?.riasec?.investigative || 90,
            Artistic: storeProfile?.personality?.riasec?.artistic || 85,
            Social: storeProfile?.personality?.riasec?.social || 70,
            Realistic: storeProfile?.personality?.riasec?.realistic || 60,
            Enterprising: storeProfile?.personality?.riasec?.enterprising || 50,
            Conventional: storeProfile?.personality?.riasec?.conventional || 40
          },
          conversationStarters: [
            'I noticed your curiosity in new projects recently. Tell me more about what excites you?',
            'I appreciate the creative problem-solving you brought to our conversation earlier.',
            'What is one way I can support your goals this week without hovering?'
          ]
        };
        setProfile(safeProfile);
      } else {
        // Fallback hydrating with real or mock teen profile
        const teenFirstName = storeUser?.name ? storeUser.name.split(' ')[0] : 'Your Teen';
        const fallbackProfile: ParentSafeProfile = {
          lastUpdated: new Date().toISOString(),
          teenName: teenFirstName,
          wellbeing: {
            score: storeProfile?.wellbeingScore || 82,
            trend: 'improving',
            interpretation: 'Doing well'
          },
          careerInterests: [
            { field: 'Technology', role: 'Software & AI Explorer', why: 'High investigative drive and logical curiosity' },
            { field: 'Design & Human Sciences', role: 'UX & Cognitive Specialist', why: 'High artistic expression paired with empathy' }
          ],
          strengths: storeProfile?.strengths || ['Creative Problem-Solving', 'Empathetic Perspective Taking', 'Curiosity'],
          lastActive: new Date().toISOString(),
          checkInStreak: 5,
          bigFive: {
            Openness: storeProfile?.personality?.bigFive?.openness || 82,
            Conscientiousness: storeProfile?.personality?.bigFive?.conscientiousness || 68,
            Extraversion: storeProfile?.personality?.bigFive?.extraversion || 64,
            Agreeableness: storeProfile?.personality?.bigFive?.agreeableness || 76,
            Neuroticism: storeProfile?.personality?.bigFive?.neuroticism || 38
          },
          riasec: {
            Investigative: 88,
            Artistic: 82,
            Social: 74,
            Realistic: 55,
            Enterprising: 58,
            Conventional: 48
          },
          conversationStarters: [
            `I've noticed your focus on your creative interests lately. What's something interesting you explored this week?`,
            `You have a unique way of looking at complex problems. What's one project you're enjoying?`,
            `How can we create a calm, distraction-free environment for you this weekend?`
          ]
        };
        setProfile(fallbackProfile);
      }
    } catch (e) {
      console.error("Failed to load parent view from backend:", e);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-slate-500 font-bold text-sm">Loading Parent Sanctuary...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white border border-slate-200/90 rounded-3xl shadow-sm text-center">
        <Shield size={48} className="text-emerald-500 mx-auto mb-4 opacity-80" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">No Data Shared Yet</h2>
        <p className="text-slate-500 text-sm mb-6 leading-relaxed">
          Your teen hasn't configured their DPDP Section 9 sharing preferences yet. Once they complete an activity and choose to share insights, they will appear here.
        </p>
        {onExit && (
          <button 
            onClick={onExit} 
            className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-sm transition-colors shadow-sm cursor-pointer"
          >
            Switch Persona
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6 md:space-y-8 animate-fade-in-up">
      {/* ========================================================
          HERO BANNER: Parent Sanctuary & Family Wisdom
         ======================================================== */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950 via-slate-900 to-indigo-950 text-white p-6 md:p-8 border border-emerald-700/30 shadow-md">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-black uppercase tracking-wider border border-emerald-400/25">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>DPDP Act 2023 §9 Compliant • Zero-Divergence Sanctuary</span>
            </div>
            
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-white flex items-center gap-2">
              Parent Sanctuary for {profile.teenName}
            </h1>
            
            <p className="text-slate-300 text-xs md:text-sm max-w-2xl leading-relaxed">
              Understand your adolescent's cognitive rhythms, emotional baseline, and emerging strengths without invasive surveillance or breach of trust.
            </p>

            {/* Sacred Family Wisdom (Sant Kabir Das) */}
            <div className="mt-4 p-3.5 rounded-2xl bg-amber-500/10 border border-amber-400/25 backdrop-blur-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <span className="text-xl flex-shrink-0 mt-0.5">🪷</span>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                      Family Creed • संत कबीर दास
                    </span>
                    <span className="text-[10px] text-slate-400">• Nurturing the Inner Light</span>
                  </div>
                  <p className="text-white font-serif text-xs md:text-sm italic mt-0.5">
                    "जैसे मृगा नाभि कस्तूरी, वन-वन फिरत उदासी... सोई हंस तेरे घट माहि, अलख पुरुष अविनाशी!"
                  </p>
                  <p className="text-amber-200/90 text-[11px] font-semibold mt-0.5">
                    Parenting Insight: <em>Every child carries their own sacred compass. Our role is to create the safe space where their authentic potential unfolds.</em>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-end sm:self-center flex-shrink-0">
                <button
                  onClick={() => setShowAtmaModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 text-xs font-bold transition-all border border-amber-400/30 flex items-center gap-1 cursor-pointer"
                  title="Read Origin & Creed"
                >
                  <span>Creed</span>
                  <ChevronRight size={13} className="text-amber-300" />
                </button>
                <button
                  onClick={() => setShowDevModal(true)}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-slate-200 text-xs font-bold transition-all border border-white/20 flex items-center gap-1 cursor-pointer"
                  title="About Architect Harsh Kumar Gupta"
                >
                  <span>👨‍💻 Dev</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Grounding Action Buttons for Parents */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-2.5 self-start lg:self-center flex-shrink-0">
            <button
              onClick={() => setShowBreathingModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-400/30 text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
              title="Practice 432 Hz Somatic Reset before conversations"
            >
              <Wind size={15} className="text-emerald-300" />
              <span>432 Hz Parent Reset</span>
            </button>

            <button
              onClick={() => setShowBlueprintModal(true)}
              className="px-4 py-2.5 rounded-2xl bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-xs font-bold transition-all flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
              title="View Teen's Life Blueprint PDF portfolio"
            >
              <Printer size={15} className="text-indigo-300" />
              <span>Life Blueprint Portfolio</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          NAVIGATION TABS
         ======================================================== */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto hide-scrollbar">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Heart size={16} />
          <span>Parenting Intelligence</span>
        </button>

        <button
          onClick={() => setActiveTab('conversations')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'conversations'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <MessageCircle size={16} />
          <span>Socratic Starters</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-xs md:text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'settings'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Shield size={16} />
          <span>Privacy & Parity (DPDP §9)</span>
        </button>
      </div>

      {/* ========================================================
          TAB 1: PARENTING INTELLIGENCE & GUIDANCE
         ======================================================== */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm">
            <div className="flex items-center justify-between pb-6 border-b border-slate-100 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shadow-inner">
                  <Sparkles size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 tracking-tight">Parenting Intelligence Guide</h2>
                  <p className="text-slate-500 text-xs font-medium">Personalised recommendations based on {profile.teenName}'s cognitive rhythm</p>
                </div>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live State</span>
              </div>
            </div>

            {/* Core Parenting Guide View with Big Five and Connection Activities */}
            <ParentingGuide
              childName={profile.teenName}
              archetype={profile.bigFive ? {
                name: storeProfile?.archetype?.name || 'The Explorer',
                emoji: '🧭',
                description: storeProfile?.archetype?.description || 'Curious and agile mindset.',
                coreStrengths: profile.strengths ?? [],
              } : undefined}
              bigFive={profile.bigFive as any}
              wellbeingScore={profile.wellbeing?.score || 80}
              wellbeingTrend={profile.wellbeing?.trend === 'improving' ? 'rising' : profile.wellbeing?.trend === 'declining' ? 'falling' : 'stable'}
              lastActive={profile.lastActive ? new Date(profile.lastActive).toLocaleString() : undefined}
              activityStatus={(profile.checkInStreak ?? 0) > 0 ? `Active — ${profile.checkInStreak} day reflection streak` : 'Active on device'}
              checkInStreak={profile.checkInStreak || 5}
              strengths={profile.strengths || []}
            />

            {/* Privacy-Filtered Fact-Checked AI Narrative */}
            <div className="mt-8 pt-8 border-t border-slate-100">
              <DisclosureGate activityType="parent_guide" onDecline={() => {}}>
                <ParentGuideView safeProfile={profile} />
              </DisclosureGate>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: CONVERSATION STARTERS & GUIDES
         ======================================================== */}
      {activeTab === 'conversations' && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div className="bg-indigo-50/70 border border-indigo-100 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-base">💬</span>
                <h3 className="font-black text-indigo-950 text-base">Curiosity Over Interrogation</h3>
              </div>
              <p className="text-indigo-900 text-xs md:text-sm font-medium leading-relaxed">
                Adolescents open up when they feel listened to rather than audited. Use these open-ended prompts during low-stakes shared moments (like cooking, walking, or riding in the car).
              </p>
            </div>

            <div className="space-y-3.5">
              {profile.conversationStarters.map((starter, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.08 }}
                  className="bg-slate-50 hover:bg-slate-100/80 rounded-2xl p-4 md:p-5 border border-slate-200/90 border-l-4 border-l-emerald-500 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                >
                  <p className="text-slate-800 font-medium text-sm leading-relaxed">{starter}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(starter);
                      alert('Copied starter to clipboard!');
                    }}
                    className="text-xs text-emerald-700 bg-white hover:bg-emerald-50 border border-emerald-200 font-bold px-3 py-1.5 rounded-xl transition-all shadow-2xs flex-shrink-0 cursor-pointer"
                  >
                    Copy Starter
                  </button>
                </motion.div>
              ))}
            </div>

            <ConversationGuides profile={profile} />
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 3: PRIVACY & PARITY (DPDP ACT §9)
         ======================================================== */}
      {activeTab === 'settings' && (
        <div className="space-y-6 max-w-4xl">
          <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6">
            <div>
              <h3 className="font-black text-slate-900 text-xl mb-1.5">Zero-Divergence Transparency</h3>
              <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
                Under PRERNA's DPDP Act Section 9 covenant, parents and teens see the same reality. There is no covert monitoring or back-channel surveillance.
              </p>
            </div>

            <div className="space-y-3 border-t border-slate-100 pt-4">
              {[
                { label: 'Wellbeing baseline & pulse', status: 'shared', icon: '✓', desc: 'Holistic emotional energy state' },
                { label: 'Career pathways & interests', status: 'shared', icon: '✓', desc: 'Identified professional & educational fields' },
                { label: 'Superpowers & strengths', status: 'shared', icon: '✓', desc: 'Top cognitive and character traits' },
                { label: 'Check-in reflection streak', status: 'shared', icon: '✓', desc: 'Habit consistency without message inspection' },
                { label: 'Private journal & reflections', status: 'restricted', icon: '🔒', desc: 'Kept private on teen device to preserve dignity' },
                { label: 'Socratic AI mentor dialogues', status: 'restricted', icon: '🔒', desc: 'Confidential space for question exploration' },
              ].map((item) => (
                <div key={item.label} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 rounded-2xl border border-slate-200/70 gap-2">
                  <div>
                    <span className="text-slate-800 font-bold text-sm block">{item.label}</span>
                    <span className="text-slate-400 text-xs">{item.desc}</span>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-xl flex items-center gap-1.5 self-start sm:self-center flex-shrink-0 ${
                    item.status === 'shared' 
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                      : 'bg-slate-200 text-slate-600 border border-slate-300'
                  }`}>
                    {item.icon} {item.status === 'shared' ? 'Shared with Parent' : 'Teen Protected Space'}
                  </span>
                </div>
              ))}
            </div>

            {/* Emergency Helplines for Parents */}
            <div className="bg-rose-50/70 border border-rose-200/90 rounded-2xl p-5 md:p-6 space-y-3">
              <div className="flex items-center gap-2 text-rose-900 font-black text-base">
                <PhoneCall size={18} className="text-rose-600" />
                <h4>Emergency Adolescent Family Resources</h4>
              </div>
              <p className="text-rose-800 text-xs leading-relaxed">
                If you observe signs of severe distress or acute risk, connect with verified national mental health services:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold pt-1">
                <div className="bg-white p-3 rounded-xl border border-rose-200 text-rose-900">
                  <span className="block text-[10px] text-slate-400 uppercase">National 24/7 Helpline</span>
                  Tele-MANAS: 14416
                </div>
                <div className="bg-white p-3 rounded-xl border border-rose-200 text-rose-900">
                  <span className="block text-[10px] text-slate-400 uppercase">Childline India</span>
                  Childline: 1098
                </div>
                <div className="bg-white p-3 rounded-xl border border-rose-200 text-rose-900">
                  <span className="block text-[10px] text-slate-400 uppercase">TISS Psychosocial</span>
                  iCall: 9152987821
                </div>
              </div>
            </div>

            {/* Cryptographic Device Pairing Hub */}
            <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-2xl p-5 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5 text-indigo-950 font-black text-base">
                  <QrCode size={20} className="text-indigo-600" />
                  <h4>Cryptographic Device Pairing</h4>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1">
                  <CheckCircle2 size={10} />
                  <span>{pairedRecord ? 'Paired Active' : 'Linked'}</span>
                </span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Linked Teen Account</span>
                  <span className="text-slate-900 font-black text-sm">
                    {pairedRecord?.teenName || profile?.teenName || 'Your Teen'}
                  </span>
                  {pairedRecord?.pairedAt && (
                    <span className="text-slate-400 text-[10px] block mt-0.5 font-mono">
                      Handshake: {new Date(pairedRecord.pairedAt).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowScannerModal(true)}
                    className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                  >
                    <Camera size={14} />
                    <span>Scan New QR</span>
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to unpair this teen device?')) {
                        unpairTeen();
                        setPairedRecord(null);
                        somaticAudio.playSoftChime();
                        if (onExit) onExit();
                      }
                    }}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-500 hover:text-rose-600 border border-slate-200 transition-colors cursor-pointer"
                    title="Unpair Device"
                  >
                    <Unlink size={14} />
                  </button>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-snug">
                Pairing keys are stored 100% on-device. Scanning a new QR replaces the previous cryptographic session token.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Somatic Breathing Modal */}
      {showBreathingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <SomaticBreathingCompanion
            isModal={true}
            onClose={() => setShowBreathingModal(false)}
          />
        </div>
      )}

      {/* Life Blueprint Export Modal */}
      <LifeBlueprintExport
        isOpen={showBlueprintModal}
        onClose={() => setShowBlueprintModal(false)}
        user={storeUser}
        profile={storeProfile}
        sixteenType={sixteenType}
      />

      {/* Atma-Jnana Origin & Philosophy Modal */}
      <AtmaJnanaOriginModal
        isOpen={showAtmaModal}
        onClose={() => setShowAtmaModal(false)}
      />

      {/* Meet the Developer Modal */}
      <AboutDeveloperModal
        isOpen={showDevModal}
        onClose={() => setShowDevModal(false)}
      />

      {/* QR Camera Scanner Modal for Re-pairing */}
      {showScannerModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in">
          <div className="w-full max-w-md">
            <QrCameraScanner
              onScan={(scannedText) => {
                const res = parseAndVerifyPairingPayload(scannedText);
                if (res.isValid && res.payload) {
                  confirmPairingHandshake(res.payload);
                  setPairedRecord(getPairedTeenInfo());
                  setShowScannerModal(false);
                  somaticAudio.playStarBeaconChime();
                  loadParentView();
                } else {
                  alert(res.error || 'Invalid pairing code scanned.');
                  setShowScannerModal(false);
                }
              }}
              onClose={() => setShowScannerModal(false)}
              title="Scan Teen's QR Code"
              subtitle="Align your camera with the QR code on the teen's screen"
            />
          </div>
        </div>
      )}
    </div>
  );
};
