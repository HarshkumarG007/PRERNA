import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, ShieldAlert } from 'lucide-react';

interface ClinicianLoginProps {
  onSuccess: () => void;
}

export const ClinicianLogin: React.FC<ClinicianLoginProps> = ({ onSuccess }) => {
  const [passcode, setPasscode] = useState('');
  const [error, setError] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // HARDCODED SECURE PROTOTYPE KEY
    if (passcode === 'CLINICIAN-007') {
      onSuccess();
    } else {
      setError(true);
      setPasscode('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
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
        <p className="text-slate-400 text-center mb-8">Authorized Personnel Only</p>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-slate-400 text-sm font-medium mb-2">Access Key</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
              <input
                type="password"
                value={passcode}
                onChange={(e) => { setPasscode(e.target.value); setError(false); }}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                placeholder="Enter clinical access key..."
              />
            </div>
            {error && <p className="text-red-400 text-sm mt-2">Invalid access key.</p>}
          </div>
          
          <button
            type="submit"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-xl transition-colors shadow-lg shadow-red-900/50"
          >
            Authenticate
          </button>
        </form>
      </motion.div>
    </div>
  );
};
