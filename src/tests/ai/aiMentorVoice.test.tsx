import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { AiMentorChat } from '../../components/mentor/AiMentorChat';
import { I18nProvider } from '../../engine/localization/i18n';
import { useAppStore } from '../../store';

describe('AiMentorChat Real Speech Dictation Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    delete (window as any).SpeechRecognition;
    delete (window as any).webkitSpeechRecognition;
    Element.prototype.scrollIntoView = vi.fn();
    useAppStore.setState({
      user: {
        id: 'demo-teen-001',
        name: 'Aarav Sharma',
        username: 'aarav',
        ageRange: '16-17',
        region: 'India - Delhi',
        language: 'en',
        role: 'teen',
        hasCompletedQuestionnaire: true,
        createdAt: new Date().toISOString(),
      },
    } as any);
  });

  const renderAndEnterChat = () => {
    render(
      <I18nProvider>
        <AiMentorChat userId="demo-teen-001" />
      </I18nProvider>
    );
    fireEvent.click(screen.getByRole('button', { name: /I Understand, Let's Chat/i }));
    fireEvent.click(screen.getByRole('button', { name: /Initialize Neural Link/i }));
  };

  it('displays honest unsupported notice when SpeechRecognition API is absent (no fake timeout transcript)', () => {
    renderAndEnterChat();

    const micBtn = screen.getByRole('button', { name: /Start voice input/i });
    fireEvent.click(micBtn);

    expect(screen.getByRole('status')).toHaveTextContent(/Voice dictation is not supported/i);
    const input = screen.getByPlaceholderText(/Type your message/i) as HTMLInputElement;
    expect(input.value).toBe('');
  });

  it('captures live transcript via Web Speech API and stops dictation cleanly on toggle', () => {
    let instanceRef: any = null;
    const startMock = vi.fn();
    const stopMock = vi.fn();

    class MockSpeechRecognition {
      lang = '';
      interimResults = false;
      continuous = false;
      onresult: ((e: any) => void) | null = null;
      onerror: ((e: any) => void) | null = null;
      onend: (() => void) | null = null;
      constructor() {
        instanceRef = this;
      }
      start = startMock;
      stop = stopMock;
    }

    (window as any).SpeechRecognition = MockSpeechRecognition;

    renderAndEnterChat();

    const micBtn = screen.getByRole('button', { name: /Start voice input/i });
    fireEvent.click(micBtn);

    expect(startMock).toHaveBeenCalledTimes(1);
    expect(instanceRef.lang).toBe('en-IN');
    expect(screen.getByText(/Speech Dictation Active/i)).toBeInTheDocument();

    act(() => {
      instanceRef.onresult?.({
        results: [[{ transcript: 'How can I stay calm before exams?' }]],
      });
    });

    const input = screen.getByPlaceholderText(/Type your message/i) as HTMLInputElement;
    expect(input.value).toBe('How can I stay calm before exams?');

    fireEvent.click(screen.getByRole('button', { name: /Stop recording/i }));
    expect(stopMock).toHaveBeenCalledTimes(1);
  });
});

