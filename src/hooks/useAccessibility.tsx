import { useEffect, useCallback } from 'react';

// Announce messages to screen readers
export function useAnnounce() {
  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = document.getElementById('sr-announcer');
    if (announcer) {
      announcer.setAttribute('aria-live', priority);
      announcer.textContent = message;
      setTimeout(() => {
        announcer.textContent = '';
      }, 1000);
    }
  }, []);

  return { announce };
}

// Focus trap for modals
export function useFocusTrap(isActive: boolean, containerRef: React.RefObject<HTMLElement>) {
  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const container = containerRef.current;
    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, containerRef]);
}

// Reduced motion preference
export function useReducedMotion() {
  const prefersReducedMotion = typeof window !== 'undefined' 
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches 
    : false;
  
  return prefersReducedMotion;
}

// High contrast mode detection
export function useHighContrast() {
  const prefersHighContrast = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-contrast: more)').matches
    : false;
    
  return prefersHighContrast;
}

// Skip to main content
export function SkipLink() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md focus:outline-none"
    >
      Chuyển đến nội dung chính
    </a>
  );
}

// Screen reader only announcer
export function ScreenReaderAnnouncer() {
  return (
    <div
      id="sr-announcer"
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    />
  );
}
