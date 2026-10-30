import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Heart, 
  Lock, 
  ShieldCheck, 
  X, 
  KeyRound, 
  ArrowRight, 
  Users2,
  AlertCircle
} from 'lucide-react';
import { usePartnerStore, RelationshipMode } from '../../../store/partnerStore';
import { somaticAudio } from '../../../utils/audioSynthesis';
import { useUser } from '../../../store';

interface PartnersGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUnlocked: () => void;
}

export const PartnersGateModal: React.FC<PartnersGateModalProps> = ({
  isOpen,
  onClose,
  onUnlocked,
}) => {
  const user = useUser();
  const { connection, activatePartners, unlockGate } = usePartnerStore();

  const isActivated = connection.isActivated;
  const [selectedMode, setSelectedMode] = useState<RelationshipMode>('lovers');
  const [passcode, setPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  // Adult eligibility check (Strict DPDP Section 9 & Age Gate rule)
  const isAdultEligible = user?.ageRange === '18+' || user?.role === 'adult';

  const handleActivate = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode.length < 4) {
      setError('Please choose a secret passcode with at least 4 digits/characters.');
      return;
    }
    if (passcode !== confirmPasscode) {
      setError('Passcodes do not match. Please verify and re-enter.');
      return;
    }

    somaticAudio.playStarBeaconChime();
    activatePartners(passcode, selectedMode);
    onUnlocked();
  };

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    const success = unlockGate(passcode);
    if (success) {
      somaticAudio.playStarBeaconChime();
      onUnlocked();
    } else {
      setError('Incorrect secret passcode. Please try again.');
    }
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-labelledby="partners-gate-title"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-md bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-rose-100/80 text-center overflow-hidden"
      >
        {/* Ambient Warm Rose Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-200/30 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-200/20 rounded-full blur-[90px] pointer-events-none" />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          title="Close"
        >
          <X size={18} />
        </button>

        {/* Adult Eligibility Gate Check */}
        {!isAdultEligible ? (
          <div className="py-6 space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto">
              <AlertCircle size={32} />
            </div>
            <h3 id="partners-gate-title" className="text-xl font-black text-slate-900">Adult Eligibility Required</h3>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xs mx-auto">
              PRERNA for Partners is an exclusive, sovereign relationship environment restricted strictly to verified adults (18+). It is not accessible on Teen, Parent, or School accounts.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all cursor-pointer shadow-sm"
            >
              Return to Sanctuary
            </button>
          </div>
        ) : !isActivated ? (
          /* First-time Activation Screen */
          <form onSubmit={handleActivate} className="relative z-10 space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-rose-500 to-amber-500 flex items-center justify-center text-white mx-auto shadow-xl shadow-rose-500/25">
              <Heart size={32} className="fill-white" />
            </div>

            <div>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  Private Sanctuary • दो दिल एक जान
                </span>
              </div>
              <h3 id="partners-gate-title" className="text-2xl font-black text-slate-900 tracking-tight">
                PRERNA for Partners
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1 max-w-xs mx-auto">
                A sacred, unjudged ecosystem to deepen love, communication, and emotional intimacy.
              </p>
            </div>

            {/* Mode Selector: Lovers vs Besties */}
            <div className="grid grid-cols-2 gap-2 text-left p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/60">
              <button
                type="button"
                onClick={() => setSelectedMode('lovers')}
                className={`p-3 rounded-xl transition-all cursor-pointer ${
                  selectedMode === 'lovers'
                    ? 'bg-white shadow-xs border border-rose-200 text-rose-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <Heart size={14} className={selectedMode === 'lovers' ? 'text-rose-500 fill-rose-500' : 'text-slate-400'} />
                  <span>Lovers & Couples</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Romance, deep intimacy & dreams</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode('besties')}
                className={`p-3 rounded-xl transition-all cursor-pointer ${
                  selectedMode === 'besties'
                    ? 'bg-white shadow-xs border border-amber-200 text-amber-900 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-black">
                  <Users2 size={14} className={selectedMode === 'besties' ? 'text-amber-500' : 'text-slate-400'} />
                  <span>Besties & Soul Friends</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-0.5 font-normal">Deep friendship & life quests</p>
              </button>
            </div>

            {/* Secret Passcode Setup */}
            <div className="space-y-3 text-left">
              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Create Secret Vault Passcode (4+ digits)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    maxLength={10}
                    value={passcode}
                    onChange={(e) => {
                      setPasscode(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter private passkey"
                    className="w-full text-center text-lg font-black tracking-widest p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                    required
                  />
                  <KeyRound size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-700 block mb-1">
                  Confirm Secret Passcode
                </label>
                <input
                  type="password"
                  maxLength={10}
                  value={confirmPasscode}
                  onChange={(e) => {
                    setConfirmPasscode(e.target.value);
                    setError(null);
                  }}
                  placeholder="Re-enter to confirm"
                  className="w-full text-center text-lg font-black tracking-widest p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {error}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-rose-500 via-rose-600 to-amber-600 hover:from-rose-600 hover:to-amber-700 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
            >
              <span>Activate Secret Sanctuary</span>
              <ArrowRight size={18} />
            </button>

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>100% On-Device Private Storage • Zero Institutional Visibility</span>
            </div>
          </form>
        ) : (
          /* Returning User Unlock Screen */
          <form onSubmit={handleUnlock} className="relative z-10 space-y-5">
            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-600 mx-auto shadow-sm">
              <Lock size={28} />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Unlock Partners Vault
              </h3>
              <p className="text-xs text-slate-500 font-medium mt-1">
                Enter your private passcode to access your shared sanctuary.
              </p>
            </div>

            <div className="relative max-w-xs mx-auto">
              <input
                type="password"
                maxLength={10}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setError(null);
                }}
                placeholder="••••"
                className="w-full text-center text-2xl font-black tracking-[0.4em] p-3.5 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/20 focus:border-rose-500 focus:outline-none text-slate-900"
                autoFocus
                required
              />
            </div>

            {error && (
              <p className="text-xs font-bold text-rose-600 bg-rose-50 p-2.5 rounded-xl border border-rose-200">
                {error}
              </p>
            )}

            <div className="space-y-2">
              <button
                type="submit"
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white font-bold rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 transition-all cursor-pointer text-sm"
              >
                <span>Unlock & Enter</span>
                <ArrowRight size={18} />
              </button>

              <button
                type="button"
                onClick={() => {
                  // Quick bypass for dev demo
                  unlockGate('DEMO99');
                  onUnlocked();
                }}
                className="w-full py-2 text-xs font-bold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
              >
                ⚡ Quick Demo Unlock
              </button>
            </div>

            <p className="text-[11px] text-slate-400">
              Completely hidden and separated from Teen, Parent, and School logins.
            </p>
          </form>
        )}
      </motion.div>
    </div>
  );
};
