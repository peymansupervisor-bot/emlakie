'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type { AssistantState } from '@/types/assistant';

export interface UseAssistantPanelReturn {
  open: boolean;
  /** Current UI state — idle in Phase 1B (no audio or AI connected). */
  assistantState: AssistantState;
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
 * Phase 1B: assistantState is always 'idle' — no audio or AI is connected.
 * Phase 1C+ will update assistantState via WebSocket session events.
 */
export function useAssistantPanel(): UseAssistantPanelReturn {
  const [open, setOpen] = useState(false);
  const [assistantState] = useState<AssistantState>('idle');
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

  return { open, assistantState, openPanel, closePanel, launcherRef, panelRef };
}
