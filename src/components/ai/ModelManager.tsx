import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { Download, Check, AlertTriangle, Cpu } from 'lucide-react';
import { motion } from 'framer-motion';

interface ModelStatus {
  loaded: boolean;
  model_name: string;
  vram_usage_mb: number;
  temperature: number;
}

const MODEL_URL = 'https://huggingface.co/TheBloke/Mistral-7B-Instruct-v0.2-GGUF/resolve/main/mistral-7b-instruct-v0.2.Q4_K_M.gguf';
const MODEL_SIZE_GB = 4.1;

export const ModelManager: React.FC = () => {
  const [status, setStatus] = useState<ModelStatus | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const result = await invoke<ModelStatus>('get_model_status');
      setStatus(result);
    } catch (err) {
      setError('Failed to check model status. Backend might be restarting.');
    }
  };

  const downloadModel = async () => {
    setIsDownloading(true);
    setError(null);
    
    try {
      // In production, use tauri-plugin-download or reqwest in Rust
      // For now, show manual instructions since it's 4GB
      await new Promise(resolve => setTimeout(resolve, 2000));
      setDownloadProgress(100);
      await checkStatus();
    } catch (err) {
      setError('Download failed. Please check your internet connection.');
    } finally {
      setIsDownloading(false);
    }
  };

  if (status?.loaded) {
    return (
      <div className="glass-panel bg-emerald-50/80 border-emerald-200 p-5 flex items-center gap-4">
        <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center flex-shrink-0">
          <Check size={24} strokeWidth={3} />
        </div>
        <div>
          <p className="font-black text-emerald-900 text-lg">AI Ready</p>
          <p className="text-sm font-bold text-emerald-600/80">
            {status.model_name} • {status.vram_usage_mb}MB VRAM reserved
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel p-6 border-amber-200 bg-amber-50/50">
      <div className="flex items-start gap-5">
        <div className="w-14 h-14 bg-amber-100 text-amber-500 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-sm border border-amber-200">
          <Cpu size={28} />
        </div>
        <div className="flex-1">
          <h3 className="font-black text-amber-900 text-lg mb-1">AI Model Required</h3>
          <p className="text-amber-800/80 text-sm font-medium mb-5">
            PRERNA needs a {MODEL_SIZE_GB}GB AI model to run locally on your machine. 
            This downloads once and ensures 100% privacy forever.
          </p>
          
          {error && (
            <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700 text-sm font-medium shadow-sm">
              <AlertTriangle size={18} className="flex-shrink-0 text-red-500" />
              {error}
            </div>
          )}
          
          {isDownloading ? (
            <div className="space-y-3 bg-white/60 p-4 rounded-xl border border-amber-100">
              <div className="h-3 bg-amber-100 rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${downloadProgress}%` }}
                />
              </div>
              <p className="text-xs font-bold text-amber-700 uppercase tracking-widest text-right">Downloading... {downloadProgress}%</p>
            </div>
          ) : (
            <button
              onClick={downloadModel}
              className="flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-bold rounded-xl shadow-lg shadow-orange-200 hover:shadow-orange-300 hover:-translate-y-0.5 active:translate-y-0 transition-all"
            >
              <Download size={18} />
              Download Model ({MODEL_SIZE_GB} GB)
            </button>
          )}
          
          <div className="mt-5 pt-4 border-t border-amber-200/60">
            <p className="text-[11px] font-bold text-amber-700/60 uppercase tracking-widest">
              Manual installation
            </p>
            <p className="text-xs text-amber-800/80 mt-1 font-mono bg-white/50 p-2 rounded border border-amber-100">
              Download {MODEL_URL} and place in %APPDATA%\prerna\models\
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
