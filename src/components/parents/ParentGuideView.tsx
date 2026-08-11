import React, { useState, useEffect } from 'react';
import { generateParentGuide, ParentGuideResult } from '../../ai/parentGuideNarrator';
import { ParentSafeProfile } from '../../parent/permissions';

interface ParentGuideViewProps {
  profile: ParentSafeProfile;
}

export const ParentGuideView: React.FC<ParentGuideViewProps> = ({ profile }) => {
  const [guide, setGuide] = useState<ParentGuideResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    generateParentGuide(profile).then(result => {
      if (mounted) {
        setGuide(result);
        setLoading(false);
      }
    }).catch(err => {
      console.error("Failed to generate parent guide", err);
      if (mounted) setLoading(false);
    });
    return () => { mounted = false; };
  }, [profile]);

  if (loading) return <div>Generating parent guide...</div>;
  if (!guide) return <div>Failed to load parent guide.</div>;
  if (!guide.isSafeToDisplay) return <div>No safe guide could be generated at this time.</div>;

  return (
    <div className="parent-guide-view p-6 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
      <h2 className="text-2xl font-bold mb-4 text-blue-900">Parenting Guide</h2>
      
      <div className="prose text-blue-800">
        {guide.sentences.map((sentence, index) => (
          <p key={index} className="mb-2">
            {sentence.text}
            <span className="text-xs text-blue-400 ml-2 block italic">
              Sources: {sentence.citations.join(', ')}
            </span>
          </p>
        ))}
      </div>

      <div className="mt-8 border-t border-blue-200 pt-4">
        <h3 className="text-lg font-semibold mb-2 text-blue-900">Shared Traits</h3>
        <ul className="text-sm text-blue-800">
          <li>Openness: {profile.bigFive?.openness ?? 'Not shared'}</li>
          <li>Conscientiousness: {profile.bigFive?.conscientiousness ?? 'Not shared'}</li>
          <li>Extraversion: {profile.bigFive?.extraversion ?? 'Not shared'}</li>
          <li>Agreeableness: {profile.bigFive?.agreeableness ?? 'Not shared'}</li>
          {/* Neuroticism intentionally omitted for safety */}
        </ul>
      </div>
    </div>
  );
};
