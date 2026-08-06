import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff, Sparkles, ArrowRight, Check, AlertCircle } from 'lucide-react';
import { useAppStore, SignupData } from '../../store';

interface AuthModalProps {
  mode: 'signup' | 'login';
  onClose: () => void;
  onSuccess?: (userId: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form data
  const [formData, setFormData] = useState<Partial<SignupData>>({
    ageRange: undefined,
    region: '',
    language: 'en',
    pin: '',
  });

  const { signup, login } = useAppStore();

  const validatePin = async () => {
    const userId = localStorage.getItem('prerna_last_user');
    if (!userId) {
      setError('No previous user found. Please sign up.');
      return false;
    }
    
    const storedPin = localStorage.getItem(`prerna_pin_${userId}`);
    if (storedPin !== formData.pin) {
      setError('Incorrect PIN. Please try again.');
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      if (mode === 'signup') {
        if (!formData.ageRange || !formData.region || !formData.pin) {
          throw new Error('Please complete all fields');
        }
        
        await signup(formData as SignupData);
        // Success - modal closes via parent re-render
      } else {
        // Login
        const isValid = await validatePin();
        if (!isValid) {
          setIsLoading(false);
          return;
        }
        
        const userId = localStorage.getItem('prerna_last_user')!;
        await login(userId);
      }
      
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Authentication failed');
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    if (mode === 'login') return formData.pin && formData.pin.length >= 4;
    if (step === 1) return formData.ageRange && formData.region;
    if (step === 2) return formData.pin && formData.pin.length >= 4;
    return false;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-red-500/10 border-b border-red-500/20 p-4 flex items-center gap-2 text-red-400"
            >
              <AlertCircle size={18} />
              <span className="text-sm">{error}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Header */}
        <div className="relative p-6 pb-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
              <Sparkles className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {mode === 'signup' ? 'Create Your Space' : 'Welcome Back'}
              </h2>
              <p className="text-sm text-white/50">
                {mode === 'signup' ? `Step ${step} of 2` : 'Enter your PIN to continue'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {mode === 'signup' ? (
            <SignupFlow
              step={step}
              formData={formData}
              setFormData={setFormData}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          ) : (
            <LoginForm
              pin={formData.pin || ''}
              setPin={(pin) => setFormData(prev => ({ ...prev, pin }))}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-6 pt-0">
          {mode === 'signup' && step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!canProceed()}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
            >
              Continue
              <ArrowRight size={18} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isLoading}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-xl font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'signup' ? 'Create My Profile' : 'Unlock'}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          )}

          {mode === 'signup' && step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="w-full mt-3 py-2 text-white/50 hover:text-white text-sm transition-colors"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Progress */}
        {mode === 'signup' && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/5">
            <motion.div
              className="h-full bg-gradient-to-r from-violet-500 to-fuchsia-500"
              animate={{ width: step === 1 ? '50%' : '100%' }}
              transition={{ duration: 0.3 }}
            />
          </div>
        )}
      </motion.div>
    </div>
  );
};

// Signup Flow Component
const SignupFlow: React.FC<{
  step: number;
  formData: Partial<SignupData>;
  setFormData: (data: Partial<SignupData>) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
}> = ({ step, formData, setFormData, showPassword, setShowPassword }) => {
  if (step === 1) {
    return (
      <div className="space-y-5">
        {/* Age Range */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-3">How old are you?</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: '13-15' as const, label: '13-15', desc: 'Early teens' },
              { value: '16-18' as const, label: '16-18', desc: 'High school' },
              { value: '19-22' as const, label: '19-22', desc: 'College' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFormData({ ...formData, ageRange: option.value })}
                className={`p-4 rounded-xl border-2 transition-all ${
                  formData.ageRange === option.value
                    ? 'border-violet-500 bg-violet-500/20'
                    : 'border-white/10 hover:border-white/30 bg-white/5'
                }`}
              >
                <div className="text-white font-bold">{option.label}</div>
                <div className="text-white/50 text-xs">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Region */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-3">Where are you from?</label>
          <select
            value={formData.region}
            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-violet-500 focus:outline-none appearance-none"
          >
            <option value="" className="bg-slate-900">Select your state...</option>
            {INDIAN_STATES.map((state) => (
              <option key={state} value={state} className="bg-slate-900">{state}</option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-3">Preferred language</label>
          <div className="flex gap-3">
            {[
              { code: 'en' as const, label: 'English' },
              { code: 'hi' as const, label: 'हिंदी' },
              { code: 'ta' as const, label: 'தமிழ்' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setFormData({ ...formData, language: lang.code })}
                className={`flex-1 py-3 rounded-xl border-2 transition-all ${
                  formData.language === lang.code
                    ? 'border-violet-500 bg-violet-500/20 text-white'
                    : 'border-white/10 hover:border-white/30 text-white/70'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center mb-6">
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
          <Check className="text-white" size={32} />
        </div>
        <h3 className="text-lg font-bold text-white">Almost there!</h3>
        <p className="text-white/50 text-sm">Create a PIN to secure your data</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-white/70 mb-3">Create PIN (4-6 digits)</label>
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={formData.pin}
            onChange={(e) => setFormData({ 
              ...formData, 
              pin: e.target.value.replace(/\D/g, '').slice(0, 6) 
            })}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl tracking-widest focus:border-violet-500 focus:outline-none"
            placeholder="••••"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <p className="text-white/40 text-xs mt-2 text-center">
          This PIN unlocks your data on this device only
        </p>
      </div>

      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
        <div className="flex items-start gap-3">
          <Check className="text-emerald-400 flex-shrink-0 mt-0.5" size={16} />
          <p className="text-emerald-200 text-sm">
            Your data stays on this device. No cloud. No tracking. Complete privacy.
          </p>
        </div>
      </div>
    </div>
  );
};

// Login Form Component
const LoginForm: React.FC<{
  pin: string;
  setPin: (pin: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
}> = ({ pin, setPin, showPassword, setShowPassword }) => (
  <div className="space-y-5">
    <div className="text-center mb-6">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center">
        <Sparkles className="text-white" size={32} />
      </div>
      <h3 className="text-lg font-bold text-white">Welcome back</h3>
      <p className="text-white/50 text-sm">Enter your PIN to unlock</p>
    </div>

    <div>
      <div className="relative">
        <input
          type={showPassword ? 'text' : 'password'}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-white text-center text-2xl tracking-widest focus:border-violet-500 focus:outline-none"
          placeholder="••••"
          autoFocus
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>

    <p className="text-center text-white/40 text-sm">
      Forgot your PIN? You'll need to create a new profile.
    </p>
  </div>
);

const INDIAN_STATES = [
  'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana',
  'Uttar Pradesh', 'West Bengal', 'Gujarat', 'Rajasthan', 'Kerala',
  'Punjab', 'Haryana', 'Madhya Pradesh', 'Bihar', 'Odisha',
  'Assam', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand', 'Goa',
  'Other'
];
