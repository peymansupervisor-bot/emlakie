'use client';

/**
 * LabClient — UI for the OpenAI Realtime validation lab.
 *
 * Renders a self-contained test harness. Does not share state with the
 * production assistant shell (AssistantShell / useAssistantSession / etc.).
 */

import { useRef, useState, useEffect } from 'react';
import { useRealtimeLab } from '@/hooks/assistant/realtime-lab/useRealtimeLab';
import { LAB_SYSTEM_INSTRUCTION, LAB_REALTIME_MODEL, LAB_VOICE } from '@/lib/assistant/realtime-lab/config';
import type { LabConnectionStatus, LabMetrics } from '@/lib/assistant/realtime-lab/types';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDuration(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

function formatMs(ms: number | null): string {
  if (ms === null) return '—';
  return `${ms}ms`;
}

function statusDotColor(status: LabConnectionStatus): string {
  switch (status) {
    case 'connected':     return 'bg-green-500';
    case 'connecting':
    case 'fetching-token':
    case 'requesting-mic': return 'bg-amber-400 animate-pulse';
    case 'error':          return 'bg-red-500';
    case 'stopped':        return 'bg-gray-400';
    default:               return 'bg-gray-300';
  }
}

function statusLabel(status: LabConnectionStatus): string {
  switch (status) {
    case 'idle':            return 'Idle';
    case 'requesting-mic':  return 'Requesting microphone…';
    case 'fetching-token':  return 'Fetching token…';
    case 'connecting':      return 'Connecting to OpenAI…';
    case 'connected':       return 'Connected';
    case 'stopped':         return 'Stopped';
    case 'error':           return 'Error';
  }
}

function useSessionDuration(startedAt: number | null): string {
  const [, forceUpdate] = useState(0);
  useEffect(() => {
    if (!startedAt) return;
    const id = setInterval(() => forceUpdate((n) => n + 1), 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  if (!startedAt) return '—';
  return formatDuration(Date.now() - startedAt);
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function MetricCell({ label, value, highlight = false }: {
  label: string;
  value: string | number;
  highlight?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-white p-4">
      <span className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
        {label}
      </span>
      <span className={`font-display text-xl font-bold tabular-nums ${highlight ? 'text-brand-700' : 'text-gray-800'}`}>
        {value}
      </span>
    </div>
  );
}

function EventLog({ events }: { events: LabMetrics['events'] }) {
  return (
    <div className="rounded-xl border border-gray-100 bg-gray-950 p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">Event log</span>
        <span className="text-[10px] text-gray-600">{events.length} entries · no user content</span>
      </div>
      <div className="max-h-48 overflow-y-auto space-y-0.5">
        {events.length === 0 ? (
          <p className="text-xs text-gray-600 italic">No events yet.</p>
        ) : (
          events.map((ev) => (
            <div key={ev.id} className="flex items-baseline gap-3 font-mono text-[11px]">
              <span className="flex-shrink-0 text-gray-600">
                {ev.ts.slice(11, 23)}
              </span>
              <span className="text-green-400">{ev.type}</span>
              {ev.note && (
                <span className="text-amber-400">{ev.note}</span>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export default function LabClient() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { metrics, startSession, stopSession, copyReport } = useRealtimeLab({ audioRef });
  const duration = useSessionDuration(metrics.sessionStartedAt);

  const isActive = metrics.status === 'connected';
  const isBusy =
    metrics.status === 'requesting-mic' ||
    metrics.status === 'fetching-token' ||
    metrics.status === 'connecting';

  function handlePrimary() {
    if (isActive) {
      stopSession();
    } else {
      void startSession();
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      {/* Hidden audio element — WebRTC routes remote audio here */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} autoPlay />

      <div className="mx-auto max-w-2xl space-y-6">

        {/* ── Internal warning banner ── */}
        <div className="rounded-xl border border-amber-300 bg-amber-50 px-4 py-3">
          <div className="flex items-start gap-3">
            <span className="text-lg" aria-hidden="true">⚠</span>
            <div>
              <p className="font-display text-sm font-semibold text-amber-900">
                Internal assistant lab — not for public use
              </p>
              <p className="mt-0.5 text-xs text-amber-700">
                Not connected to real listings. Conversations are not stored.
                This page validates OpenAI Realtime API capabilities only.
              </p>
            </div>
          </div>
        </div>

        {/* ── Header ── */}
        <div>
          <h1 className="font-display text-2xl font-bold text-gray-900">
            AI Leasing Assistant Lab
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Model: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700">{LAB_REALTIME_MODEL}</code>
            {' · '}
            Voice: <code className="rounded bg-gray-100 px-1.5 py-0.5 text-xs text-gray-700">{LAB_VOICE}</code>
          </p>
        </div>

        {/* ── System instruction ── */}
        <div className="rounded-xl border border-gray-200 bg-white p-4">
          <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            System instruction
          </p>
          <p className="text-sm leading-relaxed text-gray-700 italic">
            &ldquo;{LAB_SYSTEM_INSTRUCTION}&rdquo;
          </p>
        </div>

        {/* ── Status + controls ── */}
        <div className="rounded-xl border border-gray-200 bg-white p-5 space-y-4">

          {/* Status row */}
          <div className="flex items-center gap-3">
            <span className={`h-2.5 w-2.5 flex-shrink-0 rounded-full ${statusDotColor(metrics.status)}`} />
            <span className="text-sm font-medium text-gray-700">
              {statusLabel(metrics.status)}
            </span>
            {isActive && (
              <span className="text-sm text-gray-400">· Session: {duration}</span>
            )}
            {metrics.status === 'error' && metrics.lastError && (
              <span className="ml-auto rounded bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700">
                {metrics.lastError}
              </span>
            )}
          </div>

          {/* Primary button */}
          <button
            type="button"
            onClick={handlePrimary}
            disabled={isBusy}
            className={[
              'w-full rounded-xl py-3 text-sm font-semibold transition-all',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              isActive
                ? 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500'
                : isBusy
                ? 'cursor-not-allowed bg-gray-100 text-gray-400'
                : 'bg-brand-700 text-white hover:bg-brand-800 focus-visible:ring-brand-500',
            ].join(' ')}
          >
            {isBusy
              ? statusLabel(metrics.status)
              : isActive
              ? 'Stop Session'
              : metrics.status === 'stopped' || metrics.status === 'error'
              ? 'Start New Session'
              : 'Start Lab Session'}
          </button>

          {/* Test guidance */}
          {(metrics.status === 'idle' || metrics.status === 'stopped' || metrics.status === 'error') && (
            <div className="rounded-lg bg-gray-50 p-3 text-xs text-gray-500 space-y-1">
              <p className="font-medium text-gray-600">How to test:</p>
              <ul className="list-disc list-inside space-y-0.5">
                <li><strong>English:</strong> &ldquo;I&apos;m looking for a 2-bedroom apartment under $2,000&rdquo;</li>
                <li><strong>Spanish:</strong> &ldquo;Busco un departamento de dos recámaras&rdquo;</li>
                <li><strong>Persian:</strong> &ldquo;دنبال یک آپارتمان دو خوابه می‌گردم&rdquo;</li>
                <li><strong>Mixed:</strong> Switch languages mid-conversation</li>
                <li><strong>Interruption:</strong> Speak while assistant is responding</li>
              </ul>
            </div>
          )}
        </div>

        {/* ── Metrics grid ── */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
            Session metrics
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <MetricCell
              label="Last latency"
              value={formatMs(metrics.lastLatencyMs)}
              highlight={metrics.lastLatencyMs !== null && metrics.lastLatencyMs < 1000}
            />
            <MetricCell label="Avg latency" value={formatMs(metrics.avgLatencyMs)} />
            <MetricCell label="Turns" value={metrics.totalTurns} />
            <MetricCell label="Errors" value={metrics.errorCount} />
            <MetricCell
              label="Interruptions"
              value={metrics.interruptionCount}
              highlight={metrics.interruptionCount > 0}
            />
            <MetricCell label="Transcriptions" value={metrics.transcriptionCount} />
          </div>

          {/* Interruption result */}
          {metrics.interruptionCount > 0 && (
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-3 py-2">
              <span className="text-green-600" aria-hidden="true">✓</span>
              <span className="text-sm font-medium text-green-800">
                Interruption works — detected {metrics.interruptionCount} time{metrics.interruptionCount !== 1 ? 's' : ''}
              </span>
            </div>
          )}

          {/* Latency breakdown */}
          {metrics.latencies.length > 1 && (
            <div className="mt-3 rounded-lg border border-gray-100 bg-white p-3">
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-gray-400">
                Latency history (ms)
              </p>
              <div className="flex flex-wrap gap-2">
                {metrics.latencies.map((ms, i) => (
                  <span
                    key={i}
                    className={`rounded px-2 py-0.5 text-xs font-mono font-medium ${
                      ms < 800 ? 'bg-green-100 text-green-800' :
                      ms < 1500 ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}
                  >
                    {ms}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-gray-400">
                Green &lt;800ms · Amber &lt;1500ms · Red ≥1500ms
              </p>
            </div>
          )}
        </div>

        {/* ── Event log ── */}
        <EventLog events={metrics.events} />

        {/* ── Copy report ── */}
        {(metrics.status === 'stopped' || metrics.status === 'error' || metrics.totalTurns > 0) && (
          <button
            type="button"
            onClick={copyReport}
            className={[
              'w-full rounded-xl border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-600',
              'hover:bg-gray-50 transition',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
            ].join(' ')}
          >
            Copy lab report to clipboard
          </button>
        )}

        {/* ── Footer ── */}
        <p className="text-center text-xs text-gray-400 pb-8">
          Phase 1D-Validation · Internal · Not connected to real listings ·{' '}
          <code>{LAB_REALTIME_MODEL}</code>
        </p>

      </div>
    </div>
  );
}
