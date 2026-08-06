import React, { useState } from 'react';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { validateSessionCreation, SessionConfig } from '../../engine/consent/sessionGate';

import { useI18n } from '../../engine/localization/i18n';
import { useAppStore } from '../../store';
import { calculateOptimalDifficulty } from '../../assessment/skills/engine';
import { WordBridge } from '../skills/WordBridge';

export interface SkillArenaProps {
  userId?: string;
}

export const SkillArena: React.FC<SkillArenaProps> = ({ userId }) => {
  const { language } = useI18n();
  const { user } = useAppStore();
  const [disclosureAccepted, setDisclosureAccepted] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [results, setResults] = useState<any>(null);

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

  const difficulty = calculateOptimalDifficulty((user as any)?.bigFive);

  return (
    <div className="max-w-4xl mx-auto mt-10 space-y-6">
      <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-200 flex items-center justify-between">
        <div>
          <span className="font-bold">Adaptive Pacing Active:</span> Engine detected your profile traits and set the difficulty to <strong className="uppercase">{difficulty}</strong>.
        </div>
      </div>
      
      <div className="bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
        <WordBridge 
          difficulty={difficulty} 
          onComplete={(res) => {
            setResults(res as any);
            setIsSessionActive(false);
          }} 
        />
      </div>
    </div>
  );
};
