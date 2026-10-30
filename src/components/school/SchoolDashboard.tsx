import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Users, 
  BookOpen, 
  GraduationCap, 
  ArrowUpRight, 
  Brain, 
  ShieldCheck, 
  Sparkles,
  Coffee,
  ShieldAlert,
  Download
} from 'lucide-react';
import { CohortAnalytics } from './CohortAnalytics';
import { TeacherVitalityCorner } from './TeacherVitalityCorner';
import { InstitutionalCareHub } from './InstitutionalCareHub';
import { SchoolLicensingModal } from '../subscription/SchoolLicensingModal';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { somaticAudio } from '../../utils/audioSynthesis';

interface SchoolDashboardProps {
  onSwitchPersona?: () => void;
}

export const SchoolDashboard: React.FC<SchoolDashboardProps> = ({ onSwitchPersona }) => {
  const [activeTab, setActiveTab] = useState<'flourishing' | 'care' | 'teacher_vitality'>('flourishing');
  const [showLicensingModal, setShowLicensingModal] = useState(false);
  const { schoolLicense, schoolPilotDaysRemaining } = useSubscriptionStore();

  const handleExportBatchData = () => {
    somaticAudio.playStarBeaconChime();
    const batchReport = {
      institution: 'PRERNA Model School (Affiliated Secondary)',
      batchSize: 1204,
      generatedAt: new Date().toISOString(),
      kAnonymityFactor: 5,
      complianceNotice: '100% Anonymized aggregate telemetry per Section 9 DPDP Act 2023. Zero PII, zero student identity linkages.',
      flourishingIndexScore: 'A- (84/100)',
      riasecTopDistribution: {
        social: '78%',
        enterprising: '65%',
        investigative: '52%',
        artistic: '48%',
        realistic: '34%',
        conventional: '29%'
      },
      systemicCareNotice: 'Zero acute crisis events unreviewed. Normal seasonal midterm anxiety elevated.'
    };

    const blob = new Blob([JSON.stringify(batchReport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRERNA_School_Cohort_Report_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex-1 bg-slate-50 p-4 sm:p-6 md:p-10 overflow-y-auto font-sans text-left">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Top School Sanctuary Header Banner */}
        <div className="p-6 md:p-10 rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30">
                  Educator Sanctuary • विद्यापीठ दर्पण
                </span>
                <span className="text-xs text-slate-400">• Institutional Stewardship</span>
              </div>

              <h1 className="text-3xl md:text-4xl font-black tracking-tight">
                School & Cohort Flourishing Hub
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                Rabindranath Tagore’s Visva-Bharati ethos: <em>"Where the mind is without fear and the head is held high."</em> Nurturing collective adolescent potential with mathematical $k$-anonymity and zero individual surveillance.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => {
                  somaticAudio.playSoftChime();
                  setShowLicensingModal(true);
                }}
                className={`px-5 py-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs border ${
                  schoolLicense === 'district_annual'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                    : schoolLicense === 'campus_annual'
                    ? 'bg-indigo-500/20 text-indigo-300 border-indigo-400/40 hover:bg-indigo-500/30'
                    : 'bg-amber-500/20 text-amber-300 border-amber-400/40 hover:bg-amber-500/30'
                }`}
                title="Manage Institutional VidyaPeeth License"
              >
                <GraduationCap size={16} />
                <span>
                  {schoolLicense === 'district_annual'
                    ? 'District License Active'
                    : schoolLicense === 'campus_annual'
                    ? 'Campus License Active'
                    : `Pilot: ${schoolPilotDaysRemaining}d remaining`}
                </span>
              </button>
              <button
                onClick={handleExportBatchData}
                className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer border border-white/10 shadow-xs"
              >
                <Download size={16} className="text-amber-400" />
                <span>Export Cohort Report</span>
              </button>
              {onSwitchPersona && (
                <button
                  onClick={onSwitchPersona}
                  className="px-5 py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Users size={16} />
                  <span>Switch Persona</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Top 4 Aggregate KPIs */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active Learners', value: '1,204', icon: <Users size={18} className="text-blue-600" />, trend: 'Grade 9 to 12 Aggregate', color: 'bg-blue-50 border-blue-200' },
            { label: 'Quests Explored', value: '45.2k', icon: <BookOpen size={18} className="text-emerald-600" />, trend: '+5.4% this week', color: 'bg-emerald-50 border-emerald-200' },
            { label: 'Skills Cultivated', value: '8,902', icon: <GraduationCap size={18} className="text-indigo-600" />, trend: 'RIASEC & Logic Mastery', color: 'bg-indigo-50 border-indigo-200' },
            { label: 'Cohort Wellbeing', value: 'A-', icon: <ArrowUpRight size={18} className="text-purple-600" />, trend: 'Equilibrium Stable', color: 'bg-purple-50 border-purple-200' }
          ].map((kpi, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-xs"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className={`p-2 rounded-xl border ${kpi.color}`}>
                  {kpi.icon}
                </div>
                <span className="text-xs font-bold text-slate-500">{kpi.label}</span>
              </div>
              <div className="text-2xl sm:text-3xl font-black text-slate-900">{kpi.value}</div>
              <div className="text-[11px] font-semibold text-slate-400 mt-1">{kpi.trend}</div>
            </motion.div>
          ))}
        </div>

        {/* DPDP Act 2023 §9 Invariant Banner */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-center justify-between text-xs text-emerald-950">
          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-emerald-700 flex-shrink-0" />
            <span>
              <strong>Zero-Surveillance Guarantee (DPDP Act §9):</strong> Educators can only access non-identifiable batch distributions ($k \ge 5$). Student personal diaries, crisis disclosures, and private thoughts remain mathematically protected.
            </span>
          </div>
          <span className="font-mono text-[10px] font-bold text-emerald-800 uppercase px-2 py-0.5 rounded-full bg-emerald-100 hidden md:inline">
            Encrypted & Anonymized
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => { somaticAudio.playSoftChime(); setActiveTab('flourishing'); }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'flourishing'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Brain size={16} />
            <span>Cohort Flourishing & Vocational Horizon</span>
          </button>

          <button
            onClick={() => { somaticAudio.playSoftChime(); setActiveTab('care'); }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'care'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <ShieldAlert size={16} />
            <span>Institutional Care & Early Warning</span>
          </button>

          <button
            onClick={() => { somaticAudio.playSoftChime(); setActiveTab('teacher_vitality'); }}
            className={`px-5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'teacher_vitality'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Coffee size={16} />
            <span>Teacher & Educator Vitality Corner</span>
          </button>
        </div>

        {/* Active Tab View */}
        <div>
          {activeTab === 'flourishing' && (
            <div className="space-y-8">
              <CohortAnalytics />

              {/* Curriculum Suggestions */}
              <div className="bg-white border border-slate-200/80 rounded-3xl p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                    <Sparkles size={18} className="text-amber-500" />
                    <span>Curriculum & Batch Interventions</span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400">Tailored to Cohort Skew</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-5 bg-indigo-50/50 border border-indigo-100 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-indigo-900 text-sm">Resilience & Focus Workshop</h4>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">Grade 11</span>
                    </div>
                    <p className="text-xs text-indigo-700/80 leading-relaxed">
                      Grade 11 shows elevated cognitive tension during pre-midterms. Recommend 5-min somatic breath pauses in first periods.
                    </p>
                    <button 
                      onClick={() => somaticAudio.playStarBeaconChime()}
                      className="text-xs font-bold text-white bg-indigo-600 px-4 py-2 rounded-xl hover:bg-indigo-700 transition-colors cursor-pointer mt-1"
                    >
                      Deploy Module Guidelines
                    </button>
                  </div>

                  <div className="p-5 bg-emerald-50/50 border border-emerald-100 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-emerald-900 text-sm">STEM & Social Innovation Series</h4>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">Grade 10</span>
                    </div>
                    <p className="text-xs text-emerald-700/80 leading-relaxed">
                      Grade 10 shows high "Social" and "Investigative" Holland RIASEC skews. Recommend community science and healthcare projects.
                    </p>
                    <button 
                      onClick={() => somaticAudio.playStarBeaconChime()}
                      className="text-xs font-bold text-white bg-emerald-600 px-4 py-2 rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer mt-1"
                    >
                      Deploy Speaker Series
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'care' && (
            <InstitutionalCareHub />
          )}

          {activeTab === 'teacher_vitality' && (
            <TeacherVitalityCorner />
          )}
        </div>

      </div>

      {/* Institutional School Licensing Modal */}
      <SchoolLicensingModal
        isOpen={showLicensingModal}
        onClose={() => setShowLicensingModal(false)}
      />
    </div>
  );
};
