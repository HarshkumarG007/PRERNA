import React, { useState } from 'react';
import { Shield, Check, X } from 'lucide-react';
import { CURRENT_DISCLOSURES, ActivityType } from '../../engine/assessment/disclosures';
import { validateSessionCreation } from '../../engine/consent/sessionGate';
import { useAppStore } from '../../store';

interface DisclosureGateProps {
  activityType: ActivityType;
  onDecline: () => void;
  children: React.ReactNode;
}

export const DisclosureGate: React.FC<DisclosureGateProps> = ({
  activityType,
  onDecline,
  children
}) => {
  const [accepted, setAccepted] = useState(false);
  const language = useAppStore((state) => state.user?.language) || 'en';
  const disclosure = CURRENT_DISCLOSURES[activityType];

  const handleAccept = () => {
    // Validate session creation via the global rule check
    // We pass a dummy userId 'gate' just to pass the schema, because the actual IPC call happens inside the activity.
    validateSessionCreation({ 
      userId: 'gate', 
      sessionType: activityType, 
      disclosureShownId: disclosure.id 
    });
    setAccepted(true);
  };

  if (accepted) {
    return <>{children}</>;
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl max-w-lg w-full p-8 shadow-2xl relative overflow-hidden border border-slate-100"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-indigo-500" />
        
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-xl">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Before you begin</h2>
            <p className="text-sm text-slate-500">Please review this information</p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-xl p-5 mb-8 border border-slate-100">
          <p className="text-slate-700 leading-relaxed font-medium">
            {disclosure.text[language as keyof typeof disclosure.text] || disclosure.text.en}
          </p>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onDecline}
            className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 text-white font-medium rounded-xl transition-colors border border-white/5 flex items-center justify-center gap-2"
          >
            <X size={18} /> Cancel
          </button>
          <button 
            onClick={handleAccept}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors flex items-center justify-center gap-2"
          >
            <Check size={18} /> I Understand
          </button>
        </div>
      </div>
    </div>
  );
};
