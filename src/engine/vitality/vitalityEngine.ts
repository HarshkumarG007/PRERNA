/**
 * Kaya Kalpa Vitality & Circadian Rhythm Engine
 * Evidence-based adolescent physiological and circadian calculations:
 * - 90-minute ultradian sleep cycle math with sleep latency compensation
 * - Indian Academy of Pediatrics (IAP) & WHO adolescent growth percentile context
 * - Safe, non-stigmatizing developmental vitality categorization (zero weight-shaming)
 * - Hydration and movement benchmarks for adolescent neurodevelopment
 * 
 * 100% On-Device, zero external cloud telemetry (DPDP Act 2023 §9).
 */

export interface SleepCalculationResult {
  cycles: number;
  wakeTime: string; // HH:MM AM/PM
  wakeDate: Date;
  durationHours: number;
  description: string;
  isRecommended: boolean;
}

export interface BedtimeCalculationResult {
  cycles: number;
  bedtime: string; // HH:MM AM/PM
  bedDate: Date;
  durationHours: number;
  description: string;
  isRecommended: boolean;
}

export interface GrowthVitalityResult {
  bmi: number;
  category: 'building_strength' | 'harmonious_vitality' | 'active_momentum';
  title: string;
  hindiTitle: string;
  tagline: string;
  growthAdvice: string[];
  dinacharyaWisdom: string;
}

export const AVERAGE_SLEEP_LATENCY_MINUTES = 14;
export const ULTRADIAN_CYCLE_MINUTES = 90;

/**
 * Format a Date object into human-readable 12-hour time (e.g. "06:30 AM")
 */
export function formatTime12h(date: Date): string {
  let hours = date.getHours();
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 becomes 12
  const minStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
  const hrStr = hours < 10 ? `0${hours}` : `${hours}`;
  return `${hrStr}:${minStr} ${ampm}`;
}

/**
 * Calculate optimal wake times if going to bed RIGHT NOW
 */
export function calculateWakeTimesFromNow(
  now: Date = new Date(),
  latencyMinutes: number = AVERAGE_SLEEP_LATENCY_MINUTES
): SleepCalculationResult[] {
  const results: SleepCalculationResult[] = [];
  // Calculate for 4, 5, and 6 cycles (6h, 7.5h, 9h of actual sleep)
  const cycleOptions = [
    { cycles: 4, desc: '4 Cycles (6.0 hrs) — Minimum emergency rest for exams', rec: false },
    { cycles: 5, desc: '5 Cycles (7.5 hrs) — Optimal cognitive consolidation for 16–18', rec: true },
    { cycles: 6, desc: '6 Cycles (9.0 hrs) — Ideal peak neurodevelopment for 13–15', rec: true },
  ];

  for (const opt of cycleOptions) {
    const totalMinutes = latencyMinutes + opt.cycles * ULTRADIAN_CYCLE_MINUTES;
    const wakeDate = new Date(now.getTime() + totalMinutes * 60 * 1000);
    results.push({
      cycles: opt.cycles,
      wakeTime: formatTime12h(wakeDate),
      wakeDate,
      durationHours: Number((totalMinutes / 60).toFixed(1)),
      description: opt.desc,
      isRecommended: opt.rec,
    });
  }

  return results;
}

/**
 * Calculate optimal bedtimes given a desired target wake-up time
 */
export function calculateBedtimesForWakeTarget(
  targetHours: number,
  targetMinutes: number,
  latencyMinutes: number = AVERAGE_SLEEP_LATENCY_MINUTES
): BedtimeCalculationResult[] {
  const results: BedtimeCalculationResult[] = [];
  const baseWake = new Date();
  baseWake.setHours(targetHours, targetMinutes, 0, 0);

  // If target time is earlier than current time today, assume target is tomorrow morning
  if (baseWake.getTime() < Date.now()) {
    baseWake.setDate(baseWake.getDate() + 1);
  }

  const cycleOptions = [
    { cycles: 6, desc: '6 Cycles (9.0 hrs) — Maximum restoration, deep cellular recovery', rec: true },
    { cycles: 5, desc: '5 Cycles (7.5 hrs) — Balanced prefrontal focus & memory retention', rec: true },
    { cycles: 4, desc: '4 Cycles (6.0 hrs) — Short cycle, wake at top of REM phase', rec: false },
  ];

  for (const opt of cycleOptions) {
    const totalMinutes = latencyMinutes + opt.cycles * ULTRADIAN_CYCLE_MINUTES;
    const bedDate = new Date(baseWake.getTime() - totalMinutes * 60 * 1000);
    results.push({
      cycles: opt.cycles,
      bedtime: formatTime12h(bedDate),
      bedDate,
      durationHours: Number((totalMinutes / 60).toFixed(1)),
      description: opt.desc,
      isRecommended: opt.rec,
    });
  }

  return results;
}

/**
 * Safe, supportive Adolescent Growth & Vitality categorization.
 * Follows WHO / Indian Academy of Pediatrics non-shaming principles.
 */
export function evaluateAdolescentGrowth(
  heightCm: number,
  weightKg: number,
  age: number = 15
): GrowthVitalityResult {
  if (heightCm <= 0 || weightKg <= 0) {
    return {
      bmi: 0,
      category: 'harmonious_vitality',
      title: 'Growth Baseline',
      hindiTitle: 'विकास आधार',
      tagline: 'Enter height and weight to view developmental harmony.',
      growthAdvice: ['Stay hydrated with warm water', 'Get daily morning sunlight'],
      dinacharyaWisdom: 'पहला सुख निरोगी काया — The first wealth is a rhythmic body.',
    };
  }

  const heightM = heightCm / 100;
  const bmi = Number((weightKg / (heightM * heightM)).toFixed(1));

  // Age-adjusted supportive boundaries for adolescents (13-18)
  const lowerBoundary = age < 16 ? 16.0 : 17.0;
  const upperBoundary = age < 16 ? 23.0 : 24.0;

  if (bmi < lowerBoundary) {
    return {
      bmi,
      category: 'building_strength',
      title: 'Strength & Resilience Zone',
      hindiTitle: 'ऊर्जा व संवर्धन चरण',
      tagline: 'Your frame is actively lengthening. Prioritize rich, nourishing whole foods to fuel growth spurts.',
      growthAdvice: [
        'Fuel up with wholesome protein: soaked almonds, paneer, rajma, chana, and whole milk.',
        'Include healthy fats (A2 ghee, sesame seeds) essential for teenage hormone balance.',
        'Aim for 5–6 rhythmic 90-minute sleep cycles to maximize Human Growth Hormone (HGH) release.',
      ],
      dinacharyaWisdom: 'आयुर्वेद रस-धातु पोषण: Nourish your bodily tissues through warm, comforting, fresh meals.',
    };
  }

  if (bmi > upperBoundary) {
    return {
      bmi,
      category: 'active_momentum',
      title: 'Dynamic Momentum Zone',
      hindiTitle: 'गतिशील ऊर्जा चरण',
      tagline: 'Abundant vitality and stored stamina. Channel this power into joyful outdoor movement and muscle building.',
      growthAdvice: [
        'Engage in 45 minutes of joyful active play daily: badminton, football, swimming, or cycling.',
        'Practice 12 rounds of Surya Namaskar (Sun Salutations) at sunrise for core agility.',
        'Align meals with solar rhythm: hearty lunch, light dinner before 8:00 PM to optimize deep sleep digestion.',
      ],
      dinacharyaWisdom: 'अग्नि व व्यायाम: Keep your digestive fire sharp through rhythmic movement before dusk.',
    };
  }

  return {
    bmi,
    category: 'harmonious_vitality',
    title: 'Harmonious Vitality Zone',
    hindiTitle: 'संतुलित शारीरिक लय',
    tagline: 'Your growth trajectory is in steady physiological equilibrium. Maintain your vibrant daily rhythm!',
    growthAdvice: [
      'Maintain dynamic hydration: 8 glasses (2 Liters) of fresh, clean water spaced through the day.',
      'Enjoy seasonal fruits (guava, amla, papaya, oranges) rich in vitamin C and micro-nutrients.',
      'Practice regular 432 Hz somatic breathing to keep cortisol in healthy balance.',
    ],
    dinacharyaWisdom: 'समदोषः समाग्निश्च समधातुमलक्रियः: Health is perfect harmony of physical rhythms and inner calm.',
  };
}

/**
 * Hydration target progress
 */
export function calculateHydrationProgress(glasses: number, target: number = 8): {
  percentage: number;
  remaining: number;
  statusText: string;
} {
  const validGlasses = Math.max(0, glasses);
  const percentage = Math.min(100, Math.round((validGlasses / target) * 100));
  const remaining = Math.max(0, target - validGlasses);
  let statusText = 'Begin your daily hydration';

  if (percentage === 0) statusText = 'Drink your morning water (Ushapan)';
  else if (percentage < 50) statusText = 'Keep sipping steady water throughout study sessions';
  else if (percentage < 100) statusText = 'Almost at your cellular vitality target!';
  else statusText = 'Hydration goal achieved! Cellular balance energized ✨';

  return { percentage, remaining, statusText };
}

/**
 * Heart Rate (BPM) Resting Classification
 */
export function classifyRestingHeartRate(bpm: number): {
  category: 'restorative' | 'balanced' | 'active';
  label: string;
  hindiLabel: string;
  description: string;
} {
  if (bpm < 65) {
    return {
      category: 'restorative',
      label: 'Deeply Restorative / Athletic',
      hindiLabel: 'गंभीर शांत हृदय',
      description: 'Your resting heart rate reflects high parasympathetic vagal tone and cardiovascular conditioning.',
    };
  }
  if (bpm <= 85) {
    return {
      category: 'balanced',
      label: 'Optimal Calm Rhythm',
      hindiLabel: 'संतुलित सहज धड़कन',
      description: 'Healthy adolescent autonomic balance. Steady cardiovascular blood flow without nervous agitation.',
    };
  }
  return {
    category: 'active',
    label: 'Elevated Alertness / Sympathetic',
    hindiLabel: 'सक्रिय ऊर्जा अवस्था',
    description: 'Elevated pulse may reflect recent physical activity, hydration needs, or stress. Try 3 minutes of 432 Hz Box Breathing.',
  };
}
