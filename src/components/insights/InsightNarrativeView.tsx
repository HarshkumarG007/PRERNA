import React, { useState, useEffect } from 'react';
import { generateTeenInsight, InsightNarrativeResult } from '../../ai/insightNarrator';
import { UnifiedProfile } from '../../store';

interface InsightNarrativeViewProps {
  profile: UnifiedProfile;
}

export const InsightNarrativeView: React.FC<InsightNarrativeViewProps> = ({ profile }) => {
  const [insight, setInsight] = useState<InsightNarrativeResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    generateTeenInsight(profile).then(result => {
      if (mounted) {
        setInsight(result);
        setLoading(false);
      }
    }).catch(err => {
      console.error("Failed to generate insight", err);
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [profile]);

  if (loading) return <div>Generating your personalized insights...</div>;
  if (!insight) return <div>Failed to load insights.</div>;
  if (!insight.isSafeToDisplay) return <div>No safe insights could be generated at this time.</div>;

  return (
    <div className="insight-narrative-view p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-4">Your Self-Discovery Report</h2>
      
      <div className="prose">
        {insight.sentences.map((sentence, index) => (
          <p key={index} className="mb-2">
            {sentence.text}
            <span className="text-xs text-gray-400 ml-2 block italic">
              Sources: {sentence.citations.join(', ')}
            </span>
          </p>
        ))}
      </div>

      <div className="mt-8 border-t pt-4">
        <h3 className="text-lg font-semibold mb-2">Your Base Scores</h3>
        <ul className="text-sm">
          <li>Openness: {profile.personality?.bigFive?.openness}</li>
          <li>Conscientiousness: {profile.personality?.bigFive?.conscientiousness}</li>
          <li>Extraversion: {profile.personality?.bigFive?.extraversion}</li>
          <li>Agreeableness: {profile.personality?.bigFive?.agreeableness}</li>
          <li>Neuroticism: {profile.personality?.bigFive?.neuroticism}</li>
        </ul>
      </div>
    </div>
  );
};
