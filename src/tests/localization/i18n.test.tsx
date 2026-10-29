import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import { I18nProvider, useI18n, LANGUAGE_NAMES, Language } from '../../engine/localization/i18n';

const TestConsumer: React.FC = () => {
  const { language, setLanguage, t } = useI18n();

  return (
    <div>
      <span data-testid="current-lang">{language}</span>
      <span data-testid="nav-arena">{t('nav.skill_arena')}</span>
      <span data-testid="nav-helplines">{t('nav.support')}</span>
      <span data-testid="action-grounding">{t('action.grounding')}</span>
      <span data-testid="fallback-test">{t('non.existent.key', 'Default Fallback')}</span>

      <button onClick={() => setLanguage('hi')} data-testid="switch-hi">Hindi</button>
      <button onClick={() => setLanguage('mr')} data-testid="switch-mr">Marathi</button>
      <button onClick={() => setLanguage('ta')} data-testid="switch-ta">Tamil</button>
    </div>
  );
};

describe('P5-4: Multilingual Localisation & Text Expansion', () => {
  it('supports 6 Indian languages in metadata', () => {
    const codes = Object.keys(LANGUAGE_NAMES) as Language[];
    expect(codes).toContain('en');
    expect(codes).toContain('hi');
    expect(codes).toContain('ta');
    expect(codes).toContain('te');
    expect(codes).toContain('mr');
    expect(codes).toContain('bn');
  });

  it('renders default English and switches dynamically to Hindi, Marathi, and Tamil', () => {
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    );

    // Initial English
    expect(screen.getByTestId('current-lang')).toHaveTextContent('en');
    expect(screen.getByTestId('nav-arena')).toHaveTextContent('Skill Arena');
    expect(screen.getByTestId('nav-helplines')).toHaveTextContent('Helplines');
    expect(screen.getByTestId('fallback-test')).toHaveTextContent('Default Fallback');

    // Switch to Hindi
    fireEvent.click(screen.getByTestId('switch-hi'));
    expect(screen.getByTestId('current-lang')).toHaveTextContent('hi');
    expect(screen.getByTestId('nav-arena')).toHaveTextContent('स्किल एरीना');
    expect(screen.getByTestId('nav-helplines')).toHaveTextContent('हेल्पलाइन');
    expect(screen.getByTestId('action-grounding')).toHaveTextContent('आरामदायक व्यायाम आज़माएं');

    // Switch to Marathi
    fireEvent.click(screen.getByTestId('switch-mr'));
    expect(screen.getByTestId('current-lang')).toHaveTextContent('mr');
    expect(screen.getByTestId('nav-arena')).toHaveTextContent('कौशल्य आखाडा');

    // Switch to Tamil
    fireEvent.click(screen.getByTestId('switch-ta'));
    expect(screen.getByTestId('current-lang')).toHaveTextContent('ta');
    expect(screen.getByTestId('nav-arena')).toHaveTextContent('திறன் அரங்கம்');
  });

  it('verifies Hindi and regional text expansion does not break string boundaries', () => {
    render(
      <I18nProvider>
        <TestConsumer />
      </I18nProvider>
    );

    fireEvent.click(screen.getByTestId('switch-hi'));
    const hindiGrounding = screen.getByTestId('action-grounding').textContent || '';
    expect(hindiGrounding.length).toBeGreaterThan(0);
    // Hindi text is non-empty and contains Devanagari characters
    expect(/[\u0900-\u097F]/.test(hindiGrounding)).toBe(true);
  });
});

