'use client';

import { useState, useRef, useEffect } from 'react';
import { SUPPORTED_LANGUAGES } from '@/lib/assistant/config';
import AssistantStateDisplay from './AssistantStateDisplay';
import AssistantPlaceholderCards from './AssistantPlaceholderCards';
import type { AssistantState, AssistantMessage, ListingRecommendation } from '@/types/assistant';

interface AssistantPanelProps {
  open: boolean;
  displayState: AssistantState;
  messages: AssistantMessage[];
  recommendations: ListingRecommendation[];
  inputEnabled: boolean;
  onClose: () => void;
  onSendMessage: (text: string) => void;
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
 */
export default function AssistantPanel({
  open,
  displayState,
  messages,
  recommendations,
  inputEnabled,
  onClose,
  onSendMessage,
  panelRef,
}: AssistantPanelProps) {
  const [draftText, setDraftText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const langLine = SUPPORTED_LANGUAGES.map((l) => l.nameSelf).join(' · ');

  // Auto-scroll message list to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function handleSend() {
    const trimmed = draftText.trim();
    if (!trimmed || !inputEnabled) return;
    onSendMessage(trimmed);
    setDraftText('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop — subtle on mobile */}
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
          // Max height so the panel doesn't overflow viewport
          'max-h-[90vh] sm:max-h-[600px]',
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
              Tell me what kind of rental home you&apos;re looking for.
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
        <AssistantStateDisplay state={displayState} />

        {/* ── Message thread (only when messages exist) ── */}
        {messages.length > 0 && (
          <div className="mx-4 mb-3 flex max-h-48 flex-col gap-2 overflow-y-auto rounded-xl border border-gray-100 bg-gray-50 p-3">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={[
                  'text-xs leading-relaxed',
                  msg.role === 'user'
                    ? 'self-end rounded-xl bg-brand-700 px-3 py-1.5 text-white max-w-[80%]'
                    : 'self-start text-gray-700',
                ].join(' ')}
              >
                {msg.displayText}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}

        {/* ── Divider ── */}
        <div className="mx-4 border-t border-gray-100" />

        {/* ── Recommendations ── */}
        <div className="overflow-y-auto">
          <AssistantPlaceholderCards
            recommendations={recommendations.length > 0 ? recommendations : undefined}
          />
        </div>

        {/* ── Demo text input (visible when inputEnabled) ── */}
        {inputEnabled && (
          <div className="mx-4 mb-3 flex-shrink-0 rounded-xl border border-amber-300 bg-amber-50 p-3">
            <div className="mb-2 flex items-center gap-1.5">
              <span className="rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800">
                Demo
              </span>
              <span className="text-[11px] text-amber-700">
                Mock transport — no real AI yet
              </span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Test message…"
                aria-label="Test message for demo assistant"
                className={[
                  'flex-1 rounded-lg border border-amber-200 bg-white px-3 py-1.5',
                  'text-xs text-gray-700 placeholder:text-gray-400',
                  'focus:outline-none focus:ring-2 focus:ring-amber-400',
                ].join(' ')}
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!draftText.trim()}
                aria-label="Send test message"
                className={[
                  'flex h-8 w-8 flex-shrink-0 items-center justify-center',
                  'rounded-lg bg-amber-500 text-white transition',
                  'hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-40',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400',
                ].join(' ')}
              >
                <svg
                  className="h-3.5 w-3.5"
                  viewBox="0 0 16 16"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d="M1.707 1.293a1 1 0 00-1.32 1.497l5.293 4.71-5.293 4.71a1 1 0 001.32 1.497l7-6.207a1 1 0 000-1.497l-7-6.207-.707.207z" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* ── Language strip ── */}
        <div className="flex-shrink-0 border-t border-gray-50 px-4 py-3">
          <p
            className="text-center text-[11px] leading-relaxed text-gray-300"
            aria-label="Supported languages: English, Spanish, Persian, Armenian, Russian, Arabic"
          >
            {langLine}
          </p>
        </div>

        {/* ── Beta notice ── */}
        <div className="flex-shrink-0 rounded-b-2xl bg-brand-50 px-4 py-2.5">
          <p className="text-center text-[10px] text-brand-700">
            AI Assistant · Demo mode
          </p>
        </div>
      </div>
    </>
  );
}
