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

  it('navigates through all 4 personas using Next and Previous buttons', () => {
    render(
      <MultiPersonaTourModal
        isOpen={true}
        onClose={onClose}
        onSelectPersona={onSelectPersona}
        currentRole="teen"
      />
    );

    // Initial: Teen
    expect(screen.getByText('Teen Explorer Sanctuary')).toBeInTheDocument();

    // Click Next -> Parent
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByText('Parent Sanctuary Hub')).toBeInTheDocument();

    // Click Next -> Adult & Partners
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByText(/Adult Sanctuary & Secret Partners/i)).toBeInTheDocument();

    // Click Next -> School
    fireEvent.click(screen.getByRole('button', { name: /Next/i }));
    expect(screen.getByText('School & Educator Flourishing Hub')).toBeInTheDocument();

    // Click Previous -> back to Adult & Partners
    fireEvent.click(screen.getByRole('button', { name: /Previous/i }));
    expect(screen.getByText(/Adult Sanctuary & Secret Partners/i)).toBeInTheDocument();
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
