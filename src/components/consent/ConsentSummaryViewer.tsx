import React from 'react';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';
import { useI18n } from '../../engine/localization/i18n';

interface ConsentRecord {
  id: string;
  consentedAt: Date;
  disclosureVersion: string;
  scope: string[];
}

interface ConsentSummaryViewerProps {
  consentRecord: ConsentRecord | null;
  onRevoke?: () => void;
}

export const ConsentSummaryViewer: React.FC<ConsentSummaryViewerProps> = ({
  consentRecord,
  onRevoke,
}) => {
  const { language } = useI18n();

  if (!consentRecord) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">No active consent record found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-5 bg-black/40 border border-white/10 rounded-2xl">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-white">Active Consent Summary</h3>
          <p className="text-sm font-medium text-white/50">
            Granted on {consentRecord.consentedAt.toLocaleDateString()}
          </p>
        </div>
        {onRevoke && (
          <button
            onClick={onRevoke}
            className="text-xs font-bold text-rose-400 hover:text-white hover:bg-rose-500/20 px-4 py-2 border border-rose-500/30 rounded-xl transition-colors uppercase tracking-widest"
          >
            Revoke Consent
          </button>
        )}
      </div>

      <div className="mt-6">
        <h4 className="text-sm font-bold text-white/80 mb-3 uppercase tracking-widest">What you agreed to:</h4>
        <ul className="space-y-3">
          {consentRecord.scope.map((scopeItem) => {
            const disclosure = Object.values(CURRENT_DISCLOSURES).find((d) => d.type === scopeItem);
            if (!disclosure) return null;
            return (
              <li key={scopeItem} className="text-sm bg-white/5 p-4 rounded-xl border border-white/5">
                <span className="font-bold text-white capitalize block mb-1">
                  {scopeItem.replace('_', ' ')}
                </span>
                <p className="mt-2 text-sm font-medium text-white/60 leading-relaxed">{disclosure.text[language]}</p>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-6 pt-4 border-t border-white/10">
        <p className="text-[10px] font-mono text-white/40 uppercase tracking-wider">
          Consent ID: {consentRecord.id} | Disclosure Version: {consentRecord.disclosureVersion}
        </p>
      </div>
    </div>
  );
};
