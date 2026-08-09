// src/components/common/Toast.tsx
// A self-contained, global toast notification system.
// Usage: import { useToast, ToastContainer } from './Toast'

import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number; // ms, default 4000, 0 = persistent
}

interface ToastContextValue {
  toast: (opts: Omit<ToastMessage, 'id'>) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const ICONS: Record<ToastType, React.FC<{ size: number; className: string }>> = {
  success: ({ size, className }) => <CheckCircle size={size} className={className} />,
  error:   ({ size, className }) => <XCircle size={size} className={className} />,
  warning: ({ size, className }) => <AlertTriangle size={size} className={className} />,
  info:    ({ size, className }) => <Info size={size} className={className} />,
};

const STYLES: Record<ToastType, { container: string; icon: string }> = {
  success: { container: 'bg-emerald-900/90 border-emerald-500/40', icon: 'text-emerald-400' },
  error:   { container: 'bg-red-900/90 border-red-500/40', icon: 'text-red-400' },
  warning: { container: 'bg-amber-900/90 border-amber-500/40', icon: 'text-amber-400' },
  info:    { container: 'bg-slate-800/90 border-slate-500/40', icon: 'text-blue-400' },
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timersRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const dismiss = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
  }, []);

  const toast = useCallback((opts: Omit<ToastMessage, 'id'>) => {
    const id = crypto.randomUUID();
    const duration = opts.duration ?? 4000;
    setToasts(prev => [...prev, { ...opts, id }]);

    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => dismiss(id), duration);
    }
  }, [dismiss]);

  const success = useCallback((title: string, message?: string) => toast({ type: 'success', title, message }), [toast]);
  const error   = useCallback((title: string, message?: string) => toast({ type: 'error', title, message, duration: 6000 }), [toast]);
  const warning = useCallback((title: string, message?: string) => toast({ type: 'warning', title, message }), [toast]);
  const info    = useCallback((title: string, message?: string) => toast({ type: 'info', title, message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, warning, info, dismiss }}>
      {children}
      <ToastContainer toasts={toasts} dismiss={dismiss} />
    </ToastContext.Provider>
  );
};

export const useToast = (): ToastContextValue => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>');
  return ctx;
};

const ToastContainer: React.FC<{ toasts: ToastMessage[]; dismiss: (id: string) => void }> = ({ toasts, dismiss }) => (
  <div className="fixed top-5 right-5 z-[9999] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
    <AnimatePresence mode="sync">
      {toasts.map(t => {
        const IconComp = ICONS[t.type];
        const style = STYLES[t.type];
        return (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, x: 60, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, scale: 0.9 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={`pointer-events-auto flex items-start gap-3 px-4 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl ${style.container}`}
          >
            <IconComp size={20} className={`flex-shrink-0 mt-0.5 ${style.icon}`} />
            <div className="flex-1 min-w-0">
              <p className="text-white font-bold text-sm leading-snug">{t.title}</p>
              {t.message && (
                <p className="text-white/70 text-xs mt-0.5 leading-relaxed">{t.message}</p>
              )}
            </div>
            <button
              onClick={() => dismiss(t.id)}
              className="flex-shrink-0 text-white/40 hover:text-white/80 transition-colors mt-0.5"
            >
              <X size={16} />
            </button>
          </motion.div>
        );
      })}
    </AnimatePresence>
  </div>
);
