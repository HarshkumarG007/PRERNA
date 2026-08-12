import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Sparkles, Check, AlertCircle, User, MapPin, Lock } from 'lucide-react';
import { useAppStore, SignupData } from '../../store';
import { generateProofOfWork } from '../../utils/proofOfWork';
import { safeInvoke as invoke } from '../../utils/mockBackend';

interface AuthModalProps {
  mode: 'signup' | 'login';
  initialLoginMode?: 'pin' | 'full';
  onClose: () => void;
  onSuccess?: (userId: string) => void;
}

// Total signup steps: 1=Identity, 2=Location & Contact, 3=Account Security, 4=MFA


const stepConfig = [
  { icon: <User size={20} />, title: 'Who are you?', color: 'from-violet-500 to-fuchsia-500' },
  { icon: <MapPin size={20} />, title: 'Where are you?', color: 'from-cyan-500 to-blue-500' },
  { icon: <Lock size={20} />, title: 'Secure your space', color: 'from-emerald-500 to-teal-500' },
  { icon: <Sparkles size={20} />, title: 'Two-Factor Setup', color: 'from-amber-500 to-orange-500' },
];

export const AuthModal: React.FC<AuthModalProps> = ({ mode: initialMode, initialLoginMode, onClose }) => {
  const [mode, setMode] = useState(initialMode);
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState<{ secret: string; qr_code_svg: string } | null>(null);
  const [mfaToken, setMfaToken] = useState('');
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [powStatus, setPowStatus] = useState<string | null>(null);
  
  const [loginMode, setLoginMode] = useState<'pin' | 'full'>(
    initialLoginMode || (localStorage.getItem('prerna_last_user') ? 'pin' : 'full')
  );
  
  // Form data — now includes full profile
  const [formData, setFormData] = useState<Partial<SignupData>>({
    username: '',
    passwordInput: '',
    ageRange: undefined,
    region: '',
    language: 'en',
    pin: '',
    name: '',
    gender: undefined,
    dateOfBirth: '',
    country: 'India',
    state: '',
    city: '',
    email: '',
    phone: '',
  });

  const { signup, login, loginWithCredentials } = useAppStore();

  const validatePin = async () => {
    const userId = localStorage.getItem('prerna_last_user');
    if (!userId) {
      setError('No previous user found. Please sign up or log in with credentials.');
      return false;
    }
    const storedPin = localStorage.getItem(`prerna_pin_${userId}`);
    if (storedPin !== formData.pin) {
      setError('Incorrect PIN. Please try again.');
      return false;
    }
    return true;
  };

  const canProceed = () => {
    if (mode === 'login') {
       if ((loginMode as any) === 'mfa') return mfaToken && mfaToken.length === 6;
       if (loginMode === 'pin') return formData.pin && formData.pin.length >= 4;
       return formData.username && formData.passwordInput && formData.passwordInput.length > 0;
    }
    if (step === 1) return formData.name && formData.gender && formData.dateOfBirth && formData.ageRange;
    if (step === 2) return formData.country && formData.state && formData.email;
    if (step === 3) return formData.username && formData.passwordInput && formData.pin && formData.pin.length >= 4;
    if (step === 4) return mfaToken && mfaToken.length === 6;
    return false;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    setPowStatus(null);
    
    try {
      if (mode === 'signup') {
        if (step < 3) {
          setStep(step + 1);
          setIsLoading(false);
          return;
        }
        
        if (step === 3) {
          if (!formData.username || !formData.passwordInput || !formData.ageRange || !formData.pin) {
            throw new Error('Please complete all required fields');
          }
          
          setPowStatus('Generating security proof... (Bot Protection)');
          await generateProofOfWork(4);
          setPowStatus('Proof generated. Creating account...');
          
          const userId = await signup(formData as SignupData);
          setTempUserId(userId);
          
          const mfaData = await invoke<{ secret: string; qr_code_svg: string }>('generate_mfa_secret', { userId });
          setMfaSetupData(mfaData);
          setStep(4);
          setIsLoading(false);
          return;
        }

        if (step === 4) {
          if (!tempUserId || !mfaToken || mfaToken.length < 6) {
            throw new Error('Please enter a valid 6-digit code');
          }
          
          const isValid = await invoke<boolean>('verify_mfa_setup', { 
            userId: tempUserId, 
            token: mfaToken 
          });
          
          if (!isValid) throw new Error('Invalid code. Please try again.');
          
          await login(tempUserId);
          onClose();
          return;
        }
      } else {
        if (loginMode === 'pin') {
          const isValid = await validatePin();
          if (!isValid) { setIsLoading(false); return; }
          const userId = localStorage.getItem('prerna_last_user')!;
          await login(userId);
          onClose();
        } else if (loginMode === 'full') {
          if (!formData.username || !formData.passwordInput) {
             throw new Error('Please enter username and password');
          }
          const response = await loginWithCredentials(formData.username, formData.passwordInput);
          if (typeof response === 'object' && response?.mfaRequired) {
             setTempUserId(response.userId);
             setLoginMode('mfa' as any);
             setIsLoading(false);
             return;
          }
          onClose();
        } else if ((loginMode as any) === 'mfa') {
          if (!mfaToken || mfaToken.length < 6) throw new Error('Please enter a valid 6-digit code');
          const user = await invoke<any>('verify_login_mfa', { userId: tempUserId, token: mfaToken });
          if (user) {
            localStorage.setItem('prerna_last_user', user.id);
            await login(user.id);
            onClose();
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setIsLoading(false);
    }
  };

  const currentStepConfig = stepConfig[step - 1];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-lg bg-[#0b1120] rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]"
      >
        {/* Ambient glow */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-violet-500/10 rounded-full blur-[80px] pointer-events-none" />

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-500/10 border-b border-red-500/20 p-3 flex items-center gap-2 text-red-400 flex-shrink-0 z-10 relative"
            >
              <AlertCircle size={16} />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="relative p-6 pb-4 flex-shrink-0 z-10">
          <button
            onClick={onClose}
            aria-label="Close authentication modal"
            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={18} />
          </button>
          
          {mode === 'signup' ? (
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${currentStepConfig?.color || 'from-violet-500 to-fuchsia-500'} flex items-center justify-center text-white shadow-lg flex-shrink-0`}>
                {currentStepConfig?.icon}
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight">
                  {step === 4 ? 'Secure Your Account' : currentStepConfig?.title}
                </h2>
                <p className="text-sm text-white/40 font-medium">
                  {step < 4 ? `Step ${step} of 3` : 'Final Step'}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
                <Sparkles className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Welcome Back</h2>
                <p className="text-sm text-white/50">
                  {loginMode === 'pin' ? 'Enter your PIN to continue' : ((loginMode as any) === 'mfa' ? 'Two-Factor Authentication' : 'Enter your credentials')}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto custom-scrollbar flex-1 relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={`${mode}-${step}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {mode === 'signup' ? (
                <SignupFlow
                  step={step}
                  formData={formData}
                  setFormData={setFormData}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  mfaSetupData={mfaSetupData}
                  mfaToken={mfaToken}
                  setMfaToken={setMfaToken}
                />
              ) : (
                <LoginForm 
                  loginMode={loginMode}
                  setLoginMode={setLoginMode}
                  formData={formData}
                  setFormData={setFormData}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  switchToSignup={() => { setMode('signup'); setStep(1); }}
                  mfaToken={mfaToken}
                  setMfaToken={setMfaToken}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex-shrink-0 relative z-10">
          <button
            onClick={handleSubmit}
            disabled={!canProceed() || isLoading}
            className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-bold text-white shadow-lg shadow-violet-500/20 disabled:opacity-40 transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2"
          >
            {powStatus || (isLoading ? 'Processing...' : (
              mode === 'login' ? 'Log In' : 
              step === 4 ? 'Verify & Complete →' : 
              step === 3 ? 'Create Account →' : 
              'Continue →'
            ))}
          </button>
          
          {mode === 'signup' && step > 1 && step < 4 && (
            <button
              onClick={() => setStep(step - 1)}
              className="w-full mt-3 py-2 text-white/40 hover:text-white text-sm transition-colors"
            >
              ← Back
            </button>
          )}
          
          {mode === 'login' && loginMode === 'pin' && (
            <button
              onClick={() => setLoginMode('full')}
              className="w-full mt-4 text-center text-white/40 text-sm hover:text-white transition-colors"
            >
              Log in with Username & Password instead
            </button>
          )}
        </div>

        {/* Progress Bar */}
        {mode === 'signup' && step < 4 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
              animate={{ width: `${(step / 3) * 100}%` }}
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

// ─── Input helper ───────────────────────────────────────────────────────────
const Field: React.FC<{
  label: string;
  required?: boolean;
  children: React.ReactNode;
}> = ({ label, required, children }) => (
  <div>
    <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">
      {label}{required && <span className="text-rose-400 ml-1">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-violet-500 focus:outline-none transition-colors text-sm";
const selectCls = `${inputCls} appearance-none`;

// ─── Signup Flow ─────────────────────────────────────────────────────────────
const SignupFlow: React.FC<{
  step: number;
  formData: Partial<SignupData>;
  setFormData: (data: Partial<SignupData>) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  mfaSetupData: { secret: string; qr_code_svg: string } | null;
  mfaToken: string;
  setMfaToken: (token: string) => void;
}> = ({ step, formData, setFormData, showPassword, setShowPassword, mfaSetupData, mfaToken, setMfaToken }) => {

  // ── Step 1: Identity ─────────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="space-y-5 pt-2">
        <Field label="Full Name" required>
          <input
            type="text"
            value={formData.name || ''}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className={inputCls}
            placeholder="Enter your full name"
            autoFocus
          />
        </Field>

        <Field label="Gender" required>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'male', label: '♂ Male' },
              { value: 'female', label: '♀ Female' },
              { value: 'non-binary', label: '⚧ Non-binary' },
              { value: 'prefer-not-to-say', label: '🔒 Prefer not to say' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setFormData({ ...formData, gender: opt.value as any })}
                className={`p-3 rounded-xl border text-sm font-medium transition-all text-left ${
                  formData.gender === opt.value
                    ? 'border-violet-500 bg-violet-500/20 text-white'
                    : 'border-white/10 bg-white/5 text-white/60 hover:border-white/30'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Date of Birth" required>
          <input
            type="date"
            value={formData.dateOfBirth || ''}
            onChange={(e) => {
              const dob = e.target.value;
              // Auto-calculate age range
              const age = new Date().getFullYear() - new Date(dob).getFullYear();
              const ageRange = age <= 15 ? '13-15' : age <= 18 ? '16-18' : '19-22';
              setFormData({ ...formData, dateOfBirth: dob, ageRange });
            }}
            className={inputCls}
            max={new Date(new Date().setFullYear(new Date().getFullYear() - 13)).toISOString().split('T')[0]}
          />
          {formData.ageRange && (
            <p className="text-emerald-400 text-xs mt-1 font-medium flex items-center gap-1">
              <Check size={12} /> Detected age group: {formData.ageRange}
            </p>
          )}
        </Field>
      </div>
    );
  }

  // ── Step 2: Location & Contact ─────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="space-y-5 pt-2">
        <Field label="Country" required>
          <select
            value={formData.country || 'India'}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            className={selectCls}
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c} className="bg-slate-900">{c}</option>
            ))}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="State / Province" required>
            <select
              value={formData.state || ''}
              onChange={(e) => setFormData({ ...formData, state: e.target.value, region: e.target.value })}
              className={selectCls}
            >
              <option value="" className="bg-slate-900">Select state...</option>
              {(formData.country === 'India' ? INDIAN_STATES : GLOBAL_STATES).map((s) => (
                <option key={s} value={s} className="bg-slate-900">{s}</option>
              ))}
            </select>
          </Field>
          <Field label="City">
            <input
              type="text"
              value={formData.city || ''}
              onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              className={inputCls}
              placeholder="Your city"
            />
          </Field>
        </div>

        <Field label="Email Address" required>
          <input
            type="email"
            value={formData.email || ''}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            className={inputCls}
            placeholder="you@example.com"
          />
        </Field>

        <Field label="Phone Number">
          <input
            type="tel"
            value={formData.phone || ''}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/[^0-9+\-\s]/g, '') })}
            className={inputCls}
            placeholder="+91 98765 43210"
          />
        </Field>

        <Field label="Preferred Language" required>
          <div className="grid grid-cols-3 gap-2">
            {LANGUAGES.map((lang) => (
              <button
                key={lang.code}
                type="button"
                onClick={() => setFormData({ ...formData, language: lang.code })}
                className={`p-2.5 rounded-xl border flex flex-col items-center transition-all text-xs ${
                  formData.language === lang.code
                    ? 'bg-cyan-500/20 border-cyan-500 text-white'
                    : 'bg-white/5 border-white/10 text-white/60 hover:border-white/30'
                }`}
              >
                <span className="font-bold">{lang.native}</span>
                <span className="opacity-60">{lang.label}</span>
              </button>
            ))}
          </div>
        </Field>
      </div>
    );
  }

  // ── Step 3: Account Security ────────────────────────────────────────────
  if (step === 3) {
    return (
      <div className="space-y-5 pt-2">
        <div className="p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl mb-2">
          <p className="text-violet-200 text-sm font-medium">
            Hi <strong>{formData.name?.split(' ')[0]}</strong>! Choose a username and strong password to protect your private PRERNA space.
          </p>
        </div>

        <Field label="Username" required>
          <input
            type="text"
            value={formData.username || ''}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            className={inputCls}
            placeholder="Choose a unique username"
            autoFocus
          />
        </Field>

        <Field label="Password" required>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.passwordInput || ''}
              onChange={(e) => setFormData({ ...formData, passwordInput: e.target.value })}
              className={inputCls + ' pr-12'}
              placeholder="Create a strong password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              aria-pressed={showPassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </Field>

        <Field label="Quick-Access PIN (4–6 digits)" required>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.pin || ''}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 6) })}
              className={`${inputCls} text-center text-xl tracking-[0.5em] font-mono pr-12`}
              placeholder="••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Hide PIN" : "Show PIN"}
              aria-pressed={showPassword}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <p className="text-white/30 text-xs mt-1">This PIN unlocks your data on this device only</p>
        </Field>

        <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Check className="text-emerald-400 flex-shrink-0 mt-0.5" size={16} />
            <p className="text-emerald-200 text-xs leading-relaxed">
              Your data stays encrypted on this device. No cloud storage. No tracking. You own everything.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 4: MFA Setup ───────────────────────────────────────────────────
  if (step === 4 && mfaSetupData) {
    return (
      <div className="space-y-4 text-center pt-2">
        <div className="bg-white p-4 rounded-2xl inline-block shadow-lg" dangerouslySetInnerHTML={{ __html: mfaSetupData.qr_code_svg }} />
        <div className="space-y-2 mt-4">
          <p className="text-sm text-white/70">Scan this QR Code with <strong className="text-white">Google Authenticator</strong> or Authy.</p>
          <p className="text-xs text-violet-400 font-mono font-bold tracking-widest bg-violet-500/10 px-4 py-2 rounded-lg inline-block">{mfaSetupData.secret}</p>
        </div>
        <div className="mt-4">
          <input
            type="text"
            maxLength={6}
            placeholder="000000"
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-center text-white placeholder-white/20 text-2xl tracking-widest focus:outline-none focus:border-violet-500 transition-colors font-mono"
            value={mfaToken}
            onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ''))}
          />
        </div>
      </div>
    );
  }

  return null;
};

// ─── Login Form ────────────────────────────────────────────────────────────
const LoginForm: React.FC<{
  loginMode: 'pin' | 'full';
  setLoginMode: (mode: 'pin' | 'full') => void;
  formData: Partial<SignupData>;
  setFormData: (data: Partial<SignupData>) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  switchToSignup: () => void;
  mfaToken: string;
  setMfaToken: (token: string) => void;
}> = ({ loginMode, formData, setFormData, showPassword, setShowPassword, switchToSignup, mfaToken, setMfaToken }) => {
  if ((loginMode as any) === 'mfa') {
    return (
      <div className="space-y-4 text-center pt-2">
        <div className="w-16 h-16 mx-auto rounded-full bg-violet-500/20 flex items-center justify-center">
          <Sparkles className="text-violet-400" size={32} />
        </div>
        <p className="text-sm text-white/70">Enter the 6-digit code from your authenticator app.</p>
        <input
          type="text"
          maxLength={6}
          placeholder="000000"
          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-4 text-center text-white placeholder-white/20 text-2xl tracking-widest focus:outline-none focus:border-violet-500 transition-colors font-mono"
          value={mfaToken}
          onChange={(e) => setMfaToken(e.target.value.replace(/\D/g, ''))}
        />
      </div>
    );
  }

  if (loginMode === 'pin') {
    return (
      <div className="space-y-5 pt-2">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
            <Sparkles className="text-white" size={32} />
          </div>
          <h3 className="text-lg font-bold text-white">Welcome back</h3>
          <p className="text-white/50 text-sm">Enter your PIN to unlock</p>
        </div>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.pin || ''}
            onChange={(e) => setFormData({ ...formData, pin: e.target.value.replace(/\D/g, '').slice(0, 6)})}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl tracking-widest focus:border-violet-500 focus:outline-none font-mono"
            placeholder="••••"
            autoFocus
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide PIN" : "Show PIN"}
            aria-pressed={showPassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pt-2">
      <div>
        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Username</label>
        <input
          type="text"
          value={formData.username || ''}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-violet-500 focus:outline-none transition-colors text-sm"
          placeholder="Enter your username"
          autoFocus
        />
      </div>
      <div>
        <label className="block text-xs font-bold text-white/50 uppercase tracking-widest mb-2">Password</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.passwordInput || ''}
            onChange={(e) => setFormData({ ...formData, passwordInput: e.target.value })}
            className="w-full p-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/20 focus:border-violet-500 focus:outline-none transition-colors text-sm pr-12"
            placeholder="Enter your password"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            aria-pressed={showPassword}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>
      <div className="pt-2 text-center">
        <button type="button" onClick={switchToSignup} className="text-violet-400 hover:text-violet-300 text-sm font-medium transition-colors">
          Don't have an account? Sign up
        </button>
      </div>
    </div>
  );
};

// ─── Data ──────────────────────────────────────────────────────────────────
const COUNTRIES = [
  'India', 'United States', 'United Kingdom', 'Canada', 'Australia',
  'Germany', 'France', 'Singapore', 'UAE', 'Other'
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi',
];

const GLOBAL_STATES = [
  'North', 'South', 'East', 'West', 'Central', 'Other'
];

const LANGUAGES = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'hi', label: 'Hindi', native: 'हिंदी' },
  { code: 'ta', label: 'Tamil', native: 'தமிழ்' },
  { code: 'te', label: 'Telugu', native: 'తెలుగు' },
  { code: 'mr', label: 'Marathi', native: 'मराठी' },
  { code: 'bn', label: 'Bengali', native: 'বাংলা' },
];
