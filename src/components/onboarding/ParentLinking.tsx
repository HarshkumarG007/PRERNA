import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Link2, 
  ArrowRight, 
  ShieldCheck, 
  ArrowLeft, 
  Camera, 
  KeyRound, 
  AlertCircle,
  UserCheck
} from 'lucide-react';
import { QrCameraScanner } from '../scanner/QrCameraScanner';
import { 
  parseAndVerifyPairingPayload, 
  confirmPairingHandshake, 
  PairingPayload 
} from '../../utils/pairingProtocol';
import { somaticAudio } from '../../utils/audioSynthesis';

interface ParentLinkingProps {
  onLinkSuccess: () => void;
  onBack: () => void;
}

export const ParentLinking: React.FC<ParentLinkingProps> = ({ onLinkSuccess, onBack }) => {
  const [activeTab, setActiveTab] = useState<'camera' | 'code' | 'upload'>('camera');
  const [manualCode, setManualCode] = useState('');
  const [status, setStatus] = useState<'idle' | 'verifying' | 'verified' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [verifiedPayload, setVerifiedPayload] = useState<PairingPayload | null>(null);

  // Handle scanned raw QR code text or uploaded image text
  const handleScannedResult = (rawText: string) => {
    setStatus('verifying');
    setErrorMessage(null);

    const result = parseAndVerifyPairingPayload(rawText);

    if (result.isValid && result.payload) {
      setVerifiedPayload(result.payload);
      setStatus('verified');
      somaticAudio.playStarBeaconChime();
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Invalid or unrecognized QR code format.');
    }
  };

  // Handle manual code submission
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim().length < 6) return;

    setStatus('verifying');
    setErrorMessage(null);

    const result = parseAndVerifyPairingPayload(manualCode.trim());

    if (result.isValid && result.payload) {
      setVerifiedPayload(result.payload);
      setStatus('verified');
      somaticAudio.playStarBeaconChime();
    } else {
      setStatus('error');
      setErrorMessage(result.error || 'Invalid sync code. Please check and try again.');
    }
  };

  // Finalize pairing and transition to Parent Dashboard
  const handleConfirmPairing = () => {
    if (!verifiedPayload) return;
    confirmPairingHandshake(verifiedPayload);
    somaticAudio.playStarBeaconChime();
    setTimeout(onLinkSuccess, 600);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col relative overflow-hidden font-sans">
      {/* Ambient Frost Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-cyan-200/40 rounded-full blur-[140px]" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-200/40 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 sm:p-6">
        <button 
          onClick={onBack} 
          className="absolute top-6 left-6 text-slate-500 hover:text-indigo-600 flex items-center gap-2 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white/90 backdrop-blur-xl rounded-[2.5rem] p-6 sm:p-8 shadow-2xl shadow-indigo-500/10 border border-slate-200/80 text-center"
        >
          {/* Header Icon & Title */}
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-cyan-100 rounded-3xl mx-auto flex items-center justify-center shadow-inner border border-indigo-200/50 mb-4">
            <Link2 size={28} className="text-indigo-600" />
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mb-1">
            Link Teen Sanctuary
          </h2>
          <p className="text-slate-500 text-xs sm:text-sm font-medium mb-6 max-w-sm mx-auto">
            Scan your teen’s pairing QR code or enter their 6-digit sync code to connect.
          </p>

          {/* Mode Switcher Tabs */}
          {status !== 'verified' && (
            <div className="flex items-center justify-center gap-1.5 p-1.5 bg-slate-100/90 rounded-2xl mb-6 max-w-md mx-auto border border-slate-200/60">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('camera');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'camera'
                    ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Camera size={14} />
                <span>Camera Scanner</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveTab('code');
                  setErrorMessage(null);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'code'
                    ? 'bg-white text-indigo-900 shadow-xs border border-indigo-200/60'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <KeyRound size={14} />
                <span>Enter Code</span>
              </button>
            </div>
          )}

          {/* Content Views */}
          <AnimatePresence mode="wait">
            {/* View 1: Verified Teen Confirmation Card */}
            {status === 'verified' && verifiedPayload && (
              <motion.div
                key="verified-card"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="space-y-5 py-2"
              >
                <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-teal-500/10 to-indigo-500/10 border-2 border-emerald-400/40 text-left space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 shadow-2xs font-black text-lg">
                        {verifiedPayload.teenName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-base font-black text-slate-900">
                            {verifiedPayload.teenName}
                          </h4>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                            Verified Teen
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 font-mono">
                          ID: {verifiedPayload.teenId.substring(0, 12)}...
                        </p>
                      </div>
                    </div>

                    <div className="w-9 h-9 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-sm">
                      <UserCheck size={20} />
                    </div>
                  </div>

                  {/* Consented Sharing Scope */}
                  <div className="pt-2 border-t border-emerald-200/60">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block mb-1.5">
                      Granted Sharing Scope:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {verifiedPayload.scope.map((item, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] font-bold px-2.5 py-0.5 rounded-lg bg-white/80 text-emerald-900 border border-emerald-200 shadow-2xs"
                        >
                          ✓ {item.replace(/([A-Z])/g, ' $1').toLowerCase()}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* DPDP Section 9 Trust Notice */}
                  <div className="flex items-start gap-2 bg-white/70 p-3 rounded-2xl border border-emerald-200/50 text-[11px] text-slate-600">
                    <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                    <span>
                      Private journal entries and confidential AI mentor reflections remain strictly on your teen's device.
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleConfirmPairing}
                    className="w-full py-4 bg-gradient-to-r from-emerald-600 via-teal-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/35 cursor-pointer text-sm"
                  >
                    <span>Connect & Open Parent Hub</span>
                    <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={() => {
                      setStatus('idle');
                      setVerifiedPayload(null);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600 py-1 transition-colors cursor-pointer"
                  >
                    Scan a different code
                  </button>
                </div>
              </motion.div>
            )}

            {/* View 2: Live Camera Scanner */}
            {status !== 'verified' && activeTab === 'camera' && (
              <motion.div
                key="camera-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-4"
              >
                <QrCameraScanner
                  onScan={handleScannedResult}
                  title="Align Teen's QR Code"
                  subtitle="Keep code inside the glowing box"
                />

                {errorMessage && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-600 flex items-center gap-2 text-left animate-fade-in">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <span>{errorMessage}</span>
                  </div>
                )}
              </motion.div>
            )}

            {/* View 3: Manual 6-Digit Code Input */}
            {status !== 'verified' && activeTab === 'code' && (
              <motion.div
                key="code-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <form onSubmit={handleManualSubmit} className="space-y-5">
                  <div>
                    <input
                      type="text"
                      value={manualCode}
                      onChange={(e) => {
                        setManualCode(e.target.value.toUpperCase());
                        setErrorMessage(null);
                      }}
                      placeholder="PRN-842"
                      maxLength={7}
                      className="w-full text-center text-3xl font-black font-mono tracking-[0.3em] p-5 bg-slate-100/60 border-2 border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-900 placeholder:text-slate-300"
                    />
                    <p className="text-[11px] text-slate-400 font-medium mt-2">
                      Enter the 6-character code shown on your teen's screen.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl text-xs font-bold text-rose-600 flex items-center gap-2 text-left animate-fade-in">
                      <AlertCircle size={16} className="flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={manualCode.length < 6 || status === 'verifying'}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 via-indigo-700 to-cyan-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-sm"
                  >
                    {status === 'verifying' ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Verifying Cryptographic Handshake...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify & Link</span>
                        <ArrowRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Demo Preview Option */}
          {status !== 'verified' && (
            <div className="pt-4 mt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  handleScannedResult('DEMO99');
                }}
                className="w-full py-2.5 px-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition-colors border border-indigo-200 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>⚡ Quick Preview Mode (Explore Parent Hub Instantly)</span>
              </button>
            </div>
          )}

          <div className="mt-6 text-[11px] font-medium text-slate-400">
            PRERNA uses local E2E cryptographic handshakes. Your teen maintains full data sovereignty under India DPDP Act 2023 §9.
          </div>
        </motion.div>
      </div>
    </div>
  );
};
