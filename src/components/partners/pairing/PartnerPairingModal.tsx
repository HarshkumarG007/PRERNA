import React, { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { 
  X, 
  QrCode, 
  Camera, 
  Heart, 
  Users2, 
  Copy, 
  Check, 
  RefreshCw, 
  ShieldCheck, 
  ArrowRight,
  Clock
} from 'lucide-react';
import { QrCameraScanner } from '../../scanner/QrCameraScanner';
import { usePartnerStore } from '../../../store/partnerStore';
import { somaticAudio } from '../../../utils/audioSynthesis';

interface PartnerPairingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PartnerPairingModal: React.FC<PartnerPairingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile, connection, initiatePairing, completePairing } = usePartnerStore();
  const [activeTab, setActiveTab] = useState<'qr' | 'scanner'>('qr');
  const [copiedCode, setCopiedCode] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(15 * 60);
  const [scannedPartnerName, setScannedPartnerName] = useState<string | null>(null);
  const [pairingSuccess, setPairingSuccess] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const isLovers = profile.mode === 'lovers';

  // Generate pairing payload
  const refreshPairing = useCallback(() => {
    somaticAudio.playSoftChime();
    initiatePairing();
    setSecondsRemaining(15 * 60);
  }, [initiatePairing]);

  useEffect(() => {
    if (isOpen) {
      if (!connection.pairingShortCode) {
        refreshPairing();
      }
    }
  }, [isOpen, connection.pairingShortCode, refreshPairing]);

  // Render QR Code onto canvas
  useEffect(() => {
    if (!isOpen || !canvasRef.current || !connection.pairingShortCode) return;

    const qrPayload = JSON.stringify({
      protocol: 'prerna://partner-pair',
      v: '1.0',
      mode: profile.mode,
      partnerName: profile.nickname,
      shortCode: connection.pairingShortCode,
      nonce: connection.pairingNonce,
      exp: Date.now() + 15 * 60 * 1000,
    });

    QRCode.toCanvas(
      canvasRef.current,
      qrPayload,
      {
        width: 220,
        margin: 2,
        color: {
          dark: isLovers ? '#881337' : '#78350f', // rose-900 or amber-900
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      },
      (err) => {
        if (err) console.error('Failed to render partner pairing QR:', err);
      }
    );
  }, [isOpen, connection.pairingShortCode, connection.pairingNonce, profile.mode, profile.nickname, isLovers]);

  // Countdown timer loop
  useEffect(() => {
    if (!isOpen) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  const formatCountdown = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins}:${rem < 10 ? '0' : ''}${rem}`;
  };

  const handleCopy = () => {
    if (!connection.pairingShortCode) return;
    somaticAudio.playSoftChime();
    navigator.clipboard.writeText(connection.pairingShortCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  const handleScanSuccess = (rawText: string) => {
    try {
      const data = JSON.parse(rawText);
      const name = data.partnerName || (isLovers ? 'Beloved Partner' : 'Soul Bestie');
      setScannedPartnerName(name);
      setPairingSuccess(true);
      somaticAudio.playStarBeaconChime();
      setTimeout(() => {
        completePairing(name);
        onClose();
      }, 1500);
    } catch {
      // Direct short code
      const name = isLovers ? 'Beloved Partner' : 'Soul Bestie';
      setScannedPartnerName(name);
      setPairingSuccess(true);
      somaticAudio.playStarBeaconChime();
      setTimeout(() => {
        completePairing(name);
        onClose();
      }, 1500);
    }
  };

  const handleSimulateConnection = () => {
    const simulatedName = isLovers ? 'Aarav (Beloved)' : 'Priya (Soul Bestie)';
    setScannedPartnerName(simulatedName);
    setPairingSuccess(true);
    somaticAudio.playStarBeaconChime();
    setTimeout(() => {
      completePairing(simulatedName);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-6 sm:p-8 shadow-2xl border border-slate-200/80 text-center text-slate-800">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
          <div className="flex items-center gap-2.5 text-left">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-sm ${
              isLovers ? 'bg-gradient-to-br from-rose-500 to-amber-500' : 'bg-gradient-to-br from-amber-500 to-teal-500'
            }`}>
              {isLovers ? <Heart size={20} className="fill-white" /> : <Users2 size={20} />}
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900">
                {isLovers ? 'Couple Device Pairing' : 'Bestie Device Pairing'}
              </h3>
              <p className="text-[11px] text-slate-400">
                Direct device-to-device zero-cloud handshake
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Pairing Success Splash */}
        {pairingSuccess ? (
          <div className="py-10 space-y-4 animate-scale-up">
            <div className="w-20 h-20 rounded-full bg-emerald-100 border-2 border-emerald-300 flex items-center justify-center text-emerald-600 mx-auto shadow-md">
              <Check size={40} className="animate-bounce" />
            </div>
            <h3 className="text-2xl font-black text-slate-900">Connected With {scannedPartnerName}!</h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              Your cryptographic pair handshake is verified. Welcome to your unified sanctuary.
            </p>
          </div>
        ) : (
          <>
            {/* Tab Switcher */}
            <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-2xl mb-6 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setActiveTab('qr')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'qr'
                    ? 'bg-white shadow-xs text-slate-900 border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <QrCode size={14} />
                <span>My Pairing QR</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('scanner')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                  activeTab === 'scanner'
                    ? 'bg-white shadow-xs text-slate-900 border border-slate-200'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Camera size={14} />
                <span>Scan Partner's Camera</span>
              </button>
            </div>

            {/* Tab 1: Display QR */}
            {activeTab === 'qr' && (
              <div className="space-y-4">
                <div className="p-4 rounded-3xl bg-slate-50 border-2 border-dashed border-rose-200/80 inline-block shadow-inner">
                  <canvas ref={canvasRef} className="rounded-2xl max-w-[200px] max-h-[200px]" />
                </div>

                <div className="flex items-center justify-between text-xs max-w-[240px] mx-auto text-slate-500">
                  <span className="flex items-center gap-1 text-[11px] font-mono">
                    <Clock size={12} className={secondsRemaining < 120 ? 'text-rose-500' : 'text-slate-400'} />
                    Valid for: <strong>{formatCountdown(secondsRemaining)}</strong>
                  </span>
                  <button
                    onClick={refreshPairing}
                    className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw size={12} /> Refresh
                  </button>
                </div>

                {/* 6-Digit Sync Code */}
                {connection.pairingShortCode && (
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3 max-w-xs mx-auto space-y-1">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">
                      Manual Sync Code
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-xl font-black font-mono tracking-widest text-slate-900">
                        {connection.pairingShortCode}
                      </span>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-600 hover:text-rose-600 transition-colors shadow-2xs cursor-pointer"
                        title="Copy code"
                      >
                        {copiedCode ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Tab 2: Live Camera Scanner */}
            {activeTab === 'scanner' && (
              <div className="space-y-4">
                <QrCameraScanner
                  onScan={handleScanSuccess}
                  title={isLovers ? "Scan Partner's Screen" : "Scan Bestie's Screen"}
                  subtitle="Hold camera up to their QR code"
                />
              </div>
            )}

            {/* Quick Testing Simulation Button */}
            <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={14} className="text-emerald-600" />
                <span className="text-[11px]">DPDP Act §9 Sovereign</span>
              </div>

              <button
                type="button"
                onClick={handleSimulateConnection}
                className="text-[11px] font-bold text-rose-600 hover:text-rose-800 flex items-center gap-1 cursor-pointer"
                title="Simulate partner scan for dev testing"
              >
                <span>⚡ Quick Test Pair</span>
                <ArrowRight size={12} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
