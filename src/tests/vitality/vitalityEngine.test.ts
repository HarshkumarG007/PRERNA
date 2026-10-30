import { describe, it, expect } from 'vitest';
import { 
  calculateWakeTimesFromNow, 
  calculateBedtimesForWakeTarget, 
  evaluateAdolescentGrowth, 
  calculateHydrationProgress, 
  classifyRestingHeartRate, 
  formatTime12h 
} from '../../engine/vitality/vitalityEngine';

describe('Kaya Kalpa: Vitality & Circadian Sleep Engine', () => {
  describe('formatTime12h', () => {
    it('formats morning times correctly with AM', () => {
      const d = new Date(2026, 9, 30, 6, 30);
      expect(formatTime12h(d)).toBe('06:30 AM');
    });

    it('formats evening times correctly with PM', () => {
      const d = new Date(2026, 9, 30, 22, 15);
      expect(formatTime12h(d)).toBe('10:15 PM');
    });

    it('formats noon and midnight accurately', () => {
      const noon = new Date(2026, 9, 30, 12, 0);
      expect(formatTime12h(noon)).toBe('12:00 PM');
      const midnight = new Date(2026, 9, 30, 0, 5);
      expect(formatTime12h(midnight)).toBe('12:05 AM');
    });
  });

  describe('90-Minute Ultradian Sleep Cycle Calculations', () => {
    it('calculates 3 wake times from now (4, 5, 6 cycles) with sleep latency', () => {
      const fixedNow = new Date(2026, 9, 30, 22, 0); // 10:00 PM
      const wakeTimes = calculateWakeTimesFromNow(fixedNow, 14);

      expect(wakeTimes).toHaveLength(3);
      expect(wakeTimes[0].cycles).toBe(4);
      expect(wakeTimes[1].cycles).toBe(5);
      expect(wakeTimes[2].cycles).toBe(6);

      // 4 cycles = 360m + 14m = 374m = 6.2h -> 04:14 AM
      expect(wakeTimes[0].wakeTime).toBe('04:14 AM');
      // 5 cycles = 450m + 14m = 464m = 7.7h -> 05:44 AM
      expect(wakeTimes[1].wakeTime).toBe('05:44 AM');
      expect(wakeTimes[1].isRecommended).toBe(true);
      // 6 cycles = 540m + 14m = 554m = 9.2h -> 07:14 AM
      expect(wakeTimes[2].wakeTime).toBe('07:14 AM');
      expect(wakeTimes[2].isRecommended).toBe(true);
    });

    it('calculates optimal bedtimes for target wake up time', () => {
      // Desired wake up at 06:30 AM
      const bedtimes = calculateBedtimesForWakeTarget(6, 30, 14);

      expect(bedtimes).toHaveLength(3);
      expect(bedtimes[0].cycles).toBe(6); // 9h sleep + 14m latency = 554m before 06:30 AM = 09:16 PM
      expect(bedtimes[0].bedtime).toBe('09:16 PM');
      expect(bedtimes[0].isRecommended).toBe(true);

      expect(bedtimes[1].cycles).toBe(5); // 7.5h sleep + 14m latency = 464m before 06:30 AM = 10:46 PM
      expect(bedtimes[1].bedtime).toBe('10:46 PM');
      expect(bedtimes[1].isRecommended).toBe(true);

      expect(bedtimes[2].cycles).toBe(4); // 6h sleep + 14m latency = 374m before 06:30 AM = 12:16 AM
      expect(bedtimes[2].bedtime).toBe('12:16 AM');
      expect(bedtimes[2].isRecommended).toBe(false);
    });
  });

  describe('evaluateAdolescentGrowth', () => {
    it('handles zero or negative inputs gracefully', () => {
      const res = evaluateAdolescentGrowth(0, 0);
      expect(res.bmi).toBe(0);
      expect(res.category).toBe('harmonious_vitality');
      expect(res.title).toBe('Growth Baseline');
    });

    it('identifies building strength zone without weight-shaming', () => {
      // 165 cm, 40 kg -> BMI ~ 14.7
      const res = evaluateAdolescentGrowth(165, 40, 15);
      expect(res.bmi).toBe(14.7);
      expect(res.category).toBe('building_strength');
      expect(res.hindiTitle).toContain('संवर्धन');
      expect(res.growthAdvice.some(a => a.includes('protein'))).toBe(true);
    });

    it('identifies harmonious vitality zone for balanced adolescent growth', () => {
      // 162 cm, 52 kg -> BMI ~ 19.8
      const res = evaluateAdolescentGrowth(162, 52, 15);
      expect(res.bmi).toBe(19.8);
      expect(res.category).toBe('harmonious_vitality');
      expect(res.title).toBe('Harmonious Vitality Zone');
      expect(res.growthAdvice.some(a => a.includes('hydration'))).toBe(true);
    });

    it('identifies active momentum zone for higher BMI adolescents', () => {
      // 160 cm, 68 kg -> BMI ~ 26.6
      const res = evaluateAdolescentGrowth(160, 68, 15);
      expect(res.bmi).toBe(26.6);
      expect(res.category).toBe('active_momentum');
      expect(res.title).toBe('Dynamic Momentum Zone');
      expect(res.growthAdvice.some(a => a.includes('active play'))).toBe(true);
    });
  });

  describe('calculateHydrationProgress', () => {
    it('correctly tracks progress across glasses', () => {
      expect(calculateHydrationProgress(0).percentage).toBe(0);
      expect(calculateHydrationProgress(4).percentage).toBe(50);
      expect(calculateHydrationProgress(8).percentage).toBe(100);
      expect(calculateHydrationProgress(8).remaining).toBe(0);
      expect(calculateHydrationProgress(10).percentage).toBe(100); // capped at 100%
    });
  });

  describe('classifyRestingHeartRate', () => {
    it('accurately classifies resting heart rates', () => {
      expect(classifyRestingHeartRate(58).category).toBe('restorative');
      expect(classifyRestingHeartRate(72).category).toBe('balanced');
      expect(classifyRestingHeartRate(95).category).toBe('active');
    });
  });
});
