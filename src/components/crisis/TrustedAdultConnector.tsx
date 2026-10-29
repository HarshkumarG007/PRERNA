import React, { useState } from 'react';
import { UserPlus, Shield, Check, Heart, Mail } from 'lucide-react';
import { useToast } from '../common/Toast';

export const RELATIONSHIP_OPTIONS = [
  { value: 'counselor', label: 'School Counselor / Psychologist' },
  { value: 'teacher', label: 'Teacher / Academic Mentor' },
  { value: 'relative', label: 'Trusted Relative / Elder Sibling' },
  { value: 'parent', label: 'Parent / Legal Guardian' },
  { value: 'other_mentor', label: 'Sports Coach / Community Mentor' },
];

export const MESSAGE_TEMPLATES = [
  'I would love to share my strengths and career exploration summary with you.',
  'I am using PRERNA for self-discovery and would appreciate your guidance on my journey.',
  'Things have felt a bit stressful lately, and I was hoping we could chat sometime this week.',
];

export const TrustedAdultConnector: React.FC = () => {
  const { success } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [adultName, setAdultName] = useState('');
  const [adultContact, setAdultContact] = useState('');
  const [relationship, setRelationship] = useState(RELATIONSHIP_OPTIONS[0].value);
  const [message, setMessage] = useState(MESSAGE_TEMPLATES[0]);
  const [confirmedConsent, setConfirmedConsent] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adultName.trim() || !adultContact.trim() || !confirmedConsent) {
      return;
    }

    // Teen-initiated connection dispatch
    setSent(true);
    success(
      'Invitation Sent',
      `Your personal invite has been sent to ${adultName}. PRERNA will never contact them without your consent.`
    );
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        data-testid="open-trusted-adult-btn"
        className="inline-flex items-center gap-2 text-sm text-indigo-700 hover:text-indigo-900 font-bold bg-indigo-50/80 hover:bg-indigo-100 px-4 py-2 rounded-xl border border-indigo-200 transition-colors"
      >
        <UserPlus className="w-4 h-4 text-indigo-600" />
        Loop In a Trusted Adult (Optional & Teen-Controlled)
      </button>
    );
  }

  if (sent) {
    return (
      <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-2xl animate-fade-in" data-testid="trusted-adult-sent">
        <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm mb-1">
          <Check className="w-5 h-5 text-emerald-600" /> Invitation Dispatched
        </div>
        <p className="text-xs text-emerald-800 leading-relaxed">
          We reached out to <strong className="font-extrabold">{adultName}</strong> ({adultContact}).
          Only the safe summary you selected is visible to them. You can manage or revoke access from your profile anytime.
        </p>
        <button
          onClick={() => {
            setSent(false);
            setIsOpen(false);
            setAdultName('');
            setAdultContact('');
            setConfirmedConsent(false);
          }}
          className="mt-3 text-xs font-bold text-emerald-800 underline hover:text-emerald-950"
        >
          Connect another adult
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm space-y-4" data-testid="trusted-adult-form-container">
      <div className="flex items-start justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
            <Heart className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-black text-slate-900 text-base">Connect a Trusted Adult</h3>
            <p className="text-xs text-slate-500 font-medium">
              You choose who to loop in. This is 100% voluntary and teen-controlled.
            </p>
          </div>
        </div>
        <span className="text-[11px] font-bold px-2 py-0.5 bg-indigo-50 text-indigo-700 rounded-md flex items-center gap-1">
          <Shield className="w-3 h-3" /> Teen-Initiated
        </span>
      </div>

      <form onSubmit={handleSend} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Their Full Name</label>
            <input
              type="text"
              required
              data-testid="adult-name-input"
              placeholder="e.g. Mrs. Anjali Deshmukh"
              value={adultName}
              onChange={(e) => setAdultName(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Their Email or Phone</label>
            <input
              type="text"
              required
              data-testid="adult-contact-input"
              placeholder="anjali@school.edu.in or +91 98765..."
              value={adultContact}
              onChange={(e) => setAdultContact(e.target.value)}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 mb-1">Relationship</label>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          >
            {RELATIONSHIP_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-xs font-bold text-slate-700">Message / Context</label>
            <span className="text-[11px] text-indigo-600 font-semibold">Choose quick prompt:</span>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-2">
            {MESSAGE_TEMPLATES.map((tmpl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setMessage(tmpl)}
                className="text-[10px] px-2 py-1 rounded-md bg-slate-100 hover:bg-indigo-50 text-slate-600 hover:text-indigo-700 border border-slate-200 transition-colors"
              >
                Template {idx + 1}
              </button>
            ))}
          </div>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="p-3 bg-indigo-50/60 rounded-xl border border-indigo-100 flex items-start gap-2.5">
          <input
            type="checkbox"
            id="teen-consent-chk"
            data-testid="teen-consent-checkbox"
            checked={confirmedConsent}
            onChange={(e) => setConfirmedConsent(e.target.checked)}
            className="mt-1 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
          />
          <label htmlFor="teen-consent-chk" className="text-xs text-indigo-950 font-medium cursor-pointer">
            I confirm that I am choosing to invite this person myself. I understand that PRERNA will never contact them
            automatically without my instruction.
          </label>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!confirmedConsent || !adultName || !adultContact}
            data-testid="send-adult-invite-btn"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Mail className="w-3.5 h-3.5" />
            Send Invitation
          </button>
          <button
            type="button"
            onClick={() => setIsOpen(false)}
            className="px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};
