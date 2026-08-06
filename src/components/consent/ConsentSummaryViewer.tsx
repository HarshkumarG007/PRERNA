import React from 'react';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';

interface ConsentRecord {
  id: string;
  consentedAt: Date;
  disclosureVersion: string;
  scope: string[];
}

interface ConsentSummaryViewerProps {
  consentRecord: ConsentRecord | null;
  viewerType: 'teen' | 'parent';
  onRevoke?: () => void;
}

export const ConsentSummaryViewer: React.FC<ConsentSummaryViewerProps> = ({
  consentRecord,
  viewerType,
  onRevoke,
}) => {
  if (!consentRecord) {
    return (
      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-md">
        <p className="text-sm text-yellow-800">No active consent record found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4 border border-gray-200 rounded-lg bg-white">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Active Consent Summary</h3>
          <p className="text-sm text-gray-500">
            Granted on {consentRecord.consentedAt.toLocaleDateString()}
          </p>
        </div>
        {viewerType === 'parent' && onRevoke && (
          <button
            onClick={onRevoke}
            className="text-sm text-red-600 hover:text-red-800 font-medium px-3 py-1 border border-red-200 rounded-md hover:bg-red-50"
          >
            Revoke Consent
          </button>
        )}
      </div>

      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">What you agreed to:</h4>
        <ul className="space-y-3">
          {consentRecord.scope.map((scopeItem) => {
            const disclosure = Object.values(CURRENT_DISCLOSURES).find((d) => d.type === scopeItem);
            if (!disclosure) return null;
            return (
              <li key={scopeItem} className="text-sm bg-gray-50 p-3 rounded-md">
                <span className="font-semibold text-gray-800 capitalize block mb-1">
                  {scopeItem.replace('_', ' ')}
                </span>
                <span className="text-gray-600">{disclosure.text}</span>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4 pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          Consent ID: {consentRecord.id} | Disclosure Version: {consentRecord.disclosureVersion}
        </p>
      </div>
    </div>
  );
};
