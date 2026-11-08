import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Printer, X, ShieldCheck, Scissors } from 'lucide-react';
import { somaticAudio } from '../../utils/audioSynthesis';

export interface HandoutToken {
  id: string;
  token: string;
  gradeSection: string;
  status: 'available' | 'claimed';
}

interface ClassroomHandoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: HandoutToken[];
  grade: string;
  section: string;
}

export const ClassroomHandoutModal: React.FC<ClassroomHandoutModalProps> = ({
  isOpen,
  onClose,
  tokens,
  grade,
  section,
}) => {
  const [qrMap, setQrMap] = useState<Record<string, string>>({});
  const [loadingQr, setLoadingQr] = useState(false);

  useEffect(() => {
    if (!isOpen || tokens.length === 0) return;

    let mounted = true;
    setLoadingQr(true);

    const generateQrs = async () => {
      const map: Record<string, string> = {};
      for (const t of tokens) {
        try {
          const unlockUrl = `https://harshkumarg007.github.io/PRERNA/?token=${encodeURIComponent(t.token)}`;
          map[t.token] = await QRCode.toDataURL(unlockUrl, {
            width: 140,
            margin: 1,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
          });
        } catch (e) {
          console.error('Failed to generate QR for token', t.token, e);
        }
      }
      if (mounted) {
        setQrMap(map);
        setLoadingQr(false);
      }
    };

    generateQrs();
    return () => {
      mounted = false;
    };
  }, [isOpen, tokens]);

  if (!isOpen) return null;

  const handlePrint = () => {
    somaticAudio.playStarBeaconChime();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-xs font-sans text-left">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-handouts-area, #printable-handouts-area * {
            visibility: visible;
          }
          #printable-handouts-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white !important;
            padding: 10mm;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
      `}</style>

      <div className="bg-white w-full max-w-5xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[92vh] overflow-hidden border border-slate-200">
        
        {/* Modal Top Bar (Hidden during print) */}
        <div className="no-print p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Classroom Handout Generator
              </span>
              <span className="text-xs text-slate-500 font-semibold">• {grade} - {section}</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              Printable Student Token Cards ({tokens.length} Students)
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={loadingQr}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Printer size={16} />
              <span>{loadingQr ? 'Generating Cards...' : 'Print Handouts'}</span>
            </button>
            <button
              onClick={() => {
                somaticAudio.playSoftChime();
                onClose();
              }}
              className="p-2.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div id="printable-handouts-area" className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="no-print p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-3">
            <ShieldCheck size={18} className="text-emerald-700 flex-shrink-0" />
            <span>
              <strong>Zero-Surveillance Guarantee:</strong> Hand out these cards to students randomly. No roster matches tokens to real names or roll numbers.
            </span>
          </div>

          {/* Cards Grid: 2 columns on desktop/print */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tokens.map((t, idx) => (
              <div 
                key={t.id}
                className="relative p-5 rounded-2xl border-2 border-dashed border-slate-300 bg-white hover:border-slate-400 transition-colors flex flex-col justify-between"
              >
                {/* Scissors cut indicator */}
                <div className="absolute -top-3 left-6 px-2 bg-white text-slate-400 text-[10px] flex items-center gap-1 font-mono uppercase tracking-wider">
                  <Scissors size={11} /> Cut Here
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <div className="text-[10px] font-black uppercase text-amber-600 tracking-wider">
                        PRERNA विद्यापीठ
                      </div>
                      <div className="text-xs font-bold text-slate-700">
                        Adolescent Flourishing Sanctuary
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {t.gradeSection} • Card #{idx + 1}
                    </span>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* QR Code */}
                    <div className="flex-shrink-0 p-1.5 rounded-xl border border-slate-200 bg-white shadow-2xs">
                      {qrMap[t.token] ? (
                        <img 
                          src={qrMap[t.token]} 
                          alt="Student Pairing QR" 
                          className="w-24 h-24 object-contain rounded-lg"
                        />
                      ) : (
                        <div className="w-24 h-24 bg-slate-100 animate-pulse rounded-lg" />
                      )}
                    </div>

                    {/* Token & Instructions */}
                    <div className="space-y-1.5 min-w-0">
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        Your Secret Access Token:
                      </div>
                      <div className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1.5 rounded-lg border border-slate-200 select-all break-all">
                        {t.token}
                      </div>
                      <div className="text-[10px] text-slate-500 space-y-0.5 pt-1">
                        <div>1. Visit <strong>prerna.sanctuary</strong> or scan QR</div>
                        <div>2. Enter this token on the welcome gate</div>
                        <div>3. Zero passwords • 100% Private to you</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-2 border-t border-slate-100 flex items-center justify-between text-[9px] text-slate-400">
                  <span>DPDP Act 2023 §9 Protected</span>
                  <span className="font-mono">No Email • No Phone • No Tracking</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modal Bottom Footer (Hidden during print) */}
        <div className="no-print p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Tip: Use A4 paper in portrait mode. Each printed page holds 4–6 cut-out cards.</span>
          <button
            onClick={() => {
              somaticAudio.playSoftChime();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200/60 font-bold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

