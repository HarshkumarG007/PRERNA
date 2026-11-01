import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sovereignVoice } from '../../utils/speechSynthesis';

describe('SovereignVoiceNarrator (Indian Web Speech TTS)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();

    // Mock global SpeechSynthesisUtterance in jsdom
    class MockUtterance {
      text: string;
      lang = 'en-US';
      rate = 1;
      pitch = 1;
      volume = 1;
      voice = null;
      onend: (() => void) | null = null;
      onerror: ((e: any) => void) | null = null;
      constructor(text: string) {
        this.text = text;
      }
    }
    (global as any).SpeechSynthesisUtterance = MockUtterance;
    (window as any).SpeechSynthesisUtterance = MockUtterance;
  });

  it('exposes isSupported and detects availability', () => {
    expect(typeof sovereignVoice.isSupported).toBe('function');
  });

  it('sanitizes text, stripping citation tags and markdown symbols before speaking', () => {
    const speakSpy = vi.fn();
    const cancelSpy = vi.fn();

    const mockSynth = {
      speak: speakSpy,
      cancel: cancelSpy,
      getVoices: () => [
        { name: 'Microsoft Swara Online (Natural) - Hindi (India)', lang: 'hi-IN' },
        { name: 'Microsoft Neerja Online (Natural) - English (India)', lang: 'en-IN' }
      ],
      speaking: false,
      onvoiceschanged: null
    };

    (window as any).speechSynthesis = mockSynth;
    (sovereignVoice as any).synth = mockSynth;

    sovereignVoice.speak('Explore your traits [cite: bigFive.openness] **carefully**!');

    expect(cancelSpy).toHaveBeenCalled();
    expect(speakSpy).toHaveBeenCalled();
    const calledUtterance = speakSpy.mock.calls[0][0];
    expect(calledUtterance.text).toBe('Explore your traits carefully!');
  });

  it('auto-selects hi-IN when Hindi Devanagari characters are detected', () => {
    const speakSpy = vi.fn();
    const mockSynth = {
      speak: speakSpy,
      cancel: vi.fn(),
      getVoices: () => [
        { name: 'Hindi India Voice', lang: 'hi-IN' }
      ],
      speaking: false,
      onvoiceschanged: null
    };

    (window as any).speechSynthesis = mockSynth;
    (sovereignVoice as any).synth = mockSynth;

    sovereignVoice.speak('जैसे मृगा नाभि कस्तूरी');

    expect(speakSpy).toHaveBeenCalled();
    const utterance = speakSpy.mock.calls[0][0];
    expect(utterance.lang).toBe('hi-IN');
  });

  it('stops ongoing speech safely', () => {
    const cancelSpy = vi.fn();
    const mockSynth = {
      cancel: cancelSpy,
      speak: vi.fn(),
      getVoices: () => [],
      speaking: true
    };

    (window as any).speechSynthesis = mockSynth;
    (sovereignVoice as any).synth = mockSynth;

    sovereignVoice.stop();
    expect(cancelSpy).toHaveBeenCalled();
  });
});
