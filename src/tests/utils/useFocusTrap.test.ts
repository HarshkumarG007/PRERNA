import { renderHook } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useFocusTrap } from '../../utils/useFocusTrap';

describe('useFocusTrap Hook (WCAG 2.1 AA a11y)', () => {
  it('initializes ref and attaches Escape event listener', () => {
    const onClose = vi.fn();
    const { result } = renderHook(() => useFocusTrap(true, onClose));

    expect(result.current).toBeDefined();

    // Trigger escape
    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    window.dispatchEvent(escapeEvent);

    expect(onClose).toHaveBeenCalled();
  });

  it('does not trigger onClose on Escape when isOpen is false', () => {
    const onClose = vi.fn();
    renderHook(() => useFocusTrap(false, onClose));

    const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true });
    window.dispatchEvent(escapeEvent);

    expect(onClose).not.toHaveBeenCalled();
  });
});

