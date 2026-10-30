import React, { useState, useEffect } from 'react';
import { Smartphone, Check } from 'lucide-react';
import { somaticAudio } from '../../utils/audioSynthesis';

export const InstallPwaPill: React.FC<{ className?: string }> = ({ className = '' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone mode (already installed PWA)
    if (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('To install PRERNA: Tap the Share or Settings menu in your browser, then select "Add to Home Screen" or "Install App".');
      return;
    }

    somaticAudio.playStarBeaconChime();
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  if (isInstalled) {
    return (
      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold ${className}`}>
        <Check size={12} className="text-emerald-600" />
        <span>Installed App</span>
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={handleInstallClick}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold transition-all shadow-2xs cursor-pointer ${className}`}
      title="Install PRERNA as an Offline Desktop or Mobile Application"
    >
      <Smartphone size={12} className="text-amber-400" />
      <span>Install App</span>
    </button>
  );
};
