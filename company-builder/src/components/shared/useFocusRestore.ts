'use client';

import { useEffect, useRef } from 'react';

/**
 * Saves a reference to the currently focused element when `active` becomes
 * true, and restores focus to that element when `active` becomes false (i.e.
 * when a modal or overlay closes).
 *
 * Returns the ref so callers can pass it to the modal container if they want
 * to tether the saved focus target further.
 */
export function useFocusRestore(active: boolean) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    if (active) {
      // Capture focus target at open time
      previousFocusRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
    } else {
      // Restore focus on close
      previousFocusRef.current?.focus();
      previousFocusRef.current = null;
    }
  }, [active]);

  return previousFocusRef;
}
