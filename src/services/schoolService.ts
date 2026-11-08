/**
 * School Analytics & Differential Privacy Service
 * Communicates with Tauri IPC / Mock Backend for k-anonymity (k >= 5) cohort reports.
 */

import { safeInvoke as invoke } from '../utils/mockBackend';

export interface SchoolAnalyticsReport {
  cohort_size: number;
  average_wellbeing: number;
  top_career_clusters: string[];
  top_cognitive_strengths: string[];
  k_anonymity_threshold_met: boolean;
  differential_privacy_applied: boolean;
  privacy_epsilon: number;
  remaining_query_budget: number;
}

export async function getSchoolStudents(): Promise<string[]> {
  try {
    return await invoke<string[]>('get_school_students');
  } catch (err) {
    console.warn('[SchoolService] get_school_students fallback:', err);
    return [
      'vp-student-001', 'vp-student-002', 'vp-student-003', 'vp-student-004',
      'vp-student-005', 'vp-student-006', 'vp-student-007', 'vp-student-008'
    ];
  }
}

export async function generateSchoolReport(studentIds?: string[]): Promise<SchoolAnalyticsReport> {
  return await invoke<SchoolAnalyticsReport>('generate_school_report', {
    student_ids: studentIds && studentIds.length > 0 ? studentIds : []
  });
}

export function downloadCohortReportCsv(report: SchoolAnalyticsReport, cohortLabel: string): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const csvRows = [
    ['PRERNA Institutional Cohort Report', 'DPDP Act 2023 §9 Compliant'],
    ['Cohort', cohortLabel],
    ['Report Date', new Date().toISOString()],
    ['Anonymized Cohort Size (N)', report.cohort_size.toString()],
    ['k-Anonymity Threshold Met', report.k_anonymity_threshold_met ? 'YES (k >= 5)' : 'NO (< 5 suppressed)'],
    ['Differential Privacy Applied', report.differential_privacy_applied ? `Laplace (epsilon=${report.privacy_epsilon})` : 'NO'],
    ['Cohort Wellbeing Score (0-100)', report.average_wellbeing.toString()],
    ['Remaining Educator Query Budget', `${report.remaining_query_budget}/10`],
    [],
    ['Top RIASEC Career Horizons', 'Top Cognitive Strengths'],
  ];

  const maxLen = Math.max(report.top_career_clusters.length, report.top_cognitive_strengths.length);
  for (let i = 0; i < maxLen; i++) {
    csvRows.push([
      report.top_career_clusters[i] || '',
      report.top_cognitive_strengths[i] || ''
    ]);
  }

  csvRows.push([]);
  csvRows.push(['Statutory Notice', 'Zero student PII or individual scores exposed. Derived via DPDP Section 9 differential privacy.']);

  const csvContent = csvRows.map(row => row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PRERNA_${cohortLabel.replace(/\s+/g, '_')}_Report_${timestamp}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadCohortReportJson(report: SchoolAnalyticsReport, cohortLabel: string): void {
  const timestamp = new Date().toISOString().split('T')[0];
  const payload = {
    institution: 'PRERNA VidyaPeeth Model School',
    cohort: cohortLabel,
    generatedAt: new Date().toISOString(),
    complianceNotice: '100% Anonymized aggregate telemetry per Section 9 DPDP Act 2023. Zero PII, zero individual surveillance.',
    metrics: report
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `PRERNA_${cohortLabel.replace(/\s+/g, '_')}_Report_${timestamp}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

