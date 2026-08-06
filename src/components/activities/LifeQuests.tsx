import React, { useState } from 'react';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { validateSessionCreation, SessionConfig } from '../../engine/consent/sessionGate';
import { calculateBigFive, QuestChoice, BigFiveProfile } from '../../engine/assessment/bigFive';
import { useI18n } from '../../engine/localization/i18n';

interface LifeQuestsProps {
  userId: string;
}

export const LifeQuests: React.FC<LifeQuestsProps> = ({ userId }) => {
  const [disclosureAccepted, setDisclosureAccepted] = useState(false);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [choicesMade, setChoicesMade] = useState<QuestChoice[]>([]);
  const [results, setResults] = useState<BigFiveProfile | null>(null);
  const { language } = useI18n();

  const disclosure = CURRENT_DISCLOSURES.life_quests;

  const handleStartSession = () => {
    try {
      const config: SessionConfig = {
        userId,
        sessionType: 'life_quests',
        disclosureShownId: disclosure.id,
      };
      
      // Enforces Global Rule 0.1-2
      validateSessionCreation(config);
      
      setIsSessionActive(true);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleChoice = (choice: QuestChoice) => {
    const updatedChoices = [...choicesMade, choice];
    setChoicesMade(updatedChoices);
    
    // Simulate finishing quest after 2 choices
    if (updatedChoices.length >= 2) {
      const profile = calculateBigFive(updatedChoices);
      setResults(profile);
      setIsSessionActive(false);
      // In a real app: write to trait_snapshots table here
    }
  };

  if (results) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-8 glass-panel space-y-6 animate-fade-in-up">
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Quest Complete!</h2>
        <p className="text-slate-600 font-medium">Here's what we learned about your decision-making style:</p>
        <div className="bg-slate-50/80 p-6 rounded-xl border border-slate-100 shadow-inner">
          <pre className="text-sm text-slate-600 font-mono overflow-auto">{JSON.stringify(results, null, 2)}</pre>
        </div>
        <button onClick={() => setResults(null)} className="w-full flex justify-center py-3 px-4 rounded-xl shadow-lg shadow-indigo-200 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 transition-all duration-300 hover:-translate-y-0.5">
          Play Again
        </button>
      </div>
    );
  }

  if (!disclosureAccepted) {
    return (
      <div className="max-w-xl mx-auto mt-10 p-8 glass-panel space-y-6 animate-fade-in-up relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60"></div>
        <h2 className="text-3xl font-black text-indigo-900 relative z-10">Life Quests</h2>
        <div className="mt-4 bg-white/60 p-6 rounded-xl border border-indigo-50 shadow-sm relative z-10">
          <p className="text-xs uppercase tracking-widest font-bold text-indigo-500 mb-2">Before you play</p>
          <p className="text-slate-700 leading-relaxed font-medium">{disclosure.text[language]}</p>
        </div>
        <button
          onClick={() => setDisclosureAccepted(true)}
          className="mt-6 w-full flex justify-center py-4 px-4 rounded-xl shadow-lg shadow-indigo-200 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 hover:-translate-y-0.5 transition-all duration-300 relative z-10"
        >
          I Understand, Let's Play!
        </button>
      </div>
    );
  }

  if (!isSessionActive) {
    return (
      <div className="max-w-xl mx-auto mt-20 text-center animate-fade-in-up">
        <button
          onClick={handleStartSession}
          className="py-4 px-8 rounded-2xl shadow-xl shadow-purple-200 text-lg font-black text-white bg-gradient-to-r from-purple-500 to-indigo-600 hover:scale-105 transition-all duration-300 active:scale-95"
        >
          Start a New Quest
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto mt-10 p-8 glass-panel space-y-8 animate-fade-in-up">
      <div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">The Crossroads</h2>
        <p className="text-slate-600 text-lg mt-2 font-medium">You encounter a traveler looking for directions. They seem lost, but in a rush.</p>
      </div>
      
      <div className="space-y-4 mt-8">
        <button
          onClick={() => handleChoice({ id: 'c1', traitImpacts: { agreeableness: 10, conscientiousness: 5 } })}
          className="w-full text-left p-6 rounded-xl border border-slate-200 bg-white/50 hover:border-indigo-300 hover:bg-indigo-50 hover:shadow-md transition-all duration-300 group"
        >
          <strong className="block text-lg text-slate-800 group-hover:text-indigo-700 transition-colors">Help them map a route</strong>
          <span className="text-sm text-slate-500 mt-1 block">Take your time to ensure they don't get lost again.</span>
        </button>
        <button
          onClick={() => handleChoice({ id: 'c2', traitImpacts: { openness: 10, extraversion: 5 } })}
          className="w-full text-left p-6 rounded-xl border border-slate-200 bg-white/50 hover:border-purple-300 hover:bg-purple-50 hover:shadow-md transition-all duration-300 group"
        >
          <strong className="block text-lg text-slate-800 group-hover:text-purple-700 transition-colors">Offer to walk with them</strong>
          <span className="text-sm text-slate-500 mt-1 block">Join them on their journey to see where it goes.</span>
        </button>
      </div>
    </div>
  );
};
