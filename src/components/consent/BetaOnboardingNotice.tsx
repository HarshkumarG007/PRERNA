import React, { useState } from 'react';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { useI18n } from '../../engine/localization/i18n';

interface BetaOnboardingNoticeProps {
  onAccept: () => void;
}

export const BetaOnboardingNotice: React.FC<BetaOnboardingNoticeProps> = ({ onAccept }) => {
  const [accepted, setAccepted] = useState(false);
  const { language } = useI18n();
  const disclosure = CURRENT_DISCLOSURES.beta_cohort;

  const handleContinue = () => {
    if (accepted) {
      onAccept();
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-8 bg-amber-50 rounded-xl shadow-lg border-2 border-amber-300 relative overflow-hidden">
      <div className="absolute top-0 right-0 bg-amber-400 text-amber-900 font-bold text-xs px-3 py-1 rounded-bl-lg uppercase tracking-widest">
        Beta Build
      </div>
      
      <h2 className="text-2xl font-bold text-amber-900 mb-2">Welcome to the PRERNA Beta!</h2>
      <p className="text-amber-800 mb-6 font-medium">Thank you for being part of our early testing cohort.</p>
      
      <div className="bg-white p-5 rounded-lg border border-amber-200 mb-6 shadow-sm">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">Important Notice</h3>
        <p className="text-gray-700 font-medium mb-3">
          {disclosure.text[language]}
        </p>
        <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm space-y-2">
          <p>
            <strong>Crisis Response:</strong> Human-review escalations are handled by the safety team. As a prototype system, responses are not guaranteed and should not be relied upon in an active emergency.
          </p>
          <p>
            <strong>Direct Contact:</strong> If you experience technical issues or have concerns about data processing, contact the beta engineering team directly at <a href="mailto:beta-support@prerna.project" className="text-amber-600 underline">beta-support@prerna.project</a>.
          </p>
        </div>
      </div>

      <div className="flex items-start mb-6">
        <div className="flex items-center h-5">
          <input
            id="beta-accept"
            type="checkbox"
            checked={accepted}
            onChange={(e) => setAccepted(e.target.checked)}
            className="w-5 h-5 text-amber-600 bg-white border-gray-300 rounded focus:ring-amber-500"
          />
        </div>
        <div className="ml-3 text-sm">
          <label htmlFor="beta-accept" className="font-medium text-gray-800 cursor-pointer">
            I understand the limitations of the Beta program, especially regarding the limited availability of human clinical review.
          </label>
        </div>
      </div>

      <button
        onClick={handleContinue}
        disabled={!accepted}
        className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 disabled:cursor-not-allowed transition-colors"
      >
        Enter PRERNA Beta
      </button>
    </div>
  );
};
