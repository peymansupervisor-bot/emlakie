'use client';

import { SUPPORTED_LANGUAGES } from '@/lib/assistant/config';
import AssistantStateDisplay from './AssistantStateDisplay';
import AssistantPlaceholderCards from './AssistantPlaceholderCards';
import type { AssistantState } from '@/types/assistant';

interface AssistantPanelProps {
  open: boolean;
  assistantState: AssistantState;
  onClose: () => void;
  panelRef: React.RefObject<HTMLDivElement>;
}

/**
 * The main assistant panel.
 *
 * Accessibility:
 * - role="dialog" with aria-modal and aria-labelledby
 * - Close button is the first focusable element (receives focus on open)
 * - Escape key handled by useAssistantPanel
 * - aria-hidden when closed to hide from screen readers
 *
 * Phase 1B: Static UI shell only. No audio, AI, or API calls.
 */
export default function AssistantPanel({
  open,
  assistantState,
  onClose,
  panelRef,
}: AssistantPanelProps) {
  if (!open) return null;

  const langLine = SUPPORTED_LANGUAGES.map((l) => l.nameSelf).join(' · ');

  return (
    <>
      {/* Backdrop — transparent on desktop, subtle on mobile */}
      <div
        className="fixed inset-0 z-[59] bg-black/10 sm:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="assistant-panel-title"
        aria-describedby="assistant-panel-subtitle"
        className={[
          // Positioning: full-width at bottom on mobile, floating card on desktop
          'fixed z-[60] bg-white shadow-card-hover',
          // Mobile: full width, bottom sheet style
          'bottom-0 left-0 right-0 rounded-t-2xl',
          // Desktop: floating card above launcher
          'sm:bottom-24 sm:right-6 sm:left-auto sm:w-[380px] sm:rounded-2xl',
          // Border
          'border border-gray-100',
        ].join(' ')}
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between border-b border-gray-100 p-4">
          <div>
            <h2
              id="assistant-panel-title"
              className="font-display text-sm font-semibold text-gray-900"
            >
              Emlakie AI Leasing Assistant
            </h2>
            <p
              id="assistant-panel-subtitle"
              className="mt-0.5 text-xs text-gray-500"
            >
              Tell me what kind of rental home you&apos;re looking for.
            </p>
          </div>

          {/* Close button — first focusable element, receives focus on open */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close assistant"
            className={[
              'ml-3 flex h-8 w-8 flex-shrink-0 items-center justify-center',
              'rounded-lg text-gray-400 transition',
              'hover:bg-gray-100 hover:text-gray-600',
              'focus-visible:outline-none focus-visible:ring-2',
              'focus-visible:ring-brand-500 focus-visible:ring-offset-1',
            ].join(' ')}
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              <path d="M2 2l12 12M14 2L2 14" />
            </svg>
          </button>
        </div>

        {/* ── State display ── */}
        <AssistantStateDisplay state={assistantState} />

        {/* ── Divider ── */}
        <div className="mx-4 border-t border-gray-100" />

        {/* ── Placeholder recommendation cards ── */}
        <AssistantPlaceholderCards />

        {/* ── Language strip ── */}
        <div className="border-t border-gray-50 px-4 py-3">
          <p
            className="text-center text-[11px] leading-relaxed text-gray-300"
            aria-label="Supported languages: English, Spanish, Persian, Armenian, Russian, Arabic"
          >
            {langLine}
          </p>
        </div>

        {/* ── Beta notice ── */}
        <div className="rounded-b-2xl bg-brand-50 px-4 py-2.5">
          <p className="text-center text-[10px] text-brand-700">
            AI Assistant · Coming soon
          </p>
        </div>
      </div>
    </>
  );
}
