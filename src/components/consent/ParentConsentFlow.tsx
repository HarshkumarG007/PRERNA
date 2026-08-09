import React, { useState } from 'react';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { useI18n } from '../../engine/localization/i18n';

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
  const { language } = useI18n();

  const handleSendOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (parentName && parentEmail) {
      // In a real app, this calls the backend to dispatch an email OTP
      setOtpSent(true);
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 6) {
      // In a real app, this verifies the OTP against the backend
      setIsVerified(true);
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
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md space-y-6 border-t-4 border-indigo-600">
        <div className="bg-indigo-50 border-l-4 border-indigo-500 text-indigo-700 p-4 mb-4 text-sm" role="alert">
          <p className="font-bold">DPDP Compliance Mode</p>
          <p>Since DigiLocker is pending approval, we are using the legally viable <strong>Email Verification (OTP)</strong> fallback to establish verifiable parental consent.</p>
        </div>
        <h2 className="text-xl font-bold text-gray-900">Parent / Guardian Verification</h2>
        
        {!otpSent ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Full Name</label>
              <input
                type="text"
                required
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent Email</label>
              <input
                type="email"
                required
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-2 border"
              />
            </div>
            <div className="flex space-x-3">
              <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                Send OTP
              </button>
              <button type="button" onClick={onCancel} className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div className="bg-green-50 text-green-700 p-3 rounded-md text-sm border border-green-200">
              OTP sent to <strong>{parentEmail}</strong>. Please enter the 6-digit code.
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Verification Code (OTP)</label>
              <input
                type="text"
                maxLength={6}
                required
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm p-3 border text-center tracking-widest text-xl font-mono"
              />
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
              Verify
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md space-y-6 border-t-4 border-green-600">
      <h2 className="text-xl font-bold text-gray-900">Provide Consent</h2>
      <p className="text-sm text-gray-700">
        As the verified parent/guardian of this user, please review the information we collect and why.
      </p>

      <div className="bg-gray-50 p-4 rounded-md space-y-4 border">
        {Object.values(CURRENT_DISCLOSURES).map((d) => (
          <div key={d.id} className="text-sm">
            <strong className="text-gray-900 capitalize">{d.type.replace('_', ' ')}:</strong>
            <p className="text-gray-600 mt-1">{d.text[language]}</p>
          </div>
        ))}
      </div>

      <div className="flex items-start">
        <div className="flex items-center h-5">
          <input
            id="consent"
            type="checkbox"
            checked={hasConsented}
            onChange={(e) => setHasConsented(e.target.checked)}
            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="consent" className="font-medium text-gray-700">
            I explicitly consent to PRERNA collecting this information for the transparent purposes stated above.
          </label>
        </div>
      </div>

      <button
        onClick={handleConsent}
        disabled={!hasConsented}
        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
      >
        Grant Consent & Unlock PRERNA
      </button>
    </div>
  );
};
