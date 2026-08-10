import React, { useState } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { useI18n } from '../../engine/localization/i18n';
import { BetaOnboardingNotice } from './BetaOnboardingNotice';

interface ParentConsentFlowProps {
  onConsentGranted: (consentId: string, scope: string[]) => void;
  onCancel: () => void;
}

export const ParentConsentFlow: React.FC<ParentConsentFlowProps> = ({
  onConsentGranted,
  onCancel,
}) => {
  const [parentName, setParentName] = useState('');
  const [parentEmail, setParentEmail] = useState('');
  const [isVerified, setIsVerified] = useState(false);
  const [hasConsented, setHasConsented] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [betaAccepted, setBetaAccepted] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const { language } = useI18n();

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (parentName && parentEmail) {
      // In a real app, this calls the backend to dispatch an email OTP
      setOtpSent(true);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      setIsVerifying(true);
      setVerificationError(null);
      try {
        await invoke('submit_consent_token', {
          token: otp,
          // In a real flow, teen_user_id is passed down or inferred, for now we mock it as the current teen context
          teenUserId: 'current_teen_user'
        });
        setIsVerified(true);
      } catch (err: any) {
        setVerificationError(err.toString());
      } finally {
        setIsVerifying(false);
      }
    }
  };

  const handleConsent = () => {
    if (hasConsented) {
      const consentId = `consent_${Date.now()}`;
      const scope = ['life_quests', 'skill_arena', 'mood_mirror', 'social_compass', 'body_clock', 'ai_mentor'];
      onConsentGranted(consentId, scope);
    }
  };

  if (!isVerified) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-8 glass-panel border-t-4 border-t-indigo-500 space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-bl-full blur-2xl" />
        
        <div className="bg-orange-50/80 backdrop-blur-sm border-l-4 border-orange-500 text-orange-800 p-4 mb-4 text-sm rounded-r-lg" role="alert">
          <p className="font-bold flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" /> SIMULATED — NOT PRODUCTION READY</p>
          <p className="mt-1">This is a simulated verification flow for demonstration purposes only. A real verification mechanism (e.g., DigiLocker or verified OTP) is required before production deployment.</p>
        </div>
        <h2 className="text-2xl font-black text-slate-900">Parent / Guardian Verification</h2>
        
        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Parent Full Name</label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="block w-full bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm p-3 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Parent Email</label>
              <input
                type="email"
                required
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="block w-full bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm p-3 transition-colors"
              />
            </div>
            <div className="flex space-x-4 pt-2">
              <button type="submit" className="w-full premium-button py-2.5">
                Send OTP
              </button>
              <button type="button" onClick={onCancel} className="w-full flex justify-center py-2.5 px-4 border border-slate-200 rounded-xl shadow-sm text-sm font-semibold text-slate-700 bg-white/50 hover:bg-slate-50 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-5">
            <div className="bg-emerald-50/80 backdrop-blur-sm text-emerald-800 p-4 rounded-lg text-sm border border-emerald-200">
              OTP sent to <strong>{parentEmail}</strong>. Please enter the 6-digit code.
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Verification Code (OTP)</label>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="• • • • • •"
                disabled={isVerifying}
                className="block w-full bg-white/50 border border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 rounded-lg shadow-sm p-4 text-center tracking-[1em] text-2xl font-mono transition-colors"
              />
            </div>
            
            {verificationError && (
              <div className="bg-rose-50/80 backdrop-blur-sm text-rose-700 p-4 rounded-lg text-sm border border-rose-200">
                <strong>Verification Failed:</strong> {verificationError}
              </div>
            )}
            
            <button type="submit" disabled={isVerifying} className="w-full premium-button py-3 mt-2">
              {isVerifying ? 'Verifying...' : 'Verify Securely'}
            </button>
          </form>
        )}
      </div>
    );
  }

  if (!betaAccepted) {
    return <BetaOnboardingNotice onAccept={() => setBetaAccepted(true)} />;
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 glass-panel border-t-4 border-t-emerald-500 space-y-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-bl-full blur-2xl pointer-events-none" />
      
      <h2 className="text-2xl font-black text-slate-900 relative z-10">Provide Consent</h2>
      <p className="text-sm text-slate-600 relative z-10 font-medium">
        As the verified parent/guardian of this user, please review the information we collect and why.
      </p>

      <div className="bg-white/40 backdrop-blur-md p-5 rounded-xl space-y-5 border border-white/60 shadow-inner relative z-10">
        {Object.values(CURRENT_DISCLOSURES).map((d) => (
          <div key={d.id} className="text-sm">
            <strong className="text-slate-900 capitalize text-base">{d.type.replace('_', ' ')}:</strong>
            <p className="text-slate-600 mt-1.5 leading-relaxed">{d.text[language]}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start bg-slate-50/50 p-4 rounded-xl border border-slate-100 relative z-10">
        <div className="flex items-center h-5 mt-0.5">
          <input
            id="consent"
            type="checkbox"
            checked={hasConsented}
            onChange={(e) => setHasConsented(e.target.checked)}
            className="focus:ring-emerald-500 h-5 w-5 text-emerald-600 border-slate-300 rounded cursor-pointer"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="consent" className="font-semibold text-slate-800 cursor-pointer">
            I explicitly consent to PRERNA collecting this information for the transparent purposes stated above.
          </label>
        </div>
      </div>

      <button
        onClick={handleConsent}
        disabled={!hasConsented}
        className="w-full premium-button py-3 mt-4 relative z-10 from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 shadow-emerald-500/20"
      >
        Grant Consent & Unlock PRERNA
      </button>
    </div>
  );
};
