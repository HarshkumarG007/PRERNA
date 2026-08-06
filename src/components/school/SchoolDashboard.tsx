import React, { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/core';
import { ShieldAlert, Users, TrendingUp, Briefcase, Brain, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface SchoolReport {
  cohort_size: number;
  average_wellbeing: number;
  top_career_clusters: string[];
  top_cognitive_strengths: string[];
  k_anonymity_threshold_met: boolean;
}

export const SchoolDashboard: React.FC = () => {
  const [report, setReport] = useState<SchoolReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // We pass dummy student IDs for the purpose of the UI demo.
    // The backend K-Anonymity threshold is 5.
    const dummyStudentIds = ['student_1', 'student_2', 'student_3', 'student_4', 'student_5', 'student_6'];
    
    invoke<SchoolReport>('generate_school_report', { studentIds: dummyStudentIds })
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch school report");
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="flex h-[80vh] items-center justify-center flex-col text-red-600">
        <ShieldAlert size={64} className="mb-4" />
        <h2 className="text-2xl font-bold">{error || "Failed to load"}</h2>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <Link to="/" className="text-indigo-600 hover:text-indigo-800 flex items-center gap-2 font-bold mb-4">
            <ArrowLeft size={20} /> Back to Hub
          </Link>
          <h1 className="text-4xl font-black text-gray-900 tracking-tight">School Counselor Dashboard</h1>
          <p className="text-gray-500 font-medium text-lg mt-2">Aggregate insights for cohort wellbeing and trends.</p>
        </div>
      </div>

      {!report.k_anonymity_threshold_met ? (
        <div className="bg-red-50 border-2 border-red-500 rounded-3xl p-10 flex flex-col items-center text-center shadow-lg">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-6">
            <ShieldAlert className="text-red-600" size={40} />
          </div>
          <h2 className="text-3xl font-black text-red-900 mb-4">K-Anonymity Privacy Lock Active</h2>
          <p className="text-lg text-red-800 max-w-2xl font-medium">
            The requested cohort size ({report.cohort_size}) is below our strict privacy threshold (Minimum 5). 
            Data has been withheld to prevent the deanonymization of individual students.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-fade-in-up">
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Users className="text-blue-600" size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Total Cohort</p>
                <div className="text-5xl font-black text-gray-900">{report.cohort_size} <span className="text-xl text-gray-400 font-medium tracking-normal">students</span></div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex items-center gap-6">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="text-emerald-600" size={32} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-1">Avg Wellbeing</p>
                <div className="text-5xl font-black text-emerald-600">{report.average_wellbeing} <span className="text-xl text-gray-400 font-medium tracking-normal">/ 100</span></div>
              </div>
            </div>
          </div>

          {/* Insights */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-8 border border-indigo-100">
              <h3 className="text-2xl font-black text-indigo-950 flex items-center gap-3 mb-6">
                <Briefcase className="text-indigo-600" size={28} /> Top Career Clusters
              </h3>
              <ul className="space-y-4">
                {report.top_career_clusters.map((cluster, idx) => (
                  <li key={idx} className="bg-white/60 p-4 rounded-xl border border-white font-bold text-indigo-900 text-lg flex items-center gap-4 shadow-sm">
                    <span className="text-indigo-400 font-black text-2xl">0{idx + 1}</span> {cluster}
                  </li>
                ))}
                {report.top_career_clusters.length === 0 && <li className="text-indigo-600/60 font-medium">No distinct clusters formed yet.</li>}
              </ul>
            </div>

            <div className="bg-gradient-to-br from-fuchsia-50 to-pink-50 rounded-3xl p-8 border border-fuchsia-100">
              <h3 className="text-2xl font-black text-fuchsia-950 flex items-center gap-3 mb-6">
                <Brain className="text-fuchsia-600" size={28} /> Top Cognitive Strengths
              </h3>
              <ul className="space-y-4">
                {report.top_cognitive_strengths.map((strength, idx) => (
                  <li key={idx} className="bg-white/60 p-4 rounded-xl border border-white font-bold text-fuchsia-900 text-lg flex items-center gap-4 shadow-sm">
                    <span className="text-fuchsia-400 font-black text-2xl">0{idx + 1}</span> {strength}
                  </li>
                ))}
                {report.top_cognitive_strengths.length === 0 && <li className="text-fuchsia-600/60 font-medium">No distinct strengths mapped yet.</li>}
              </ul>
            </div>
          </div>
          
          <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-2xl flex items-start gap-4">
            <ShieldAlert className="text-emerald-600 flex-shrink-0 mt-1" size={24} />
            <div>
              <h4 className="font-bold text-emerald-900 text-lg mb-1">K-Anonymity Verified</h4>
              <p className="text-emerald-800">
                This report aggregates data from {report.cohort_size} students, successfully exceeding the minimum threshold of 5 required to guarantee individual privacy. No single student's data can be extrapolated from these results.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
