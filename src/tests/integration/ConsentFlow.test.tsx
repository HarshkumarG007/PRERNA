import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import React from 'react';
import { AgeDeclaration } from '../../components/consent/AgeDeclaration';
import { ParentConsentFlow } from '../../components/consent/ParentConsentFlow';
import { I18nProvider } from '../../engine/localization/i18n';
import { AccountType } from '../../engine/consent/ageTierGate';

const ConsentFlowWrapper = () => {
  const [accountType, setAccountType] = React.useState<AccountType | null>(null);
  
  if (accountType === 'under_18') {
    return <ParentConsentFlow onConsentGranted={() => {}} onCancel={() => {}} />;
  }
  
  return <AgeDeclaration onComplete={(_, type) => setAccountType(type)} />;
};

describe('Integration: Consent Flow', () => {
  it('redirects an under-18 user to the parent verification flow', async () => {
    const user = userEvent.setup();
    
    render(
      <I18nProvider>
        <ConsentFlowWrapper />
      </I18nProvider>
    );

    // Verify initial render
    expect(screen.getByText(/Welcome to PRERNA/i)).toBeInTheDocument();
    
    // Select age 15
    const ageInput = screen.getByRole('spinbutton', { name: /Your Age/i });
    await user.type(ageInput, '15');
    
    // Click Continue
    const continueButton = screen.getByRole('button', { name: /Continue/i });
    await user.click(continueButton);
    
    // Should render the Parent Consent Flow block
    expect(screen.getByText(/Parent \/ Guardian Verification/i)).toBeInTheDocument();
  });

  it('completes the flow directly for an adult', async () => {
    const user = userEvent.setup();
    
    render(
      <I18nProvider>
        <ConsentFlowWrapper />
      </I18nProvider>
    );

    // Select age 25
    const ageInput = screen.getByRole('spinbutton', { name: /Your Age/i });
    await user.type(ageInput, '25');
    
    // Click Continue
    const continueButton = screen.getByRole('button', { name: /Continue/i });
    await user.click(continueButton);

    // Should NOT render the Parent Consent flow
    expect(screen.queryByText(/Parental Verification Required/i)).not.toBeInTheDocument();
  });
});
