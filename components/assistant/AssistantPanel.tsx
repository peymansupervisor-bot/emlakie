'use client';

import { useEffect, useRef } from 'react';
import { SUPPORTED_LANGUAGES } from '@/lib/assistant/config';
import AssistantStateDisplay from './AssistantStateDisplay';
import AssistantListingCard from './AssistantListingCard';
import type { AssistantState, ListingRecommendation, AssistantActiveFilters } from '@/types/assistant';

interface AssistantPanelProps {
  open: boolean;
  displayState: AssistantState;
  onClose: () => void;
  onCancel: () => void;
  panelRef: React.RefObject<HTMLDivElement>;
  recommendations?: ListingRecommendation[];
  activeFilters?: AssistantActiveFilters;
  errorCode?: string;
}

/**
 * Production AI Leasing Assistant panel — voice-only.
 *
 * The assistant communicates entirely via voice (OpenAI Realtime API / WebRTC).
 * When the model calls search_listings, listing cards appear in a horizontal
 * scroll strip. No text input, no text transcript.
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
  recommendations = [],
  activeFilters,
  errorCode,
}: AssistantPanelProps) {
  const langLine = SUPPORTED_LANGUAGES.map((l) => l.nameSelf).join(' · ');
  const cardScrollRef = useRef<HTMLDivElement>(null);

  // Item 14 — scroll cards back to start when model begins speaking
  useEffect(() => {
    if (displayState === 'speaking' && cardScrollRef.current) {
      cardScrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
    }
  }, [displayState]);
  const isActive =
    displayState === 'listening' ||
    displayState === 'processing' ||
    displayState === 'speaking' ||
    displayState === 'greeting';

  const hasCards = recommendations.length > 0;

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
          'max-h-[90vh] sm:max-h-[560px]',
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

        {/* ── Active filter strip (Item 11) ── */}
        {activeFilters && <FilterStrip filters={activeFilters} />}

        {/* ── Listing cards ── */}
        {hasCards && (
          <div
            className="flex-shrink-0 border-b border-gray-50"
            aria-label={`${recommendations.length} listing${recommendations.length === 1 ? '' : 's'} found`}
          >
            <div
              ref={cardScrollRef}
              className="flex gap-2.5 overflow-x-auto px-4 py-3 scroll-smooth"
              style={{ scrollbarWidth: 'none' }}
            >
              {recommendations.map((listing, i) => (
                <AssistantListingCard
                  key={listing.id}
                  listing={listing}
                  rank={i + 1}
                />
              ))}
            </div>
            <p className="pb-2 text-center text-[10px] text-gray-400">
              {recommendations.length} listing{recommendations.length === 1 ? '' : 's'} · scroll to see more
            </p>
          </div>
        )}

        {/* ── State display ── */}
        <div className="flex-1">
          <AssistantStateDisplay state={displayState} errorCode={errorCode} />
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

// ---------------------------------------------------------------------------
// Filter strip — shows the active search filters as dismissible chips
// ---------------------------------------------------------------------------

function FilterStrip({ filters }: { filters: AssistantActiveFilters }) {
  const chips: string[] = [];

  if (filters.city) chips.push(filters.city);
  if (filters.zip) chips.push(filters.zip);
  if (filters.bedrooms) {
    chips.push(filters.bedrooms === '0' ? 'Studio' : `${filters.bedrooms} bed`);
  }
  if (filters.propertyType) {
    chips.push(filters.propertyType.charAt(0).toUpperCase() + filters.propertyType.slice(1));
  }
  if (filters.minPrice && filters.maxPrice) {
    chips.push(`$${Number(filters.minPrice).toLocaleString()}–$${Number(filters.maxPrice).toLocaleString()}`);
  } else if (filters.minPrice) {
    chips.push(`From $${Number(filters.minPrice).toLocaleString()}`);
  } else if (filters.maxPrice) {
    chips.push(`Up to $${Number(filters.maxPrice).toLocaleString()}`);
  }
  if (filters.amenities) {
    filters.amenities.split(',').slice(0, 2).forEach((a) => chips.push(a.trim()));
  }

  if (chips.length === 0) return null;

  return (
    <div
      className="flex-shrink-0 border-b border-gray-50 px-4 py-2"
      aria-label="Active search filters"
    >
      <div className="flex items-center gap-1.5 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <span className="flex-shrink-0 text-[10px] font-medium text-gray-400 uppercase tracking-wide">
          Searching:
        </span>
        {chips.map((chip) => (
          <span
            key={chip}
            className="flex-shrink-0 rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-700"
          >
            {chip}
          </span>
        ))}
      </div>
    </div>
  );
}
