import React, { useState } from 'react';
import { 
  Users, 
  PhoneCall, 
  ShieldCheck, 
  BookOpen
} from 'lucide-react';
import { somaticAudio } from '../../utils/audioSynthesis';

interface SystemicRiskItem {
  id: string;
  category: 'academic_stress' | 'peer_climate' | 'attendance_drop' | 'digital_fatigue';
  title: string;
  severity: 'high' | 'medium' | 'low';
  cohort: string;
  detectedTrend: string;
  recommendedPlaybook: string;
  isDeployed?: boolean;
}

export const InstitutionalCareHub: React.FC = () => {
  const [risks, setRisks] = useState<SystemicRiskItem[]>([
    {
      id: 'r_1',
      category: 'academic_stress',
      title: 'Midterm Pre-Exam Cognitive Overload',
      severity: 'high',
      cohort: 'Grade 11 - Science & Commerce (Aggregate)',
      detectedTrend: '18% drop in 90-minute sleep cycle completion; elevated somatic tension reported.',
      recommendedPlaybook: 'Deploy 5-Minute Pre-Class Somatic Vagal Reset & Stagger Assignment Deadlines.',
      isDeployed: false,
    },
    {
      id: 'r_2',
      category: 'peer_climate',
      title: 'New Admissions Isolation Vector',
      severity: 'medium',
      cohort: 'Grade 9 - New Entrants (Aggregate)',
      detectedTrend: 'Lower engagement on Social Compass group quests among recent transfers.',
      recommendedPlaybook: 'Organize Paired Peer-Quest Orientation and Lunchtime Activity Pods.',
      isDeployed: true,
    },
    {
      id: 'r_3',
      category: 'digital_fatigue',
      title: 'Late-Night Screen Use & Circadian Disruption',
      severity: 'low',
      cohort: 'Grade 10 - Section A & C',
      detectedTrend: 'Late morning check-in responses suggesting blue-light circadian delay.',
      recommendedPlaybook: 'Circulate Dinacharya Circadian Rhythm & Sleep Hygiene Sanctuary Guide to parents.',
      isDeployed: false,
    },
  ]);

  const [activeTab, setActiveTab] = useState<'alerts' | 'helplines' | 'playbooks'>('alerts');

  const handleToggleDeploy = (id: string) => {
    somaticAudio.playSoftChime();
    setRisks(prev => prev.map(r => r.id === id ? { ...r, isDeployed: !r.isDeployed } : r));
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* Top Banner */}
      <div className="p-6 md:p-8 rounded-[2.5rem] bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                DPDP Act 2023 §9 Compliant • Zero Individual Surveillance
              </span>
            </div>
            <h3 className="text-2xl md:text-3xl font-black tracking-tight">
              Institutional Care & Early Warning Sanctuary
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Detect systemic school-wide friction vectors without ever invading individual teen privacy. All metrics are mathematical cohort aggregates with $k$-anonymity.
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 text-xs space-y-1">
            <div className="font-bold text-emerald-300 flex items-center gap-1.5">
              <ShieldCheck size={16} /> Strict Privacy Boundary
            </div>
            <div className="text-[11px] text-slate-300">
              Personal reflections, journals, and private chats are strictly inaccessible.
            </div>
          </div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        {[
          { id: 'alerts', label: 'Cohort Risk Vectors', count: risks.length },
          { id: 'playbooks', label: 'Compassionate Playbooks' },
          { id: 'helplines', label: 'Emergency Helplines & Legal Protocol' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => { somaticAudio.playSoftChime(); setActiveTab(tab.id as any); }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                activeTab === tab.id ? 'bg-indigo-700 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab 1: Cohort Alerts */}
      {activeTab === 'alerts' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {risks.map(risk => (
            <div 
              key={risk.id}
              className={`p-6 rounded-3xl border-2 transition-all flex flex-col justify-between ${
                risk.isDeployed 
                  ? 'bg-emerald-50/50 border-emerald-300/80 shadow-xs' 
                  : 'bg-white border-slate-200 shadow-xs hover:border-indigo-300'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                    risk.severity === 'high' ? 'bg-rose-100 text-rose-800' :
                    risk.severity === 'medium' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {risk.severity} severity
                  </span>
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Users size={12} /> {risk.cohort}
                  </span>
                </div>

                <h4 className="text-base font-black text-slate-900 leading-snug">
                  {risk.title}
                </h4>

                <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <strong>Observed Pattern:</strong> {risk.detectedTrend}
                </p>

                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-xs text-indigo-950 space-y-1">
                  <strong className="block text-indigo-900 font-bold">Recommended Socratic Action:</strong>
                  <p>{risk.recommendedPlaybook}</p>
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-medium text-slate-400">
                  {risk.isDeployed ? '✓ Playbook Deployed' : 'Action Pending'}
                </span>
                <button
                  onClick={() => handleToggleDeploy(risk.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    risk.isDeployed 
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm'
                  }`}
                >
                  {risk.isDeployed ? 'Mark Resolved' : 'Deploy Protocol'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 2: Socratic Playbooks */}
      {activeTab === 'playbooks' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            {
              title: 'Exam Season Collective Somatic Reset',
              category: 'Academic Flourishing',
              steps: [
                'Incorporate 3 minutes of 432 Hz Pythagorean breathing at the start of double periods.',
                'Coordinate with department heads to prevent >2 major subject submissions on a single day.',
                'Open a dedicated quiet room for self-regulated sensory decompression during study hours.'
              ]
            },
            {
              title: 'Anti-Bullying Restorative Dialogue Circle',
              category: 'Social Cohesion',
              steps: [
                'Use Nonviolent Communication (NVC) observation-without-evaluation circles.',
                'Facilitate peer-guided mediation where both parties articulate emotional needs rather than blame.',
                'Focus on restorative restitution rather than punitive isolation which compounds adolescent alienation.'
              ]
            }
          ].map((pb, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {pb.category}
                </span>
                <BookOpen size={16} className="text-slate-400" />
              </div>

              <h4 className="text-base font-black text-slate-900">{pb.title}</h4>

              <div className="space-y-2">
                {pb.steps.map((st, i) => (
                  <div key={i} className="flex items-start gap-2.5 text-xs text-slate-600 leading-relaxed">
                    <span className="w-5 h-5 rounded-full bg-slate-100 font-bold text-slate-700 flex items-center justify-center flex-shrink-0 mt-0.5 text-[11px]">
                      {i + 1}
                    </span>
                    <span>{st}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Helplines */}
      {activeTab === 'helplines' && (
        <div className="p-6 md:p-8 rounded-3xl bg-white border border-slate-200/80 shadow-xs space-y-6">
          <div>
            <h4 className="text-lg font-black text-slate-900">National Adolescent Crisis Support Hotlines</h4>
            <p className="text-xs text-slate-500 mt-1">
              In cases of acute emotional distress, counselors should facilitate direct, confidential connection to verified 24/7 emergency resources.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'Tele-MANAS (Ministry of Health)', number: '14416', desc: 'Free 24/7 comprehensive multilingual psychological support.' },
              { name: 'KIRAN National Helpline', number: '1800-599-0019', desc: 'Mental health rehabilitation, anxiety, and depression guidance.' },
              { name: 'CHILDLINE India', number: '1098', desc: 'Adolescent protection, emergency care, and immediate rescue.' },
              { name: 'Vandrevala Foundation', number: '9999 666 555', desc: 'Experienced crisis counselors available around the clock.' },
            ].map(hl => (
              <div key={hl.number} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-start justify-between">
                <div>
                  <h5 className="text-sm font-bold text-slate-900">{hl.name}</h5>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">{hl.desc}</p>
                </div>
                <a
                  href={`tel:${hl.number.replace(/\s+/g, '')}`}
                  className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 flex-shrink-0 transition-colors"
                >
                  <PhoneCall size={14} />
                  <span>{hl.number}</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
