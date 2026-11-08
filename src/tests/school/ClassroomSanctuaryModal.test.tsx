import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClassroomSanctuaryModal } from '../../components/school/ClassroomSanctuaryModal';

vi.mock('../../utils/audioSynthesis', () => ({
  somaticAudio: {
    playStarBeaconChime: vi.fn(),
    playSoftChime: vi.fn(),
  }
}));

describe('ClassroomSanctuaryModal Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('does not render when isOpen is false', () => {
    render(<ClassroomSanctuaryModal isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText(/Classroom Collective Somatic Reset/i)).not.toBeInTheDocument();
  });

  it('renders classroom smartboard header, breathing orb, and Tagore/Kabir reflection when open', () => {
    render(<ClassroomSanctuaryModal isOpen={true} onClose={vi.fn()} />);

    expect(screen.getByText(/Classroom Collective Somatic Reset/i)).toBeInTheDocument();
    expect(screen.getByText(/Ready for Classroom Equilibrium/i)).toBeInTheDocument();
    expect(screen.getByText(/5 Minute Homeroom Pause/i)).toBeInTheDocument();
    expect(screen.getByText(/Start Classroom Grounding/i)).toBeInTheDocument();
  });

  it('allows toggling breathing patterns between Coherent, Vagal, and Box focus', () => {
    render(<ClassroomSanctuaryModal isOpen={true} onClose={vi.fn()} />);

    const vagalBtn = screen.getByRole('button', { name: /Vagal Exam Calm/i });
    fireEvent.click(vagalBtn);
    expect(vagalBtn).toHaveClass('bg-indigo-600');

    const boxBtn = screen.getByRole('button', { name: /Box Focus/i });
    fireEvent.click(boxBtn);
    expect(boxBtn).toHaveClass('bg-indigo-600');
  });

  it('starts and pauses classroom grounding timer on button click', () => {
    render(<ClassroomSanctuaryModal isOpen={true} onClose={vi.fn()} />);

    const startBtn = screen.getByRole('button', { name: /Start Classroom Grounding/i });
    fireEvent.click(startBtn);

    expect(screen.getByText(/Pause Sanctuary/i)).toBeInTheDocument();

    const pauseBtn = screen.getByRole('button', { name: /Pause Sanctuary/i });
    fireEvent.click(pauseBtn);

    expect(screen.getByText(/Start Classroom Grounding/i)).toBeInTheDocument();
  });
});

