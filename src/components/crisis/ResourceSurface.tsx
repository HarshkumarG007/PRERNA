import React, { useState } from 'react';
import { HeartHandshake, PhoneCall, ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { CopingSkills } from '../activities/CopingSkills';
import { TrustedAdultConnector } from './TrustedAdultConnector';

export interface HelplineResource {
  name: string;
  numbers: string[];
  hours: string;
  organization: string;
  language: string;
  badge?: string;
}

export const VERIFIED_HELPLINES: HelplineResource[] = [
  {
    name: 'Tele-MANAS (Govt. of India)',
    numbers: ['14416', '1800-891-4416'],
    hours: '24/7 (Toll-Free)',
    organization: 'Ministry of Health & Family Welfare',
    language: '20+ Indian Languages',
    badge: 'National Helpline',
  },
  {
    name: 'Childline India',
    numbers: ['1098'],
    hours: '24/7 (Toll-Free)',
    organization: 'Ministry of Women & Child Development',
    language: 'Pan-India',
    badge: 'Children & Adolescents',
  },
  {
    name: 'KIRAN Mental Health Helpline',
    numbers: ['1800-599-0019'],
    hours: '24/7 (Toll-Free)',
    organization: 'Department of Empowerment of Persons with Disabilities',
    language: '13 Languages',
  },
  {
    name: 'Vandrevala Foundation',
    numbers: ['9999 666 555'],
    hours: '24/7 (Free Counseling)',
    organization: 'Cyrus & Priya Vandrevala Foundation',
    language: 'English, Hindi, Regional',
  },
  {
    name: 'iCall Psychosocial Helpline',
    numbers: ['9152987821'],
    hours: 'Mon - Sat (10:00 AM – 8:00 PM)',
    organization: 'Tata Institute of Social Sciences (TISS)',
    language: 'English, Hindi, Marathi, etc.',
  },
  {
    name: 'NIMHANS Psychosocial Support',
    numbers: ['080-46110007'],
    hours: '24/7',
    organization: 'National Institute of Mental Health and Neurosciences',
    language: 'English, Hindi, Kannada',
  },
];

interface ResourceSurfaceProps {
  mode?: 'banner' | 'page';
  onClose?: () => void;
}

export const ResourceSurface: React.FC<ResourceSurfaceProps> = ({ mode = 'banner', onClose }) => {
  const [showCoping, setShowCoping] = useState(false);
  const [showAdultConnector, setShowAdultConnector] = useState(false);

  if (mode === 'page') {
    return (
      <div className="max-w-4xl mx-auto p-6 md:p-8 space-y-8 animate-fade-in-up">
        <div className="bg-gradient-to-r from-rose-50 via-indigo-50 to-teal-50 border border-rose-200/60 rounded-3xl p-8 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <HeartHandshake className="w-6 h-6" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-rose-100 text-rose-800 text-xs font-bold rounded-full">
                  Always-On Support
                </span>
                <span className="text-xs text-slate-500 font-medium">Free • Confidential • 24/7</span>
              </div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                Support is Always Within Reach
              </h1>
              <p className="text-slate-600 font-medium leading-relaxed max-w-2xl">
                Growing up comes with intense moments, exam stress, and emotional waves. Whenever things feel heavy,
                trained professionals and confidential helplines are ready to listen without judgment.
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setShowCoping(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-bold rounded-xl shadow-sm transition-all"
            >
              <Sparkles className="w-4 h-4" />
              Try a Calming Grounding Exercise
            </button>
            <button
              onClick={() => setShowAdultConnector(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 text-sm font-bold rounded-xl shadow-sm transition-all"
            >
              <UserPlus className="w-4 h-4 text-indigo-600" />
              Connect a Trusted Adult (Optional)
            </button>
          </div>
        </div>

        {/* Helplines Grid */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <PhoneCall className="w-5 h-5 text-indigo-600" />
              Verified National Support Helplines
            </h2>
            <span className="text-xs text-slate-500 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" /> Verified Build-time
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {VERIFIED_HELPLINES.map((hl) => (
              <div
                key={hl.name}
                className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 shadow-sm transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-slate-900 text-base">{hl.name}</h3>
                    {hl.badge && (
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 font-semibold text-xs rounded-md">
                        {hl.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-3">{hl.organization}</p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-indigo-700 tracking-wide">
                      {hl.numbers.join(' / ')}
                    </div>
                    <div className="text-xs text-slate-500 font-medium">{hl.hours}</div>
                  </div>
                  <a
                    href={`tel:${hl.numbers[0].replace(/[^0-9]/g, '')}`}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-lg transition-colors flex items-center gap-1"
                  >
                    Call Now
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {showAdultConnector && (
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-3xl">
            <TrustedAdultConnector />
          </div>
        )}

        {showCoping && <CopingSkills onClose={() => setShowCoping(false)} />}
      </div>
    );
  }

  // Banner mode (for inline alerts or drawer)
  return (
    <div className="bg-rose-50/90 border-l-4 border-rose-500 p-5 rounded-r-2xl my-4 shadow-sm" data-testid="resource-surface-banner">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          <HeartHandshake className="h-6 w-6 text-rose-500" />
        </div>
        <div className="ml-3.5 w-full">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-rose-900">Support is always available</h3>
            {onClose && (
              <button
                onClick={onClose}
                className="text-rose-600 hover:text-rose-800 text-xs font-semibold"
              >
                Dismiss
              </button>
            )}
          </div>
          <div className="mt-1.5 text-sm text-rose-800/90 leading-relaxed">
            <p>If you or someone you know is feeling overwhelmed, anxious, or distressed, free confidential help is a call away:</p>
            <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-white/80 rounded-lg border border-rose-200/60">
                <span className="font-bold text-rose-950 block">Tele-MANAS (24/7):</span>
                <span className="font-extrabold text-rose-700 text-sm">14416</span> / 1800-891-4416
              </div>
              <div className="p-2.5 bg-white/80 rounded-lg border border-rose-200/60">
                <span className="font-bold text-rose-950 block">Childline (24/7):</span>
                <span className="font-extrabold text-rose-700 text-sm">1098</span>
              </div>
              <div className="p-2.5 bg-white/80 rounded-lg border border-rose-200/60">
                <span className="font-bold text-rose-950 block">KIRAN (24/7):</span>
                <span className="font-extrabold text-rose-700 text-sm">1800-599-0019</span>
              </div>
              <div className="p-2.5 bg-white/80 rounded-lg border border-rose-200/60">
                <span className="font-bold text-rose-950 block">Vandrevala (24/7):</span>
                <span className="font-extrabold text-rose-700 text-sm">9999 666 555</span>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={() => setShowCoping(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-transparent text-xs font-bold rounded-lg text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Try a Grounding Exercise
              </button>
              <button
                onClick={() => setShowAdultConnector(!showAdultConnector)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-rose-300 text-xs font-bold rounded-lg text-rose-800 bg-white hover:bg-rose-50 transition-colors"
              >
                <UserPlus className="w-3.5 h-3.5" />
                Connect a Trusted Adult
              </button>
            </div>
          </div>
        </div>
      </div>

      {showAdultConnector && (
        <div className="mt-4 pt-4 border-t border-rose-200">
          <TrustedAdultConnector />
        </div>
      )}

      {showCoping && <CopingSkills onClose={() => setShowCoping(false)} />}
    </div>
  );
};
