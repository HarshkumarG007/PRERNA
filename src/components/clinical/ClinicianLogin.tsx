import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert, User, KeyRound, ShieldCheck } from 'lucide-react';
import { safeInvoke as invoke } from '../../utils/mockBackend';

interface ClinicianLoginProps {
  onSuccess: () => void;
}

export const ClinicianLogin: React.FC<ClinicianLoginProps> = ({ onSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [mfaPendingUserId, setMfaPendingUserId] = useState<string | null>(null);
  const [mfaToken, setMfaToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const verifyRoleAndProceed = async (authUser: any) => {
    if (!authUser || (authUser.role !== 'reviewer' && authUser.role !== 'admin')) {
      // Fail closed: immediately clear any non-reviewer session established during check
      await invoke('logout').catch(() => {});
      setErrorMsg('Access Denied: Registered clinical reviewer credentials required.');
      return;
    }
    onSuccess();
  };

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedUser = username.trim();
    if (!trimmedUser || !password) {
      setErrorMsg('Please enter your reviewer username and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const result: any = await invoke('authenticate_user', {
        username: trimmedUser,
        passwordInput: password,
      });

      if (!result) {
        setErrorMsg('Invalid reviewer username or password.');
        setPassword('');
        return;
      }

      if (result.mfaRequired && result.userId) {
        setMfaPendingUserId(result.userId);
        return;
      }

      await verifyRoleAndProceed(result);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaPendingUserId || isLoading) return;

    const trimmedToken = mfaToken.trim();
    if (!/^\d{6}$/.test(trimmedToken)) {
      setErrorMsg('Please enter a valid 6-digit authenticator code.');
      return;
    }

    setIsLoading(true);
    setErrorMsg(null);

    try {
      const user: any = await invoke('verify_login_mfa', {
        userId: mfaPendingUserId,
        token: trimmedToken,
      });

      if (!user) {
        setErrorMsg('Invalid 2FA verification code.');
        return;
      }

      await verifyRoleAndProceed(user);
    } catch (err: any) {
      setErrorMsg(err?.message || 'MFA verification failed.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4 font-sans text-left">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-slate-800 p-8 rounded-2xl max-w-md w-full shadow-2xl border border-slate-700"
      >
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center">
            <ShieldAlert size={32} />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-white text-center mb-2">Clinical Review Portal</h2>
        <p className="text-slate-400 text-center text-sm mb-6">
          Server-Authenticated Access for Licensed Reviewers (Rule 0.3)
        </p>

        {!mfaPendingUserId ? (
          <form onSubmit={handleCredentialSubmit} className="space-y-5">
            <div>
              <label htmlFor="clinician-username" className="block text-slate-300 text-xs font-bold uppercase mb-1.5">
                Reviewer Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 text-slate-500" size={18} />
                <input
                  id="clinician-username"
                  type="text"
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setErrorMsg(null); }}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  placeholder="Enter clinical reviewer ID..."
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
            </div>

            <div>
              <label htmlFor="clinician-password" className="block text-slate-300 text-xs font-bold uppercase mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
                <input
                  id="clinician-password"
                  type="password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(null); }}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  placeholder="Enter vault password..."
                  disabled={isLoading}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {errorMsg && (
              <div role="alert" className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors shadow-lg shadow-red-900/50 text-sm cursor-pointer disabled:opacity-50"
            >
              {isLoading ? 'Verifying Session...' : 'Authenticate Reviewer'}
            </button>

            {import.meta.env.DEV && (
              <p className="text-[11px] text-slate-500 text-center">
                Dev sandbox reviewer account: <code className="text-slate-400">clinician</code>
              </p>
            )}
          </form>
        ) : (
          <form onSubmit={handleMfaSubmit} className="space-y-5">
            <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-indigo-200 text-xs flex items-center gap-2">
              <ShieldCheck size={16} className="text-indigo-400 flex-shrink-0" />
              <span>Two-factor authentication is enabled on this reviewer account.</span>
            </div>

            <div>
              <label htmlFor="clinician-mfa" className="block text-slate-300 text-xs font-bold uppercase mb-1.5">
                6-Digit TOTP Code
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-3 text-slate-500" size={18} />
                <input
                  id="clinician-mfa"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={mfaToken}
                  onChange={(e) => { setMfaToken(e.target.value.replace(/\D/g, '')); setErrorMsg(null); }}
                  className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-2.5 text-sm font-mono tracking-widest focus:outline-none focus:border-indigo-400"
                  placeholder="000000"
                  disabled={isLoading}
                />
              </div>
            </div>

            {errorMsg && (
              <div role="alert" className="p-3 rounded-xl bg-red-950/60 border border-red-500/40 text-red-300 text-xs font-medium">
                {errorMsg}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setMfaPendingUserId(null); setMfaToken(''); setErrorMsg(null); }}
                className="px-4 py-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-bold cursor-pointer"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-colors text-sm cursor-pointer disabled:opacity-50"
              >
                {isLoading ? 'Verifying 2FA...' : 'Verify & Enter Portal'}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
};
