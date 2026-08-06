import React, { useState } from 'react';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { validateSessionCreation } from '../../engine/consent/sessionGate';
import { checkForCrisisIndicators } from '../../engine/crisis/escalationRouter';
import { ResourceSurface } from '../crisis/ResourceSurface';
import { TrustedAdultConnector } from '../crisis/TrustedAdultConnector';
import { useI18n } from '../../engine/localization/i18n';

interface MoodMirrorProps {
  userId?: string;
}

export const MoodMirror: React.FC<MoodMirrorProps> = ({ userId }) => {
  const { language } = useI18n();
  const [disclosureAccepted, setDisclosureAccepted] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [logged, setLogged] = useState(false);

  const disclosure = CURRENT_DISCLOSURES.mood_mirror;

  const handleStartSession = () => {
    try {
      validateSessionCreation({ userId: userId || 'guest', sessionType: 'mood_mirror', disclosureShownId: disclosure.id });
      setIsSessionActive(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleLogMood = async (sentiment: 'positive' | 'neutral' | 'severe_distress') => {
    setLogged(true);
    // 1. Simulate saving to DB
    // 2. Feed to crisis detection engine
    await checkForCrisisIndicators({
      userId: userId || 'guest',
      content: `Logged sentiment: ${sentiment}`,
      sentiment
    });
  };

  if (logged) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md border-t-4 border-indigo-500 text-center">
        <h2 className="text-xl font-bold text-gray-900">Mood Logged</h2>
        <p className="text-gray-600 mt-2">Thanks for checking in today.</p>
        <ResourceSurface />
        <TrustedAdultConnector />
      </div>
    );
  }

  if (!disclosureAccepted) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl shadow-md border border-indigo-100">
        <h2 className="text-2xl font-bold text-indigo-900">Mood Mirror</h2>
        <div className="mt-4 bg-indigo-100 p-4 rounded-lg">
          <p className="text-sm font-medium text-indigo-800">Before we start:</p>
          <p className="text-indigo-900 mt-2">{disclosure.text[language]}</p>
        </div>
        <button
          onClick={() => setDisclosureAccepted(true)}
          className="mt-6 w-full flex justify-center py-3 px-4 rounded-md shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700"
        >
          I Understand
        </button>
      </div>
    );
  }

  if (!isSessionActive) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-center">
        <button
          onClick={handleStartSession}
          className="py-3 px-6 rounded-full shadow-lg text-lg font-bold text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Check In Today
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100">
      <h2 className="text-2xl font-bold text-gray-900 text-center mb-6">How are you feeling right now?</h2>
      <div className="grid grid-cols-3 gap-4">
        <button onClick={() => handleLogMood('positive')} className="p-6 text-4xl bg-green-50 hover:bg-green-100 rounded-lg border border-green-200">
          😊
        </button>
        <button onClick={() => handleLogMood('neutral')} className="p-6 text-4xl bg-yellow-50 hover:bg-yellow-100 rounded-lg border border-yellow-200">
          😐
        </button>
        <button onClick={() => handleLogMood('severe_distress')} className="p-6 text-4xl bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300">
          🌪️
        </button>
      </div>
      <div className="mt-8">
        <ResourceSurface />
      </div>
    </div>
  );
};
