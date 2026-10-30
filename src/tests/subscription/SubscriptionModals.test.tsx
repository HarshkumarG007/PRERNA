import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PartnerSubscriptionModal } from '../../components/subscription/PartnerSubscriptionModal';
import { SchoolLicensingModal } from '../../components/subscription/SchoolLicensingModal';
import { useSubscriptionStore } from '../../store/subscriptionStore';

describe('Subscription & Licensing Modals (Phase 7-24)', () => {
  beforeEach(() => {
    useSubscriptionStore.setState({
      partnerPlan: 'trial',
      partnerTrialDaysRemaining: 7,
      partnerActivatedAt: new Date().toISOString(),
      partnerExpiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      schoolLicense: 'pilot',
      schoolPilotDaysRemaining: 60,
      schoolActivatedAt: new Date().toISOString(),
      schoolExpiresAt: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
    });
  });

  describe('PartnerSubscriptionModal', () => {
    it('renders pricing tiers and sacred trial status', () => {
      render(<PartnerSubscriptionModal isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText(/PRERNA Partner Pro ❤️/i)).toBeInTheDocument();
      expect(screen.getByText(/7-Day Sacred Trial/i)).toBeInTheDocument();
      expect(screen.getByText(/Partner Pro Monthly/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Partner Pro Annual/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/Sacred Lifetime Pass/i)).toBeInTheDocument();
    });

    it('allows selecting different plans and shows activation button', () => {
      render(<PartnerSubscriptionModal isOpen={true} onClose={vi.fn()} />);

      const monthlyCard = screen.getByText(/Partner Pro Monthly/i);
      fireEvent.click(monthlyCard);

      expect(screen.getByRole('button', { name: /Activate Partner Pro Monthly/i })).toBeInTheDocument();
    });

    it('allows fast demo testing switching to Lifetime pass', () => {
      render(<PartnerSubscriptionModal isOpen={true} onClose={vi.fn()} />);

      const lifetimeBtn = screen.getByRole('button', { name: /^Lifetime$/i });
      fireEvent.click(lifetimeBtn);

      const store = useSubscriptionStore.getState();
      expect(store.partnerPlan).toBe('partner_lifetime');
      expect(store.isPartnerPro()).toBe(true);
    });
  });

  describe('SchoolLicensingModal', () => {
    it('renders VidyaPeeth Enterprise tiers and 60-day pilot status', () => {
      render(<SchoolLicensingModal isOpen={true} onClose={vi.fn()} />);

      expect(screen.getByText(/PRERNA VidyaPeeth Enterprise/i)).toBeInTheDocument();
      expect(screen.getByText(/60-Day Campus Pilot Active/i)).toBeInTheDocument();
      expect(screen.getAllByText(/Campus Annual License/i).length).toBeGreaterThan(0);
      expect(screen.getByText(/District & Trust License/i)).toBeInTheDocument();
    });

    it('allows fast demo testing switching to Campus Annual license', () => {
      render(<SchoolLicensingModal isOpen={true} onClose={vi.fn()} />);

      const campusBtn = screen.getByRole('button', { name: /^Campus$/i });
      fireEvent.click(campusBtn);

      const store = useSubscriptionStore.getState();
      expect(store.schoolLicense).toBe('campus_annual');
      expect(store.isSchoolLicensed()).toBe(true);
    });
  });
});
