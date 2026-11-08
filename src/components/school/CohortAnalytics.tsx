import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Brain, 
  ShieldCheck, 
  AlertTriangle, 
  Download, 
  RefreshCw, 
  Lock, 
  Sparkles,
  Gauge
} from 'lucide-react';
import { 
  SchoolAnalyticsReport, 
  generateSchoolReport, 
  downloadCohortReportCsv, 
  downloadCohortReportJson 
} from '../../services/schoolService';
import { somaticAudio } from '../../utils/audioSynthesis';

interface CohortFilterOption {
  id: string;
  label: string;
  studentIds: string[];
}

export const CohortAnalytics: React.FC = () => {
  const [report, setReport] = useState<SchoolAnalyticsReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCohortId, setSelectedCohortId] = useState<string>('all');

  const cohortOptions: CohortFilterOption[] = [
    {
      id: 'all',
      label: 'Whole School Cohort (N=8)',
      studentIds: [
        'vp-student-001', 'vp-student-002', 'vp-student-003', 'vp-student-004',
        'vp-student-005', 'vp-student-006', 'vp-student-007', 'vp-student-008'
      ]
    },
    {
      id: 'grade_10_11',
      label: 'Secondary Senior (Grades 10 & 11, N=6)',
      studentIds: [
        'vp-student-001', 'vp-student-002', 'vp-student-003',
        'vp-student-004', 'vp-student-005', 'vp-student-006'
      ]
    },
    {
      id: 'grade_10_small',
      label: 'Grade 10 Section A (N=2 • Test Small-Cell)',
      studentIds: ['vp-student-001', 'vp-student-002']
    },
    {
      id: 'grade_11_small',
      label: 'Grade 11 Section B (N=3 • Test Small-Cell)',
      studentIds: ['vp-student-004', 'vp-student-005', 'vp-student-006']
    }
  ];

  const activeCohort = cohortOptions.find(c => c.id === selectedCohortId) || cohortOptions[0];

  const fetchAnalytics = useCallback(async (studentIds?: string[]) => {
    setLoading(true);
    setError(null);
    try {
      const data = await generateSchoolReport(studentIds);
      setReport(data);
    } catch (err: any) {
      console.error('[CohortAnalytics] Error loading school report:', err);
      setError(err?.message || String(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics(activeCohort.studentIds);
  }, [activeCohort.studentIds, fetchAnalytics]);

  const handleSelectCohort = (option: CohortFilterOption) => {
    somaticAudio.playSoftChime();
    setSelectedCohortId(option.id);
  };

  const handleExportCsv = () => {
    if (!report) return;
    somaticAudio.playStarBeaconChime();
    downloadCohortReportCsv(report, activeCohort.label);
  };

  const handleExportJson = () => {
    if (!report) return;
    somaticAudio.playStarBeaconChime();
    downloadCohortReportJson(report, activeCohort.label);
  };

  return (
    <div className="space-y-6">
      
      {/* Cohort Selector & Privacy Controls Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              DPDP Section 9 Engine
            </span>
            <span className="text-xs text-slate-400 font-semibold">• Active Cohort View</span>
          </div>
          <h3 className="font-black text-slate-900 text-lg">
            Cohort Differential Privacy Analytics
          </h3>
        </div>

        {/* Cohort Pill Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {cohortOptions.map(option => (
            <button
              key={option.id}
              onClick={() => handleSelectCohort(option)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                selectedCohortId === option.id
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {option.label}
            </button>
          ))}

          <button
            onClick={() => fetchAnalytics(activeCohort.studentIds)}
            disabled={loading}
            className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200 transition-colors cursor-pointer"
            title="Refresh Cohort Telemetry"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Error or Differencing Attack Banner */}
      {error && (
        <div className="p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle size={18} className="text-amber-700" />
            <span>Privacy Guard Triggered</span>
          </div>
          <p className="text-xs leading-relaxed text-amber-800">
            {error}
          </p>
          <div className="text-[11px] text-amber-700 font-medium">
            💡 <em>Rule H-09 Explanation:</em> Overlapping queries differing by fewer than 5 students are rejected to mathematically prevent differencing attacks against individual adolescents.
          </div>
        </div>
      )}

      {/* Main Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Aggregate Career Horizons & RIASEC */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-black text-slate-900 flex items-center gap-2 text-base">
                  <Brain size={18} className="text-indigo-600" /> Top Vocational Horizons
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Small-Cell Suppressed ($\tau \ge 3$) • Holland RIASEC Aggregates
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleExportCsv}
                  disabled={!report || !report.k_anonymity_threshold_met}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold uppercase rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
                  title="Export aggregate CSV"
                >
                  <Download size={12} /> CSV
                </button>
                <button
                  onClick={handleExportJson}
                  disabled={!report || !report.k_anonymity_threshold_met}
                  className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-bold uppercase rounded-lg border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer disabled:opacity-40"
                  title="Export aggregate JSON"
                >
                  <Download size={12} /> JSON
                </button>
              </div>
            </div>

            {loading ? (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                <RefreshCw size={16} className="animate-spin mr-2" /> Computing differential privacy aggregates...
              </div>
            ) : report && !report.k_anonymity_threshold_met ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 my-4">
                <Lock size={24} className="mx-auto text-slate-400" />
                <h5 className="font-bold text-slate-700 text-xs">Small-Cell Privacy Threshold Not Met</h5>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                  The selected cohort has <strong>{report.cohort_size} students</strong>, which is below the statutory $k \ge 5$ threshold. Individual career distributions are withheld to protect student identity.
                </p>
              </div>
            ) : report ? (
              <div className="space-y-4 my-2">
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Leading Career Clusters:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {report.top_career_clusters.map((cluster, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-800 text-xs font-bold border border-indigo-100 flex items-center gap-1.5"
                      >
                        <Sparkles size={13} className="text-indigo-600" />
                        {cluster}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Prominent Cognitive Strengths:
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {report.top_cognitive_strengths.map((str, i) => (
                      <span 
                        key={i}
                        className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-100"
                      >
                        {str}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Enforcing NEP 2020 Holistic Evaluation</span>
            <span className="font-mono text-emerald-600 font-bold">Zero Diagnostic Labels</span>
          </div>
        </div>

        {/* Aggregate Wellbeing Index with Laplace Noise */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-black text-slate-900 flex items-center gap-2 text-base">
                  <Activity size={18} className="text-emerald-600" /> Institutional Wellbeing Index
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Laplace Differential Privacy ($\epsilon = 1.0$) • Zero Raw Data
                </p>
              </div>

              {report && (
                <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded-full border ${
                  report.differential_privacy_applied
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-500 border-slate-200'
                }`}>
                  {report.differential_privacy_applied ? 'DP Noise Active' : 'Suppressed'}
                </span>
              )}
            </div>

            {loading ? (
              <div className="h-44 flex items-center justify-center text-xs text-slate-400">
                <RefreshCw size={16} className="animate-spin mr-2" /> Sampling Laplace variates...
              </div>
            ) : report && !report.k_anonymity_threshold_met ? (
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200 text-center space-y-2 my-4">
                <Lock size={24} className="mx-auto text-slate-400" />
                <h5 className="font-bold text-slate-700 text-xs">Wellbeing Metric Suppressed</h5>
                <p className="text-[11px] text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Average score calculation requires at least 5 independent student records to prevent individual score extraction.
                </p>
              </div>
            ) : report ? (
              <div className="space-y-4 my-2">
                <div className="flex items-baseline gap-3">
                  <div className="text-5xl font-black text-slate-900">
                    {report.average_wellbeing}
                    <span className="text-lg font-bold text-slate-400">/100</span>
                  </div>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    report.average_wellbeing >= 75
                      ? 'bg-emerald-100 text-emerald-800'
                      : report.average_wellbeing >= 60
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {report.average_wellbeing >= 75 ? 'Flourishing Equilibrium' : 'Moderate Vitality'}
                  </span>
                </div>

                <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-slate-600 font-semibold">
                    <span>Differential Noise Scale ($b$):</span>
                    <span className="font-mono font-bold text-slate-800">
                      ±{(100 / Math.max(report.cohort_size, 5) / report.privacy_epsilon).toFixed(2)} pts
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 font-semibold">
                    <span>Privacy Parameter ($\epsilon$):</span>
                    <span className="font-mono font-bold text-indigo-700">1.0 (Rigorous)</span>
                  </div>
                  <div className="flex items-center justify-between text-slate-600 font-semibold">
                    <span>Active Sample Size:</span>
                    <span className="font-mono font-bold text-slate-800">{report.cohort_size} students</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Privacy Budget Counter */}
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">
            <div className="flex items-center gap-1.5 font-bold text-slate-600">
              <Gauge size={14} className="text-indigo-600" />
              <span>Session Query Budget:</span>
            </div>
            <span className={`font-mono font-black px-2 py-0.5 rounded-md ${
              (report?.remaining_query_budget ?? 10) > 3
                ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                : 'bg-rose-50 text-rose-700 border border-rose-200'
            }`}>
              {report?.remaining_query_budget ?? 10} / 10 remaining
            </span>
          </div>
        </div>

      </div>

      {/* Statutory DPDP & Visva-Bharati Transparency Notice */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <ShieldCheck size={20} className="text-emerald-400 flex-shrink-0" />
          <span className="text-slate-200">
            <strong>Rabindranath Tagore’s Visva-Bharati Invariant:</strong> Counselors guide collective flourishing without ever inspecting personal journals, private chats, or individual mental scores.
          </span>
        </div>
        <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider px-2 py-1 rounded-full bg-emerald-500/20 whitespace-nowrap">
          Mathematically Non-Reconstructible
        </span>
      </div>

    </div>
  );
};
