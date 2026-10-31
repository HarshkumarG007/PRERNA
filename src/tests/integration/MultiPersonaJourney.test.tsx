import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAppStore } from '../../store';
import { usePartnerStore } from '../../store/partnerStore';
import { useSubscriptionStore } from '../../store/subscriptionStore';
import { PersonaAuthModal } from '../../components/security/PersonaAuthModal';
import { PartnersGateModal } from '../../components/partners/auth/PartnersGateModal';
import { PaymentCheckoutModal } from '../../components/subscription/PaymentCheckoutModal';
import { DataSovereigntyModal } from '../../components/governance/DataSovereigntyModal';
import { InstitutionalAdminPortal } from '../../components/school/InstitutionalAdminPortal';
import { hashPasscode } from '../../utils/cryptoVault';
import { buildUpiDeepLink, generateTaxInvoice } from '../../services/paymentGateway';

// Mock audio
vi.mock('../../utils/audioSynthesis', () => ({
  somaticAudio: {
    playStarBeaconChime: vi.fn(),
    playSoftChime: vi.fn(),
    playTibetanBell: vi.fn(),
    playSingingBowl: vi.fn(),
  }
}));

describe('PRERNA Multi-Persona E2E End-to-End Browser Journey', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();

    useAppStore.setState({
      user: {
        id: 'teen_e2e_user',
        ageRange: '16-17',
        region: 'Delhi NCR',
        language: 'en',
        role: 'teen',
        createdAt: new Date().toISOString(),
      },
      isAuthenticated: true,
      journalEntries: [
        {
          id: 'j1',
          title: 'Evening Contemplation',
          reflection: 'Reflected on Tagore poem during evening silence.',
          type: 'reflection',
          moodRating: 5,
          tags: ['mindfulness'],
          createdAt: new Date().toISOString(),
        }
      ],
      sleepSessions: [],
      movementEntries: [],
    });

    usePartnerStore.setState({
      connection: {
        status: 'paired',
        pairedPartnerName: 'Ananya',
        pairedSince: '2024-02-14',
        secretPasscode: hashPasscode('PAIRED12'),
        isActivated: true,
        isGateLocked: true,
      },
      conversationPrompts: [],
      dateIdeas: [],
      sharedMemories: [],
      journalEntries: [],
      bucketList: [],
      chatHistory: [],
    });

    useSubscriptionStore.setState({
      partnerPlan: 'trial',
      schoolLicense: 'campus_annual',
      schoolPilotDaysRemaining: 0,
    });
  });

  describe('Journey 1: Teen to Adult Persona Cryptographic Authorization Gate', () => {
    it('requires secure PIN authorization to switch role from Teen to Adult', async () => {
      const handleAuthorize = vi.fn();
      const handleClose = vi.fn();

      render(
        <PersonaAuthModal
          isOpen={true}
          onClose={handleClose}
          onAuthorize={handleAuthorize}
        />
      );

      expect(screen.getByText(/DPDP ACT §9 PERSONA PRIVACY VAULT/i)).toBeInTheDocument();
      expect(screen.getByText(/Verify Identity to Switch Persona/i)).toBeInTheDocument();

      // Switch to PIN tab
      const pinTabBtn = screen.getByRole('button', { name: /PIN/i });
      fireEvent.click(pinTabBtn);

      // Enter default PIN '0000'
      const pinInput = screen.getByPlaceholderText(/••••/i);
      fireEvent.change(pinInput, { target: { value: '0000' } });

      const authSubmitBtn = screen.getByRole('button', { name: /Authorize Access/i });
      fireEvent.click(authSubmitBtn);

      await waitFor(() => {
        expect(handleAuthorize).toHaveBeenCalledWith('adult');
      });
    });
  });

  describe('Journey 2: Adult Sanctuary & Partners Vault Cryptographic Unlock', () => {
    it('protects Partners Vault behind salted SHA-256 passcode and rejects unauthorized access', async () => {
      // User is now an authorized Adult
      useAppStore.setState({
        user: {
          id: 'adult_user_1',
          ageRange: '18+',
          region: 'Delhi NCR',
          language: 'en',
          role: 'adult',
          createdAt: new Date().toISOString(),
        }
      });

      const handleUnlocked = vi.fn();
      const handleClose = vi.fn();

      render(
        <PartnersGateModal
          isOpen={true}
          onClose={handleClose}
          onUnlocked={handleUnlocked}
        />
      );

      expect(screen.getByText(/Unlock Partners Vault/i)).toBeInTheDocument();
      expect(screen.getByText(/Enter your private passcode to access your shared sanctuary/i)).toBeInTheDocument();

      const input = screen.getByPlaceholderText(/••••/i);
      const unlockBtn = screen.getByRole('button', { name: /Unlock & Enter/i });

      // Attempt wrong passcode
      fireEvent.change(input, { target: { value: 'WRONG99' } });
      fireEvent.click(unlockBtn);

      await waitFor(() => {
        expect(screen.getByText(/Incorrect secret passcode/i)).toBeInTheDocument();
      });
      expect(handleUnlocked).not.toHaveBeenCalled();

      // Enter valid passcode 'PAIRED12'
      fireEvent.change(input, { target: { value: 'PAIRED12' } });
      fireEvent.click(unlockBtn);

      await waitFor(() => {
        expect(handleUnlocked).toHaveBeenCalledTimes(1);
      });
    });
  });

  describe('Journey 3: Sovereign Indian Monetization & Dynamic UPI QR Checkout', () => {
    it('generates genuine upi://pay deep link, renders QR interface, and verifies payment with GST invoice receipt', async () => {
      const handleSuccess = vi.fn();
      const handleClose = vi.fn();

      const details = {
        planTitle: 'Partners Annual Sanctuary',
        amountInr: 1999,
        tierId: 'partner_annual',
        type: 'partner' as const,
        userEmail: 'devotee@prerna.sovereign'
      };

      const upiUrl = buildUpiDeepLink(details, 'TXN_TEST_123');
      expect(upiUrl).toContain('upi://pay?');
      expect(upiUrl).toContain('pa=prerna.sanctuary%40icici');
      expect(upiUrl).toContain('am=1999.00');

      render(
        <PaymentCheckoutModal
          isOpen={true}
          onClose={handleClose}
          onSuccess={handleSuccess}
          details={details}
        />
      );

      // Verify payment details rendered
      expect(screen.getByText(/Subscribe to Partners Annual Sanctuary/i)).toBeInTheDocument();
      expect(screen.getByText(/₹1,999/i)).toBeInTheDocument();
      expect(screen.getByText(/Scan with Google Pay, PhonePe, Paytm, or BHIM/i)).toBeInTheDocument();

      // Trigger payment verification
      const verifyBtn = screen.getByRole('button', { name: /Verify Payment/i });
      fireEvent.click(verifyBtn);

      await waitFor(() => {
        expect(handleSuccess).toHaveBeenCalledTimes(1);
      }, { timeout: 3000 });

      // Verify GST calculation
      const invoice = generateTaxInvoice(details, 'TXN_E2E_VERIFIED');
      expect(invoice.totalAmountInr).toBe(1999);
      expect(invoice.sacCode).toBe('998431');
      expect(invoice.cgst).toBeCloseTo(invoice.taxableValue * 0.09, 1);
      expect(invoice.sgst).toBeCloseTo(invoice.taxableValue * 0.09, 1);
      expect(invoice.taxableValue + invoice.cgst + invoice.sgst).toBeCloseTo(1999, 1);
    });
  });

  describe('Journey 4: School VidyaPeeth B2B Batch Provisioning & k >= 5 Anonymity', () => {
    it('provisions zero-PII batch student tokens and respects differential privacy invariants', async () => {
      render(<InstitutionalAdminPortal />);

      expect(screen.getByText(/VidyaPeeth Institutional Portal/i)).toBeInTheDocument();
      expect(screen.getByText(/DPS-VK-2026-DELHI-CAMPUS/i)).toBeInTheDocument();

      const generateBtn = screen.getByRole('button', { name: /Generate Tokens/i });
      fireEvent.click(generateBtn);

      await waitFor(() => {
        expect(screen.getAllByText(/PRERNA-Grade9-SectionA-/i).length).toBeGreaterThan(0);
      });

      // Verify DPDP Act §9 invariant
      expect(screen.getByText(/Statutory Differential Privacy Guarantee/i)).toBeInTheDocument();
      expect(screen.getByText(/14416/i)).toBeInTheDocument();
    });
  });

  describe('Journey 5: DPDP Act 2023 §13 Statutory Sovereignty, Portability & Cryptographic Shredding', () => {
    it('executes one-click JSON portability export and enforces 2-step SHRED MY VAULT complete local erasure', async () => {
      const handleClose = vi.fn();

      // Seed local storage and stores with personal journals
      localStorage.setItem('prerna_test_item', 'secret_data');
      expect(useAppStore.getState().journalEntries.length).toBe(1);

      render(
        <DataSovereigntyModal
          isOpen={true}
          onClose={handleClose}
        />
      );

      expect(screen.getByText(/Data Sovereignty Vault/i)).toBeInTheDocument();

      // Navigate to Right to Erasure Tab
      const erasureTab = screen.getByRole('button', { name: /Right to Erasure/i });
      fireEvent.click(erasureTab);

      expect(screen.getByText(/Irreversible Local Cryptographic Shredding/i)).toBeInTheDocument();

      const shredBtn = screen.getByRole('button', { name: /Permanently Shred All My Data/i });
      expect(shredBtn).toBeDisabled();

      // Type confirmation phrase 'SHRED MY VAULT'
      const input = screen.getByPlaceholderText('Type SHRED MY VAULT');
      fireEvent.change(input, { target: { value: 'SHRED MY VAULT' } });

      expect(shredBtn).not.toBeDisabled();

      // Trigger shredding
      fireEvent.click(shredBtn);

      // Verify that local data was completely shredded and reset
      await waitFor(() => {
        expect(useAppStore.getState().journalEntries).toEqual([]);
        expect(useAppStore.getState().user).toBeNull();
        expect(usePartnerStore.getState().connection.isActivated).toBe(false);
      });
    });
  });
});
