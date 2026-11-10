import React, { useState, useEffect, useCallback } from 'react';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  ArrowRight,
  ShieldAlert,
  BookOpen,
  ShieldCheck,
  RefreshCw,
  FileCheck2,
  Send
} from 'lucide-react';
import {
  CrisisDecision,
  CrisisEventRecord,
  DeliveryRecord,
  claimCrisisEvent,
  getCrisisDeliveryRecords,
  getPendingCrisisEvents,
  resolveCrisisEvent
} from '../../services/crisisService';

interface ResolvedCaseSummary {
  event: CrisisEventRecord;
  decision: CrisisDecision;
  teenInformedAt: number | null;
  resolvedAt: string;
  deliveryRecords: DeliveryRecord[];
}

export const ReviewDashboard: React.FC = () => {
  const [events, setEvents] = useState<CrisisEventRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState<CrisisEventRecord | null>(null);
  const [credentialsRef, setCredentialsRef] = useState('');
  const [teenInformedAt, setTeenInformedAt] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);
  const [resolvedHistory, setResolvedHistory] = useState<ResolvedCaseSummary[]>([]);

  const loadEvents = useCallback(async () => {
    setErrorMsg(null);
    try {
      const pending = await getPendingCrisisEvents();
      setEvents(pending);
    } catch (error: any) {
      console.error('Failed to load crisis events:', error);
      setErrorMsg(error?.message || String(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  const handleSelectEvent = (evt: CrisisEventRecord) => {
    setSelectedEvent(evt);
    setTeenInformedAt(evt.teen_informed_at ?? null);
    setErrorMsg(null);
    setStatusMsg(null);
  };

  const handleToggleTeenInformed = (checked: boolean) => {
    setTeenInformedAt(checked ? Date.now() : null);
    setErrorMsg(null);
  };

  const handleResolve = async (decision: CrisisDecision) => {
    if (!selectedEvent || submitting) return;

    const trimmedCreds = credentialsRef.trim();
    if (!trimmedCreds) {
      setErrorMsg('Clinical reviewer credentials reference is required (e.g., MCI/RCI/LCSW license ID).');
      return;
    }

    if (decision === 'GuardianNotified' && !teenInformedAt) {
      setErrorMsg('Rule 0.3 Violation: You must confirm the adolescent has been informed prior to notifying a guardian.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);
    setStatusMsg(null);

    try {
      // Ensure the case is atomically claimed by the authenticated reviewer before resolving
      if (!selectedEvent.reviewer_id) {
        await claimCrisisEvent(selectedEvent.id);
      }

      const informedTimestamp = decision === 'GuardianNotified' ? teenInformedAt : null;
      await resolveCrisisEvent({
        eventId: selectedEvent.id,
        reviewerCredentialsRef: trimmedCreds,
        decision,
        teenInformedAt: informedTimestamp,
      });

      let deliveryRecords: DeliveryRecord[] = [];
      if (decision === 'GuardianNotified') {
        try {
          deliveryRecords = await getCrisisDeliveryRecords(selectedEvent.id);
        } catch (auditErr) {
          console.warn('Could not immediately fetch delivery audit records:', auditErr);
        }
      }

      const summary: ResolvedCaseSummary = {
        event: selectedEvent,
        decision,
        teenInformedAt: informedTimestamp,
        resolvedAt: new Date().toISOString(),
        deliveryRecords,
      };
      setResolvedHistory(prev => [summary, ...prev]);

      setStatusMsg(
        decision === 'GuardianNotified'
          ? `Event ${selectedEvent.id} escalated & guardian notification logged (${deliveryRecords.length} delivery record(s)).`
          : `Event ${selectedEvent.id} resolved as ${decision}.`
      );
      setSelectedEvent(null);
      setTeenInformedAt(null);
      await loadEvents();
    } catch (error: any) {
      setErrorMsg(error?.message || String(error));
    } finally {
      setSubmitting(false);
    }
  };

  const handleRefreshDeliveryRecords = async (crisisId: string) => {
    try {
      const records = await getCrisisDeliveryRecords(crisisId);
      setResolvedHistory(prev =>
        prev.map(item =>
          item.event.id === crisisId ? { ...item, deliveryRecords: records } : item
        )
      );
    } catch (err: any) {
      setErrorMsg(err?.message || String(err));
    }
  };

  if (loading) return <div className="text-white p-8">Loading queue...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 flex flex-col lg:flex-row font-sans text-left">
      {/* Sidebar Queue */}
      <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r border-slate-700 bg-slate-800 flex flex-col">
        <div className="p-6 border-b border-slate-700 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldAlert className="text-red-500" />
            Review Queue
          </h2>
          <div className="flex items-center gap-2">
            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full text-sm font-bold">
              {events.length} Pending
            </span>
            <button
              onClick={loadEvents}
              className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 transition-colors cursor-pointer"
              title="Refresh review queue"
            >
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto max-h-80 lg:max-h-none">
          {events.length === 0 ? (
            <div className="p-8 text-center text-slate-500">
              <CheckCircle size={48} className="mx-auto mb-4 opacity-50" />
              <p>Queue is empty.</p>
            </div>
          ) : (
            events.map(event => (
              <button
                key={event.id}
                onClick={() => handleSelectEvent(event)}
                className={`w-full text-left p-4 border-b border-slate-700 hover:bg-slate-700/50 transition-colors cursor-pointer ${
                  selectedEvent?.id === event.id ? 'bg-slate-700/80 border-l-4 border-l-red-500' : ''
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-white">{event.severity.toUpperCase()}</span>
                  <span className="text-xs text-slate-400 flex items-center gap-1">
                    <Clock size={12} />
                    {new Date(event.detected_at).toLocaleTimeString()}
                  </span>
                </div>
                <div className="text-sm text-slate-400 truncate">
                  User ID: {event.user_id.substring(0, 12)}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Origin: {event.origin} • {event.reviewer_id ? 'Claimed' : 'Unclaimed'}
                </div>
              </button>
            ))
          )}
        </div>

        {/* Session Delivery Audit Log */}
        {resolvedHistory.length > 0 && (
          <div className="border-t border-slate-700 p-4 bg-slate-900/60 space-y-3">
            <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-emerald-400">
              <span className="flex items-center gap-1.5">
                <FileCheck2 size={14} /> Delivery Audit Trail
              </span>
              <span>{resolvedHistory.length} Resolved</span>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {resolvedHistory.map(item => (
                <div key={item.event.id} className="p-3 rounded-xl bg-slate-800 border border-slate-700 text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white">{item.event.id}</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300">
                      {item.decision}
                    </span>
                  </div>
                  {item.deliveryRecords.length > 0 ? (
                    item.deliveryRecords.map(rec => (
                      <div key={rec.id} className="p-2 rounded-lg bg-slate-900/70 border border-slate-700/80 space-y-0.5 text-[11px]">
                        <div className="flex items-center justify-between">
                          <span className="text-emerald-400 font-bold flex items-center gap-1">
                            <Send size={11} /> {rec.status}
                          </span>
                          <span className="font-mono text-slate-400">{rec.provider}</span>
                        </div>
                        <div className="text-slate-400 truncate">Recipient: {rec.recipient_id}</div>
                        {rec.provider_reference && (
                          <div className="font-mono text-[10px] text-slate-500 truncate">
                            Ref: {rec.provider_reference}
                          </div>
                        )}
                      </div>
                    ))
                  ) : item.decision === 'GuardianNotified' ? (
                    <button
                      onClick={() => handleRefreshDeliveryRecords(item.event.id)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 underline cursor-pointer"
                    >
                      Verify delivery status
                    </button>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Review Area */}
      <div className="flex-1 p-6 md:p-8 space-y-4">
        {statusMsg && (
          <div className="max-w-3xl mx-auto p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-200 text-sm flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-400 flex-shrink-0" />
            <span>{statusMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="max-w-3xl mx-auto p-4 rounded-xl bg-red-950/70 border border-red-500/50 text-red-200 text-sm flex items-center gap-2">
            <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {selectedEvent ? (
          <div className="max-w-3xl mx-auto">
            <div className="bg-slate-800 rounded-2xl border border-slate-700 p-6 md:p-8 shadow-xl space-y-6">
              <div className="flex items-center gap-3 pb-6 border-b border-slate-700">
                <AlertTriangle className="text-red-500" size={32} />
                <div>
                  <h1 className="text-2xl font-bold text-white">Crisis Event Review</h1>
                  <p className="text-slate-400 font-mono text-xs">ID: {selectedEvent.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase mb-1">Detected At</h3>
                  <p className="text-base font-medium text-white">
                    {new Date(selectedEvent.detected_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase mb-1">Severity Level</h3>
                  <p className="text-base font-medium text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500" />
                    {selectedEvent.severity}
                  </p>
                </div>
              </div>

              {/* Reviewer Credentials Input */}
              <div className="space-y-2 pt-2 border-t border-slate-700">
                <label
                  htmlFor="reviewer-credentials-input"
                  className="block text-xs font-semibold text-slate-300 uppercase"
                >
                  Clinical Reviewer Credentials Reference (Required)
                </label>
                <input
                  id="reviewer-credentials-input"
                  type="text"
                  value={credentialsRef}
                  onChange={(e) => setCredentialsRef(e.target.value)}
                  placeholder="e.g. RCI-CLIN-99412 or LCSW-12345"
                  className="w-full bg-slate-900 border border-slate-600 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400"
                  disabled={submitting}
                />
              </div>

              {/* Explicit Rule 0.3 Teen Informed Confirmation */}
              <div className="p-4 rounded-xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={Boolean(teenInformedAt)}
                    onChange={(e) => handleToggleTeenInformed(e.target.checked)}
                    disabled={submitting}
                    className="mt-1 h-4 w-4 rounded border-amber-400 text-amber-500 focus:ring-amber-500"
                  />
                  <div className="text-xs space-y-1">
                    <span className="font-bold text-amber-200 block">
                      Rule 0.3 Confirmation: Adolescent Transparently Informed First
                    </span>
                    <span className="text-amber-200/70 block leading-relaxed">
                      Required before guardian escalation: confirm that the adolescent was notified and provided immediate coping support before contacting any linked guardian.
                    </span>
                    {teenInformedAt && (
                      <span className="text-[11px] font-mono text-emerald-300 block">
                        Recorded teen_informed_at: {new Date(teenInformedAt).toLocaleTimeString()}
                      </span>
                    )}
                  </div>
                </label>
              </div>

              <div>
                <h3 className="text-xs font-semibold text-slate-400 uppercase mb-4">Clinical Action</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <button
                    onClick={() => handleResolve('NoAction')}
                    disabled={submitting}
                    className="bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-xl p-4 text-left transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <div className="font-bold text-white mb-1">False Positive</div>
                    <div className="text-xs text-slate-400">Dismiss event</div>
                  </button>

                  <button
                    onClick={() => handleResolve('ResourcesOnly')}
                    disabled={submitting}
                    className="bg-indigo-900/50 hover:bg-indigo-800/50 border border-indigo-700/50 rounded-xl p-4 text-left transition-colors cursor-pointer disabled:opacity-50"
                  >
                    <div className="font-bold text-indigo-300 flex items-center gap-2 mb-1">
                      <BookOpen size={16} /> Send Resources
                    </div>
                    <div className="text-xs text-slate-400">Sub-clinical distress</div>
                  </button>

                  <button
                    onClick={() => handleResolve('GuardianNotified')}
                    disabled={submitting || !teenInformedAt}
                    className="bg-red-900/50 hover:bg-red-800/50 border border-red-700/50 rounded-xl p-4 text-left transition-colors group cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                    title={teenInformedAt ? 'Dispatch Sovereign Emergency Alert to linked guardian' : 'Confirm Rule 0.3 teen notification above first'}
                  >
                    <div className="font-bold text-red-400 flex items-center justify-between mb-1">
                      Notify Guardian
                      <ArrowRight size={16} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                    <div className="text-xs text-red-200/70">
                      {teenInformedAt ? 'Imminent risk confirmed' : 'Requires Rule 0.3 check'}
                    </div>
                  </button>
                </div>
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
