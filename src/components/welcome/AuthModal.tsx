import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Eye, EyeOff, Sparkles, ArrowRight, Check } from 'lucide-react';
import { useDatabase } from '../../hooks/useDatabase';

interface AuthModalProps {
  mode: 'signup' | 'login';
  onClose: () => void;
  onSuccess: (userId: string) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ mode, onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Form data
  const [ageRange, setAgeRange] = useState('');
  const [region, setRegion] = useState('');
  const [language, setLanguage] = useState('en');
  const [pin, setPin] = useState('');
  
  const { createUser } = useDatabase();

  const handleSubmit = async () => {
    setIsLoading(true);
    
    try {
      if (mode === 'signup') {
        // Create new user
        const userId = await createUser({
          age_range: ageRange,
          region,
          language,
        });
        
        if (userId) {
          // Store PIN locally
          localStorage.setItem(`prerna_pin_${userId}`, pin);
          onSuccess(userId);
        }
      } else {
        // Login - verify PIN
        const userId = localStorage.getItem('prerna_last_user');
        if (userId) {
          const storedPin = localStorage.getItem(`prerna_pin_${userId}`);
          if (storedPin === pin) {
            onSuccess(userId);
          } else {
            alert('Invalid PIN');
            setIsLoading(false);
            return;
          }
        } else {
            // Mock fallback if user doesn't exist but has valid demo
            if (pin === '1234' || pin === '0000') {
              onSuccess('user_123'); // Demo user
            } else {
              alert('Invalid PIN');
              setIsLoading(false);
              return;
            }
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setIsLoading(false);
    }
  };

  const canProceed = () => {
    if (mode === 'login') return pin.length >= 4;
    if (step === 1) return ageRange && region && language;
    if (step === 2) return pin.length >= 4;
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />

      {/* Modal */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative w-full max-w-md bg-slate-900 rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="relative p-8 pb-0">
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-2 text-white/40 hover:text-white hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">
                {mode === 'signup' ? 'Create Profile' : 'Welcome Back'}
              </h2>
              <p className="text-sm font-medium text-white/50">
                {mode === 'signup' ? 'Your journey begins here' : 'Enter your PIN to continue'}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8">
          {mode === 'signup' ? (
            <SignupFlow
              step={step}
              ageRange={ageRange}
              setAgeRange={setAgeRange}
              region={region}
              setRegion={setRegion}
              language={language}
              setLanguage={setLanguage}
              pin={pin}
              setPin={setPin}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          ) : (
            <LoginForm
              pin={pin}
              setPin={setPin}
              showPassword={showPassword}
              setShowPassword={setShowPassword}
            />
          )}
        </div>

        {/* Footer */}
        <div className="p-8 pt-0">
          {mode === 'signup' && step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!canProceed()}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
            >
              Continue
              <ArrowRight size={20} />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isLoading}
              className="w-full py-4 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-2xl font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'signup' ? 'Create My Profile' : 'Unlock PRERNA'}
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          )}

          {mode === 'signup' && step === 2 && (
            <button
              onClick={() => setStep(1)}
              className="w-full mt-4 py-2 text-white/50 font-bold hover:text-white text-sm transition-colors"
            >
              ← Back
            </button>
          )}
        </div>

        {/* Progress Indicator */}
        {mode === 'signup' && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/5">
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
  ageRange: string;
  setAgeRange: (v: string) => void;
  region: string;
  setRegion: (v: string) => void;
  language: string;
  setLanguage: (v: string) => void;
  pin: string;
  setPin: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
}> = ({
  step,
  ageRange,
  setAgeRange,
  region,
  setRegion,
  language,
  setLanguage,
  pin,
  setPin,
  showPassword,
  setShowPassword,
}) => {
  if (step === 1) {
    return (
      <div className="space-y-6">
        {/* Age Range */}
        <div>
          <label className="block text-sm font-bold text-white/70 mb-3">How old are you?</label>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: '13-15', label: '13-15', desc: 'Early teens' },
              { value: '16-18', label: '16-18', desc: 'High school' },
              { value: '19-22', label: '19-22', desc: 'College/Early' },
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setAgeRange(option.value)}
                className={`p-3 rounded-2xl border-2 transition-all text-left ${
                  ageRange === option.value
                    ? 'border-violet-500 bg-violet-500/20'
                    : 'border-white/10 hover:border-white/30 bg-white/5'
                }`}
              >
                <div className="text-white font-bold">{option.label}</div>
                <div className="text-white/50 font-medium text-xs mt-1">{option.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Region */}
        <div>
          <label className="block text-sm font-bold text-white/70 mb-3">Where are you from?</label>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-medium focus:border-violet-500 focus:outline-none appearance-none"
          >
            <option value="" className="bg-slate-900">Select your state...</option>
            {[
              'Delhi', 'Maharashtra', 'Karnataka', 'Tamil Nadu', 'Telangana',
              'Uttar Pradesh', 'West Bengal', 'Gujarat', 'Rajasthan', 'Kerala',
              'Punjab', 'Haryana', 'Madhya Pradesh', 'Bihar', 'Odisha',
              'Assam', 'Jharkhand', 'Chhattisgarh', 'Uttarakhand', 'Goa',
              'Other'
            ].map((state) => (
              <option key={state} value={state} className="bg-slate-900">{state}</option>
            ))}
          </select>
        </div>

        {/* Language */}
        <div>
          <label className="block text-sm font-bold text-white/70 mb-3">Preferred language</label>
          <div className="flex gap-3">
            {[
              { code: 'en', label: 'English' },
              { code: 'hi', label: 'हिंदी' },
              { code: 'ta', label: 'தமிழ்' },
            ].map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`flex-1 py-3 rounded-xl font-bold border-2 transition-all ${
                  language === lang.code
                    ? 'border-violet-500 bg-violet-500/20 text-white'
                    : 'border-white/10 hover:border-white/30 text-white/70 bg-white/5'
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
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <Check className="text-emerald-400" size={32} />
        </div>
        <h3 className="text-xl font-black text-white">Almost there!</h3>
        <p className="text-white/50 font-medium mt-1">Create a PIN to secure your data</p>
      </div>

      <div>
        <label className="block text-sm font-bold text-white/70 mb-3 text-center">Create PIN (4-6 digits)</label>
        <div className="relative max-w-[240px] mx-auto">
          <input
            type={showPassword ? 'text' : 'password'}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-mono text-center text-3xl tracking-widest focus:border-violet-500 focus:outline-none focus:bg-white/10 transition-colors"
            placeholder="••••"
          />
          <button
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
          </button>
        </div>
      </div>

      <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl mt-8">
        <div className="flex items-start gap-3">
          <Check className="text-emerald-400 flex-shrink-0 mt-0.5" size={18} />
          <p className="text-emerald-200 font-medium text-sm">
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
  setPin: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
}> = ({ pin, setPin, showPassword, setShowPassword }) => (
  <div className="space-y-6">
    <div className="text-center mb-8">
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-violet-500/20 border border-violet-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
        <Sparkles className="text-violet-400" size={32} />
      </div>
      <h3 className="text-xl font-black text-white">Welcome back</h3>
      <p className="text-white/50 font-medium mt-1">Enter your PIN to unlock</p>
    </div>

    <div>
      <div className="relative max-w-[240px] mx-auto">
        <input
          type={showPassword ? 'text' : 'password'}
          value={pin}
          onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="w-full p-4 bg-white/5 border border-white/10 rounded-2xl text-white font-mono text-center text-3xl tracking-widest focus:border-violet-500 focus:outline-none focus:bg-white/10 transition-colors"
          placeholder="••••"
          autoFocus
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
        >
          {showPassword ? <EyeOff size={24} /> : <Eye size={24} />}
        </button>
      </div>
    </div>

    <p className="text-center text-white/40 font-medium text-sm mt-8">
      Forgot your PIN? For your security, you'll need to create a new profile.
    </p>
  </div>
);
