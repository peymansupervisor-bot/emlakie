'use client';

import type { AssistantState } from '@/types/assistant';

interface AssistantStateDisplayProps {
  state: AssistantState;
  errorCode?: string;
}

const STATE_CONFIG: Record<
  AssistantState,
  { label: string; sublabel: string; indicator: React.ReactNode }
> = {
  idle: {
    label: 'Ready',
    sublabel: 'Start a session to speak with your AI leasing assistant.',
    indicator: <IdleIndicator />,
  },
  connecting: {
    label: 'Connecting…',
    sublabel: 'Starting your voice session.',
    indicator: <ThinkingDots />,
  },
  greeting: {
    label: 'Hello!',
    sublabel: 'The assistant is introducing itself.',
    indicator: <PulsingDot color="brand" />,
  },
  listening: {
    label: 'Listening…',
    sublabel: 'Speak your question — I\'m here to help.',
    indicator: <ListeningWave />,
  },
  processing: {
    label: 'Thinking…',
    sublabel: 'Working on your answer.',
    indicator: <ThinkingDots />,
  },
  speaking: {
    label: 'Speaking',
    sublabel: 'The assistant is responding.',
    indicator: <PulsingDot color="brand" />,
  },
  showingRecommendations: {
    label: 'Results ready',
    sublabel: 'Here are some homes that match your request.',
    indicator: <IdleIndicator />,
  },
  error: {
    label: 'Something went wrong',
    sublabel: 'Please close and try again.',
    indicator: <PulsingDot color="error" />,
  },
};

export default function AssistantStateDisplay({ state, errorCode }: AssistantStateDisplayProps) {
  const cfg = {
    ...STATE_CONFIG[state],
    ...(state === 'error' && errorCode === 'mic_permission_denied' && {
      label: 'Microphone blocked',
      sublabel: 'Please enable your microphone in your browser settings, then try again.',
    }),
  };

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`Assistant status: ${cfg.label}`}
      className="flex flex-col items-center gap-3 py-6 px-4"
    >
      {/* Visual indicator */}
      <div className="flex h-14 w-14 items-center justify-center">
        {cfg.indicator}
      </div>

      {/* Text */}
      <div className="text-center">
        <p className="font-display text-sm font-semibold text-gray-800">{cfg.label}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-gray-500">{cfg.sublabel}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-indicators — all CSS-only, no JS animation loops, no flashing (WCAG 2.3.1)
// ---------------------------------------------------------------------------

function IdleIndicator() {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-14 w-14"
    >
      <circle cx="28" cy="28" r="27" stroke="#dcfce7" strokeWidth="2" />
      <circle cx="28" cy="28" r="20" fill="#f0fdf4" />
      {/* Waveform bars */}
      <rect x="16" y="24" width="3.5" height="8" rx="1.75" fill="#16a34a" />
      <rect x="21.5" y="20" width="3.5" height="16" rx="1.75" fill="#16a34a" />
      <rect x="27" y="22" width="3.5" height="12" rx="1.75" fill="#16a34a" />
      <rect x="32.5" y="19" width="3.5" height="18" rx="1.75" fill="#16a34a" />
      <rect x="38" y="23" width="3.5" height="10" rx="1.75" fill="#16a34a" />
    </svg>
  );
}

function ListeningWave() {
  return (
    <svg
      viewBox="0 0 56 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="h-14 w-14"
    >
      <circle cx="28" cy="28" r="27" stroke="#bbf7d0" strokeWidth="2" className="animate-glow-pulse" />
      <circle cx="28" cy="28" r="20" fill="#dcfce7" />
      {/* Animated bars via CSS animation-delay */}
      <rect x="16" y="26" width="3.5" height="4" rx="1.75" fill="#16a34a"
        style={{ transformOrigin: '17.75px 28px', animation: 'listeningBar 1s ease-in-out infinite' }} />
      <rect x="21.5" y="22" width="3.5" height="12" rx="1.75" fill="#15803d"
        style={{ transformOrigin: '23.25px 28px', animation: 'listeningBar 1s ease-in-out infinite 0.15s' }} />
      <rect x="27" y="19" width="3.5" height="18" rx="1.75" fill="#15803d"
        style={{ transformOrigin: '28.75px 28px', animation: 'listeningBar 1s ease-in-out infinite 0.3s' }} />
      <rect x="32.5" y="22" width="3.5" height="12" rx="1.75" fill="#15803d"
        style={{ transformOrigin: '34.25px 28px', animation: 'listeningBar 1s ease-in-out infinite 0.15s' }} />
      <rect x="38" y="26" width="3.5" height="4" rx="1.75" fill="#16a34a"
        style={{ transformOrigin: '39.75px 28px', animation: 'listeningBar 1s ease-in-out infinite' }} />
      <style>{`
        @keyframes listeningBar {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(2.2); }
        }
        @media (prefers-reduced-motion: reduce) {
          rect[style*="listeningBar"] { animation: none !important; }
        }
      `}</style>
    </svg>
  );
}

function ThinkingDots() {
  return (
    <div className="flex items-center gap-1.5" aria-hidden="true">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2.5 w-2.5 rounded-full bg-brand-600"
          style={{
            animation: 'thinkingDot 1.2s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes thinkingDot {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        @media (prefers-reduced-motion: reduce) {
          span[style*="thinkingDot"] { animation: none !important; opacity: 1 !important; transform: none !important; }
        }
      `}</style>
    </div>
  );
}

function PulsingDot({ color }: { color: 'brand' | 'error' }) {
  const bg = color === 'brand' ? 'bg-brand-600' : 'bg-red-500';
  return (
    <span
      aria-hidden="true"
      className={`h-4 w-4 rounded-full ${bg} animate-glow-pulse`}
    />
  );
}
