import { useEffect, useRef } from 'react';

/**
 * Custom React hook for robust WCAG 2.1 AA keyboard focus trapping in modal dialogs.
 * Traps Tab and Shift+Tab navigation within the container and handles Escape key dismissal.
 */
export function useFocusTrap<T extends HTMLElement = HTMLDivElement>(
  isOpen: boolean,
  onClose?: () => void
) {
  const containerRef = useRef<T>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Selector for all keyboard-focusable child elements
    const focusableSelector = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(', ');

    // Focus initial element upon open if container is mounted
    const element = containerRef.current;
    if (element) {
      const focusableElements = Array.from(element.querySelectorAll<HTMLElement>(focusableSelector));
      if (focusableElements.length > 0) {
        setTimeout(() => {
          focusableElements[0]?.focus();
        }, 50);
      }
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && onClose) {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key === 'Tab') {
        const activeContainer = containerRef.current;
        if (!activeContainer) return;

        const elements = Array.from(activeContainer.querySelectorAll<HTMLElement>(focusableSelector));
        if (elements.length === 0) return;

        const first = elements[0];
        const last = elements[elements.length - 1];

        if (event.shiftKey) {
          // Shift + Tab: backwards
          if (document.activeElement === first) {
            event.preventDefault();
            last?.focus();
          }
        } else {
          // Tab: forwards
          if (document.activeElement === last) {
            event.preventDefault();
            first?.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return containerRef;
}
