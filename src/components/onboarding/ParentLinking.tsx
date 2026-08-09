import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link2, ArrowRight, ShieldCheck, ArrowLeft } from 'lucide-react';

interface ParentLinkingProps {
  onLinkSuccess: () => void;
  onBack: () => void;
}

export const ParentLinking: React.FC<ParentLinkingProps> = ({ onLinkSuccess, onBack }) => {
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'linking' | 'success' | 'error'>('idle');

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length < 6) return;
    
    setStatus('linking');
    
    // Simulate backend handshake
    setTimeout(() => {
      if (code.toUpperCase() === 'ERROR') {
        setStatus('error');
      } else {
        setStatus('success');
        setTimeout(onLinkSuccess, 1500);
      }
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden">
      {/* Ambient Frost Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-200/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6">
        <button onClick={onBack} className="absolute top-8 left-8 text-slate-500 hover:text-indigo-600 flex items-center gap-2 text-sm font-bold uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-white/80 backdrop-blur-xl rounded-[2rem] p-10 shadow-xl shadow-slate-200/50 border border-white text-center"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-cyan-100 to-indigo-100 rounded-3xl mx-auto flex items-center justify-center shadow-inner border border-cyan-200/50 mb-8">
            <Link2 size={32} className="text-indigo-600" />
          </div>

          <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Link Account</h2>
          <p className="text-slate-500 font-medium mb-8">
            Ask your teen to generate a 6-digit sync code from their Profile Dashboard.
          </p>

          <form onSubmit={handleLink} className="space-y-6">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ENTER 6-DIGIT CODE"
                maxLength={6}
                className="w-full text-center text-3xl font-black tracking-[0.5em] p-6 bg-slate-100/50 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 transition-all text-slate-800 placeholder:text-slate-300"
              />
            </div>

            {status === 'error' && (
              <p className="text-sm font-bold text-rose-500">Invalid code. Please check and try again.</p>
            )}

            <button
              type="submit"
              disabled={code.length < 6 || status === 'linking' || status === 'success'}
              className="w-full py-4 bg-gradient-to-r from-indigo-500 to-cyan-500 text-white rounded-xl font-bold flex items-center justify-center gap-3 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'idle' || status === 'error' ? (
                <>Link Securely <ArrowRight size={20} /></>
              ) : status === 'linking' ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Initiating Handshake...
                </>
              ) : (
                <>
                  <ShieldCheck size={20} /> Linked Successfully!
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-slate-100 text-sm font-medium text-slate-400">
            PRERNA uses local E2E encryption. Your teen remains in complete control of what data is shared.
          </div>
        </motion.div>
      </div>
    </div>
  );
};
