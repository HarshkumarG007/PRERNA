import React, { useState } from 'react';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { validateSessionCreation, SessionConfig } from '../../engine/consent/sessionGate';
import { calculateRiasec, ArenaAction, RiasecProfile } from '../../engine/assessment/riasec';
import { useI18n } from '../../engine/localization/i18n';

export interface SkillArenaProps {
  userId?: string;
}

export const SkillArena: React.FC<SkillArenaProps> = ({ userId }) => {
  const { language } = useI18n();
  const [disclosureAccepted, setDisclosureAccepted] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [actionsMade, setActionsMade] = useState<ArenaAction[]>([]);
  const [results, setResults] = useState<RiasecProfile | null>(null);

  const disclosure = CURRENT_DISCLOSURES.skill_arena;

  const handleStartSession = () => {
    try {
      const config: SessionConfig = {
        userId: userId || 'guest',
        sessionType: 'skill_arena',
        disclosureShownId: disclosure.id,
      };
      
      // Enforces Global Rule 0.1-2
      validateSessionCreation(config);
      
      setIsSessionActive(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleAction = (action: ArenaAction) => {
    const updatedActions = [...actionsMade, action];
    setActionsMade(updatedActions);
    
    // Simulate finishing mini-game after 2 actions
    if (updatedActions.length >= 2) {
      const profile = calculateRiasec(updatedActions);
      setResults(profile);
      setIsSessionActive(false);
      // In a real app: write to trait_snapshots table here
    }
  };

  if (results) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md space-y-6 border-t-4 border-green-500">
        <h2 className="text-xl font-bold text-gray-900">Arena Cleared!</h2>
        <p className="text-gray-700">Here's how your skills map out today:</p>
        <div className="bg-gray-50 p-4 rounded-md border">
          <pre className="text-sm text-gray-600">{JSON.stringify(results, null, 2)}</pre>
        </div>
        <button onClick={() => setResults(null)} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700">
          Re-enter Arena
        </button>
      </div>
    );
  }

  if (!disclosureAccepted) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl shadow-md border border-green-100">
        <h2 className="text-2xl font-bold text-green-900">Skill Arena</h2>
        <div className="mt-4 bg-green-100 p-4 rounded-lg">
          <p className="text-sm font-medium text-green-800">Before you play:</p>
          <p className="text-fuchsia-900 mt-2">{disclosure.text[language as keyof typeof disclosure.text]}</p>
        </div>
        <button
          onClick={() => setDisclosureAccepted(true)}
          className="mt-6 w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-md text-sm font-bold text-white bg-green-600 hover:bg-green-700 hover:-translate-y-0.5 transition-transform"
        >
          I Understand, Let's Play!
        </button>
      </div>
    );
  }

  if (!isSessionActive) {
    return (
      <div className="max-w-xl mx-auto mt-10 text-center">
        <button
          onClick={handleStartSession}
          className="py-3 px-6 rounded-full shadow-lg text-lg font-bold text-white bg-gradient-to-r from-emerald-500 to-green-600 hover:scale-105 transition-transform"
        >
          Enter the Arena
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg border border-gray-100 space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Puzzle Sequence Alpha</h2>
      <p className="text-gray-700 text-lg">A complex machine lies broken in front of you. How do you approach it?</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <button
          onClick={() => handleAction({ id: 'a1', traitImpacts: { investigative: 15, realistic: 5 } })}
          className="p-4 rounded-lg border-2 border-blue-100 hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
        >
          <strong className="block text-blue-900 text-lg">Analyze the manual</strong>
          <span className="text-sm text-gray-600">Figure out exactly how it works first.</span>
        </button>
        <button
          onClick={() => handleAction({ id: 'a2', traitImpacts: { artistic: 15, enterprising: 5 } })}
          className="p-4 rounded-lg border-2 border-orange-100 hover:border-orange-500 hover:bg-orange-50 transition-colors text-left"
        >
          <strong className="block text-orange-900 text-lg">Redesign a part</strong>
          <span className="text-sm text-gray-600">Make it look and function better than before.</span>
        </button>
        <button
          onClick={() => handleAction({ id: 'a3', traitImpacts: { realistic: 15, conventional: 5 } })}
          className="p-4 rounded-lg border-2 border-teal-100 hover:border-teal-500 hover:bg-teal-50 transition-colors text-left"
        >
          <strong className="block text-teal-900 text-lg">Grab some tools</strong>
          <span className="text-sm text-gray-600">Get your hands dirty and force it to work.</span>
        </button>
        <button
          onClick={() => handleAction({ id: 'a4', traitImpacts: { social: 15, enterprising: 10 } })}
          className="p-4 rounded-lg border-2 border-rose-100 hover:border-rose-500 hover:bg-rose-50 transition-colors text-left"
        >
          <strong className="block text-rose-900 text-lg">Call for help</strong>
          <span className="text-sm text-gray-600">Organize a team to solve it together.</span>
        </button>
      </div>
    </div>
  );
};
