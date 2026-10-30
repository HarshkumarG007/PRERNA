import React, { useState } from 'react';
import { 
  Heart, 
  Activity, 
  Lock, 
  Wind, 
  ArrowRight, 
  ShieldCheck, 
  User, 
  Sun,
  Award
} from 'lucide-react';
import { useUser, useAppStore } from '../../store';
import { usePartnerStore } from '../../store/partnerStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { somaticAudio } from '../../utils/audioSynthesis';
import { PartnersGateModal } from '../partners/auth/PartnersGateModal';
import { SomaticBreathingCompanion } from '../growth/SomaticBreathingCompanion';

interface AdultDashboardProps {
  onEnterPartners: () => void;
  onSwitchPersona: () => void;
}

export const AdultDashboard: React.FC<AdultDashboardProps> = ({
  onEnterPartners,
  onSwitchPersona,
}) => {
  const user = useUser();
  const profile = useAppStore((state) => state.profile);
  const { connection } = usePartnerStore();
  const { partnerPlan, partnerTrialDaysRemaining } = useSubscriptionStore();

  const [showGateModal, setShowGateModal] = useState(false);
  const [showBreathingModal, setShowBreathingModal] = useState(false);

  const isPartnerActivated = connection.isActivated;

  const handleOpenGate = () => {
    somaticAudio.playSoftChime();
    setShowGateModal(true);
  };

  const handleGateUnlocked = () => {
    setShowGateModal(false);
    onEnterPartners();
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

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => setShowBreathingModal(true)}
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10"
            >
              <Wind size={16} className="text-emerald-400" />
              <span>432 Hz Breathe</span>
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

      {/* Adult Pillars Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Pillar 1: Swadharma & Values */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
            <Sun size={20} />
          </div>
          <h4 className="text-base font-black text-slate-900">Swadharma & Inner Calling</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Align your daily vocation with authentic inner nature. Exploring Holland RIASEC themes & archetypal strengths.
          </p>
          <div className="pt-2">
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
              Archetype: {profile?.archetype?.name || 'The Navigator'}
            </span>
          </div>
        </div>

        {/* Pillar 2: Maslow Transcendence */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Award size={20} />
          </div>
          <h4 className="text-base font-black text-slate-900">Maslow's Compass</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            From physiological safety to self-actualization and cosmic transcendence. Balanced life fulfillment.
          </p>
          <div className="pt-2">
            <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-3 py-1 rounded-xl border border-indigo-200">
              Wellbeing Index: {profile?.wellbeingScore || 82}%
            </span>
          </div>
        </div>

        {/* Pillar 3: Physical Vitality */}
        <div className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Activity size={20} />
          </div>
          <h4 className="text-base font-black text-slate-900">Kaya Kalpa Vitality</h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            Circadian sleep alignment, 90-minute ultradian cycles, hydration pacing, and somatic vagal regulation.
          </p>
          <div className="pt-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
              432 Hz Pythagorean Audio Active
            </span>
          </div>
        </div>
      </div>

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

    </div>
  );
};
