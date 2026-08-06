import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { LifeQuests } from '../../components/activities/LifeQuests';
import { I18nProvider } from '../../engine/localization/i18n';
import { CURRENT_DISCLOSURES } from '../../engine/assessment/disclosures';

describe('Integration: Activity Gating', () => {
  it('blocks interaction until disclosure is explicitly accepted', async () => {
    const user = userEvent.setup();
    
    render(
      <MemoryRouter>
        <I18nProvider>
          <LifeQuests />
        </I18nProvider>
      </MemoryRouter>
    );

    // The core activity content should NOT be present yet
    expect(screen.queryByText(/Quest 1: The Mountain Path/i)).not.toBeInTheDocument();
    
    // The Disclosure banner should be visible
    expect(screen.getByText(/Before you play/i)).toBeInTheDocument();
    
    // The exact plain-language text for Life Quests should be rendered
    const expectedDisclosureText = CURRENT_DISCLOSURES.life_quests.text.en;
    expect(screen.getByText(expectedDisclosureText)).toBeInTheDocument();

    // Accept the disclosure
    const acceptButton = screen.getByRole('button', { name: /I Understand, Let's Play!/i });
    await user.click(acceptButton);

    // Now the disclosure should be gone and the activity visible
    expect(screen.queryByText(/Before you play/i)).not.toBeInTheDocument();
    expect(screen.getByText(/Start a New Quest/i)).toBeInTheDocument();
  });
});
