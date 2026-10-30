import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Sparkles, 
  Check, 
  Building2, 
  ShieldCheck, 
  ArrowRight,
  GraduationCap
} from 'lucide-react';
import { useSubscriptionStore, SchoolLicenseTier } from '../../store/subscriptionStore';
import { somaticAudio } from '../../utils/audioSynthesis';

interface SchoolLicensingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SchoolLicensingModal: React.FC<SchoolLicensingModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { schoolLicense, schoolPilotDaysRemaining, schoolExpiresAt, upgradeSchoolLicense } = useSubscriptionStore();
  const [selectedTier, setSelectedTier] = useState<SchoolLicenseTier>('campus_annual');
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessBadge, setShowSuccessBadge] = useState(false);

  if (!isOpen) return null;

  const handleActivate = (tier: SchoolLicenseTier) => {
    setIsProcessing(true);
    somaticAudio.playSoftChime();

    setTimeout(() => {
      upgradeSchoolLicense(tier);
      setIsProcessing(false);
      setShowSuccessBadge(true);
      somaticAudio.playStarBeaconChime();

      setTimeout(() => {
        setShowSuccessBadge(false);
        onClose();
      }, 1400);
    }, 900);
  };

  const TIERS = [
    {
      id: 'campus_annual' as SchoolLicenseTier,
      title: 'Campus Annual License',
      price: '₹49,000',
      period: '/ campus / year',
      badge: 'Single Campus',
      badgeColor: 'bg-indigo-100 text-indigo-900 border-indigo-300',
      description: 'Complete student cohort flourishing intelligence for one school campus (up to 3,000 students).',
      popular: true,
    },
    {
      id: 'district_annual' as SchoolLicenseTier,
      title: 'District & Trust License',
      price: '₹1,49,000',
      period: '/ group / year',
      badge: 'Multi-Campus',
      badgeColor: 'bg-amber-100 text-amber-900 border-amber-300',
      description: 'Centralized district reporting across up to 5 campuses with cross-school anonymized benchmarks.',
      popular: false,
    },
  ];

  const DELIVERABLES = [
    { title: 'k-Anonymized Cohort Analytics (k ≥ 5)', desc: 'Aggregate emotional climate without individual student tracking or diary surveillance' },
    { title: 'Systemic Distress & Exam Anxiety Vectors', desc: 'Proactive early warning indicators before midterm and board examination spikes' },
    { title: 'Teacher Vitality Program & 432Hz Bells', desc: 'Tagore-inspired educator self-care drills, mindfulness pacing, and non-punitive playbooks' },
    { title: 'Official Board Audit Reports (JSON & PDF)', desc: 'One-click compliance telemetry reports for school management, CBSE/ICSE, and state boards' },
    { title: 'Tele-MANAS & Childline Protocol Integration', desc: 'Direct escalation routing with India’s National Tele-Mental Health Programme (14416)' },
    { title: 'DPDP Act 2023 §9 Legal Compliance', desc: 'Zero cloud telemetry. Full cryptographic data protection on institutional local servers' },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md font-sans">
        
        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh] text-left"
        >
          {/* Header */}
          <div className="px-6 py-5 bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 text-white flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/30 flex items-center justify-center text-amber-400 shadow-md">
                <Building2 size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-white">
                    PRERNA VidyaPeeth Enterprise • संस्थागत अनुज्ञा
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                    Institutional Flourishing License
                  </span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">
                  Proactive cohort mental wellbeing intelligence, non-punitive care, and educator vitality without student surveillance
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              title="Close modal"
            >
              <X size={20} />
            </button>
          </div>

          {/* Status Bar */}
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">Institutional Status:</span>
              {schoolLicense === 'pilot' ? (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 font-bold">
                  ⏳ 60-Day Campus Pilot Active ({schoolPilotDaysRemaining} days remaining)
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 font-bold">
                  ✓ Enterprise License Active (Expires: {schoolExpiresAt ? new Date(schoolExpiresAt).toLocaleDateString() : 'Annual Active'})
                </span>
              )}
            </div>

            <span className="text-[11px] text-indigo-700 font-medium">
              DPDP Act 2023 §9 Section Compliant • k ≥ 5 Anonymity
            </span>
          </div>

          {/* Main Content Area */}
          <div className="flex-grow overflow-y-auto p-6 md:p-8 space-y-6">
            
            {/* Activation Feedback */}
            {showSuccessBadge && (
              <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-300 text-emerald-900 flex items-center justify-center gap-2 font-bold animate-pulse">
                <Sparkles size={18} className="text-emerald-600" />
                <span>Enterprise License Successfully Activated! School cohort dashboard updated.</span>
              </div>
            )}

            {/* Pricing Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {TIERS.map((tier) => {
                const isSelected = selectedTier === tier.id;
                return (
                  <div
                    key={tier.id}
                    onClick={() => {
                      somaticAudio.playSoftChime();
                      setSelectedTier(tier.id);
                    }}
                    className={`relative p-6 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 shadow-lg scale-102 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    {tier.popular && (
                      <span className="absolute -top-3 right-6 text-[10px] font-black uppercase tracking-wider px-3 py-0.5 rounded-full bg-indigo-600 text-white shadow-sm">
                        Standard Campus License
                      </span>
                    )}

                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-800">{tier.title}</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${tier.badgeColor}`}>
                          {tier.badge}
                        </span>
                      </div>

                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black text-slate-900">{tier.price}</span>
                        <span className="text-xs text-slate-500 font-medium">{tier.period}</span>
                      </div>

                      <p className="text-xs text-slate-600 leading-relaxed">
                        {tier.description}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-bold text-indigo-900">
                        {isSelected ? '✓ Selected Tier' : 'Select Tier'}
                      </span>
                      <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                        isSelected ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-300'
                      }`}>
                        {isSelected && <Check size={12} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Institutional Deliverables */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700">
                Institutional Deliverables & Educational Governance:
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {DELIVERABLES.map((deliv, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                    <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check size={12} />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block">{deliv.title}</span>
                      <span className="text-slate-500 text-[11px] leading-snug">{deliv.desc}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Statutory Compliance Invariant */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200 flex items-start gap-3">
              <ShieldCheck size={20} className="text-emerald-700 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-emerald-950 space-y-0.5">
                <span className="font-bold block">DPDP Act 2023 Section 9 Guarantee for Educational Institutions</span>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  Schools have legal obligations under Indian law to avoid behavioral monitoring or targeted advertising of children. PRERNA provides 100% mathematically anonymized ($k \ge 5$) wellbeing insights without ever exposing individual student identities.
                </p>
              </div>
            </div>

          </div>

          {/* Footer Bar */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            
            {/* Developer Fast-Testing Controls */}
            <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
              <span className="font-bold uppercase tracking-wider text-slate-400">Test Sim:</span>
              <button
                type="button"
                onClick={() => upgradeSchoolLicense('pilot')}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-300 font-semibold cursor-pointer"
              >
                Pilot
              </button>
              <button
                type="button"
                onClick={() => upgradeSchoolLicense('campus_annual')}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-300 font-semibold cursor-pointer"
              >
                Campus
              </button>
              <button
                type="button"
                onClick={() => upgradeSchoolLicense('district_annual')}
                className="px-2 py-0.5 rounded bg-white hover:bg-slate-200 border border-slate-300 font-semibold cursor-pointer"
              >
                District
              </button>
            </div>

            {/* Action Button */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => handleActivate(selectedTier)}
                disabled={isProcessing}
                className="w-full sm:w-auto px-8 py-3 rounded-2xl bg-indigo-950 hover:bg-slate-900 text-white font-black text-xs shadow-lg shadow-indigo-950/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Generating Institutional License...</span>
                ) : (
                  <>
                    <GraduationCap size={16} />
                    <span>Activate {TIERS.find((t) => t.id === selectedTier)?.title}</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>
            </div>

          </div>

        </motion.div>
      </div>
    </AnimatePresence>
  );
};
