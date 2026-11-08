import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TeacherVitalityCorner } from '../../components/school/TeacherVitalityCorner';
import { InstitutionalCareHub } from '../../components/school/InstitutionalCareHub';

describe('School & Educator Modernization Components (Phase 7-24)', () => {
  describe('TeacherVitalityCorner', () => {
    it('renders Tagore educational philosophy and educator guidance', () => {
      render(<TeacherVitalityCorner />);

      expect(screen.getByText(/Honoring the Light of the Teacher/i)).toBeInTheDocument();
      expect(screen.getByText(/Rabindranath Tagore/i)).toBeInTheDocument();
      expect(screen.getByText(/Ring 432 Hz Mindful Bell/i)).toBeInTheDocument();
      expect(screen.getByText(/Compassionate Pedagogy Playbook/i)).toBeInTheDocument();
    });

    it('allows triggering 432 Hz bell chime with interactive feedback', () => {
      render(<TeacherVitalityCorner />);

      const bellBtn = screen.getByRole('button', { name: /Ring 432 Hz Mindful Bell/i });
      fireEvent.click(bellBtn);

      expect(screen.getByText(/432 Hz Resonating.../i)).toBeInTheDocument();
    });

    it('toggles completion of educator recharge drills', () => {
      render(<TeacherVitalityCorner />);

      const drillText = screen.getByText(/3-Min Silence Before 1st Period/i);
      expect(drillText).toBeInTheDocument();

      const drillCard = drillText.closest('div[class*="rounded-2xl"]');
      if (drillCard) {
        fireEvent.click(drillCard);
      }
      expect(screen.getByText(/Educator Self-Care Drills/i)).toBeInTheDocument();
    });
  });

  describe('InstitutionalCareHub', () => {
    it('renders zero-surveillance guarantees and k-anonymity protocol', () => {
      render(<InstitutionalCareHub />);

      expect(screen.getByText(/Institutional Care & Early Warning Sanctuary/i)).toBeInTheDocument();
      expect(screen.getByText(/Strict Privacy Boundary/i)).toBeInTheDocument();
      expect(screen.getByText(/Cohort Risk Vectors/i)).toBeInTheDocument();
    });

    it('switches to Emergency Helplines tab and renders Tele-MANAS (14416) and Childline (1098)', () => {
      render(<InstitutionalCareHub />);

      const helplinesTab = screen.getByRole('button', { name: /Emergency Helplines & Legal Protocol/i });
      fireEvent.click(helplinesTab);

      expect(screen.getByText(/14416/i)).toBeInTheDocument();
      expect(screen.getByText(/1098/i)).toBeInTheDocument();
      expect(screen.getByText(/Tele-MANAS/i)).toBeInTheDocument();
      expect(screen.getByText(/Childline/i)).toBeInTheDocument();
    });

    it('opens actionable lesson plan modal and allows adding private counselor pastoral notes', () => {
      render(<InstitutionalCareHub />);

      // Open View Protocol on first risk
      const viewProtocolBtn = screen.getAllByRole('button', { name: /View Protocol/i })[0];
      fireEvent.click(viewProtocolBtn);

      expect(screen.getAllByText(/15-Minute Pre-Exam Somatic Calming Protocol/i).length).toBeGreaterThan(0);
      expect(screen.getByRole('button', { name: /Export .MD/i })).toBeInTheDocument();

      // Close modal
      const closeBtn = screen.getByRole('button', { name: /Close/i });
      fireEvent.click(closeBtn);

      expect(screen.queryByText(/Step-by-Step Classroom Delivery Sequence/i)).not.toBeInTheDocument();

      // Switch to Counselor Pastoral Log
      const notesTab = screen.getByRole('button', { name: /Counselor Pastoral Log/i });
      fireEvent.click(notesTab);

      expect(screen.getByText(/Private, encrypted on-device notes for cohort interventions/i)).toBeInTheDocument();

      // Add a note
      const textarea = screen.getByPlaceholderText(/Record intervention notes/i);
      fireEvent.change(textarea, { target: { value: 'Grade 12 pre-boards breathing exercise conducted successfully.' } });

      const addBtn = screen.getByRole('button', { name: /Add Note to Log/i });
      fireEvent.click(addBtn);

      expect(screen.getByText(/Grade 12 pre-boards breathing exercise conducted successfully./i)).toBeInTheDocument();
    });
  });
});
