import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DisclosureGate } from '../../components/consent/DisclosureGate';
import { I18nProvider } from '../../engine/localization/i18n';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';

describe('Integration: DisclosureGate Component', () => {
  it('blocks rendering children until disclosure is acknowledged', async () => {
    const user = userEvent.setup();
    const handleDecline = vi.fn();

    render(
      <I18nProvider>
        <DisclosureGate activityType="skill_arena" onDecline={handleDecline}>
          <div data-testid="protected-activity">Secret Content</div>
        </DisclosureGate>
      </I18nProvider>
    );

    // Activity should not be mounted
    expect(screen.queryByTestId('protected-activity')).not.toBeInTheDocument();
    
    // Disclosure text should be visible
    expect(screen.getByText(CURRENT_DISCLOSURES.skill_arena.text.en)).toBeInTheDocument();

    // Clicking decline triggers callback and does not reveal content
    const declineButton = screen.getByRole('button', { name: /Cancel/i });
    await user.click(declineButton);
    expect(handleDecline).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('protected-activity')).not.toBeInTheDocument();

    // Clicking accept reveals content and unmounts disclosure
    const acceptButton = screen.getByRole('button', { name: /I Understand/i });
    await user.click(acceptButton);
    
    expect(screen.getByTestId('protected-activity')).toBeInTheDocument();
    expect(screen.queryByText(CURRENT_DISCLOSURES.skill_arena.text.en)).not.toBeInTheDocument();
  });
});
