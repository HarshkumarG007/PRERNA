import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Eye, EyeOff, Lock, X } from 'lucide-react';
import { ParentPermissionManager, SharingPreferences } from '../../parent/permissions';

export const TeenPrivacyControls: React.FC<{ userId: string; onClose: () => void }> = ({ userId, onClose }) => {
  const [prefs, setPrefs] = useState<SharingPreferences | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    setPrefs(ParentPermissionManager.getPreferences(userId));
  }, [userId]);

  const toggleShare = (key: keyof SharingPreferences['shares']) => {
    if (!prefs) return;
    
    const updated = {
      ...prefs,
      shares: {
        ...prefs.shares,
        [key]: !prefs.shares[key],
      },
    };
    
    setPrefs(updated);
    ParentPermissionManager.updatePreferences(updated);
    
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  if (!prefs) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="max-w-2xl w-full bg-white rounded-3xl overflow-hidden shadow-2xl relative"
      >
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-800 transition-colors z-10"
        >
          <X size={24} />
        </button>

        <div className="p-8 md:p-10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-indigo-100 rounded-2xl flex items-center justify-center">
              <Shield className="text-indigo-500" size={32} />
            </div>
            <div>
              <h2 className="text-3xl font-black text-gray-800">Privacy Settings</h2>
              <p className="text-gray-500 font-medium">You control what your parents can see</p>
            </div>
          </div>

          <div className="h-6 mb-2">
            {saved && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-emerald-600 text-sm font-bold flex items-center gap-2"
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full" /> Changes saved automatically
              </motion.div>
            )}
          </div>

          <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2 scrollbar-hide">
            <h3 className="font-bold text-gray-800 uppercase tracking-widest text-xs mb-4">Share With Parents</h3>
            
            {[
              { key: 'wellbeingScore', label: 'Wellbeing score', desc: 'Your overall happiness metric (no raw data)' },
              { key: 'careerInterests', label: 'Career interests', desc: 'Top 3 fields you\'re exploring' },
              { key: 'strengths', label: 'Your strengths', desc: 'Positive traits we\'ve noticed' },
              { key: 'dailyCheckIn', label: 'Daily activity', desc: 'Whether you checked in today' },
              { key: 'concerns', label: 'Concerns (optional)', desc: 'Things you\'re struggling with' },
            ].map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-5 bg-gray-50 hover:bg-gray-100 transition-colors rounded-2xl border border-gray-100"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-1">
                    {prefs.shares[item.key as keyof typeof prefs.shares] ? (
                      <Eye className="text-emerald-500" size={24} />
                    ) : (
                      <EyeOff className="text-gray-400" size={24} />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-800">{item.label}</h4>
                    <p className="text-sm font-medium text-gray-500">{item.desc}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleShare(item.key as keyof SharingPreferences['shares'])}
                  className={`relative w-16 h-8 rounded-full transition-colors flex-shrink-0 ${
                    prefs.shares[item.key as keyof typeof prefs.shares]
                      ? 'bg-emerald-500'
                      : 'bg-gray-300'
                  }`}
                >
                  <motion.div
                    className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-md"
                    animate={{
                      left: prefs.shares[item.key as keyof typeof prefs.shares] ? '34px' : '4px',
                    }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                </button>
              </div>
            ))}

            <div className="mt-8 p-6 bg-indigo-50 border border-indigo-100 rounded-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                  <Lock className="text-indigo-600" size={18} />
                </div>
                <h4 className="font-black text-indigo-900 text-lg">Always Private</h4>
              </div>
              <ul className="text-sm font-medium text-indigo-800 space-y-2 pl-11">
                <li>• Your chat conversations with AI Mentor</li>
                <li>• Detailed assessment responses & scores</li>
                <li>• Specific test rankings</li>
                <li>• Raw daily mood entries</li>
              </ul>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <button onClick={onClose} className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-2xl transition-colors">
              Done
            </button>
            <p className="text-xs font-medium text-gray-400 mt-4">
              Your data never leaves your device unencrypted. You are in control.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
