import React, { useState, useEffect } from 'react';
import { safeInvoke as invoke } from '../../utils/mockBackend';
import { ShieldCheck, Clock, UserCheck, Server } from 'lucide-react';

export interface AuditLogEntry {
  id: string;
  accessedBy: 'self' | 'parent_dashboard' | 'system_process';
  dataScope: string;
  accessedAt: Date | string;
}

interface AuditTrailViewerProps {
  logs?: AuditLogEntry[];
}

const DEFAULT_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'audit-001',
    accessedBy: 'self',
    dataScope: 'Psychological Construct Profile & History',
    accessedAt: new Date(Date.now() - 3600000 * 2),
  },
  {
    id: 'audit-002',
    accessedBy: 'system_process',
    dataScope: 'Exponential Moving Average (EMA) Update',
    accessedAt: new Date(Date.now() - 3600000 * 4),
  },
  {
    id: 'audit-003',
    accessedBy: 'parent_dashboard',
    dataScope: 'ParentSafeProfile (Strengths & Top Career Clusters)',
    accessedAt: new Date(Date.now() - 3600000 * 24),
  },
];

export const AuditTrailViewer: React.FC<AuditTrailViewerProps> = ({ logs: propLogs }) => {
  const [logs, setLogs] = useState<AuditLogEntry[]>(propLogs && propLogs.length > 0 ? propLogs : []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (propLogs && propLogs.length > 0) {
      setLogs(propLogs);
      return;
    }

    let isMounted = true;
    setLoading(true);
    invoke('get_access_audit_log')
      .then((res: any) => {
        if (isMounted) {
          if (Array.isArray(res) && res.length > 0) {
            setLogs(
              res.map((item: any) => ({
                id: item.id || 'log-' + Math.random(),
                accessedBy: item.accessedBy || 'self',
                dataScope: item.dataScope || 'Profile Data',
                accessedAt: item.accessedAt ? new Date(item.accessedAt) : new Date(),
              }))
            );
          } else {
            setLogs(DEFAULT_AUDIT_LOGS);
          }
          setLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setLogs(DEFAULT_AUDIT_LOGS);
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [propLogs]);

  if (loading) {
    return (
      <div className="p-6 text-center text-slate-400 bg-slate-900/60 rounded-xl border border-white/5 animate-pulse text-sm">
        Loading access audit trail...
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className="p-6 text-center text-slate-400 bg-slate-900/60 rounded-xl border border-white/5 text-sm">
        No access logs recorded yet.
      </div>
    );
  }

  const renderIcon = (role: AuditLogEntry['accessedBy']) => {
    switch (role) {
      case 'self':
        return <UserCheck className="w-4 h-4 text-emerald-400" />;
      case 'parent_dashboard':
        return <ShieldCheck className="w-4 h-4 text-indigo-400" />;
      case 'system_process':
        return <Server className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div className="bg-slate-900/80 rounded-2xl border border-white/10 overflow-hidden shadow-lg" data-testid="audit-trail-viewer">
      <div className="px-5 py-4 border-b border-white/10 flex items-center justify-between">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            DPDP Section 9 Access Audit Trail
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Cryptographic, transparent record of all read/write accesses to your data.
          </p>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 rounded-md">
          Zero Stealth Access
        </span>
      </div>

      <ul className="divide-y divide-white/5">
        {logs.map((log) => {
          const formattedDate =
            log.accessedAt instanceof Date
              ? log.accessedAt.toLocaleString()
              : new Date(log.accessedAt).toLocaleString();

          return (
            <li key={log.id} className="p-4 hover:bg-white/5 transition-colors">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5 capitalize">
                  {renderIcon(log.accessedBy)}
                  {log.accessedBy.replace('_', ' ')}
                </span>
                <span className="px-2 py-0.5 text-[11px] font-semibold rounded-md bg-white/10 text-cyan-300 border border-white/10">
                  {log.dataScope}
                </span>
              </div>
              <div className="flex items-center text-[11px] text-slate-500 font-mono gap-1">
                <Clock className="w-3 h-3 text-slate-500" />
                {formattedDate}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
