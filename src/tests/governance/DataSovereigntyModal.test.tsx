import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DataSovereigntyModal } from '../../components/governance/DataSovereigntyModal';
import { useAppStore } from '../../store';

describe('DataSovereigntyModal (DPDP Act §13 Suite)', () => {
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    useAppStore.setState({
      user: {
        id: 'user_dpdp_test',
        role: 'teen',
        ageRange: '13-15',
        region: 'Maharashtra',
        language: 'en',
        createdAt: '2026-01-01T00:00:00.000Z',
      } as any,
      sessions: [
        { id: 's1', type: 'life_quest', completedAt: '2026-01-02T00:00:00.000Z', metadata: {} },
        { id: 's2', type: 'skill_arena', completedAt: '2026-01-03T00:00:00.000Z', metadata: {} }
      ],
      journalEntries: [
        { id: 'j1', content: 'Reflections on peace', tags: ['peace'], mood: 'radiant', createdAt: '2026-01-02' } as any
      ],
      trackedNeeds: [],
      sleepSessions: [],
    });
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(<DataSovereigntyModal isOpen={false} onClose={onClose} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders Data Sovereignty Vault header and Section 13 Portability by default', () => {
    render(<DataSovereigntyModal isOpen={true} onClose={onClose} />);

    expect(screen.getByText('DPDP Act 2023 • Data Sovereignty Vault')).toBeInTheDocument();
    expect(screen.getByText(/Download Your Complete Sovereign Archive/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Download Full Sovereign Archive/i })).toBeInTheDocument();
  });

  it('switches to Right to Erasure tab and enforces SHRED MY VAULT confirmation challenge', () => {
    render(<DataSovereigntyModal isOpen={true} onClose={onClose} />);

    const erasureTab = screen.getByRole('button', { name: /Right to Erasure/i });
    fireEvent.click(erasureTab);

    expect(screen.getByText(/Irreversible Local Cryptographic Shredding/i)).toBeInTheDocument();

    const shredButton = screen.getByRole('button', { name: /Permanently Shred All My Data/i });
    expect(shredButton).toBeDisabled();

    // Type incorrect challenge
    const input = screen.getByPlaceholderText(/Type SHRED MY VAULT/i);
    fireEvent.change(input, { target: { value: 'wrong text' } });
    expect(shredButton).toBeDisabled();

    // Type exact challenge
    fireEvent.change(input, { target: { value: 'SHRED MY VAULT' } });
    expect(shredButton).not.toBeDisabled();
  });

  it('switches to DPDP Compliance Manifest tab and displays statutory verification', () => {
    render(<DataSovereigntyModal isOpen={true} onClose={onClose} />);

    const complianceTab = screen.getByRole('button', { name: /Compliance Manifest/i });
    fireEvent.click(complianceTab);

    expect(screen.getByText(/Sovereign Statutory Compliance Architecture/i)).toBeInTheDocument();
    expect(screen.getByText(/§9\(1\) Verifiable Parental Consent/i)).toBeInTheDocument();
    expect(screen.getByText(/§9\(2\) Prohibition on Behavioral Tracking of Minors/i)).toBeInTheDocument();
    expect(screen.getByText(/Rule 0\.3 Clinician Escalation Matrix/i)).toBeInTheDocument();
  });
});

