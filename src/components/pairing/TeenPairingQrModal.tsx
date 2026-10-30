import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  RefreshCw, 
  Copy, 
  Check, 
  ShieldCheck, 
  Smartphone, 
  QrCode,
  Clock,
  ArrowRight
} from 'lucide-react';
import { 
  generatePairingPayload, 
  encodePairingQrData, 
  PairingPayload, 
  getStoredPairingRequest 
} from '../../utils/pairingProtocol';
import { somaticAudio } from '../../utils/audioSynthesis';
import { useUser } from '../../store';

interface TeenPairingQrModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateSuccess?: () => void;
}

export const TeenPairingQrModal: React.FC<TeenPairingQrModalProps> = ({
  isOpen,
  onClose,
  onSimulateSuccess,
}) => {
  const user = useUser();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [payload, setPayload] = useState<PairingPayload | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState<number>(15 * 60);

  // Initialize or reload pairing payload
  const refreshPayload = useCallback(() => {
    somaticAudio.playSoftChime();
    if (!user) return;
    const existing = getStoredPairingRequest();
    if (existing && existing.teenId === user.id && Date.now() < existing.exp) {
      setPayload(existing);
      setSecondsRemaining(Math.max(0, Math.floor((existing.exp - Date.now()) / 1000)));
    } else {
      const fresh = generatePairingPayload(user);
      setPayload(fresh);
      setSecondsRemaining(15 * 60);
    }
  }, [user]);

  useEffect(() => {
    if (isOpen) {
      refreshPayload();
    }
  }, [isOpen, refreshPayload]);

  // Render QR code to canvas whenever payload changes
  useEffect(() => {
    if (!payload || !canvasRef.current) return;

    const qrData = encodePairingQrData(payload);
    QRCode.toCanvas(
      canvasRef.current,
      qrData,
      {
        width: 240,
        margin: 2,
        color: {
          dark: '#0f172a', // slate-900
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (error) => {
        if (error) console.error('Failed to render QR Code:', error);
      }
    );
  }, [payload]);

  // Countdown timer loop
  useEffect(() => {
    if (!isOpen || !payload) return;

    const timer = setInterval(() => {
      const diff = Math.max(0, Math.floor((payload.exp - Date.now()) / 1000));
      setSecondsRemaining(diff);
      if (diff <= 0) {
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, payload]);

  if (!isOpen) return null;

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainingSecs = secs % 60;
    return `${mins}:${remainingSecs < 10 ? '0' : ''}${remainingSecs}`;
  };

  const handleCopyCode = () => {
    if (!payload) return;
    somaticAudio.playSoftChime();
    navigator.clipboard.writeText(payload.shortCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleSimulateScan = () => {
    somaticAudio.playStarBeaconChime();
    if (onSimulateSuccess) {
      onSimulateSuccess();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden flex flex-col text-slate-800">
        
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200/80 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 shadow-2xs">
              <QrCode size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-black text-sm tracking-tight text-slate-900">
                  Link Parent Sanctuary
                </h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  Secure Peer Handshake
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                Hold your screen for your parent to scan with their camera
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 rounded-full transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center text-center space-y-5">
          {/* QR Code Container with Glowing Frame */}
          <div className="relative p-4 rounded-3xl bg-slate-50 border-2 border-indigo-100 shadow-inner flex flex-col items-center justify-center group">
            <canvas ref={canvasRef} className="rounded-2xl shadow-sm max-w-[220px] max-h-[220px]" />

            {/* Expired Overlay */}
            {secondsRemaining <= 0 && (
              <div className="absolute inset-0 bg-white/95 backdrop-blur-xs rounded-3xl flex flex-col items-center justify-center p-4">
                <Clock size={32} className="text-amber-500 mb-2" />
                <h5 className="text-xs font-bold text-slate-800">Code Expired</h5>
                <p className="text-[11px] text-slate-500 mb-3">Pairing tokens expire after 15 mins for privacy.</p>
                <button
                  onClick={refreshPayload}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw size={14} /> Refresh Code
                </button>
              </div>
            )}
          </div>

          {/* Countdown & Refresh Bar */}
          <div className="flex items-center justify-between w-full max-w-[260px] px-2 text-xs">
            <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[11px]">
              <Clock size={12} className={secondsRemaining < 120 ? 'text-amber-500 animate-pulse' : 'text-slate-400'} />
              <span>Expires in: <strong>{formatCountdown(secondsRemaining)}</strong></span>
            </div>

            <button
              onClick={refreshPayload}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
              title="Generate a new pairing QR code"
            >
              <RefreshCw size={12} />
              <span>Regenerate</span>
            </button>
          </div>

          {/* 6-Digit Sync Code Fallback */}
          {payload && (
            <div className="w-full bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Or Enter 6-Digit Sync Code Manually
              </span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-2xl font-black font-mono tracking-widest text-indigo-950 px-3 py-1 bg-white rounded-xl border border-indigo-200/60 shadow-2xs">
                  {payload.shortCode}
                </span>
                <button
                  onClick={handleCopyCode}
                  className="p-2 rounded-xl bg-white hover:bg-indigo-50 text-slate-600 hover:text-indigo-600 border border-slate-200 transition-colors shadow-2xs cursor-pointer"
                  title="Copy 6-digit sync code"
                >
                  {copiedCode ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                </button>
              </div>
              {copiedCode && (
                <p className="text-[10px] font-bold text-emerald-600 animate-fade-in">
                  Sync code copied to clipboard!
                </p>
              )}
            </div>
          )}

          {/* Privacy & Legal Guarantee Notice */}
          <div className="flex items-start gap-2 text-left bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3 text-[11px] text-emerald-950">
            <ShieldCheck size={16} className="text-emerald-700 flex-shrink-0 mt-0.5" />
            <div className="space-y-0.5 leading-snug">
              <span className="font-bold text-emerald-900 block">DPDP Act 2023 §9 Zero-Cloud Guarantee</span>
              <span className="text-emerald-800/90 text-[10px] block">
                Your parent only receives aggregated wellbeing milestones and career horizons. They cannot read your personal private journal or chat transcripts.
              </span>
            </div>
          </div>
        </div>

        {/* Footer with Simulation Option */}
        <div className="px-6 py-3.5 border-t border-slate-200/80 bg-slate-50 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <Smartphone size={14} className="text-indigo-600" />
            <span className="text-[11px] font-medium">Device-to-device camera link</span>
          </div>

          <button
            onClick={handleSimulateScan}
            className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 transition-colors cursor-pointer"
            title="Simulate parent scan for testing on single device"
          >
            <span>Simulate Scan</span>
            <ArrowRight size={12} />
          </button>
        </div>

      </div>
    </div>
  );
};
