import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { HumanReviewQueue } from '../../components/crisis/HumanReviewQueue';

describe('Integration: Admin Review Queue', () => {
  it('allows a clinician to review a pending case and escalate it', async () => {
    const user = userEvent.setup();
    
    // Render the dashboard
    render(<HumanReviewQueue />);

    // Since it mounts with dummy pending cases, we should see one
    expect(screen.getByText(/User:/i)).toBeInTheDocument();
    expect(screen.getByText(/u123/i)).toBeInTheDocument();

    // Click on the case to select it
    const caseCard = screen.getByText(/u123/i).closest('button');
    expect(caseCard).not.toBeNull();
    await user.click(caseCard!);

    // The review panel should now be visible
    expect(screen.getByText(/Clinical Actions/i)).toBeInTheDocument();

    // Select the "Notify Guardian" action
    // In this component, we don't have a select box, we have buttons for each action!
    const notifyButton = screen.getByRole('button', { name: /Notify Guardian/i });
    await user.click(notifyButton);

    // Case should be removed from the pending list
    expect(screen.queryByText(/u123/i)).not.toBeInTheDocument();
  });
});
