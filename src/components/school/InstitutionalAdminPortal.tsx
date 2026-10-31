import React, { useState } from 'react';
import { 
  Building2, 
  Key, 
  Users, 
  Copy, 
  CheckCircle2, 
  ShieldCheck, 
  FileSpreadsheet, 
  Sparkles, 
  Receipt
} from 'lucide-react';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { generateTaxInvoice, downloadTaxInvoiceReceipt } from '../../services/paymentGateway';
import { somaticAudio } from '../../utils/audioSynthesis';

interface StudentToken {
  id: string;
  token: string;
  gradeSection: string;
  status: 'available' | 'claimed';
  createdAt: string;
}

export const InstitutionalAdminPortal: React.FC = () => {
  const { schoolLicense } = useSubscriptionStore();
  
  // Batch generator state
  const [grade, setGrade] = useState('Grade 9');
  const [section, setSection] = useState('Section A');
  const [studentCount, setStudentCount] = useState<number>(30);
  const [generatedTokens, setGeneratedTokens] = useState<StudentToken[]>([]);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const [showInvoiceAlert, setShowInvoiceAlert] = useState(false);

  // Stats
  const allocatedSeats = 1500;
  const activeEnrolled = 920;
  const remainingSeats = allocatedSeats - activeEnrolled;

  const handleGenerateBatch = () => {
    somaticAudio.playStarBeaconChime();
    const prefix = `${grade.replace(' ', '')}-${section.replace(' ', '')}`;
    const newTokens: StudentToken[] = [];
    
    for (let i = 1; i <= studentCount; i++) {
      const paddedNum = String(i).padStart(3, '0');
      const randomHex = Math.random().toString(36).substring(2, 6).toUpperCase();
      newTokens.push({
        id: `tok_${Date.now()}_${i}`,
        token: `PRERNA-${prefix}-${paddedNum}-${randomHex}`,
        gradeSection: `${grade} - ${section}`,
        status: 'available',
        createdAt: new Date().toISOString()
      });
    }

    setGeneratedTokens(newTokens);
  };

  const handleCopyToken = (tok: string) => {
    navigator.clipboard.writeText(tok);
    setCopiedToken(tok);
    somaticAudio.playSoftChime();
    setTimeout(() => setCopiedToken(null), 2000);
  };

  const handleDownloadCsv = () => {
    somaticAudio.playSoftChime();
    const csvRows = [
      ['Pseudonymous ID', 'Class Section', 'Status', 'Activation Guide', 'DPDP Compliance Notice'],
      ...generatedTokens.map(t => [
        t.token,
        t.gradeSection,
        t.status,
        'Enter token on initial PRERNA launch screen',
        'Section 9 DPDP Act 2023 - Zero Student PII collected or stored'
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + csvRows.map(e => e.map(cell => `"${cell}"`).join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `PRERNA_Student_Tokens_${grade.replace(' ', '_')}_${section.replace(' ', '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadInvoice = () => {
    somaticAudio.playStarBeaconChime();
    const invoice = generateTaxInvoice(
      {
        planTitle: 'Campus VidyaPeeth Annual License',
        amountInr: 49999,
        tierId: 'campus_annual',
        type: 'school',
        userEmail: 'principal@dps-delhi.edu.in'
      },
      `TXN_SCH_${Date.now()}`
    );

    downloadTaxInvoiceReceipt(invoice);
    setShowInvoiceAlert(true);
    setTimeout(() => setShowInvoiceAlert(false), 4000);
  };

  return (
    <div className="space-y-8 text-left" role="region" aria-label="Institutional Admin Portal">
      {/* License & Stewardship Banner */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xs">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="p-2 bg-indigo-50 border border-indigo-200 rounded-xl text-indigo-700">
                <Building2 size={20} />
              </span>
              <span className="text-xs uppercase font-extrabold tracking-widest text-indigo-900">
                VidyaPeeth Institutional Portal • विद्यापीठ प्रशासन
              </span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">
              PRERNA VidyaPeeth Secondary Campus
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Institutional ID: <span className="font-mono font-bold text-slate-700">DPS-VK-2026-DELHI-CAMPUS</span> • Tier: <span className="font-bold text-indigo-700 uppercase">{schoolLicense || 'Pilot Campus'}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleDownloadInvoice}
              className="px-4 py-2.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-xs"
              title="Download official GST tax invoice"
            >
              <Receipt size={14} className="text-amber-400" />
              <span>Download GST Receipt (SAC 998431)</span>
            </button>
          </div>
        </div>

        {showInvoiceAlert && (
          <div className="mt-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 font-medium flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Tax invoice downloaded with 18% GST breakdown (CGST ₹4,500 + SGST ₹4,500) and HSN/SAC SAC 998431.</span>
          </div>
        )}

        {/* License Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
          <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
              <span>Licensed Seat Capacity</span>
              <Users size={16} className="text-indigo-600" />
            </div>
            <div className="text-2xl font-black text-slate-900">{allocatedSeats.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-slate-500 mt-1">₹49,999/yr Institutional Tier</div>
          </div>

          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-emerald-700 mb-1">
              <span>Enrolled Anonymous Peers</span>
              <ShieldCheck size={16} className="text-emerald-700" />
            </div>
            <div className="text-2xl font-black text-emerald-900">{activeEnrolled.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-emerald-700 mt-1">DPDP Act §9 Cryptographic Pseudonyms</div>
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl">
            <div className="flex items-center justify-between text-xs text-amber-700 mb-1">
              <span>Remaining Capacity</span>
              <Sparkles size={16} className="text-amber-600" />
            </div>
            <div className="text-2xl font-black text-amber-900">{remainingSeats.toLocaleString('en-IN')}</div>
            <div className="text-[11px] text-amber-700 mt-1">Available for new student batches</div>
          </div>
        </div>
      </div>

      {/* Batch Anonymized Token Provisioning */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Key size={18} className="text-amber-600" />
              <span>Batch Anonymized Token Provisioner</span>
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Generate zero-PII onboarding tokens for entire classrooms. Students pair without disclosing names, emails, or phone numbers.
            </p>
          </div>
        </div>

        {/* Generator Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200/70">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Grade</label>
            <select
              value={grade}
              onChange={(e) => setGrade(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Grade 8">Grade 8</option>
              <option value="Grade 9">Grade 9</option>
              <option value="Grade 10">Grade 10</option>
              <option value="Grade 11">Grade 11</option>
              <option value="Grade 12">Grade 12</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Section</label>
            <select
              value={section}
              onChange={(e) => setSection(e.target.value)}
              className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="Section A">Section A</option>
              <option value="Section B">Section B</option>
              <option value="Section C">Section C</option>
              <option value="Section D">Section D</option>
              <option value="Science">Science Cohort</option>
              <option value="Commerce">Commerce Cohort</option>
              <option value="Humanities">Humanities Cohort</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Number of Students</label>
            <input
              type="number"
              min={5}
              max={100}
              value={studentCount}
              onChange={(e) => setStudentCount(Math.max(5, Math.min(100, parseInt(e.target.value) || 5)))}
              className="w-full text-xs font-bold px-3 py-2 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={handleGenerateBatch}
              className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <Sparkles size={14} />
              <span>Generate Tokens</span>
            </button>
          </div>
        </div>

        {/* Generated Tokens Table */}
        {generatedTokens.length > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">
                Generated {generatedTokens.length} Pseudonymous Activation Tokens for {grade} - {section}
              </span>
              <button
                onClick={handleDownloadCsv}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FileSpreadsheet size={14} />
                <span>Export CSV for Classroom Distribution</span>
              </button>
            </div>

            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-2xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 sticky top-0 border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4 font-bold text-slate-600">#</th>
                    <th className="py-2.5 px-4 font-bold text-slate-600">Pseudonymous Activation Token</th>
                    <th className="py-2.5 px-4 font-bold text-slate-600">Class Section</th>
                    <th className="py-2.5 px-4 font-bold text-slate-600">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {generatedTokens.map((tok, idx) => (
                    <tr key={tok.id} className="hover:bg-slate-50/50">
                      <td className="py-2 px-4 text-slate-400 font-mono text-[11px]">{idx + 1}</td>
                      <td className="py-2 px-4 font-mono font-bold text-indigo-700">{tok.token}</td>
                      <td className="py-2 px-4 text-slate-600 font-medium">{tok.gradeSection}</td>
                      <td className="py-2 px-4">
                        <button
                          onClick={() => handleCopyToken(tok.token)}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          {copiedToken === tok.token ? (
                            <>
                              <CheckCircle2 size={12} className="text-emerald-600" />
                              <span className="text-emerald-700">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy size={12} />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Differential Privacy $k \ge 5$ Guarantee Explainer */}
      <div className="p-6 bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-3xl shadow-md space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck size={20} className="text-emerald-400" />
          <h3 className="text-sm font-black tracking-tight text-white uppercase">
            Statutory Differential Privacy Guarantee ($k \ge 5$)
          </h3>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          Under the <strong>Digital Personal Data Protection (DPDP) Act 2023 §9</strong>, schools and educational institutions are legally prohibited from monitoring minor students’ individual behavioral or mental-health data. PRERNA enforces a mathematical invariant: 
          if any cohort or classroom section has fewer than 5 active responses, <strong>all aggregate metrics are strictly suppressed</strong> to prevent deductive re-identification of vulnerable adolescents.
        </p>
        <div className="flex flex-wrap gap-3 pt-2 text-[11px]">
          <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/15">
            Tele-MANAS Toll-Free: <strong className="text-amber-400 font-mono">14416</strong>
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/15">
            National Childline: <strong className="text-amber-400 font-mono">1098</strong>
          </span>
          <span className="px-3 py-1 rounded-full bg-white/10 text-slate-200 border border-white/15">
            Zero Surveillance Architecture
          </span>
        </div>
      </div>
    </div>
  );
};
