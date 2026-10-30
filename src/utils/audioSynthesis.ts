/**
 * Web Audio API Synthesizer for Somatic Vagal Resets & Meditative Contemplation.
 * Pure client-side mathematical oscillator synthesis — zero external mp3/wav dependencies.
 * Tuned to 432 Hz harmonic frequency for optimal adolescent autonomic relaxation.
 */

class SomaticAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private masterGain: GainNode | null = null;

  private initContext() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass && typeof AudioCtxClass === 'function') {
        try {
          this.ctx = new AudioCtxClass();
          this.masterGain = this.ctx.createGain();
          this.masterGain.gain.setValueAtTime(0.7, this.ctx.currentTime);
          this.masterGain.connect(this.ctx.destination);
        } catch (e) {
          console.warn('AudioContext init failed:', e);
        }
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.7, this.ctx.currentTime);
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  /**
   * Plays an authentic singing bowl tone at 432 Hz with rich Pythagorean harmonics.
   */
  public playSingingBowl(baseFreq: number = 432, duration: number = 3.5) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const harmonics = [
        { freq: baseFreq, gain: 0.5 },
        { freq: baseFreq * 1.5, gain: 0.25 }, // Perfect 5th
        { freq: baseFreq * 2.0, gain: 0.15 }, // Octave
        { freq: baseFreq * 2.75, gain: 0.08 }, // Soft shimmer
      ];

      harmonics.forEach(({ freq, gain: targetGain }) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gainNode = this.ctx.createGain();

        // Warm sine wave with subtle vibrato
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);

        // Natural exponential decay envelope
        gainNode.gain.setValueAtTime(0.001, now);
        gainNode.gain.exponentialRampToValueAtTime(targetGain, now + 0.15);
        gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration);

        osc.connect(gainNode);
        gainNode.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + duration + 0.1);
      });
    } catch (e) {
      console.warn('Audio synthesis unavailable or blocked by browser policy:', e);
    }
  }

  /**
   * Plays a celestial beacon chime (Pythagorean harmonic cascade: 432 Hz -> 540 Hz -> 648 Hz -> 864 Hz)
   * celebrating lighting a star on GitHub for the collective adolescent sanctuary.
   */
  public playStarBeaconChime() {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;
      const now = this.ctx.currentTime;
      const notes = [432, 540, 648, 864];
      notes.forEach((freq, idx) => {
        if (!this.ctx || !this.masterGain) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);
        gain.gain.setValueAtTime(0, now + idx * 0.1);
        gain.gain.linearRampToValueAtTime(0.18, now + idx * 0.1 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 1.2);
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 1.2);
      });
    } catch (e) {
      // safe fallback
    }
  }

  /**
   * Rising swell chime for Inhale phase (gently lifts energy & opens lungs).
   */
  public playInhaleTone(duration: number = 4) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'triangle'; // Softer, round harmonic
      osc.frequency.setValueAtTime(216, now);
      osc.frequency.exponentialRampToValueAtTime(432, now + duration);

      gainNode.gain.setValueAtTime(0.01, now);
      gainNode.gain.linearRampToValueAtTime(0.3, now + duration * 0.7);
      gainNode.gain.linearRampToValueAtTime(0.01, now + duration);

      osc.connect(gainNode);
      gainNode.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Inhale tone failed:', e);
    }
  }

  /**
   * Pure plateau chime for Hold phase (centered still point / suspension).
   */
  public playHoldTone(duration: number = 7) {
    if (this.isMuted) return;
    this.playSingingBowl(540, Math.min(duration, 4));
  }

  /**
   * Calming descending wave for Exhale phase (activates parasympathetic vagal response).
   */
  public playExhaleTone(duration: number = 8) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx || !this.masterGain) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gainNode = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(432, now);
      osc.frequency.exponentialRampToValueAtTime(216, now + duration);

      gainNode.gain.setValueAtTime(0.35, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gainNode);
      gainNode.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      console.warn('Exhale tone failed:', e);
    }
  }
}

export const somaticAudio = new SomaticAudioSynthesizer();
