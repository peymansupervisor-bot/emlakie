'use client';

import { SUPPORTED_LANGUAGES } from '@/lib/assistant/config';
import AssistantStateDisplay from './AssistantStateDisplay';
import type { AssistantState } from '@/types/assistant';

interface AssistantPanelProps {
  open: boolean;
  displayState: AssistantState;
  onClose: () => void;
  onCancel: () => void;
  panelRef: React.RefObject<HTMLDivElement>;
}

/**
 * Production AI Leasing Assistant panel — voice-only.
 *
 * The assistant communicates entirely via voice (OpenAI Realtime API / WebRTC).
 * No text input, no text transcript, no recommendation cards in Phase 2.
 * Listing integration is Phase 3.
 *
 * Accessibility:
 * - role="dialog" with aria-modal and aria-labelledby
 * - Close button receives focus on open (managed by useAssistantPanel)
 * - Escape key handled by useAssistantPanel
 */
export default function AssistantPanel({
  open,
  displayState,
  onClose,
  onCancel,
  panelRef,
}: AssistantPanelProps) {
  const langLine = SUPPORTED_LANGUAGES.map((l) => l.nameSelf).join(' · ');
  const isActive =
    displayState === 'listening' ||
    displayState === 'processing' ||
    displayState === 'speaking' ||
    displayState === 'greeting';

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
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
          'fixed z-[60] bg-white shadow-card-hover',
          'bottom-0 left-0 right-0 rounded-t-2xl',
          'sm:bottom-24 sm:right-6 sm:left-auto sm:w-[380px] sm:rounded-2xl',
          'border border-gray-100',
          'flex flex-col',
          'max-h-[90vh] sm:max-h-[480px]',
        ].join(' ')}
      >
        {/* ── Header ── */}
        <div className="flex flex-shrink-0 items-start justify-between border-b border-gray-100 p-4">
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
              Voice assistant — speak your question
            </p>
          </div>

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
        <div className="flex-1">
          <AssistantStateDisplay state={displayState} />
        </div>

        {/* ── Cancel button (visible while assistant is speaking) ── */}
        {displayState === 'speaking' && (
          <div className="px-4 pb-3 flex-shrink-0">
            <button
              type="button"
              onClick={onCancel}
              className={[
                'w-full rounded-xl border border-gray-200 py-2',
                'text-xs font-medium text-gray-500 transition',
                'hover:bg-gray-50 hover:text-gray-700',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
              ].join(' ')}
            >
              Stop speaking
            </button>
          </div>
        )}

        {/* ── Language strip ── */}
        <div className="flex-shrink-0 border-t border-gray-50 px-4 py-3">
          <p
            className="text-center text-[11px] leading-relaxed text-gray-300"
            aria-label={`Supported languages: ${SUPPORTED_LANGUAGES.map((l) => l.nameEn).join(', ')}`}
          >
            {langLine}
          </p>
        </div>

        {/* ── Footer ── */}
        <div className="flex-shrink-0 rounded-b-2xl bg-brand-50 px-4 py-2.5">
          <p className="text-center text-[10px] text-brand-700">
            {isActive ? 'Live session · AI responses may vary' : 'AI Leasing Assistant · Beta'}
          </p>
        </div>
      </div>
    </>
  );
}
