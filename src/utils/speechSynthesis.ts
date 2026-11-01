/**
 * Native Web Speech API Voice Narration for PRERNA.
 * Provides on-device, zero-cloud text-to-speech with prioritized support
 * for Indian English (en-IN) and Hindi (hi-IN) voice synthesis.
 */

export interface SpeechOptions {
  lang?: 'en-IN' | 'hi-IN' | 'en-US';
  rate?: number;
  pitch?: number;
  volume?: number;
  onEnd?: () => void;
  onError?: (error: any) => void;
}

class SovereignVoiceNarrator {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private voices: SpeechSynthesisVoice[] = [];

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    try {
      this.voices = this.synth.getVoices();
    } catch {
      this.voices = [];
    }
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  public isSpeaking(): boolean {
    return Boolean(this.synth?.speaking || this.currentUtterance);
  }

  public getAvailableVoices(): SpeechSynthesisVoice[] {
    if (this.voices.length === 0) {
      this.loadVoices();
    }
    return this.voices;
  }

  /**
   * Finds the most culturally resonant voice for the given language.
   * Prioritizes en-IN / hi-IN specific Indian accents where available.
   */
  private findBestVoice(lang: string): SpeechSynthesisVoice | null {
    const voices = this.getAvailableVoices();
    if (voices.length === 0) return null;

    if (lang === 'hi-IN') {
      // Prioritize Hindi voices
      const hindi = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi') || v.name.toLowerCase().includes('swara') || v.name.toLowerCase().includes('madhur'));
      if (hindi) return hindi;
    }

    if (lang === 'en-IN' || lang.startsWith('en')) {
      // Prioritize Indian English voices
      const indianEnglish = voices.find(v => v.lang === 'en-IN' || v.name.toLowerCase().includes('india') || v.name.toLowerCase().includes('heera') || v.name.toLowerCase().includes('neerja') || v.name.toLowerCase().includes('prabhat'));
      if (indianEnglish) return indianEnglish;
    }

    // Fallback matching prefix or default
    return voices.find(v => v.lang.startsWith(lang.split('-')[0])) || voices[0] || null;
  }

  /**
   * Speaks the text aloud using the best available voice.
   */
  public speak(text: string, options: SpeechOptions = {}) {
    if (!this.isSupported() || !this.synth) {
      options.onEnd?.();
      return;
    }

    // Cancel any ongoing utterance to prevent audio overlap
    this.stop();

    const cleanText = text
      .replace(/\[cite:[^\]]+\]/g, '') // Strip citation metadata
      .replace(/[#*`_~]/g, '')        // Strip markdown symbols
      .replace(/\s+/g, ' ')           // Normalize whitespace
      .trim();

    if (!cleanText) {
      options.onEnd?.();
      return;
    }

    const lang = options.lang || (/[ऀ-ॿ]/.test(cleanText) ? 'hi-IN' : 'en-IN');
    const utterance = new SpeechSynthesisUtterance(cleanText);

    utterance.lang = lang;
    utterance.rate = options.rate ?? (lang === 'hi-IN' ? 0.95 : 1.0); // Slightly measured cadence for Hindi
    utterance.pitch = options.pitch ?? 1.0;
    utterance.volume = options.volume ?? 1.0;

    const matchedVoice = this.findBestVoice(lang);
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onend = () => {
      this.currentUtterance = null;
      options.onEnd?.();
    };

    utterance.onerror = (e) => {
      this.currentUtterance = null;
      options.onError?.(e);
      options.onEnd?.();
    };

    this.currentUtterance = utterance;
    try {
      this.synth.speak(utterance);
    } catch (e) {
      console.warn('Voice synthesis exception:', e);
      options.onEnd?.();
    }
  }

  public stop() {
    if (!this.synth) return;
    try {
      this.synth.cancel();
      this.currentUtterance = null;
    } catch {}
  }
}

export const sovereignVoice = new SovereignVoiceNarrator();
