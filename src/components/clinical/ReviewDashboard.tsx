import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { AlertTriangle, Clock, CheckCircle, ArrowRight, ShieldAlert, BookOpen } from 'lucide-react';
import { CrisisEvent } from '../../engine/crisis/patternDetection';

export const ReviewDashboard: React.FC = () => {
  const [events, setEvents] = useState<CrisisEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CrisisEvent | null>(null);
  
  const loadEvents = async () => {
    try {
      const pending = await invoke<CrisisEvent[]>('get_pending_crisis_events');
      setEvents(pending);
    } catch (error) {
      console.error("Failed to load crisis events:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleResolve = async (decision: 'NoAction' | 'ResourcesOnly' | 'GuardianNotified') => {
    if (!selectedEvent) return;
    
    try {
      // In a real app, teenInformedAt would be captured via the UI flow.
      // For testing, we mock that the teen was informed right now if GuardianNotified.
      const teenInformedAt = decision === 'GuardianNotified' ? Date.now() : null;
      
      await invoke('resolve_crisis_event', {
        eventId: selectedEvent.id,
        reviewerId: 'CLINICIAN_001',
        reviewerCredentialsRef: 'LCSW_12345',
        decision,
        teenInformedAt,
      });
      
      setSelectedEvent(null);
      loadEvents();
    } catch (error) {
      alert(`Failed to resolve event: ${error}`);
    }
  };

  if (loading) return <div className="text-white p-8">Loading queue...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex">
      {/* Sidebar Queue */}
      <div className="w-1/3 border-r border-slate-700 bg-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="text-red-500" />
            Review Queue
          </h2>
          <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold">
            {events.length} Pending
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {events.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>Queue is empty.</p>
            </div>
          ) : (
            events.map(event => (
              <button
                key={event.id}
                onClick={() => setSelectedEvent(event)}
                className={`w-full text-left p-4 border-b border-slate-700 hover:bg-slate-700/50 transition-colors ${selectedEvent?.id === event.id ? 'bg-slate-700/80 border-l-4 border-l-red-500' : ''}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-white">{event.severity.toUpperCase()}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(event.detectedAt).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-slate-400 truncate">
                  User ID: {event.userId.substring(0, 8)}...
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Review Area */}
      <div className="flex-1 p-8">
        {selectedEvent ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-8 shadow-xl">
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-slate-700">
                <AlertTriangle className="text-red-500" size={32} />
                <div>
                  <h1 className="text-2xl font-bold text-white">Crisis Event Review</h1>
                  <p className="text-slate-400">ID: {selectedEvent.id}</p>
                </div>
              </div>
              
              <div className="space-y-6 mb-8">
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">Detected At</h3>
                  <p className="text-lg">{new Date(selectedEvent.detectedAt).toLocaleString()}</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-semibold text-slate-400 uppercase mb-2">Severity Level</h3>
                  <p className="text-lg flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500"></span>
                    {selectedEvent.severity}
                  </p>
                </div>
              </div>
              
              <h3 className="text-sm font-semibold text-slate-400 uppercase mb-4">Clinical Action</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleResolve('NoAction')}
                  className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl p-4 text-left transition-colors"
                >
                  <div className="font-bold text-white mb-1">False Positive</div>
                  <div className="text-sm text-slate-400">Dismiss event</div>
                </button>
                
                <button
                  onClick={() => handleResolve('ResourcesOnly')}
                  className="bg-indigo-900/50 hover:bg-indigo-800/50 border border-indigo-700/50 rounded-xl p-4 text-left transition-colors"
                >
                  <div className="font-bold text-indigo-300 flex items-center gap-2 mb-1">
                    <BookOpen size={16} /> Send Resources
                  </div>
                  <div className="text-sm text-slate-400">Sub-clinical distress</div>
                </button>
                
                <button
                  onClick={() => handleResolve('GuardianNotified')}
                  className="bg-red-900/50 hover:bg-red-800/50 border border-red-700/50 rounded-xl p-4 text-left transition-colors group"
                >
                  <div className="font-bold text-red-400 flex items-center justify-between mb-1">
                    Notify Guardian
                    <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <div className="text-sm text-red-200/60">Imminent risk confirmed</div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-slate-500">
            Select an event from the queue to review.
          </div>
        )}
      </div>
    </div>
  );
};
