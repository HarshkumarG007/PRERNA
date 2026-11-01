import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Send, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  Copy, 
  Mail, 
  Building, 
  User, 
  Heart,
  GraduationCap,
  Scale
} from 'lucide-react';
import { sovereignSupabase, BetaAccessRequestSubmission } from '../../utils/supabaseClient';
import { somaticAudio } from '../../utils/audioSynthesis';

interface RequestAccessModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type AccessRole = 'teen' | 'parent' | 'educator' | 'reviewer' | 'partner' | 'other';

export const RequestAccessModal: React.FC<RequestAccessModalProps> = ({ isOpen, onClose }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AccessRole>('teen');
  const [organization, setOrganization] = useState('');
  const [purpose, setPurpose] = useState('');
  const [discoverySource, setDiscoverySource] = useState('GitHub Repository');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [copiedDraft, setCopiedDraft] = useState(false);

  if (!isOpen) return null;

  const roleOptions: { id: AccessRole; label: string; icon: React.ReactNode; desc: string }[] = [
    { id: 'teen', label: 'Teenager (13–17)', icon: <Sparkles size={14} />, desc: 'Explore self-discovery, Atma-Jnana & AI Mentor' },
    { id: 'parent', label: 'Parent / Guardian', icon: <Heart size={14} />, desc: 'Review consent-first shared dashboard & vitality' },
    { id: 'educator', label: 'School Counselor / Educator', icon: <GraduationCap size={14} />, desc: 'Evaluate classroom zero-PII batch pilot kit' },
    { id: 'reviewer', label: 'Clinical / Legal Specialist', icon: <Scale size={14} />, desc: 'Review H1–H4 safety & DPDP compliance' },
    { id: 'partner', label: 'Partner / Couple', icon: <Heart size={14} />, desc: 'Test encrypted Lovers / Besties Sanctuary' },
    { id: 'other', label: 'Curious Developer / Other', icon: <User size={14} />, desc: 'Open-source enthusiast & architecture review' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !purpose.trim()) {
      setStatusMsg({ type: 'error', text: 'Please fill in your name, email, and reason for requesting access.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMsg(null);

    const submission: BetaAccessRequestSubmission = {
      fullName: fullName.trim(),
      email: email.trim(),
      role,
      organization: organization.trim() || undefined,
      purpose: purpose.trim(),
      discoverySource
    };

    const res = await sovereignSupabase.submitAccessRequest(submission);
    setIsSubmitting(false);

    if (res.success) {
      somaticAudio.playStarBeaconChime();
      setSubmittedSuccess(true);
      setStatusMsg({ type: 'success', text: res.message });
    } else {
      setStatusMsg({ type: 'error', text: res.message });
    }
  };

  const handleCopyEmailDraft = () => {
    const draft = `Subject: PRERNA Access Request — ${fullName} (${role.toUpperCase()})
To: hrslsha007@gmail.com

Hello Harsh,

I have submitted an in-app pilot access request for PRERNA:
- Name: ${fullName}
- Email: ${email}
- Role: ${role}
- Organization / Context: ${organization || 'Independent'}
- Discovery Source: ${discoverySource}
- Purpose & Interest: ${purpose}

Looking forward to receiving an invitation token. Thank you!`;

    navigator.clipboard.writeText(draft);
    setCopiedDraft(true);
    somaticAudio.playSoftChime();
    setTimeout(() => setCopiedDraft(false), 2500);
  };

  const handleOpenDirectEmail = () => {
    const subject = encodeURIComponent(`PRERNA Pilot Access Request — ${fullName} (${role})`);
    const body = encodeURIComponent(
      `Hello Harsh,\n\nI would like to request pilot access to PRERNA:\n- Name: ${fullName}\n- Email: ${email}\n- Role: ${role}\n- Organization: ${organization || 'Independent'}\n- Discovery: ${discoverySource}\n- Purpose: ${purpose}\n\nThank you!`
    );
    window.location.href = `mailto:hrslsha007@gmail.com?subject=${subject}&body=${body}`;
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-xl animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-slate-200 my-8">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Close Request Access Modal"
          className="absolute top-5 right-5 p-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/15 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shadow-inner">
            <Sparkles size={22} />
          </div>
          <div className="text-left">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Request Pilot Access</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Closed Beta
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              PRERNA is in confidential pilot evaluation. Submit to receive a single-use token.
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!submittedSuccess ? (
            <motion.form 
              key="request-form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={handleSubmit} 
              className="space-y-4 text-left text-xs"
            >
              {/* Full Name & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Your Full Name *</label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Dr. Ananya Sen"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Your Email Address *</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1.5">Who are you joining as? *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {roleOptions.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => setRole(r.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        role === r.id
                          ? 'bg-indigo-600/20 border-indigo-500 text-white ring-1 ring-indigo-500/50'
                          : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-1.5 font-bold text-[11px] mb-1">
                        <span className={role === r.id ? 'text-indigo-400' : 'text-slate-500'}>{r.icon}</span>
                        <span className="truncate">{r.label}</span>
                      </div>
                      <span className="text-[10px] text-slate-500 line-clamp-2 leading-tight">
                        {r.desc}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Organization & Discovery Source */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Organization / School (Optional)</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={organization}
                      onChange={(e) => setOrganization(e.target.value)}
                      placeholder="e.g. VidyaPeeth / Self"
                      className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                    <Building size={14} className="absolute left-3 top-3 text-slate-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">How did you find PRERNA?</label>
                  <select
                    value={discoverySource}
                    onChange={(e) => setDiscoverySource(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 text-white focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer"
                  >
                    <option value="GitHub Repository">GitHub Repository</option>
                    <option value="LinkedIn / Social Media">LinkedIn / Social Media</option>
                    <option value="School / Educational Institution">School / Educational Institution</option>
                    <option value="Mental Health / Clinical Community">Mental Health / Clinical Community</option>
                    <option value="Friend or Colleague">Friend or Colleague</option>
                    <option value="Direct Outreach">Direct Outreach</option>
                  </select>
                </div>
              </div>

              {/* Purpose / Why request access */}
              <div>
                <label className="block text-slate-400 font-semibold mb-1">
                  Why would you like to explore PRERNA? *
                </label>
                <textarea
                  required
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="e.g. I saw your local-first architecture on GitHub and want to test the Atma-Jnana self-discovery module with my students..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                />
              </div>

              {/* Sovereign Notice */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-slate-300 text-[11px] flex items-center gap-2">
                <ShieldCheck size={16} className="text-indigo-400 flex-shrink-0" />
                <span>
                  Sovereign Gatekeeper: Your email is solely used to deliver your single-use pass. Never spammed or sold.
                </span>
              </div>

              {statusMsg && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    statusMsg.type === 'error'
                      ? 'bg-rose-500/15 border-rose-500/30 text-rose-300'
                      : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
                  }`}
                >
                  {statusMsg.type === 'error' ? <AlertCircle size={15} /> : <CheckCircle2 size={15} />}
                  <span>{statusMsg.text}</span>
                </div>
              )}

              {/* Action Button */}
              <div className="pt-2 flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition-colors cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 via-indigo-600 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white font-bold shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>Submitting to Supabase...</span>
                  ) : (
                    <>
                      <Send size={15} />
                      <span>Submit Request</span>
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          ) : (
            <motion.div
              key="success-screen"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-4 space-y-5"
            >
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-inner">
                <CheckCircle2 size={32} />
              </div>

              <div className="space-y-1.5">
                <h4 className="text-base font-bold text-white">Pilot Request Recorded!</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Thank you, <span className="text-indigo-300 font-semibold">{fullName}</span>. Founder <span className="text-slate-200 font-semibold">Harsh Kumar Gupta</span> has received your application.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-left text-xs space-y-2 text-slate-300">
                <p className="text-slate-400 text-[11px] font-semibold uppercase tracking-wider">What happens next?</p>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" />
                  <span>Review turnaround is typically within <strong>24–48 hours</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" />
                  <span>A cryptographic single-use invitation link will be dispatched to <strong>{email}</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5" />
                  <span>The token locks to your device upon first tap to preserve cohort integrity.</span>
                </div>
              </div>

              {/* Fast-track Buttons */}
              <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleCopyEmailDraft}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy size={14} />
                  <span>{copiedDraft ? 'Draft Copied!' : 'Copy Summary'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleOpenDirectEmail}
                  className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600/30 border border-indigo-500/40 hover:bg-indigo-600/50 text-indigo-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Mail size={14} />
                  <span>Send Direct Email</span>
                </button>
              </div>

              <div>
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors cursor-pointer"
                >
                  Back to Gatekeeper
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

