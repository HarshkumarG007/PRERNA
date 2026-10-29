import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ResourceSurface, VERIFIED_HELPLINES } from '../../components/crisis/ResourceSurface';
import { TrustedAdultConnector } from '../../components/crisis/TrustedAdultConnector';
import { SharedDashboardView } from '../../components/dashboard/SharedDashboardView';
import { ToastProvider } from '../../components/common/Toast';
import { BrowserRouter } from 'react-router-dom';

describe('Phase 4 & 5 UI Components: Crisis Resources & Shared Dashboard', () => {
  describe('P4-3: Always-On Resource Surface', () => {
    it('verifies all mandatory Indian national helplines are present at build time', () => {
      const names = VERIFIED_HELPLINES.map((h) => h.name);
      expect(names).toContain('Tele-MANAS (Govt. of India)');
      expect(names).toContain('Childline India');
      expect(names).toContain('KIRAN Mental Health Helpline');
      expect(names).toContain('Vandrevala Foundation');
      expect(names).toContain('iCall Psychosocial Helpline');

      const kiran = VERIFIED_HELPLINES.find((h) => h.name.includes('KIRAN'));
      expect(kiran?.numbers).toContain('1800-599-0019');

      const teleManas = VERIFIED_HELPLINES.find((h) => h.name.includes('Tele-MANAS'));
      expect(teleManas?.numbers).toContain('14416');

      const childline = VERIFIED_HELPLINES.find((h) => h.name.includes('Childline'));
      expect(childline?.numbers).toContain('1098');
    });

    it('renders page mode with calm non-stigmatizing framing and grounding exercises', () => {
      render(
        <ToastProvider>
          <ResourceSurface mode="page" />
        </ToastProvider>
      );

      expect(screen.getByText('Support is Always Within Reach')).toBeInTheDocument();
      expect(screen.getByText('Try a Calming Grounding Exercise')).toBeInTheDocument();
      expect(screen.getByText('Verified National Support Helplines')).toBeInTheDocument();
    });

    it('renders banner mode with instant helpline shortcuts without any detection trigger', () => {
      render(
        <ToastProvider>
          <ResourceSurface mode="banner" />
        </ToastProvider>
      );

      expect(screen.getByTestId('resource-surface-banner')).toBeInTheDocument();
      expect(screen.getByText(/Tele-MANAS/)).toBeInTheDocument();
      expect(screen.getByText(/14416/)).toBeInTheDocument();
      expect(screen.getByText('Try a Grounding Exercise')).toBeInTheDocument();
    });
  });

  describe('P4-4: Teen-Initiated Trusted Adult Connector', () => {
    it('remains closed by default and requires explicit teen action to open', () => {
      render(
        <ToastProvider>
          <TrustedAdultConnector />
        </ToastProvider>
      );

      const openBtn = screen.getByTestId('open-trusted-adult-btn');
      expect(openBtn).toBeInTheDocument();
      expect(screen.queryByTestId('trusted-adult-form-container')).not.toBeInTheDocument();

      fireEvent.click(openBtn);
      expect(screen.getByTestId('trusted-adult-form-container')).toBeInTheDocument();
    });

    it('disables send button until adult details and explicit teen consent checkbox are checked', () => {
      render(
        <ToastProvider>
          <TrustedAdultConnector />
        </ToastProvider>
      );

      fireEvent.click(screen.getByTestId('open-trusted-adult-btn'));

      const submitBtn = screen.getByTestId('send-adult-invite-btn');
      expect(submitBtn).toBeDisabled();

      fireEvent.change(screen.getByTestId('adult-name-input'), {
        target: { value: 'Dr. Ramesh Sharma' },
      });
      fireEvent.change(screen.getByTestId('adult-contact-input'), {
        target: { value: 'ramesh@school.in' },
      });

      // Still disabled without explicit checkbox
      expect(submitBtn).toBeDisabled();

      // Check the explicit teen consent checkbox
      fireEvent.click(screen.getByTestId('teen-consent-checkbox'));
      expect(submitBtn).not.toBeDisabled();

      // Click submit
      fireEvent.click(submitBtn);

      expect(screen.getByTestId('trusted-adult-sent')).toBeInTheDocument();
      expect(screen.getAllByText(/Dr\. Ramesh Sharma/).length).toBeGreaterThan(0);
    });
  });

  describe('P5-1: Shared Dashboard Parity (Zero Divergence)', () => {
    it('renders both Teen and Parent view from the exact same single data source', () => {
      render(
        <BrowserRouter>
          <SharedDashboardView />
        </BrowserRouter>
      );

      expect(screen.getByTestId('shared-dashboard-view')).toBeInTheDocument();
      expect(screen.getByTestId('teen-view-panel')).toBeInTheDocument();
      expect(screen.getByTestId('parent-view-panel')).toBeInTheDocument();

      // Verify invariant banner
      expect(screen.getByText('Shared Self-Discovery Transparency')).toBeInTheDocument();
      expect(screen.getByText(/Single Source of Truth/)).toBeInTheDocument();
    });

    it('allows teen to toggle sharing preferences and updates parent perspective immediately', () => {
      const onPrefsChange = vi.fn();

      render(
        <BrowserRouter>
          <SharedDashboardView onPreferencesChange={onPrefsChange} />
        </BrowserRouter>
      );

      // Initially wellbeing score is displayed in parent panel
      expect(screen.getByText('78/100')).toBeInTheDocument();

      // Find the Wellbeing Score toggle in sharing controls and click to set private
      const wellbeingBtn = screen.getByText('Wellbeing Score').closest('button')!;
      fireEvent.click(wellbeingBtn);

      expect(onPrefsChange).toHaveBeenCalled();
      // Parent panel should now reflect that wellbeing score was kept private
      expect(screen.getByText('Wellbeing score kept private by teen')).toBeInTheDocument();
    });
  });
});
