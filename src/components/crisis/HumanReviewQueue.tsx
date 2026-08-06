import React, { useState } from 'react';
import { CrisisEvent } from '../../engine/crisis/patternDetection';
import { executeGuardianNotification } from '../../engine/crisis/escalationRouter';

// Mock data for the queue
const MOCK_QUEUE: CrisisEvent[] = [
  { id: 'c1', userId: 'u123', detectedAt: new Date(), humanReviewStatus: 'pending' },
];

export const HumanReviewQueue: React.FC = () => {
  const [queue, setQueue] = useState<CrisisEvent[]>(MOCK_QUEUE);
  const [selectedCase, setSelectedCase] = useState<CrisisEvent | null>(null);

  const handleAction = async (status: CrisisEvent['humanReviewStatus']) => {
    if (!selectedCase) return;

    // 1. Update the case status
    const updatedCase = { ...selectedCase, humanReviewStatus: status, reviewerRef: 'dr_counselor_1' };
    
    // 2. If it's a guardian notification, we MUST inform the teen first per Rule 0.1-3
    if (status === 'reviewed_guardian_notified') {
      updatedCase.teenInformedAt = new Date(); // Simulate informing the teen
      
      try {
        await executeGuardianNotification(updatedCase);
        alert('Guardian successfully notified safely.');
      } catch (err: any) {
        alert(err.message);
        return;
      }
    } else {
      alert(`Case resolved with status: ${status}`);
    }

    // Remove from queue
    setQueue(queue.filter(q => q.id !== selectedCase.id));
    setSelectedCase(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-gray-50 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 border-b pb-4">Clinical Review Queue (Admin)</h1>
      
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-1 border-r pr-6 space-y-3">
          <h2 className="font-semibold text-gray-700 mb-4">Pending Cases ({queue.length})</h2>
          {queue.map((c) => (
            <button 
              key={c.id} 
              onClick={() => setSelectedCase(c)}
              className={`w-full text-left p-3 rounded-md border ${selectedCase?.id === c.id ? 'bg-indigo-100 border-indigo-300' : 'bg-white hover:bg-gray-100'}`}
            >
              <div className="text-sm font-bold text-gray-900">User: {c.userId}</div>
              <div className="text-xs text-red-600 mt-1">Detected: {c.detectedAt.toLocaleTimeString()}</div>
            </button>
          ))}
          {queue.length === 0 && <p className="text-sm text-gray-500">Queue is empty.</p>}
        </div>

        <div className="col-span-2">
          {selectedCase ? (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-xl font-bold mb-4">Case Details: {selectedCase.id}</h2>
              <div className="bg-red-50 p-4 rounded-md mb-6 border border-red-100">
                <p className="text-sm font-medium text-red-800">Trigger: Sustained Severe Distress (Mock Data)</p>
                <p className="text-sm text-red-700 mt-2">"User selected lowest mood state 5 days in a row."</p>
              </div>

              <h3 className="text-sm font-bold text-gray-900 mb-3">Clinical Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => handleAction('reviewed_no_action')}
                  className="w-full text-left p-3 rounded-md border border-gray-300 hover:bg-gray-50"
                >
                  <strong className="block text-gray-800">Dismiss / False Positive</strong>
                  <span className="text-xs text-gray-500">No action needed.</span>
                </button>
                <button 
                  onClick={() => handleAction('reviewed_resources_only')}
                  className="w-full text-left p-3 rounded-md border border-blue-300 bg-blue-50 hover:bg-blue-100"
                >
                  <strong className="block text-blue-800">Resources Only</strong>
                  <span className="text-xs text-blue-600">Re-surface hotlines to the teen in-app.</span>
                </button>
                <button 
                  onClick={() => handleAction('reviewed_guardian_notified')}
                  className="w-full text-left p-3 rounded-md border border-red-300 bg-red-50 hover:bg-red-100"
                >
                  <strong className="block text-red-800">Imminent Risk: Notify Guardian</strong>
                  <span className="text-xs text-red-600">Informs teen immediately, then dispatches alert to verified parent.</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              Select a case to review.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
