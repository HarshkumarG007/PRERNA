import React from 'react';
import { ParentSafeProfile } from '../../parent/permissions';

interface ConversationGuidesProps {
  profile: ParentSafeProfile;
}

export const ConversationGuides: React.FC<ConversationGuidesProps> = ({ profile }) => {
  const getGuidesForStrengths = (strengths: string[]) => {
    // Generate dynamic questions based on strengths
    const guides = [];
    if (strengths.some(s => s.toLowerCase().includes('curious'))) {
      guides.push("I noticed you've been exploring a lot of new topics lately. What's the most interesting thing you've learned this week?");
    }
    if (strengths.some(s => s.toLowerCase().includes('creative'))) {
      guides.push("Your creativity is really shining. Have you had any fun ideas for a new project or hobby?");
    }
    if (strengths.some(s => s.toLowerCase().includes('analytical'))) {
      guides.push("You're great at figuring things out. Can you teach me about how [topic they like] works?");
    }
    if (guides.length === 0) {
      guides.push("You have such unique strengths. What's something you feel really confident doing right now?");
    }
    return guides;
  };

  const guides = getGuidesForStrengths(profile.strengths || []);

  return (
    <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden mt-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 border-b border-gray-100">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <span>💬</span> Conversation Starters
        </h3>
        <p className="text-sm text-gray-600 mt-1">
          Based on your teen's recent activity, here are some positive ways to connect.
        </p>
      </div>
      
      <div className="p-5 space-y-4">
        {guides.map((guide, idx) => (
          <div key={idx} className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <p className="text-gray-800 font-medium italic">"{guide}"</p>
            <div className="mt-2 text-xs text-blue-600 font-semibold uppercase tracking-wider">
              Tip: Ask this while doing a shared activity, like driving or eating, to reduce pressure.
            </div>
          </div>
        ))}
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <h4 className="text-sm font-bold text-gray-700 mb-2">General Check-in</h4>
          <p className="text-gray-800 font-medium italic">"I'm really proud of how you're handling your schedule. Is there anything you'd like my help with, or are you good?"</p>
        </div>
      </div>
    </div>
  );
};
