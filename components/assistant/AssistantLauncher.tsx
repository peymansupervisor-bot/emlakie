'use client';

import type { AssistantState } from '@/types/assistant';

interface AssistantLauncherProps {
  onClick: () => void;
  panelOpen: boolean;
  displayState: AssistantState;
  buttonRef: React.RefObject<HTMLButtonElement>;
}

/**
 * Fixed floating launcher button for the AI Leasing Assistant.
 *
 * Accessibility:
 * - Real <button> element
 * - aria-expanded reflects panel open state
 * - aria-controls references the panel dialog
 * - Minimum 44×44px touch target (WCAG 2.5.5)
 * - focus-visible ring matches site-wide style
 *
 * Design:
 * - Matches brand-700 green (#15803d)
 * - Professional, not cartoonish
 * - Text label on desktop, icon-only label for screen readers on mobile
 * - Bottom-right fixed, above navbar z-index
 */
export default function AssistantLauncher({
  onClick,
  panelOpen,
  displayState,
  buttonRef,
}: AssistantLauncherProps) {
  const isActive = displayState !== 'idle' && displayState !== 'error';

  return (
    <button
      ref={buttonRef}
      type="button"
      onClick={onClick}
      aria-expanded={panelOpen}
      aria-controls="assistant-panel"
      aria-label={panelOpen ? 'Close AI leasing assistant' : 'Open AI leasing assistant'}
      className={[
        // Position
        'fixed bottom-6 right-5 z-[60]',
        // Layout — ensure minimum 44px tap target
        'flex items-center gap-2.5',
        'h-[52px] pl-4 pr-5',
        // Shape & color
        'rounded-2xl bg-brand-700 text-white shadow-card-hover',
        // Typography
        'font-display text-sm font-semibold tracking-tight',
        // Interactions
        'transition-all duration-150',
        'hover:bg-brand-800 hover:shadow-lg',
        'active:scale-[0.97]',
        // Focus ring — matches site Button component
        'focus-visible:outline-none focus-visible:ring-2',
        'focus-visible:ring-brand-500 focus-visible:ring-offset-2',
        // Active state (when session is live)
        isActive ? 'animate-glow-pulse' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {/* Waveform icon */}
      <WaveformIcon active={isActive} />

      {/* Text — visible on desktop, sr-only on very small screens */}
      <span className="hidden sm:inline">
        {panelOpen ? 'Close' : 'Talk to Emlakie'}
      </span>
      {/* Always visible on mobile as text (avoids icon-only confusion) */}
      <span className="sm:hidden">
        {panelOpen ? 'Close' : 'Talk to Emlakie'}
      </span>
    </button>
  );
}

function WaveformIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      {/* Five vertical bars — a voice waveform that looks professional */}
      <rect
        x="2" y="7" width="2.5" height="6" rx="1.25"
        fill={active ? 'white' : 'rgba(255,255,255,0.7)'}
      />
      <rect
        x="5.75" y="4" width="2.5" height="12" rx="1.25"
        fill="white"
      />
      <rect
        x="9.5" y="2" width="2.5" height="16" rx="1.25"
        fill="white"
      />
      <rect
        x="13.25" y="5" width="2.5" height="10" rx="1.25"
        fill="white"
      />
      <rect
        x="17" y="8" width="2.5" height="4" rx="1.25"
        fill={active ? 'white' : 'rgba(255,255,255,0.7)'}
      />
    </svg>
  );
}
