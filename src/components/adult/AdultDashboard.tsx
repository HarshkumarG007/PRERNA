import React, { useState, Suspense, lazy } from 'react';
import { 
  Heart, 
  Activity, 
  Lock, 
  Wind, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Sun,
  Award,
  Compass,
  BookOpen,
  Printer,
  Sparkles
} from 'lucide-react';
import { useUser, useAppStore } from '../../store';
import { usePartnerStore } from '../../store/partnerStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { somaticAudio } from '../../utils/audioSynthesis';
import { resolveSixteenType } from '../../engine/assessment/sixteenPersonalities';
import { PartnersGateModal } from '../partners/auth/PartnersGateModal';
import { SomaticBreathingCompanion } from '../growth/SomaticBreathingCompanion';
import { LifeBlueprintExport } from '../growth/LifeBlueprintExport';
import { MaslowNeedsCompass } from '../growth/MaslowNeedsCompass';

const KayaKalpaSanctuary = lazy(() =>
  import('../vitality/KayaKalpaSanctuary').then((m) => ({ default: m.KayaKalpaSanctuary }))
);
const SelfEvolutionSanctuary = lazy(() =>
  import('../growth/SelfEvolutionSanctuary').then((m) => ({ default: m.SelfEvolutionSanctuary }))
);

interface AdultDashboardProps {
  onEnterPartners: () => void;
  onSwitchPersona: () => void;
}

type AdultTab = 'overview' | 'maslow' | 'vitality' | 'evolution';

export const AdultDashboard: React.FC<AdultDashboardProps> = ({
  onEnterPartners,
  onSwitchPersona,
}) => {
  const user = useUser();
  const profile = useAppStore((state) => state.profile);
  const { connection } = usePartnerStore();
  const { partnerPlan, partnerTrialDaysRemaining } = useSubscriptionStore();

  const [activeTab, setActiveTab] = useState<AdultTab>('overview');
  const [showGateModal, setShowGateModal] = useState(false);
  const [showBreathingModal, setShowBreathingModal] = useState(false);
  const [showBlueprintModal, setShowBlueprintModal] = useState(false);

  const sixteenType = React.useMemo(() => resolveSixteenType(profile), [profile]);
  const isPartnerActivated = connection.isActivated;

  const handleOpenGate = () => {
    somaticAudio.playSoftChime();
    setShowGateModal(true);
  };

  const handleGateUnlocked = () => {
    setShowGateModal(false);
    onEnterPartners();
  };

  const handleSwitchTab = (tab: AdultTab) => {
    somaticAudio.playSoftChime();
    setActiveTab(tab);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 py-8 sm:px-6 font-sans text-left">
      
      {/* Top Adult Sanctuary Banner */}
      <div className="p-6 md:p-10 rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="space-y-3 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-400/30">
                Adult Sanctuary • आत्म-साक्षात्कार
              </span>
              <span className="text-xs text-slate-400">• Age 18+ Verified</span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight">
              Welcome, {user?.name || 'Fellow Traveler'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Sant Kabir Das reminds us: <em>"सोई हंस तेरे घट माहि, अलख पुरुष अविनाशी!"</em> Here you cultivate your personal Swadharma, emotional transcendence, and holistic life balance in complete cryptographic privacy.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <button
              onClick={() => {
                somaticAudio.playSoftChime();
                setShowBreathingModal(true);
              }}
              className="px-4 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
            >
              <Wind size={16} className="text-emerald-400" />
              <span>432 Hz Breathe</span>
            </button>
            <button
              onClick={() => {
                somaticAudio.playStarBeaconChime();
                setShowBlueprintModal(true);
              }}
              className="px-4 py-3 rounded-2xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-amber-400/30"
            >
              <Printer size={16} className="text-amber-300" />
              <span>Life Blueprint PDF</span>
            </button>
            <button
              onClick={onSwitchPersona}
              className="px-5 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
            >
              <User size={16} />
              <span>Switch Persona</span>
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto hide-scrollbar">
        {[
          { id: 'overview', label: 'Sanctuary & Partners Gateway', icon: <Sparkles size={15} /> },
          { id: 'maslow', label: "Maslow's Needs Compass", icon: <Compass size={15} /> },
          { id: 'vitality', label: 'Kaya Kalpa Vitality Lab', icon: <Activity size={15} /> },
          { id: 'evolution', label: 'Swadharma & Journal', icon: <BookOpen size={15} /> },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleSwitchTab(tab.id as AdultTab)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* PRIVATE PARTNERS SANCTUARY GATEWAY CARD (The Secret Entryway) */}
          <div className="p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-r from-rose-500/15 via-pink-500/10 to-amber-500/15 border-2 border-rose-300/60 shadow-lg relative overflow-hidden group">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4 text-center md:text-left">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/25 flex-shrink-0 group-hover:scale-105 transition-transform">
                  <Heart size={32} className="fill-white" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center justify-center md:justify-start gap-2">
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                      Secret Gateway • दो दिल एक जान
                    </span>
                    <span className="text-xs text-slate-400 font-semibold hidden sm:inline">• Lovers & Besties</span>
                  </div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                    PRERNA for Partners ❤️
                  </h3>
                  <p className="text-xs text-slate-600 max-w-xl leading-relaxed">
                    A dedicated, private space for two souls to cultivate deeper understanding, mindful communication, and shared lifetime dreams. Completely isolated from Teen, Parent, and School accounts.
                  </p>
                </div>
              </div>

              <button
                onClick={handleOpenGate}
                className="px-6 py-4 bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white rounded-2xl font-black text-xs sm:text-sm flex items-center gap-2 transition-all shadow-lg shadow-rose-500/25 hover:shadow-rose-500/40 hover:scale-102 cursor-pointer flex-shrink-0"
              >
                <Lock size={16} />
                <span>{isPartnerActivated ? 'Enter Partners Vault' : 'Activate Partners ❤️'}</span>
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="mt-4 pt-4 border-t border-rose-200/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span>DPDP Act 2023 §9 Zero-Cloud Privacy Guarantee</span>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  {partnerPlan === 'partner_lifetime'
                    ? '👑 Lifetime Pass'
                    : partnerPlan === 'partner_pro_annual' || partnerPlan === 'partner_pro_monthly'
                    ? '✨ Partner Pro Active'
                    : partnerPlan === 'trial'
                    ? `⏳ Sacred Trial (${partnerTrialDaysRemaining}d)`
                    : 'Free Sanctuary'}
                </span>
                <span className="font-mono text-[10px] text-rose-700 font-bold hidden sm:inline">
                  {isPartnerActivated ? 'Vault Active & Protected' : 'Adult Opt-in Required'}
                </span>
              </div>
            </div>
          </div>

          {/* Adult Interactive Pillars Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Pillar 1: Swadharma & Values */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
                  <Sun size={20} />
                </div>
                <h4 className="text-base font-black text-slate-900">Swadharma & Inner Calling</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Align your daily vocation with authentic inner nature. Exploring Holland RIASEC themes, personal journal, and archetypal strengths.
                </p>
                <div className="pt-1">
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 inline-block">
                    Archetype: {profile?.archetype?.name || 'The Navigator'}
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center gap-2">
                <button
                  onClick={() => handleSwitchTab('evolution')}
                  className="flex-1 px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Open Journal</span>
                  <ArrowRight size={13} />
                </button>
                <button
                  onClick={() => {
                    somaticAudio.playStarBeaconChime();
                    setShowBlueprintModal(true);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
                  title="Print or export Life Blueprint"
                >
                  Blueprint
                </button>
              </div>
            </div>

            {/* Pillar 2: Maslow Transcendence */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                  <Award size={20} />
                </div>
                <h4 className="text-base font-black text-slate-900">Maslow's Compass</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Discern genuine psychological needs from transient impulses across safety, belonging, esteem, and self-actualization.
                </p>
                <div className="pt-1">
                  <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200 inline-block">
                    Wellbeing Index: {profile?.wellbeingScore || 82}%
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleSwitchTab('maslow')}
                  className="w-full px-3 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Launch Maslow Compass</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>

            {/* Pillar 3: Physical Vitality */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                  <Activity size={20} />
                </div>
                <h4 className="text-base font-black text-slate-900">Kaya Kalpa Vitality</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Circadian sleep alignment, 90-minute ultradian cycles, hydration pacing, and somatic vagal regulation.
                </p>
                <div className="pt-1">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200 inline-block">
                    432 Hz Pythagorean Audio Active
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100">
                <button
                  onClick={() => handleSwitchTab('vitality')}
                  className="w-full px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <span>Open Kaya Kalpa Lab</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Maslow's Needs Compass Tab */}
      {activeTab === 'maslow' && <MaslowNeedsCompass />}

      {/* Interactive Kaya Kalpa Vitality Lab Tab */}
      {activeTab === 'vitality' && (
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Kaya Kalpa Vitality Lab...</div>}>
          <KayaKalpaSanctuary />
        </Suspense>
      )}

      {/* Interactive Swadharma & Self-Evolution Journal Tab */}
      {activeTab === 'evolution' && (
        <Suspense fallback={<div className="p-8 text-center text-xs text-slate-500">Loading Swadharma & Evolution Journal...</div>}>
          <SelfEvolutionSanctuary initialTab="journal" />
        </Suspense>
      )}

      {/* Secret Partners Gate Modal */}
      <PartnersGateModal
        isOpen={showGateModal}
        onClose={() => setShowGateModal(false)}
        onUnlocked={handleGateUnlocked}
      />

      {/* Somatic Breathing Modal */}
      {showBreathingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <SomaticBreathingCompanion
            isModal={true}
            onClose={() => setShowBreathingModal(false)}
          />
        </div>
      )}

      {/* Life Blueprint PDF Portfolio Modal */}
      <LifeBlueprintExport
        isOpen={showBlueprintModal}
        onClose={() => setShowBlueprintModal(false)}
        user={user}
        profile={profile}
        sixteenType={sixteenType}
      />

    </div>
  );
};
