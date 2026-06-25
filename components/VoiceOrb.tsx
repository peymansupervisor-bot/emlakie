'use client';

import { useEffect } from 'react';

export type OrbState = 'idle' | 'listening' | 'thinking' | 'speaking';

export interface OrbTranscript {
  user?: string;
  ai?: string;
}

const COLORS: Record<Exclude<OrbState, 'idle'>, {
  outer: string; mid: string; inner: string; text: string; sub: string;
}> = {
  listening: {
    outer: 'from-blue-600 via-indigo-500 to-cyan-400',
    mid:   'from-blue-400 via-sky-300 to-indigo-400',
    inner: 'from-white/40 to-cyan-200/30',
    text:  'Listening…',
    sub:   'Speak now',
  },
  thinking: {
    outer: 'from-violet-600 via-purple-500 to-fuchsia-400',
    mid:   'from-violet-400 via-purple-300 to-pink-400',
    inner: 'from-white/40 to-purple-200/30',
    text:  'Thinking…',
    sub:   'Processing your request',
  },
  speaking: {
    outer: 'from-emerald-500 via-green-400 to-teal-400',
    mid:   'from-green-300 via-emerald-200 to-teal-300',
    inner: 'from-white/40 to-emerald-200/30',
    text:  'Responding…',
    sub:   'Playing response',
  },
};

export default function VoiceOrb({
  state,
  transcript = {},
  onStop,
}: {
  state: OrbState;
  transcript?: OrbTranscript;
  onStop: () => void;
}) {
  useEffect(() => {
    if (state === 'idle') return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onStop(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state, onStop]);

  if (state === 'idle') return null;

  const c = COLORS[state];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={c.text}
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-950/85 backdrop-blur-xl"
      onClick={onStop}
    >
      {/* Orb */}
      <div
        className="orb-fade-in relative flex h-56 w-56 items-center justify-center sm:h-64 sm:w-64"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Far outer halo */}
        <div className={`absolute inset-0 rounded-full bg-gradient-to-br ${c.outer} opacity-20 blur-3xl orb-pulse`} />
        {/* Rotating ring */}
        <div className={`absolute inset-3 rounded-full bg-gradient-to-br ${c.outer} opacity-30 orb-spin`}
          style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }} />
        {/* Main morphing blob */}
        <div
          className={`absolute inset-6 bg-gradient-to-br ${c.outer} orb-morph shadow-2xl`}
          style={{ borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%' }}
        />
        {/* Mid layer */}
        <div
          className={`absolute inset-10 bg-gradient-to-br ${c.mid} opacity-70`}
          style={{ borderRadius: '40% 60% 70% 30% / 30% 50% 50% 70%', animation: 'orb-morph 4s ease-in-out infinite reverse' }}
        />
        {/* Inner shimmer */}
        <div className={`absolute inset-14 rounded-full bg-gradient-to-br ${c.inner} blur-md orb-shimmer`} />
        {/* Center dot */}
        <div className="relative z-10 h-3 w-3 rounded-full bg-white/80 shadow-lg" />
        {/* Ripple rings when listening */}
        {state === 'listening' && (
          <>
            <div className="absolute inset-0 rounded-full border border-white/10 orb-pulse" style={{ animationDelay: '0s' }} />
            <div className="absolute -inset-4 rounded-full border border-white/5 orb-pulse" style={{ animationDelay: '0.4s' }} />
            <div className="absolute -inset-8 rounded-full border border-white/[0.03] orb-pulse" style={{ animationDelay: '0.8s' }} />
          </>
        )}
      </div>

      {/* State label */}
      <div className="orb-fade-in mt-8 flex flex-col items-center gap-1 text-center">
        <p className="text-lg font-semibold tracking-wide text-white">{c.text}</p>
        <p className="text-sm text-white/40">{c.sub}</p>
      </div>

      {/* Conversation transcript */}
      {(transcript.user || transcript.ai) && (
        <div
          className="orb-fade-in mx-6 mt-6 w-full max-w-sm space-y-3 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          {transcript.user && (
            <div className="rounded-2xl bg-white/10 px-5 py-3">
              <p className="text-sm text-white/60">You said</p>
              <p className="mt-0.5 text-sm font-medium text-white/90">"{transcript.user}"</p>
            </div>
          )}
          {transcript.ai && (
            <div className="rounded-2xl bg-white/[0.07] px-5 py-3">
              <p className="text-xs text-white/40">EMLAKIE</p>
              <p className="mt-0.5 text-sm text-white/80">{transcript.ai}</p>
            </div>
          )}
        </div>
      )}

      {/* Stop button */}
      <button
        type="button"
        onClick={onStop}
        className="orb-fade-in mt-8 rounded-full border border-white/20 bg-white/10 px-8 py-3 text-sm font-medium text-white/70 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
      >
        End conversation
      </button>
    </div>
  );
}
