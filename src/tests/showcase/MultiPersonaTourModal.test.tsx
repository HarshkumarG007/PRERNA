import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { MultiPersonaTourModal } from '../../components/showcase/MultiPersonaTourModal';

describe('MultiPersonaTourModal (Phase 7-24)', () => {
  const onSelectPersona = vi.fn();
  const onClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders nothing when isOpen is false', () => {
    const { container } = render(
      <MultiPersonaTourModal
        isOpen={false}
        onClose={onClose}
        onSelectPersona={onSelectPersona}
        currentRole="teen"
      />
    );
    expect(container.firstChild).toBeNull();
  });

  it('renders Teen Explorer Sanctuary by default for teen role', () => {
    render(
      <MultiPersonaTourModal
        isOpen={true}
        onClose={onClose}
        onSelectPersona={onSelectPersona}
        currentRole="teen"
      />
    );

    expect(screen.getByText('PRERNA Ecosystem Tour • चतुर्विध साधना')).toBeInTheDocument();
    expect(screen.getByText('Teen Explorer Sanctuary')).toBeInTheDocument();
    expect(screen.getByText(/Sant Kabir/i)).toBeInTheDocument();
    expect(screen.getByText(/5-Domain Psychometric Profiling/i)).toBeInTheDocument();
  });

  it('strictly isolates teen role: only shows Teen & Parent slides and hides Adult/School', () => {
    render(
      <MultiPersonaTourModal
        isOpen={true}
        onClose={onClose}
        onSelectPersona={onSelectPersona}
        currentRole="teen"
      />
    );

    // Initial: Teen Explorer
    expect(screen.getByText('Teen Explorer Sanctuary')).toBeInTheDocument();
    expect(screen.getByText('2 Sovereign Personas')).toBeInTheDocument();

    // Click Next -> Parent Hub
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByText('Parent Sanctuary Hub')).toBeInTheDocument();

    // Click Next again -> wraps back to Teen (Adult and School are hidden from Teens)
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByText('Teen Explorer Sanctuary')).toBeInTheDocument();

    // Adult and School are NEVER in the teen tour
    expect(screen.queryByText(/Adult Sanctuary/i)).toBeNull();
    expect(screen.queryByText(/School & Educator Flourishing Hub/i)).toBeNull();
  });

  it('navigates through all 4 personas for adult role', () => {
    render(
      <MultiPersonaTourModal
        isOpen={true}
        onClose={onClose}
        onSelectPersona={onSelectPersona}
        currentRole="adult"
      />
    );

    expect(screen.getByText('4 Sovereign Personas')).toBeInTheDocument();

    // Starts on Adult for adult role
    expect(screen.getByText('Adult Sanctuary • Swadharma & Purpose')).toBeInTheDocument();

    // Click Next -> School
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByText('School & Educator Flourishing Hub')).toBeInTheDocument();

    // Click Next -> Teen
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByText('Teen Explorer Sanctuary')).toBeInTheDocument();

    // Click Next -> Parent
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByText('Parent Sanctuary Hub')).toBeInTheDocument();

    // Click Next -> back to Adult
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByText('Adult Sanctuary • Swadharma & Purpose')).toBeInTheDocument();
  });

  it('triggers onSelectPersona and onClose when clicking Switch to Persona button', () => {
    render(
      <MultiPersonaTourModal
        isOpen={true}
        onClose={onClose}
        onSelectPersona={onSelectPersona}
        currentRole="teen"
      />
    );

    const switchBtn = screen.getByRole('button', { name: /Switch to Teen Sanctuary/i });
    fireEvent.click(switchBtn);

    expect(onSelectPersona).toHaveBeenCalledWith('teen');
    expect(onClose).toHaveBeenCalled();
  });

  it('triggers onClose when clicking close button', () => {
    render(
      <MultiPersonaTourModal
        isOpen={true}
        onClose={onClose}
        onSelectPersona={onSelectPersona}
        currentRole="teen"
      />
    );

    const closeBtn = screen.getByTitle('Close tour');
    fireEvent.click(closeBtn);

    expect(onClose).toHaveBeenCalled();
  });
});
