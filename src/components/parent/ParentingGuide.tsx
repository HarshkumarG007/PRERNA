import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, BookOpen, Shield, Zap, Star, AlertCircle,
  CheckCircle, Clock, TrendingDown, TrendingUp, Minus,
  ChevronRight, Lightbulb, Phone, Activity, Flame
} from 'lucide-react';

interface ParentingGuideProps {
  childName: string;
  archetype?: { name: string; emoji: string; description: string; coreStrengths: string[] };
  bigFive?: { Openness: number; Conscientiousness: number; Extraversion: number; Agreeableness: number; Neuroticism: number };
  wellbeingScore: number;
  wellbeingTrend: 'rising' | 'stable' | 'falling';
  lastActive?: string;
  activityStatus?: string;
  crisisAlerts?: { status: 'clear' | 'pending_review' | 'resolved'; timestamp?: string };
  checkInStreak: number;
  strengths: string[];
}

// ── Connection Activities based on personality ───────────────────────────────
function generateConnectionActivities(bigFive?: ParentingGuideProps['bigFive']): { text: string; icon: string }[] {
  if (!bigFive) return DEFAULT_ACTIVITIES;
  
  const activities: { text: string; icon: string }[] = [];

  if (bigFive.Openness >= 60) {
    activities.push({ text: 'Visit an art gallery, science museum, or cultural event together', icon: '🎨' });
    activities.push({ text: 'Explore a new cuisine by cooking a recipe from a different culture', icon: '🍳' });
    activities.push({ text: 'Start a joint "wonder journal" — share one interesting fact per day', icon: '📓' });
  } else {
    activities.push({ text: 'Do a familiar activity together in a comfortable setting', icon: '🏠' });
    activities.push({ text: 'Watch a documentary about something they already enjoy', icon: '📺' });
  }

  if (bigFive.Extraversion >= 60) {
    activities.push({ text: 'Plan a family outing to a public event or sports match', icon: '⚽' });
    activities.push({ text: 'Invite one of their friends for a group outing', icon: '👥' });
  } else {
    activities.push({ text: 'Have a quiet, one-on-one conversation over their favourite meal', icon: '🍽️' });
    activities.push({ text: 'Watch a movie or series they choose, without interrupting', icon: '🎬' });
  }

  if (bigFive.Conscientiousness >= 60) {
    activities.push({ text: 'Help them build a "future vision board" for their goals', icon: '🎯' });
    activities.push({ text: 'Work together on a 30-day challenge of their choice', icon: '💪' });
  } else {
    activities.push({ text: 'Take spontaneous day trips without a fixed plan', icon: '🚗' });
    activities.push({ text: 'Start a creative, unstructured project they can abandon if they lose interest', icon: '🎭' });
  }

  if (bigFive.Agreeableness >= 65) {
    activities.push({ text: 'Volunteer together at a local community organization', icon: '🤝' });
  }

  if (bigFive.Neuroticism >= 55) {
    activities.push({ text: 'Practice a mindfulness or breathing exercise together for 5 minutes daily', icon: '🧘' });
    activities.push({ text: 'Create a "safe word" they can use when they feel overwhelmed', icon: '🔑' });
  }

  return activities.slice(0, 6);
}

// ── Parenting Style Tips based on Big Five ──────────────────────────────────
function generateParentingTips(bigFive?: ParentingGuideProps['bigFive']): { tip: string; context: string }[] {
  if (!bigFive) return [];
  const tips: { tip: string; context: string }[] = [];

  if (bigFive.Openness >= 60) {
    tips.push({ tip: 'Ask open-ended questions like "What did you find interesting today?"', context: 'Your teen is curious and loves to discuss ideas — yes/no questions feel dismissive to them.' });
  } else {
    tips.push({ tip: 'Respect their love for the familiar', context: 'Introducing change should be gentle and gradual. They find comfort in routines.' });
  }

  if (bigFive.Extraversion <= 45) {
    tips.push({ tip: 'Give them 30-60 minutes of quiet time after school', context: 'Your teen recharges alone. Expecting conversation immediately after social events will feel exhausting.' });
  } else {
    tips.push({ tip: 'Express genuine interest in their friendships and social world', context: 'Your teen is energised by social interaction — dismissing their social life feels like dismissing them.' });
  }

  if (bigFive.Agreeableness >= 65) {
    tips.push({ tip: 'Always lead with what they did well before discussing areas for improvement', context: 'Your teen is deeply sensitive to criticism. A "sandwich" approach (positive → constructive → positive) works best.' });
  } else {
    tips.push({ tip: 'Don\'t take their bluntness personally', context: 'Their directness is also their strength. Help them channel it constructively rather than suppressing it.' });
  }

  if (bigFive.Conscientiousness <= 45) {
    tips.push({ tip: 'Avoid nagging about deadlines and chores', context: 'Instead, agree on boundaries together and let natural consequences teach where possible.' });
  } else {
    tips.push({ tip: 'Trust them with more responsibility and autonomy', context: 'Your teen is self-driven. Micromanagement will frustrate them and damage trust.' });
  }

  if (bigFive.Neuroticism >= 55) {
    tips.push({ tip: 'Regulate your own emotions before having difficult conversations', context: 'Your teen is sensitive to emotional atmosphere and picks up on tension quickly.' });
  }

  return tips.slice(0, 4);
}

const DEFAULT_ACTIVITIES: { text: string; icon: string }[] = [
  { text: 'Have a weekly "check-in dinner" — a calm meal where you ask about their week', icon: '🍽️' },
  { text: 'Start a shared playlist you both add songs to', icon: '🎵' },
  { text: 'Take a 20-minute walk together without phones', icon: '🚶' },
  { text: 'Play a board game or card game of their choice', icon: '🎲' },
  { text: 'Watch a documentary together and discuss it', icon: '📺' },
  { text: 'Cook a new recipe together', icon: '👩‍🍳' },
];

const TRAIT_COLORS: Record<string, { bar: string; text: string; bg: string }> = {
  Openness: { bar: 'from-indigo-500 to-violet-500', text: 'text-indigo-600', bg: 'bg-indigo-50' },
  Conscientiousness: { bar: 'from-emerald-500 to-teal-500', text: 'text-emerald-600', bg: 'bg-emerald-50' },
  Extraversion: { bar: 'from-amber-500 to-orange-500', text: 'text-amber-600', bg: 'bg-amber-50' },
  Agreeableness: { bar: 'from-pink-500 to-rose-500', text: 'text-pink-600', bg: 'bg-pink-50' },
  Neuroticism: { bar: 'from-slate-500 to-gray-500', text: 'text-slate-600', bg: 'bg-slate-100' },
};

// ── Main Component ─────────────────────────────────────────────────────────
export const ParentingGuide: React.FC<ParentingGuideProps> = ({
  childName, archetype, bigFive, wellbeingScore, wellbeingTrend,
  lastActive, activityStatus, crisisAlerts, checkInStreak, strengths
}) => {
  const [activeSection, setActiveSection] = useState<'overview' | 'connection' | 'parenting' | 'safety'>('overview');

  const activities = generateConnectionActivities(bigFive);
  const parentingTips = generateParentingTips(bigFive);

  const WellbeingIcon = wellbeingTrend === 'rising' ? TrendingUp : wellbeingTrend === 'falling' ? TrendingDown : Minus;
  const wellbeingColor = wellbeingScore >= 65 ? 'text-emerald-600' : wellbeingScore >= 40 ? 'text-amber-600' : 'text-rose-600';
  const wellbeingBorder = wellbeingScore >= 65 ? 'border-emerald-200' : wellbeingScore >= 40 ? 'border-amber-200' : 'border-rose-200';
  const wellbeingBg = wellbeingScore >= 65 ? 'bg-emerald-50' : wellbeingScore >= 40 ? 'bg-amber-50' : 'bg-rose-50';

  const tabs = [
    { key: 'overview', label: 'Overview', icon: <Heart size={15} /> },
    { key: 'connection', label: 'Connect', icon: <Zap size={15} /> },
    { key: 'parenting', label: 'Know Them', icon: <BookOpen size={15} /> },
    { key: 'safety', label: 'Safety', icon: <Shield size={15} /> },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Tabs — pill style */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveSection(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold transition-all duration-200 ${
              activeSection === tab.key
                ? 'bg-white text-indigo-700 shadow-md shadow-indigo-100/50'
                : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeSection}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
        >
          {/* ── Overview ─────────────────────────────────────────────────── */}
          {activeSection === 'overview' && (
            <div className="space-y-5">
              {/* Live Signals Row */}
              <div className="grid grid-cols-2 gap-4">
                {/* Wellbeing Score */}
                <div className={`p-5 rounded-2xl border-2 ${wellbeingBorder} ${wellbeingBg} relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full blur-2xl -translate-y-6 translate-x-6" />
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Activity size={14} className={wellbeingColor} />
                        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wellbeing</p>
                      </div>
                      <WellbeingIcon size={16} className={wellbeingColor} />
                    </div>
                    <p className={`text-4xl font-black ${wellbeingColor} tracking-tight`}>
                      {wellbeingScore}<span className="text-lg font-bold text-slate-400">/100</span>
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-1 capitalize">{wellbeingTrend} trend</p>
                  </div>
                </div>

                {/* Check-in Streak */}
                <div className="p-5 rounded-2xl border-2 border-orange-200 bg-orange-50 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/40 rounded-full blur-2xl -translate-y-6 translate-x-6" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-2">
                      <Flame size={14} className="text-orange-500" />
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Daily Streak</p>
                    </div>
                    <p className="text-4xl font-black text-orange-600 tracking-tight">
                      {checkInStreak}<span className="text-lg font-bold text-slate-400"> days</span>
                    </p>
                    <p className="text-xs font-medium text-slate-500 mt-1">Check-in streak</p>
                  </div>
                </div>
              </div>

              {/* Activity Status */}
              <div className="p-4 bg-white rounded-2xl border border-slate-200 flex items-center gap-3 shadow-sm">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse flex-shrink-0 shadow-lg shadow-emerald-500/30" />
                <div>
                  <p className="text-sm font-bold text-slate-800">{activityStatus || 'No recent activity'}</p>
                  <p className="text-xs text-slate-500">{lastActive ? `Last active: ${lastActive}` : 'Start PRERNA to begin tracking'}</p>
                </div>
              </div>

              {/* Archetype Card */}
              {archetype && (
                <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-200 relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-200/30 rounded-full blur-3xl" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-4 mb-3">
                      <span className="text-4xl">{archetype.emoji}</span>
                      <div>
                        <p className="text-xs font-bold text-indigo-500 uppercase tracking-widest">Personality Type</p>
                        <p className="text-xl font-black text-slate-800 tracking-tight">{archetype.name}</p>
                      </div>
                    </div>
                    <p className="text-slate-600 text-sm leading-relaxed font-medium">{archetype.description}</p>
                  </div>
                </div>
              )}

              {/* Strengths */}
              {strengths.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 px-1">
                    {childName.split(' ')[0]}'s Core Strengths
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {strengths.map((s) => (
                      <span key={s} className="px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-sm">
                        <Star size={12} className="text-emerald-500" /> {s}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Connection Activities ─────────────────────────────────────── */}
          {activeSection === 'connection' && (
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={16} className="text-blue-600" />
                  </div>
                  <p className="text-blue-800 text-sm font-medium leading-relaxed">
                    These activities are personalised based on <strong>{childName.split(' ')[0]}'s</strong> personality profile. Small, consistent connection moments matter more than grand gestures.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {activities.map((activity, i) => (
                  <motion.div
                    key={activity.text}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-4 p-4 bg-white hover:bg-slate-50 rounded-2xl border border-slate-200 transition-all cursor-pointer group shadow-sm hover:shadow-md"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-lg flex-shrink-0 shadow-sm">
                      {activity.icon}
                    </div>
                    <p className="text-slate-700 text-sm font-semibold leading-snug group-hover:text-slate-900 transition-colors flex-1">{activity.text}</p>
                    <ChevronRight size={16} className="text-slate-300 group-hover:text-indigo-500 flex-shrink-0 transition-colors" />
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* ── Parenting Style ───────────────────────────────────────────── */}
          {activeSection === 'parenting' && (
            <div className="space-y-5">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Lightbulb size={16} className="text-amber-600" />
                  </div>
                  <p className="text-amber-800 text-sm font-medium leading-relaxed">
                    These insights are derived from <strong>{childName.split(' ')[0]}'s</strong> PRERNA personality assessment. Use them as gentle guides, not rigid rules.
                  </p>
                </div>
              </div>

              {/* Big Five Bars — with visible labels & colored bars */}
              {bigFive && (
                <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
                  <h4 className="font-black text-slate-800 text-base tracking-tight">Personality Dimensions</h4>
                  {Object.entries(bigFive).map(([trait, value]) => {
                    const colors = TRAIT_COLORS[trait] || TRAIT_COLORS.Openness;
                    return (
                      <div key={trait}>
                        <div className="flex justify-between mb-1.5">
                          <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>{trait}</span>
                          <span className="text-xs font-black text-slate-600">{value}%</span>
                        </div>
                        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${value}%` }}
                            transition={{ duration: 0.8, delay: 0.1 }}
                            className={`h-full bg-gradient-to-r ${colors.bar} rounded-full`}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Parenting Tips — with visible styled cards */}
              {parentingTips.length > 0 && (
                <div className="space-y-3">
                  <h4 className="font-black text-slate-800 text-base tracking-tight px-1">Personalised Parenting Guidance</h4>
                  {parentingTips.map((item, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.08 }}
                      className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <Lightbulb size={14} className="text-amber-600" />
                        </div>
                        <div>
                          <p className="text-slate-800 text-sm font-bold leading-snug mb-1">{item.tip}</p>
                          <p className="text-slate-500 text-xs leading-relaxed">{item.context}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── Safety ────────────────────────────────────────────────────── */}
          {activeSection === 'safety' && (
            <div className="space-y-4">
              {/* Crisis Status */}
              <div className={`p-5 rounded-2xl border-2 flex items-start gap-4 ${
                !crisisAlerts || crisisAlerts.status === 'clear'
                  ? 'bg-emerald-50 border-emerald-200'
                  : crisisAlerts.status === 'pending_review'
                  ? 'bg-amber-50 border-amber-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                {!crisisAlerts || crisisAlerts.status === 'clear' ? (
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={20} className="text-emerald-600" />
                  </div>
                ) : crisisAlerts.status === 'pending_review' ? (
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <Clock size={20} className="text-amber-600" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <CheckCircle size={20} className="text-blue-600" />
                  </div>
                )}
                <div>
                  <p className={`font-bold text-base ${
                    !crisisAlerts || crisisAlerts.status === 'clear' ? 'text-emerald-800' :
                    crisisAlerts.status === 'pending_review' ? 'text-amber-800' : 'text-blue-800'
                  }`}>
                    {!crisisAlerts || crisisAlerts.status === 'clear'
                      ? 'All Clear — No crisis events detected'
                      : crisisAlerts.status === 'pending_review'
                      ? 'A counselor is reviewing a flagged entry'
                      : 'Counselor review completed'}
                  </p>
                  <p className="text-slate-600 text-sm mt-1 leading-relaxed">
                    {!crisisAlerts || crisisAlerts.status === 'clear'
                      ? `PRERNA's AI has detected no high-risk signals. ${childName.split(' ')[0]} appears to be doing well.`
                      : crisisAlerts.status === 'pending_review'
                      ? `A trained mental health counselor is reviewing the context. You will be notified if any action is needed. ${childName.split(' ')[0]} has been informed.`
                      : 'The counselor has reviewed this event. Check your email or phone for the outcome.'}
                  </p>
                </div>
              </div>

              {/* Inactivity Alert */}
              {checkInStreak === 0 && (
                <div className="p-4 bg-rose-50 border-2 border-rose-200 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={16} className="text-rose-600" />
                  </div>
                  <div>
                    <p className="font-bold text-rose-800 text-sm">No recent check-ins</p>
                    <p className="text-slate-600 text-xs mt-1">{childName.split(' ')[0]} has not opened PRERNA in the last 3 days. A gentle check-in from you might help.</p>
                  </div>
                </div>
              )}

              {/* Wellbeing Drop Alert */}
              {wellbeingTrend === 'falling' && wellbeingScore < 45 && (
                <div className="p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <TrendingDown size={16} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-800 text-sm">Wellbeing has been declining</p>
                    <p className="text-slate-600 text-xs mt-1">{childName.split(' ')[0]}'s 7-day wellbeing average has dropped. This could reflect stress, social difficulty, or just a rough week.</p>
                  </div>
                </div>
              )}

              {/* Crisis Resources */}
              <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                <div className="px-5 py-4 bg-slate-50 border-b border-slate-200">
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Certified Crisis Resources</p>
                </div>
                <div className="divide-y divide-slate-100">
                  {[
                    { name: 'KIRAN Mental Health Helpline', number: '1800-599-0019', desc: '24/7, free, multilingual' },
                    { name: 'iCall (TISS)', number: '9152987821', desc: 'For youth & students' },
                    { name: 'Vandrevala Foundation', number: '1860-2662-345', desc: '24/7 crisis support' },
                  ].map((r) => (
                    <div key={r.name} className="flex items-center justify-between px-5 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-800">{r.name}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{r.desc}</p>
                      </div>
                      <a
                        href={`tel:${r.number.replace(/[^0-9]/g, '')}`}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-bold hover:bg-emerald-100 transition-colors shadow-sm"
                      >
                        <Phone size={12} /> {r.number}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
