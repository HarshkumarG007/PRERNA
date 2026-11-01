import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthModal } from '../../components/welcome/AuthModal';
import { useAppStore } from '../../store';

describe('AuthModal Component Authentication & Signup Flow', () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.setState({
      user: null,
      isAuthenticated: false,
      profile: null,
    });
  });

  it('completes signup and immediately logs in without dropping back to welcome', async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <AuthModal
        mode="signup"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    // Step 1: Who are you?
    expect(screen.getByText(/Who are you\?/i)).toBeDefined();

    // Fill Name
    const nameInput = screen.getByPlaceholderText(/Enter your full name/i);
    fireEvent.change(nameInput, { target: { value: 'Aarav Kumar' } });

    // Select Gender
    const genderMaleBtn = screen.getByRole('button', { name: /♂ Male/i });
    fireEvent.click(genderMaleBtn);

    // Fill DOB
    const dobInput = document.querySelector('input[type="date"]') as HTMLInputElement;
    fireEvent.change(dobInput, { target: { value: '2008-01-15' } });

    // Click Continue -> Step 2
    const continueBtn = screen.getByRole('button', { name: /Continue →/i });
    fireEvent.click(continueBtn);

    // Step 2: Where are you?
    await waitFor(() => {
      expect(document.querySelectorAll('select').length).toBeGreaterThanOrEqual(2);
    });

    const stateSelect = document.querySelectorAll('select')[1] as HTMLSelectElement;
    fireEvent.change(stateSelect, { target: { value: 'Delhi' } });

    const emailInput = screen.getByPlaceholderText(/you@example.com/i);
    fireEvent.change(emailInput, { target: { value: 'aarav@example.com' } });

    // Click Continue -> Step 3
    fireEvent.click(screen.getByRole('button', { name: /Continue →/i }));

    // Step 3: Secure your space
    const usernameInput = await screen.findByPlaceholderText(/Choose a unique username/i, {}, { timeout: 3000 });
    fireEvent.change(usernameInput, { target: { value: 'aarav2008' } });

    const passwordInput = screen.getByPlaceholderText(/Create a strong password/i);
    fireEvent.change(passwordInput, { target: { value: 'SuperSecret123!' } });

    const pinInput = screen.getByPlaceholderText(/••••/i);
    fireEvent.change(pinInput, { target: { value: '1234' } });

    // Button should now say "Create Account →"
    const createAccountBtn = screen.getByRole('button', { name: /Create Account →/i });
    expect(createAccountBtn).toBeDefined();

    // Click Create Account
    fireEvent.click(createAccountBtn);

    // Should immediately authenticate, call onSuccess, and close modal
    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    }, { timeout: 15000 });

    const state = useAppStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user).not.toBeNull();
    expect(state.user?.username).toBe('aarav2008');
    expect(state.user?.role).toBe('teen');
    expect(state.user?.hasCompletedQuestionnaire).toBe(false);
  }, 15000);

  it('allows quick demo login and invokes onSuccess and onClose', async () => {
    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <AuthModal
        mode="login"
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    const demoBtn = screen.getByRole('button', { name: /⚡ Aarav \(Teen\)/i });
    fireEvent.click(demoBtn);

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalledWith('demo-teen-001');
      expect(onClose).toHaveBeenCalled();
    });

    const state = useAppStore.getState();
    expect(state.isAuthenticated).toBe(true);
    expect(state.user?.id).toBe('demo-teen-001');
  });
});
