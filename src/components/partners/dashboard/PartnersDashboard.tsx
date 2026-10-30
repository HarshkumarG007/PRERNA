import React, { useState } from 'react';
import { 
  Heart, 
  Sparkles, 
  Users2, 
  Lock, 
  ShieldCheck, 
  QrCode, 
  MessageSquareHeart, 
  Calendar, 
  BookHeart, 
  ShieldAlert, 
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Unlink
} from 'lucide-react';
import { usePartnerStore } from '../../../store/partnerStore';
import { somaticAudio } from '../../../utils/audioSynthesis';
import { PartnerAiCompanion } from '../companion/PartnerAiCompanion';
import { CommunicationStudio } from '../communication/CommunicationStudio';
import { RomanceAndHangoutStudio } from '../romance/RomanceAndHangoutStudio';
import { SharedMemoriesAndJournal } from '../memories/SharedMemoriesAndJournal';
import { PartnerPairingModal } from '../pairing/PartnerPairingModal';

interface PartnersDashboardProps {
  onQuickExit: () => void;
}

export const PartnersDashboard: React.FC<PartnersDashboardProps> = ({ onQuickExit }) => {
  const { 
    profile, 
    connection, 
    lockGate, 
    unpair, 
    deactivatePartners,
    conversationPrompts,
    dateIdeas,
    sharedMemories
  } = usePartnerStore();

  const [activeTab, setActiveTab] = useState<'us' | 'companion' | 'communication' | 'romance' | 'memories' | 'safety'>('us');
  const [showPairingModal, setShowPairingModal] = useState(false);

  const isLovers = profile.mode === 'lovers';
  const isPaired = connection.status === 'paired';

  const handleQuickExit = () => {
    somaticAudio.playSoftChime();
    lockGate();
    onQuickExit();
  };

  const handleUnpair = () => {
    if (confirm('Are you sure you want to disconnect from your partner? All shared data remains on your local device.')) {
      unpair();
      somaticAudio.playSoftChime();
    }
  };

  const handleDeactivate = () => {
    if (confirm('Are you sure you want to deactivate PRERNA for Partners? Your primary PRERNA account remains intact.')) {
      deactivatePartners();
      onQuickExit();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Sovereignty Header */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 py-2.5 sm:px-6 flex items-center justify-between gap-3">
          
          {/* Left: Identity */}
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-2xl flex items-center justify-center text-white shadow-sm ${
              isLovers ? 'bg-gradient-to-br from-rose-500 to-amber-500' : 'bg-gradient-to-br from-amber-500 to-teal-500'
            }`}>
              {isLovers ? <Heart size={18} className="fill-white" /> : <Users2 size={18} />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-sm tracking-tight text-slate-900">
                  {isLovers ? 'PRERNA for Partners ❤️' : 'PRERNA for Besties 🪷'}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 hidden sm:inline">
                  {isLovers ? 'दो दिल एक जान' : 'सच्ची दोस्ती'}
                </span>
              </div>
              <p className="text-[10px] text-slate-500">
                {isPaired 
                  ? `Connected with ${connection.pairedPartnerName}` 
                  : 'Individual Mode (Unpaired)'}
              </p>
            </div>
          </div>

          {/* Right: Quick Controls & Quick Exit */}
          <div className="flex items-center gap-2">
            {!isPaired ? (
              <button
                onClick={() => setShowPairingModal(true)}
                className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <QrCode size={14} />
                <span>Pair via QR</span>
              </button>
            ) : (
              <button
                onClick={() => setShowPairingModal(true)}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <CheckCircle2 size={14} />
                <span className="hidden sm:inline">Paired</span>
              </button>
            )}

            {/* QUICK EXIT BUTTON (Crucial Security & Privacy Gate) */}
            <button
              onClick={handleQuickExit}
              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-black transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Quickly lock partner vault and exit to Adult Sanctuary"
            >
              <Lock size={13} />
              <span>⚡ Quick Exit</span>
            </button>
          </div>
        </div>

        {/* Horizontal Navigation Stepper */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1.5 overflow-x-auto py-1.5 border-t border-slate-100 text-xs">
          {[
            { id: 'us', label: 'Us & Pulse', icon: Heart },
            { id: 'companion', label: 'AI Preeti', icon: Sparkles },
            { id: 'communication', label: 'Communication', icon: MessageSquareHeart },
            { id: 'romance', label: isLovers ? 'Romance & Dates' : 'Hangouts & Quests', icon: Calendar },
            { id: 'memories', label: 'Memories & Vault', icon: BookHeart },
            { id: 'safety', label: 'Safety & Rights', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  somaticAudio.playSoftChime();
                  setActiveTab(tab.id as any);
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-rose-50 text-rose-900 border border-rose-200 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <Icon size={14} className={activeTab === tab.id ? 'text-rose-600' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Tab Area */}
      <main className="flex-grow p-4 sm:p-6 max-w-7xl mx-auto w-full">
        {/* Tab 1: Us (Dashboard Overview) */}
        {activeTab === 'us' && (
          <div className="space-y-6 text-left">
            {/* Top Romantic Welcome Card */}
            <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-rose-500/10 via-pink-500/10 to-amber-500/10 border border-rose-200/80 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200">
                  {isLovers ? 'Sacred Romantic Union' : 'Sacred Soul Connection'}
                </span>
                <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  Welcome, {profile.nickname || 'Beloved Soul'}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 max-w-xl leading-relaxed">
                  "Two souls with but a single thought, two hearts that beat as one." Here in this private sanctuary, your relationship is honored with tenderness, active listening, and complete zero-knowledge privacy.
                </p>
              </div>

              {!isPaired ? (
                <button
                  onClick={() => setShowPairingModal(true)}
                  className="px-6 py-3.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white rounded-2xl font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-rose-500/20 cursor-pointer flex-shrink-0"
                >
                  <QrCode size={16} />
                  <span>Connect Partner via QR</span>
                </button>
              ) : (
                <div className="p-4 rounded-2xl bg-white/80 border border-emerald-200 text-center flex-shrink-0 space-y-1 shadow-2xs">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 block">
                    Cryptographic Pairing
                  </span>
                  <span className="text-sm font-black text-slate-900">
                    {connection.pairedPartnerName}
                  </span>
                  <p className="text-[10px] text-slate-400 font-mono">100% On-Device E2E</p>
                </div>
              )}
            </div>

            {/* 3-Column Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Daily Heart Prompt */}
              <div 
                onClick={() => setActiveTab('communication')}
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-rose-300 transition-all cursor-pointer shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-rose-50 text-rose-700">
                    Daily Card
                  </span>
                  <Heart size={16} className="text-rose-500" />
                </div>
                <h4 className="text-sm font-black text-slate-900 line-clamp-2">
                  "{conversationPrompts[0]?.question}"
                </h4>
                <p className="text-xs text-rose-600 font-bold flex items-center gap-1 pt-1">
                  <span>Explore reflection</span>
                  <ArrowRight size={12} />
                </p>
              </div>

              {/* Next Date / Hangout */}
              <div 
                onClick={() => setActiveTab('romance')}
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-amber-300 transition-all cursor-pointer shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-700">
                    Date Idea
                  </span>
                  <Calendar size={16} className="text-amber-500" />
                </div>
                <h4 className="text-sm font-black text-slate-900 line-clamp-2">
                  {dateIdeas[0]?.title}
                </h4>
                <p className="text-xs text-amber-600 font-bold flex items-center gap-1 pt-1">
                  <span>View romantic quests</span>
                  <ArrowRight size={12} />
                </p>
              </div>

              {/* Milestone Horizon */}
              <div 
                onClick={() => setActiveTab('memories')}
                className="p-5 rounded-3xl bg-white border border-slate-200 hover:border-teal-300 transition-all cursor-pointer shadow-xs space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700">
                    Milestone Vault
                  </span>
                  <BookHeart size={16} className="text-teal-500" />
                </div>
                <h4 className="text-sm font-black text-slate-900">
                  {sharedMemories.length} Sacred Moments Saved
                </h4>
                <p className="text-xs text-teal-600 font-bold flex items-center gap-1 pt-1">
                  <span>Open memories timeline</span>
                  <ArrowRight size={12} />
                </p>
              </div>
            </div>

            {/* Preeti Companion Quick Trigger Card */}
            <div 
              onClick={() => setActiveTab('companion')}
              className="p-6 rounded-3xl bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 cursor-pointer hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4 text-center sm:text-left">
                <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white flex-shrink-0">
                  <Sparkles size={24} className="text-amber-300" />
                </div>
                <div>
                  <h4 className="text-base font-black tracking-tight">
                    Have something on your heart? Chat with Preeti (प्रेरणा साथी)
                  </h4>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Mode 1 gives you a private reflection space. Mode 2 helps you connect together with empathy.
                  </p>
                </div>
              </div>

              <div className="px-5 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-bold flex items-center gap-1.5 flex-shrink-0">
                <span>Open AI Companion</span>
                <ArrowRight size={14} />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: AI Relationship Companion */}
        {activeTab === 'companion' && <PartnerAiCompanion />}

        {/* Tab 3: Communication Studio */}
        {activeTab === 'communication' && <CommunicationStudio />}

        {/* Tab 4: Romance & Dates Studio */}
        {activeTab === 'romance' && <RomanceAndHangoutStudio />}

        {/* Tab 5: Memories & Dual Journal */}
        {activeTab === 'memories' && <SharedMemoriesAndJournal />}

        {/* Tab 6: Safety, Rights & Emergency Controls */}
        {activeTab === 'safety' && (
          <div className="space-y-6 max-w-4xl mx-auto text-left">
            <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-md space-y-6">
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  Privacy, Safety & Relationship Rights
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  In compliance with India's DPDP Act 2023 §9, PRERNA for Partners is built with zero surveillance, granular data visibility controls, and easy unlinking.
                </p>
              </div>

              {/* Data Rights Summary */}
              <div className="space-y-3 border-t border-slate-100 pt-4">
                {[
                  { label: 'Granular Visibility', desc: 'Every answer can be private, shared with partner, or shared with AI.' },
                  { label: 'Zero Behavioral Advertising', desc: 'No commercial profiling or partner surveillance.' },
                  { label: 'Isolated From Teens & Schools', desc: 'Institutional or parent views can never access partner data.' },
                  { label: 'Right to Forget & Unpair', desc: 'Unlinking your partner disconnects the shared space instantly without erasing your personal data.' },
                ].map((item, idx) => (
                  <div key={idx} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/60 text-xs">
                    <span className="font-bold text-slate-800 block">✓ {item.label}</span>
                    <span className="text-slate-500 text-[11px]">{item.desc}</span>
                  </div>
                ))}
              </div>

              {/* Unpair & Deactivate Actions */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row gap-3">
                {isPaired && (
                  <button
                    onClick={handleUnpair}
                    className="flex-1 py-3 px-4 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                  >
                    <Unlink size={16} />
                    <span>Unpair From Partner</span>
                  </button>
                )}

                <button
                  onClick={handleDeactivate}
                  className="flex-1 py-3 px-4 rounded-xl border border-slate-300 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors"
                >
                  <ShieldAlert size={16} />
                  <span>Deactivate Partners Module</span>
                </button>
              </div>

              {/* Emergency Support Helplines */}
              <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 text-xs space-y-2">
                <div className="flex items-center gap-2 text-rose-900 font-bold">
                  <PhoneCall size={16} className="text-rose-600" />
                  <span>National Relationship & Emotional Wellbeing Helplines</span>
                </div>
                <p className="text-rose-800 text-[11px]">
                  If you ever feel unsafe, coerced, or overwhelmed, verified confidential support is available:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-bold text-rose-950 pt-1">
                  <div className="bg-white p-2.5 rounded-xl border border-rose-200">
                    Tele-MANAS: 14416 (24x7 Mental Health Helpline)
                  </div>
                  <div className="bg-white p-2.5 rounded-xl border border-rose-200">
                    KIRAN: 1800-599-0019 (Psychological Support)
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Partner Pairing Modal */}
      <PartnerPairingModal
        isOpen={showPairingModal}
        onClose={() => setShowPairingModal(false)}
      />

    </div>
  );
};
