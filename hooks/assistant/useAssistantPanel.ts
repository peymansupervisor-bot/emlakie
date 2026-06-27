'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

export interface UseAssistantPanelReturn {
  open: boolean;
  openPanel: () => void;
  closePanel: () => void;
  /** Ref attached to the launcher button for focus-return on close. */
  launcherRef: React.RefObject<HTMLButtonElement>;
  /** Ref attached to the panel root for focus-on-open. */
  panelRef: React.RefObject<HTMLDivElement>;
}

/**
 * Manages the assistant panel's open/closed state, keyboard handling,
 * and focus management (WCAG 2.4.3 Focus Order, 2.1.2 No Keyboard Trap).
 *
 * Panel state (open/close) is separate from session state.
 * Session state (displayState, messages, etc.) is owned by useAssistantSession.
 */
export function useAssistantPanel(): UseAssistantPanelReturn {
  const [open, setOpen] = useState(false);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const openPanel = useCallback(() => setOpen(true), []);

  const closePanel = useCallback(() => {
    setOpen(false);
    // Return focus to launcher so keyboard users don't lose their position
    // Use rAF to ensure the panel has unmounted before we attempt focus
    requestAnimationFrame(() => {
      launcherRef.current?.focus();
    });
  }, []);

  // Move focus into the panel when it opens (WCAG 2.4.3)
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      if (!panelRef.current) return;
      const first = panelRef.current.querySelector<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      first?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [open]);

  // Escape key closes panel (WCAG 2.1.2)
  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') closePanel();
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, closePanel]);

  return { open, openPanel, closePanel, launcherRef, panelRef };
}
