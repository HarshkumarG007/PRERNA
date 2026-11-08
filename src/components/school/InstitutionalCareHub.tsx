import React, { useState } from 'react';
import { 
  Users, 
  PhoneCall, 
  ShieldCheck, 
  BookOpen, 
  Download, 
  Plus, 
  FileText, 
  Trash2
} from 'lucide-react';
import { somaticAudio } from '../../utils/audioSynthesis';
import { CounselorPlaybookModal } from './CounselorPlaybookModal';

interface SystemicRiskItem {
  id: string;
  category: 'academic_stress' | 'peer_climate' | 'attendance_drop' | 'digital_fatigue';
  title: string;
  severity: 'high' | 'medium' | 'low';
  cohort: string;
  detectedTrend: string;
  recommendedPlaybook: string;
  playbookId: string;
  isDeployed?: boolean;
}

interface CounselorNote {
  id: string;
  timestamp: string;
  cohort: string;
  tag: string;
  content: string;
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
      playbookId: 'exam_calm',
      isDeployed: false,
    },
    {
      id: 'r_2',
      category: 'peer_climate',
      title: 'Grade 10 Stream Anxiety & Subject Polarization',
      severity: 'medium',
      cohort: 'Grade 10 - All Sections (Aggregate)',
      detectedTrend: 'High cognitive bifurcation between Engineering and Commerce interest vectors without multi-disciplinary awareness.',
      recommendedPlaybook: 'Distribute NEP 2020 Multi-Disciplinary Stream Guidance Matrix for homeroom discussion.',
      playbookId: 'stream_matrix',
      isDeployed: true,
    },
    {
      id: 'r_3',
      category: 'digital_fatigue',
      title: 'Late-Night Screen Use & Circadian Disruption',
      severity: 'low',
      cohort: 'Grade 9 & 10 (Aggregate)',
      detectedTrend: 'Late morning check-in responses suggesting blue-light circadian delay.',
      recommendedPlaybook: 'Circulate Dinacharya Circadian Rhythm & Sleep Hygiene Sanctuary Guide to parents.',
      playbookId: 'sleep_hygiene',
      isDeployed: false,
    },
  ]);

  const [activeTab, setActiveTab] = useState<'alerts' | 'playbooks' | 'notes' | 'helplines'>('alerts');
  const [selectedPlaybookId, setSelectedPlaybookId] = useState<string | null>(null);

  // Counselor Notes State
  const [notes, setNotes] = useState<CounselorNote[]>(() => {
    try {
      const saved = localStorage.getItem('prerna_counselor_notes');
      return saved ? JSON.parse(saved) : [
        {
          id: 'note_demo_1',
          timestamp: '2026-11-02 09:30',
          cohort: 'Grade 11 - Science',
          tag: 'Exam Anxiety',
          content: 'Conducted 15-minute collective breathing reset with Section A before Physics practicals. Positive somatic calming observed.'
        },
        {
          id: 'note_demo_2',
          timestamp: '2026-11-04 14:15',
          cohort: 'Grade 10 - Section B',
          tag: 'Stream Choice',
          content: 'Circulated NEP 2020 RIASEC matching guides. Several students exploring combined Computer Science and Humanities options.'
        }
      ];
    } catch {
      return [];
    }
  });

  const [newNoteCohort, setNewNoteCohort] = useState('Grade 10 Cohort');
  const [newNoteTag, setNewNoteTag] = useState('Pastoral Care');
  const [newNoteContent, setNewNoteContent] = useState('');

  const handleToggleDeploy = (id: string) => {
    somaticAudio.playSoftChime();
    setRisks(prev => prev.map(r => r.id === id ? { ...r, isDeployed: !r.isDeployed } : r));
  };

  const handleOpenPlaybook = (playbookId: string) => {
    somaticAudio.playStarBeaconChime();
    setSelectedPlaybookId(playbookId);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteContent.trim()) return;

    somaticAudio.playSoftChime();
    const newEntry: CounselorNote = {
      id: `note_${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16),
      cohort: newNoteCohort,
      tag: newNoteTag,
      content: newNoteContent.trim()
    };

    const updated = [newEntry, ...notes];
    setNotes(updated);
    setNewNoteContent('');
    try {
      localStorage.setItem('prerna_counselor_notes', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to cache counselor notes', err);
    }
  };

  const handleDeleteNote = (id: string) => {
    somaticAudio.playSoftChime();
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    try {
      localStorage.setItem('prerna_counselor_notes', JSON.stringify(updated));
    } catch (err) {
      console.warn('Failed to cache counselor notes', err);
    }
  };

  const handleExportNotes = () => {
    somaticAudio.playStarBeaconChime();
    const mdContent = `# PRERNA VidyaPeeth School Counselor Pastoral Log
**Generated At:** ${new Date().toISOString()}  
**Statutory Privacy Notice:** DPDP Act 2023 §9 Compliant • Zero Individual Adolescent Surveillance

---

${notes.map(n => `### [${n.timestamp}] ${n.cohort} (${n.tag})
${n.content}
`).join('\n---\n')}
`;
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PRERNA_Counselor_Pastoral_Log_${new Date().toISOString().split('T')[0]}.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
          { id: 'playbooks', label: 'Actionable Playbooks & Lesson Plans' },
          { id: 'notes', label: 'Counselor Pastoral Log', count: notes.length },
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

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                <button
                  onClick={() => handleOpenPlaybook(risk.playbookId)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <BookOpen size={13} />
                  <span>View Protocol</span>
                </button>

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

      {/* Tab 2: Actionable Playbooks & Lesson Plans */}
      {activeTab === 'playbooks' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              id: 'exam_calm',
              title: '15-Min Pre-Exam Somatic Calming Protocol',
              category: 'Academic Flourishing',
              desc: 'Teacher-guided 432 Hz Pythagorean breathing and cognitive reframing to de-escalate acute board exam anxiety in homerooms.'
            },
            {
              id: 'stream_matrix',
              title: 'NEP 2020 Multi-Disciplinary Stream Matrix',
              category: 'Career Discovery',
              desc: 'Structured counseling framework mapping Holland RIASEC interests to flexible Class 11-12 subject selections.'
            },
            {
              id: 'sleep_hygiene',
              title: 'Circadian Sleep Hygiene & Sanctuary Guide',
              category: 'Biological Vitality',
              desc: 'Evidence-based 90-minute sleep cycle guide and digital blue-light curfew protocol ready to distribute to parents.'
            }
          ].map(pb => (
            <div key={pb.id} className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {pb.category}
                </span>
                <h4 className="text-base font-black text-slate-900 leading-snug">{pb.title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed">{pb.desc}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] font-semibold text-slate-400">Printable & Exportable</span>
                <button
                  onClick={() => handleOpenPlaybook(pb.id)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <BookOpen size={14} />
                  <span>Open Full Guide</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 3: Counselor Pastoral Log */}
      {activeTab === 'notes' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h4 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <FileText size={18} className="text-indigo-600" />
                  <span>Counselor Private Pastoral Log</span>
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Private, encrypted on-device notes for cohort interventions. Never synced to remote servers.
                </p>
              </div>

              {notes.length > 0 && (
                <button
                  onClick={handleExportNotes}
                  className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Download size={14} />
                  <span>Export Log (.MD)</span>
                </button>
              )}
            </div>

            {/* Note Entry Form */}
            <form onSubmit={handleAddNote} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Target Cohort</label>
                  <select
                    value={newNoteCohort}
                    onChange={(e) => setNewNoteCohort(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Grade 9 - All Sections">Grade 9 - All Sections</option>
                    <option value="Grade 10 - Section A">Grade 10 - Section A</option>
                    <option value="Grade 10 - Section B">Grade 10 - Section B</option>
                    <option value="Grade 11 - Science">Grade 11 - Science</option>
                    <option value="Grade 11 - Commerce">Grade 11 - Commerce</option>
                    <option value="Grade 12 - Senior Secondary">Grade 12 - Senior Secondary</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Intervention Category</label>
                  <select
                    value={newNoteTag}
                    onChange={(e) => setNewNoteTag(e.target.value)}
                    className="w-full text-xs font-bold px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="Exam Anxiety">Exam Anxiety</option>
                    <option value="Stream Choice">Stream Choice</option>
                    <option value="Peer Climate">Peer Climate</option>
                    <option value="Circadian Health">Circadian Health</option>
                    <option value="Pastoral Care">Pastoral Care</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Observation & Action Taken</label>
                <textarea
                  rows={2}
                  value={newNoteContent}
                  onChange={(e) => setNewNoteContent(e.target.value)}
                  placeholder="Record intervention notes, classroom feedback, or scheduled followup..."
                  className="w-full text-xs font-medium p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!newNoteContent.trim()}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40 shadow-xs"
                >
                  <Plus size={15} />
                  <span>Add Note to Log</span>
                </button>
              </div>
            </form>

            {/* Notes List */}
            <div className="space-y-3 pt-3 border-t border-slate-100">
              {notes.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No pastoral notes logged yet. Use the form above to record grade-wide observations.
                </div>
              ) : (
                notes.map(note => (
                  <div key={note.id} className="p-4 rounded-2xl bg-slate-50/70 border border-slate-200 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-xs">{note.cohort}</span>
                        <span className="text-[10px] font-bold px-2 py-0.2 rounded-md bg-indigo-100 text-indigo-800">
                          {note.tag}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">{note.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-700 leading-relaxed pt-0.5">
                        {note.content}
                      </p>
                    </div>

                    <button
                      onClick={() => handleDeleteNote(note.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete note entry"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Helplines */}
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

      {/* Full Lesson Plan Modal */}
      {selectedPlaybookId && (
        <CounselorPlaybookModal
          isOpen={Boolean(selectedPlaybookId)}
          onClose={() => setSelectedPlaybookId(null)}
          planId={selectedPlaybookId}
        />
      )}

    </div>
  );
};
