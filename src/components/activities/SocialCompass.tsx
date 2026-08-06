import React, { useState } from 'react';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { validateSessionCreation } from '../../engine/consent/sessionGate';
import { useI18n } from '../../engine/localization/i18n';

export interface SocialCompassProps {
  userId?: string;
}

export const SocialCompass: React.FC<SocialCompassProps> = ({ userId }) => {
  const { language } = useI18n();
  const [accepted, setAccepted] = useState(false);
  const [active, setActive] = useState(false);

  const disclosure = CURRENT_DISCLOSURES.social_compass;

  if (!accepted) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-orange-50 rounded-xl shadow-md border border-orange-100">
        <h2 className="text-2xl font-bold text-orange-900">Social Compass</h2>
        <div className="mt-4 bg-orange-100 p-4 rounded-lg">
          <p className="text-orange-900">{disclosure.text[language as keyof typeof disclosure.text]}</p>
        </div>
        <button onClick={() => setAccepted(true)} className="mt-6 w-full py-3 bg-orange-600 text-white rounded-md font-bold">I Understand</button>
      </div>
    );
  }

  if (!active) {
    return (
      <div className="text-center mt-10">
        <p className="mb-4">{CURRENT_DISCLOSURES.social_compass.text[language as keyof typeof CURRENT_DISCLOSURES.social_compass.text]}</p>
        <button 
          onClick={() => {
            validateSessionCreation({ userId: userId || 'guest', sessionType: 'social_compass', disclosureShownId: 'v1' });
            setActive(true);
          }} className="py-3 px-6 bg-orange-600 text-white rounded-full font-bold">Start Scenario</button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-xl font-bold mb-4">A friend cancels plans last minute. What do you do?</h2>
      <div className="space-y-3">
        <button onClick={() => alert('Saved')} className="w-full text-left p-4 rounded-lg border hover:bg-gray-50">Ask if they are okay</button>
        <button onClick={() => alert('Saved')} className="w-full text-left p-4 rounded-lg border hover:bg-gray-50">Feel annoyed but say nothing</button>
        <button onClick={() => alert('Saved')} className="w-full text-left p-4 rounded-lg border hover:bg-gray-50">Immediately make other plans</button>
      </div>
    </div>
  );
};
