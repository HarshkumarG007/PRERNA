import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { somaticAudio } from '../../utils/audioSynthesis';

export interface LessonPlan {
  id: string;
  title: string;
  category: string;
  targetCohort: string;
  duration: string;
  summary: string;
  sections: {
    title: string;
    duration: string;
    instructions: string[];
  }[];
  printableHandoutText: string;
}

export const LESSON_PLANS: Record<string, LessonPlan> = {
  exam_calm: {
    id: 'exam_calm',
    title: '15-Minute Pre-Exam Somatic Calming Protocol',
    category: 'Academic Flourishing & Anxiety Grounding',
    targetCohort: 'Grades 10 to 12 (Board & Midterm Cohorts)',
    duration: '15 Minutes',
    summary: 'A teacher-guided classroom protocol to downregulate sympathetic fight-or-flight nervous arousal before exams using 432 Hz coherent breathing and Socratic cognitive reframing.',
    sections: [
      {
        title: 'Phase 1: Physical Grounding & Posture Check',
        duration: '0–3 Min',
        instructions: [
          'Ask all students to place both feet firmly flat on the classroom floor.',
          'Instruct students to drop their shoulders away from their ears and unclamp their jaw.',
          'Teacher prompt: "Your exam paper measures your preparation on a specific syllabus—it does not define your infinite human potential."'
        ]
      },
      {
        title: 'Phase 2: Projector-Guided Coherent Breathing',
        duration: '3–8 Min',
        instructions: [
          'Launch PRERNA Smartboard Sanctuary mode on the classroom board.',
          'Synchronize the class to the 5s Inhale / 5s Exhale coherent breathing rhythm.',
          'Maintain silence with soft 432 Hz acoustic harmonic resonance.'
        ]
      },
      {
        title: 'Phase 3: Cognitive Decoupling & Sant Kabir Reflection',
        duration: '8–12 Min',
        instructions: [
          'Read aloud the Sant Kabir Doha: "धीरे-धीरे रे मना, धीरे सब कुछ होय। माली सींचे सौ घड़ा, ॠतु आए फल होय॥"',
          'Invite students to take three deep diaphragmatic breaths as they visualize calmly reading each exam question.'
        ]
      },
      {
        title: 'Phase 4: Settling & Focus Affirmation',
        duration: '12–15 Min',
        instructions: [
          'Instruct students to open their eyes gently, sip water, and take their seats with a quiet, centered mind.'
        ]
      }
    ],
    printableHandoutText: `PRERNA VIDYAPEETH MODEL SCHOOL • CLASSROOM PROTOCOL
Title: 15-Minute Pre-Exam Somatic Calming Protocol
Target: Grade 10-12 Secondary Students
Objective: Downregulate sympathetic autonomic distress before test taking.

Phase 1 (0-3m): Physical Grounding. Feet flat, shoulders relaxed, jaw released.
Phase 2 (3-8m): Synchronized 5-5 Coherent Breathing via Smartboard.
Phase 3 (8-12m): Cognitive Reframing. Separate self-worth from exam scores.
Phase 4 (12-15m): Quiet settling & water intake.

Statutory Notice: DPDP Act 2023 §9 Compliant • Zero PII collected.`
  },
  stream_matrix: {
    id: 'stream_matrix',
    title: 'NEP 2020 Multi-Disciplinary Stream Guidance Matrix',
    category: 'Vocational Horizon & Holistic Discovery',
    targetCohort: 'Grade 10 & 11 Stream Transition Cohorts',
    duration: '45-Minute Counseling Workshop',
    summary: 'A structured career decision framework mapping Holland RIASEC psychometric interest vectors to National Education Policy (NEP 2020) flexible subject combinations without external parental or peer coercion.',
    sections: [
      {
        title: 'Domain A: Investigative + Realistic (STEM & Systems)',
        duration: '10 Min',
        instructions: [
          'Primary RIASEC Skew: High Curiosity, Scientific Inquiry, Mechanical/Algorithmic Problem Solving.',
          'Recommended NEP Combinations: Mathematics, Physics, Computer Applications, with Philosophy or Fine Arts minor.',
          'Horizon Roles: Software Engineering, Data Science, Biomedical Engineering, Robotics, Environmental Sciences.'
        ]
      },
      {
        title: 'Domain B: Social + Investigative (Healthcare, Mind & Society)',
        duration: '10 Min',
        instructions: [
          'Primary RIASEC Skew: Empathy, Psychological Insight, Public Health, Teaching.',
          'Recommended NEP Combinations: Biology, Psychology, Sociology, English Literature, Chemistry.',
          'Horizon Roles: Medicine, Clinical Psychology, Public Health Policy, Special Education, Social Entrepreneurship.'
        ]
      },
      {
        title: 'Domain C: Enterprising + Conventional (Commerce & Enterprise)',
        duration: '10 Min',
        instructions: [
          'Primary RIASEC Skew: Leadership, Strategic Planning, Financial Systems, Persuasion.',
          'Recommended NEP Combinations: Economics, Accountancy, Business Studies, Applied Mathematics, Legal Studies.',
          'Horizon Roles: Investment Banking, Corporate Law, Management Consulting, Chartered Accountancy, FinTech.'
        ]
      },
      {
        title: 'Domain D: Artistic + Social/Enterprising (Design & Media)',
        duration: '10 Min',
        instructions: [
          'Primary RIASEC Skew: Creative Divergence, Visual/Narrative Expression, Cultural Innovation.',
          'Recommended NEP Combinations: Graphic Design, Media Studies, History, Psychology, Languages.',
          'Horizon Roles: UI/UX Architecture, Journalism, Game Narrative Design, Film Direction, Industrial Design.'
        ]
      }
    ],
    printableHandoutText: `PRERNA VIDYAPEETH MODEL SCHOOL • STREAM GUIDANCE FRAMEWORK
Title: NEP 2020 Multi-Disciplinary Stream Guidance Matrix
Target: Grades 10 to 11 Transition
Objective: Non-coercive career exploration aligned with natural RIASEC psychometric strengths.

Holland RIASEC Alignments:
1. Investigative + Realistic -> STEM, Computing, Environmental Science
2. Social + Investigative -> Psychology, Healthcare, Education, Public Policy
3. Enterprising + Conventional -> Economics, Business, Law, Corporate Finance
4. Artistic + Social -> Media, UI/UX Design, Architecture, Creative Arts

Guiding Creed: "Self Realisation is God's Realisation" — Sant Kabir`
  },
  sleep_hygiene: {
    id: 'sleep_hygiene',
    title: 'Adolescent Circadian Health & Sleep Hygiene Sanctuary',
    category: 'Biological Vitality & Digital Balance',
    targetCohort: 'All Secondary Students & Parents',
    duration: 'Parent-Teacher Guide',
    summary: 'Evidence-based circadian sleep guidance explaining 90-minute ultradian sleep architecture to prevent adolescent cognitive burnout and late-night digital blue-light delay.',
    sections: [
      {
        title: 'Principle 1: 90-Minute Ultradian Sleep Architecture',
        duration: 'Guidelines',
        instructions: [
          'Adolescent sleep consists of complete 90-minute ultradian cycles (Light -> Deep -> REM).',
          'Waking mid-cycle (e.g. at 7 hours) induces sleep inertia and brain fog.',
          'Aim for either 5 full cycles (7.5 hours) or 6 full cycles (9.0 hours) calculated from bedtime.'
        ]
      },
      {
        title: 'Principle 2: The 45-Minute Evening Digital Curfew',
        duration: 'Guidelines',
        instructions: [
          'Melatonin production in teens naturally peaks 2 hours later than in adults.',
          'Blue-wavelength screen exposure past 10:00 PM suppresses nocturnal melatonin synthesis by up to 50%.',
          'Recommend charging mobile phones outside the adolescent bedroom overnight.'
        ]
      },
      {
        title: 'Principle 3: Morning Solar Circadian Reset',
        duration: 'Guidelines',
        instructions: [
          'Expose eyes to natural morning daylight within 30 minutes of waking.',
          'Re-anchors the master circadian suprachiasmatic nucleus (SCN) without caffeine or stress.'
        ]
      }
    ],
    printableHandoutText: `PRERNA VIDYAPEETH MODEL SCHOOL • CIRCADIAN HEALTH GUIDE
Title: Adolescent Circadian Health & Sleep Hygiene
Target: Students & Parents

1. 90-Minute Cycle Rule: Plan sleep in 7.5 hour (5 cycle) or 9 hour (6 cycle) intervals.
2. 45-Minute Evening Curfew: Keep screens outside the bedroom 45 minutes before sleep.
3. Morning Sunlight: 10 minutes of natural outdoor light resets focus naturally.

Zero Telemetry • DPDP Act 2023 §9 Compliant`
  }
};

interface CounselorPlaybookModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
}

export const CounselorPlaybookModal: React.FC<CounselorPlaybookModalProps> = ({
  isOpen,
  onClose,
  planId,
}) => {
  if (!isOpen) return null;

  const plan = LESSON_PLANS[planId] || LESSON_PLANS.exam_calm;

  const handleDownloadMarkdown = () => {
    somaticAudio.playStarBeaconChime();
    const mdContent = `# ${plan.title}
**Category:** ${plan.category}  
**Target Cohort:** ${plan.targetCohort}  
**Suggested Duration:** ${plan.duration}  

## Summary
${plan.summary}

---

## Instructional Framework
${plan.sections.map(s => `### ${s.title} (${s.duration})
${s.instructions.map(inst => `- ${inst}`).join('\n')}
`).join('\n')}

---
### Printable Handout Summary
\`\`\`
${plan.printableHandoutText}
\`\`\`

*PRERNA VidyaPeeth Institutional Portal • DPDP Act 2023 §9 Protected*
`;

    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `PRERNA_Lesson_Plan_${plan.id}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

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
          #printable-playbook-content, #printable-playbook-content * {
            visibility: visible;
          }
          #printable-playbook-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 15mm;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      <div className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl flex flex-col max-h-[90vh] overflow-hidden border border-slate-200">
        
        {/* Top Header (No print) */}
        <div className="no-print p-6 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">
                Actionable Counselor Guide
              </span>
              <span className="text-xs text-slate-500 font-semibold">• {plan.targetCohort}</span>
            </div>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              {plan.title}
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Lesson Plan"
            >
              <Printer size={15} />
              <span>Print</span>
            </button>
            <button
              onClick={handleDownloadMarkdown}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
              title="Download Markdown"
            >
              <Download size={15} />
              <span>Export .MD</span>
            </button>
            <button
              onClick={() => {
                somaticAudio.playSoftChime();
                onClose();
              }}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div id="printable-playbook-content" className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6">
          <div className="p-4 rounded-2xl bg-indigo-50/70 border border-indigo-100 text-xs text-indigo-950 space-y-1">
            <strong className="block text-indigo-900 font-bold text-sm">{plan.category} ({plan.duration})</strong>
            <p className="leading-relaxed">{plan.summary}</p>
          </div>

          {/* Sections List */}
          <div className="space-y-4">
            <h4 className="font-black text-slate-900 text-sm uppercase tracking-wider">
              Step-by-Step Classroom Delivery Sequence:
            </h4>

            {plan.sections.map((sec, i) => (
              <div key={i} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <h5 className="font-bold text-slate-900 text-xs sm:text-sm flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] flex items-center justify-center font-bold">
                      {i + 1}
                    </span>
                    <span>{sec.title}</span>
                  </h5>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-white text-slate-600 border border-slate-200">
                    {sec.duration}
                  </span>
                </div>

                <ul className="space-y-1.5 pt-1 text-xs text-slate-600">
                  {sec.instructions.map((inst, idx) => (
                    <li key={idx} className="flex items-start gap-2 leading-relaxed">
                      <span className="text-indigo-600 font-bold">•</span>
                      <span>{inst}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Bottom Handout Text Box */}
          <div className="p-5 rounded-2xl bg-slate-900 text-slate-200 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-amber-400">
              <span>Quick Printable Roster Summary:</span>
              <span className="text-[10px] text-slate-400 font-mono">100% PII Free</span>
            </div>
            <pre className="text-[11px] font-mono whitespace-pre-wrap text-slate-300 bg-slate-950 p-3 rounded-xl border border-white/10 overflow-x-auto">
              {plan.printableHandoutText}
            </pre>
          </div>
        </div>

        {/* Footer (No print) */}
        <div className="no-print p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Ready for homeroom periods, staff briefings, or parent orientation sessions.</span>
          <button
            onClick={() => {
              somaticAudio.playSoftChime();
              onClose();
            }}
            className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-200 font-bold cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};

