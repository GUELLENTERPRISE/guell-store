import { useEffect, useState, useCallback } from 'react';

interface UseExitIntentOptions {
  enabled?: boolean;
  delay?: number; // Delay before showing popup (ms)
  triggerOnMouseLeave?: boolean;
  triggerOnVisibilityChange?: boolean;
}

export const useExitIntent = (options: UseExitIntentOptions = {}) => {
  const {
    enabled = true,
    delay = 100,
    triggerOnMouseLeave = true,
    triggerOnVisibilityChange = true,
  } = options;

  const [showPopup, setShowPopup] = useState(false);
  const [hasTriggered, setHasTriggered] = useState(false);

  const triggerExitIntent = useCallback(() => {
    if (!enabled || hasTriggered) return;

    // Small delay to prevent accidental triggers
    setTimeout(() => {
      setShowPopup(true);
      setHasTriggered(true);
    }, delay);
  }, [enabled, hasTriggered, delay]);

  const closePopup = useCallback(() => {
    setShowPopup(false);
  }, []);

  const resetTrigger = useCallback(() => {
    setHasTriggered(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    let mouseLeaveTimeout: ReturnType<typeof setTimeout>;

    const handleMouseLeave = (e: MouseEvent) => {
      if (triggerOnMouseLeave && e.clientY <= 0) {
        // Mouse left the top of the viewport
        triggerExitIntent();
      }
    };

    const handleVisibilityChange = () => {
      if (triggerOnVisibilityChange && document.hidden) {
        // User switched tabs or minimized window
        triggerExitIntent();
      }
    };

    const handleBeforeUnload = (_e: BeforeUnloadEvent) => {
      // User is trying to close/refresh the page
      triggerExitIntent();

      // Note: Modern browsers may not show custom messages
      // but the exit intent will still trigger
    };

    if (triggerOnMouseLeave) {
      document.addEventListener('mouseleave', handleMouseLeave);
    }

    if (triggerOnVisibilityChange) {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (mouseLeaveTimeout) {
        clearTimeout(mouseLeaveTimeout);
      }
    };
  }, [enabled, triggerOnMouseLeave, triggerOnVisibilityChange, triggerExitIntent]);

  return {
    showPopup,
    closePopup,
    resetTrigger,
    hasTriggered,
  };
};