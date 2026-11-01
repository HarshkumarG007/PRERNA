import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Key, ArrowRight, Mail, CheckCircle2, AlertCircle, RefreshCw, Database } from 'lucide-react';
import { PrernaEmblem } from '../common/PrernaLogo';
import { sovereignSupabase, BetaTokenVerificationResult } from '../../utils/supabaseClient';
import { RequestAccessModal } from './RequestAccessModal';

interface PrivateBetaGateProps {
  onAccessGranted: (result: BetaTokenVerificationResult) => void;
}

export const PrivateBetaGate: React.FC<PrivateBetaGateProps> = ({ onAccessGranted }) => {
  const [tokenInput, setTokenInput] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successResult, setSuccessResult] = useState<BetaTokenVerificationResult | null>(null);
  const [showConfigHelp, setShowConfigHelp] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  // Auto-detect magic invite parameter from URL on mount
  useEffect(() => {
    try {
      const getParam = (name: string): string | null => {
        // Check window.location.search (?invite=...)
        const searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get(name)) return searchParams.get(name);
        
        // Check window.location.hash (#/?invite=...)
        if (window.location.hash.includes('?')) {
          const hashQuery = window.location.hash.split('?')[1];
          const hashParams = new URLSearchParams(hashQuery);
          if (hashParams.get(name)) return hashParams.get(name);
        }
        return null;
      };

      const magicToken = getParam('invite') || getParam('access') || getParam('code');
      if (magicToken) {
        // Anti-Leak Defense: Scrub token from address bar immediately to prevent copying or forwarding leaks
        if (typeof window !== 'undefined' && window.history && window.history.replaceState) {
          const cleanUrl = window.location.origin + window.location.pathname + (window.location.hash ? window.location.hash.split('?')[0] : '');
          window.history.replaceState(null, '', cleanUrl);
        }
        setTokenInput(magicToken);
        handleVerify(magicToken);
      }
    } catch {}
  }, []);

  const handleVerify = async (tokenToTest?: string) => {
    const raw = tokenToTest || tokenInput;
    if (!raw.trim()) {
      setErrorMsg('Please enter an invitation token.');
      return;
    }

    setIsVerifying(true);
    setErrorMsg(null);

    try {
      const res = await sovereignSupabase.verifyToken(raw);
      if (res.valid) {
        setSuccessResult(res);
        // Persist verified access seal in localStorage
        localStorage.setItem('prerna_beta_access_token', raw.trim().toUpperCase());
        localStorage.setItem('prerna_beta_grantee', res.assignedTo || 'Authorized Tester');
        if (res.role) {
          localStorage.setItem('prerna_user_role', res.role);
        }

        setTimeout(() => {
          onAccessGranted(res);
        }, 1200);
      } else {
        setErrorMsg(res.message || 'Access token is invalid or expired.');
      }
    } catch {
      setErrorMsg('Verification failed. Please verify your connection.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRequestAccess = () => {
    setIsRequestModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#070A14] text-slate-200 flex flex-col items-center justify-center p-4 relative overflow-hidden select-none">
      {/* Background Ambient Celestial Blur */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-amber-500/10 rounded-full blur-[140px] animate-pulse" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-lg bg-slate-900/80 backdrop-blur-xl border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-6"
      >
        {/* Emblem & Title */}
        <div className="space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center mx-auto shadow-inner">
            <PrernaEmblem size={38} animate={true} />
          </div>

          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider border border-indigo-400/30">
              <ShieldCheck size={13} className="text-emerald-400" />
              <span>Closed Pilot • Restricted Access Gate</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              PRERNA <span className="text-indigo-400">प्रेरणा</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm max-w-sm mx-auto leading-relaxed">
              Adolescent Self-Discovery & Sovereign Wellbeing Sanctuary. Access is currently restricted to approved pilot cohorts.
            </p>
          </div>
        </div>

        {/* Success Banner */}
        {successResult && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-4 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-3 text-left"
          >
            <CheckCircle2 size={24} className="text-emerald-400 flex-shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <p className="font-bold text-sm text-white">Access Granted</p>
                <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-mono">
                  🔒 Device Locked
                </span>
              </div>
              <p className="text-emerald-300/90 mt-0.5">{successResult.message}</p>
            </div>
          </motion.div>
        )}

        {/* Token Input Form */}
        {!successResult && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleVerify();
            }}
            className="space-y-3"
          >
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Key size={16} />
              </div>
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value.toUpperCase())}
                placeholder="ENTER INVITE TOKEN (e.g. PRN-XXXX-XXXX)"
                disabled={isVerifying}
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30 rounded-2xl text-white placeholder-slate-500 text-xs sm:text-sm font-mono tracking-wider transition-all outline-none"
              />
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2 text-left"
              >
                <AlertCircle size={15} className="text-rose-400 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isVerifying || !tokenInput.trim()}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
            >
              {isVerifying ? (
                <>
                  <RefreshCw size={16} className="animate-spin text-white" />
                  <span>Verifying via Supabase...</span>
                </>
              ) : (
                <>
                  <span>Unlock Sanctuary Access</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
          <button
            onClick={handleRequestAccess}
            className="hover:text-indigo-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Mail size={13} className="text-indigo-400" />
            <span>Request Invite Token</span>
          </button>

          <button
            onClick={() => setShowConfigHelp(!showConfigHelp)}
            className="hover:text-slate-200 transition-colors flex items-center gap-1 text-[11px] text-slate-500 cursor-pointer"
          >
            <Database size={12} />
            <span>{sovereignSupabase.isConfigured() ? '🟢 Supabase Connected' : '⚪ Supabase Configuration'}</span>
          </button>
        </div>

        {/* Developer / Admin Supabase Helper Drawer */}
        {showConfigHelp && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="text-left bg-slate-950 p-4 rounded-2xl border border-slate-800 text-[11px] space-y-2 text-slate-400 font-sans"
          >
            <p className="font-bold text-white flex items-center gap-1.5">
              <span>Supabase Cloud Status:</span>
              <span className={sovereignSupabase.isConfigured() ? 'text-emerald-400' : 'text-amber-400'}>
                {sovereignSupabase.isConfigured() ? 'Active & Live' : 'Pending Env Setup'}
              </span>
            </p>
            <p>
              To manage tokens live from your Supabase dashboard, supply your project's <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> in GitHub Actions or your <code>.env.local</code>.
            </p>
            <p className="text-slate-500">
              PRERNA Sovereign Gatekeeper • Cryptographic tokens are authenticated atomically and bound to physical devices.
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* In-App Beta Access Request Modal */}
      <RequestAccessModal
        isOpen={isRequestModalOpen}
        onClose={() => setIsRequestModalOpen(false)}
      />
    </div>
  );
};
