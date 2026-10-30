import React, { useState, useEffect, useRef, useCallback } from 'react';
import jsQR from 'jsqr';
import { 
  Camera, 
  FlipHorizontal, 
  Flashlight, 
  FlashlightOff, 
  AlertCircle, 
  Upload, 
  X, 
  CheckCircle2, 
  Sparkles,
  RefreshCw
} from 'lucide-react';
import { somaticAudio } from '../../utils/audioSynthesis';

interface QrCameraScannerProps {
  onScan: (scannedText: string) => void;
  onClose?: () => void;
  title?: string;
  subtitle?: string;
}

export const QrCameraScanner: React.FC<QrCameraScannerProps> = ({
  onScan,
  onClose,
  title = 'Scan Pairing QR Code',
  subtitle = 'Point your camera at the QR code displayed on the teen’s screen',
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [hasTorch, setHasTorch] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [scannedSuccess, setScannedSuccess] = useState(false);

  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);

  // Stop camera tracks cleanly
  const stopStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
  }, []);

  // Initialize camera stream
  const startCamera = useCallback(async () => {
    stopStream();
    setErrorMessage(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setHasPermission(false);
      setErrorMessage('Camera access is not supported on this browser or platform.');
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true'); // Required for iOS Safari
        await videoRef.current.play();
      }

      setHasPermission(true);

      // Check if torch/flashlight is supported on the active video track
      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        const capabilities = (videoTrack.getCapabilities ? videoTrack.getCapabilities() : {}) as any;
        if (capabilities.torch) {
          setHasTorch(true);
        }
      }
    } catch (err: any) {
      console.warn('Camera stream request failed:', err);
      setHasPermission(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMessage('Camera access was denied. Please allow camera permissions or upload a QR image.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setErrorMessage('No camera device found on this system. You can upload an image or enter the code manually.');
      } else {
        setErrorMessage('Could not open camera stream. Please try again or upload a photo.');
      }
    }
  }, [facingMode, stopStream]);

  // Toggle torch/flashlight
  const toggleTorch = async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0] as any;
    if (track && track.applyConstraints) {
      try {
        const nextState = !torchOn;
        await track.applyConstraints({
          advanced: [{ torch: nextState }],
        });
        setTorchOn(nextState);
      } catch (e) {
        console.warn('Torch constraint error:', e);
      }
    }
  };

  // Flip between front and rear cameras
  const toggleCameraFacing = () => {
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
  };

  // Process a successful detection
  const handleDetection = useCallback((detectedText: string) => {
    if (!isScanning) return;
    setIsScanning(false);
    setScannedSuccess(true);

    // Audio & Haptic confirmation
    somaticAudio.playStarBeaconChime();
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate([40, 60, 40]);
      } catch {
        // Safe fallback
      }
    }

    stopStream();

    setTimeout(() => {
      onScan(detectedText);
    }, 600);
  }, [isScanning, onScan, stopStream]);

  // Continuous frame analysis loop
  useEffect(() => {
    if (!hasPermission || !isScanning) return;

    let isProcessing = false;

    const scanFrame = () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (video && canvas && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        if (!isProcessing) {
          isProcessing = true;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (ctx) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // 1. Try BarcodeDetector if available in browser
            const BarcodeDetectorAPI = (window as any).BarcodeDetector;
            if (BarcodeDetectorAPI && typeof BarcodeDetectorAPI === 'function') {
              const detector = new BarcodeDetectorAPI({ formats: ['qr_code'] });
              detector.detect(video)
                .then((barcodes: any[]) => {
                  if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
                    handleDetection(barcodes[0].rawValue);
                  } else {
                    // Fallback to jsQR on same frame
                    const code = jsQR(imageData.data, imageData.width, imageData.height, {
                      inversionAttempts: 'dontInvert',
                    });
                    if (code && code.data) {
                      handleDetection(code.data);
                    }
                  }
                  isProcessing = false;
                })
                .catch(() => {
                  // Fallback to jsQR
                  const code = jsQR(imageData.data, imageData.width, imageData.height, {
                    inversionAttempts: 'dontInvert',
                  });
                  if (code && code.data) {
                    handleDetection(code.data);
                  }
                  isProcessing = false;
                });
            } else {
              // 2. Universal jsQR decode
              const code = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
              });
              if (code && code.data) {
                handleDetection(code.data);
              }
              isProcessing = false;
            }
          } else {
            isProcessing = false;
          }
        }
      }

      if (isScanning) {
        animationFrameId.current = requestAnimationFrame(scanFrame);
      }
    };

    animationFrameId.current = requestAnimationFrame(scanFrame);

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [hasPermission, isScanning, handleDetection]);

  // Handle uploaded image file (QR scanner fallback)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current || document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height);
          if (code && code.data) {
            handleDetection(code.data);
          } else {
            alert('No valid QR code could be read from this image. Please try a clearer picture or enter the code manually.');
          }
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopStream();
    };
  }, [startCamera, stopStream]);

  return (
    <div className="relative w-full max-w-md mx-auto bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 text-white flex flex-col">
      {/* Hidden processing canvas */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Top Header Bar */}
      <div className="px-5 py-3.5 bg-slate-900/90 backdrop-blur-md flex items-center justify-between z-20 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-400/40 flex items-center justify-center text-indigo-400">
            <Camera size={16} />
          </div>
          <div>
            <h4 className="text-xs font-black tracking-tight text-white">{title}</h4>
            <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{subtitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {hasTorch && (
            <button
              onClick={toggleTorch}
              className={`p-2 rounded-xl transition-colors cursor-pointer ${
                torchOn ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
              title="Toggle Flashlight / Torch"
            >
              {torchOn ? <Flashlight size={14} /> : <FlashlightOff size={14} />}
            </button>
          )}

          <button
            onClick={toggleCameraFacing}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors cursor-pointer"
            title="Flip Camera (Front / Back)"
          >
            <FlipHorizontal size={14} />
          </button>

          {onClose && (
            <button
              onClick={() => {
                stopStream();
                onClose();
              }}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Close Scanner"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Camera Viewfinder Area */}
      <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
        {/* Live video */}
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-cover"
          playsInline
          muted
          autoPlay
        />

        {/* Viewfinder Overlay with Cyber / Somatic Corners */}
        <div className="relative z-10 w-64 h-64 border-2 border-indigo-500/40 rounded-2xl flex items-center justify-center pointer-events-none">
          {/* 4 Glowing Corner Accents */}
          <div className="absolute -top-1 -left-1 w-6 h-6 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
          <div className="absolute -top-1 -right-1 w-6 h-6 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
          <div className="absolute -bottom-1 -left-1 w-6 h-6 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
          <div className="absolute -bottom-1 -right-1 w-6 h-6 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />

          {/* Animated Sweeping Scanning Line */}
          {isScanning && !scannedSuccess && (
            <div className="absolute inset-x-2 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_#22d3ee] animate-pulse"
                 style={{
                   animation: 'qrLaserSweep 2.2s ease-in-out infinite alternate',
                 }}
            />
          )}

          {/* Success Beacon Checkmark */}
          {scannedSuccess && (
            <div className="w-16 h-16 rounded-full bg-emerald-500/90 border border-emerald-300 flex items-center justify-center text-white shadow-xl animate-scale-up">
              <CheckCircle2 size={36} />
            </div>
          )}

          {/* Center Targeting Dot */}
          {!scannedSuccess && (
            <div className="w-2 h-2 rounded-full bg-cyan-400/60 shadow-[0_0_8px_#22d3ee]" />
          )}
        </div>

        {/* Permission Denied or Error State */}
        {hasPermission === false && (
          <div className="absolute inset-0 z-30 bg-slate-950/95 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
              <AlertCircle size={24} />
            </div>
            <div>
              <h5 className="text-sm font-bold text-white mb-1">Camera Access Required</h5>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                {errorMessage || 'PRERNA needs camera permission to scan the pairing QR code.'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 w-full max-w-xs pt-2">
              <button
                onClick={startCamera}
                className="flex-1 py-2 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={14} /> Try Again
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Upload size={14} /> Upload QR
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Action Footer */}
      <div className="px-5 py-4 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-slate-400">
          <Sparkles size={14} className="text-indigo-400" />
          <span className="text-[11px] font-medium">100% on-device live decoding</span>
        </div>

        <div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Upload size={12} />
            <span>Upload Photo Instead</span>
          </button>
        </div>
      </div>
    </div>
  );
};
