'use client';

/**
 * useRealtimeLab — thin React wrapper around RealtimeEngine for the lab.
 *
 * All WebRTC + session logic lives in lib/assistant/realtime/engine.ts.
 * This hook maps engine events to lab metrics and event-log entries.
 *
 * NEVER logs user transcript content — only event types, language codes,
 * numeric latencies, and OpenAI error codes.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { RealtimeEngine } from '@/lib/assistant/realtime/engine';
import type { LabMetrics, LabEventEntry } from '@/lib/assistant/realtime-lab/types';
import { INITIAL_LAB_METRICS } from '@/lib/assistant/realtime-lab/types';
import {
  LAB_REALTIME_MODEL,
  LAB_VOICE,
  LAB_MAX_EVENT_LOG,
  LAB_TOKEN_URL,
  LAB_OPENAI_REALTIME_URL,
  LAB_VAD_CONFIG,
} from '@/lib/assistant/realtime-lab/config';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UseRealtimeLabOptions {
  audioRef: React.RefObject<HTMLAudioElement>;
}

export interface UseRealtimeLabReturn {
  metrics: LabMetrics;
  startSession: () => Promise<void>;
  stopSession: () => void;
  copyReport: () => void;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _seq = 0;
function nextId() {
  return `lab-${Date.now()}-${++_seq}`;
}

function detectBrowser(): string {
  if (typeof navigator === 'undefined') return 'Unknown';
  const ua = navigator.userAgent;
  if (ua.includes('Edg/') || ua.includes('EdgA/')) return 'Edge';
  if (ua.includes('Chrome/') && !ua.includes('Chromium')) return 'Chrome';
  if (ua.includes('Firefox/')) return 'Firefox';
  if (ua.includes('Safari/') && !ua.includes('Chrome')) return 'Safari';
  if (ua.includes('OPR/') || ua.includes('Opera/')) return 'Opera';
  return 'Unknown';
}

function formatDurationMs(ms: number): string {
  const totalSecs = Math.floor(ms / 1000);
  const mins = Math.floor(totalSecs / 60);
  const secs = totalSecs % 60;
  return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export function useRealtimeLab({ audioRef }: UseRealtimeLabOptions): UseRealtimeLabReturn {
  const [metrics, setMetrics] = useState<LabMetrics>(INITIAL_LAB_METRICS);

  useEffect(() => {
    setMetrics((m) => ({ ...m, browserName: detectBrowser() }));
  }, []);

  const engineRef = useRef<RealtimeEngine | null>(null);

  // -------------------------------------------------------------------------
  // Event log
  // -------------------------------------------------------------------------

  const logEvent = useCallback((type: string, note?: string) => {
    const entry: LabEventEntry = {
      id: nextId(),
      ts: new Date().toISOString(),
      type,
      ...(note !== undefined ? { note } : {}),
    };
    setMetrics((m) => ({
      ...m,
      events: [entry, ...m.events].slice(0, LAB_MAX_EVENT_LOG),
    }));
  }, []);

  // -------------------------------------------------------------------------
  // stopSession
  // -------------------------------------------------------------------------

  const stopSession = useCallback(() => {
    engineRef.current?.disconnect();
    engineRef.current = null;
    setMetrics((m) => ({ ...m, status: 'stopped', assistantState: 'idle' }));
    logEvent('session.stopped');
  }, [logEvent]);

  // -------------------------------------------------------------------------
  // Cleanup on unmount
  // -------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      engineRef.current?.disconnect();
    };
  }, []);

  // -------------------------------------------------------------------------
  // startSession
  // -------------------------------------------------------------------------

  const startSession = useCallback(async () => {
    setMetrics((prev) => ({
      ...INITIAL_LAB_METRICS,
      browserName: prev.browserName,
      status: 'requesting-mic',
    }));

    const engine = new RealtimeEngine(
      audioRef,
      {
        tokenUrl: LAB_TOKEN_URL,
        realtimeUrl: LAB_OPENAI_REALTIME_URL,
        vadConfig: LAB_VAD_CONFIG,
        voice: LAB_VOICE,
        sendGreetingOnConnect: false,
      },
      {
        onMicGranted: () => {
          setMetrics((m) => ({ ...m, micPermission: 'granted', status: 'fetching-token' }));
          logEvent('mic_granted');
        },

        onConnecting: () => {
          setMetrics((m) => ({ ...m, status: 'connecting' }));
          logEvent('webrtc_offer_answered');
        },

        onSessionCreated: () => {
          setMetrics((m) => ({
            ...m,
            status: 'connected',
            assistantState: 'listening',
            sessionStartedAt: Date.now(),
          }));
          logEvent('session.created');
        },

        onSessionUpdated: (isSetup) => {
          if (isSetup) {
            logEvent('session.updated (setup complete — create_response re-enabled)');
          } else {
            logEvent('session.updated');
          }
        },

        onConnected: () => {
          // Two-phase setup done — lab already shows 'connected' from onSessionCreated
        },

        onDisconnected: () => {
          setMetrics((m) => ({ ...m, status: 'stopped', assistantState: 'idle' }));
          logEvent('session.stopped');
        },

        onError: (code, message) => {
          console.error('[realtime-lab] error:', { code, message });
          setMetrics((m) => ({
            ...m,
            status: m.status === 'requesting-mic' || m.status === 'fetching-token' || m.status === 'connecting'
              ? 'error'
              : m.status,
            micPermission: code === 'mic_permission_denied' ? 'denied' : m.micPermission,
            errorCount: m.errorCount + 1,
            lastError: code,
          }));
          logEvent('error', code);
        },

        onSpeechStarted: (interrupted) => {
          if (interrupted) {
            setMetrics((m) => ({
              ...m,
              assistantState: 'user-speaking',
              interruptionCount: m.interruptionCount + 1,
            }));
            logEvent('speech_started', 'interruption detected');
          } else {
            setMetrics((m) => ({ ...m, assistantState: 'user-speaking' }));
            logEvent('speech_started');
          }
        },

        onSpeechStopped: () => {
          setMetrics((m) => ({ ...m, assistantState: 'listening' }));
          logEvent('speech_stopped');
        },

        onTranscriptionCompleted: (lang) => {
          setMetrics((m) => ({
            ...m,
            transcriptionCount: m.transcriptionCount + 1,
            ...(lang ? { detectedLanguage: lang } : {}),
          }));
          logEvent('transcription.completed', lang ? `lang:${lang}` : undefined);
        },

        onResponseCreated: () => {
          logEvent('response.created');
        },

        onResponseAudioFirstChunk: (latencyMs) => {
          setMetrics((m) => {
            if (latencyMs === null) {
              return { ...m, assistantState: 'speaking' };
            }
            const newLatencies = [...m.latencies, latencyMs];
            const avg = Math.round(
              newLatencies.reduce((a, b) => a + b, 0) / newLatencies.length,
            );
            return {
              ...m,
              assistantState: 'speaking',
              latencies: newLatencies,
              lastLatencyMs: latencyMs,
              avgLatencyMs: avg,
            };
          });
          logEvent(
            'response.audio.delta',
            latencyMs !== null
              ? `first chunk — ${latencyMs}ms latency`
              : 'first chunk (no speech_stopped timestamp)',
          );
        },

        onResponseAudioDone: () => {
          setMetrics((m) => ({ ...m, assistantState: 'listening' }));
          logEvent('response.audio.done');
        },

        onResponseDone: () => {
          setMetrics((m) => ({ ...m, totalTurns: m.totalTurns + 1 }));
          logEvent('response.done');
        },
      },
    );

    engineRef.current = engine;
    await engine.connect();
  }, [audioRef, logEvent]);

  // -------------------------------------------------------------------------
  // Copy report
  // -------------------------------------------------------------------------

  const copyReport = useCallback(() => {
    const now = new Date();
    const durationMs = metrics.sessionStartedAt
      ? Date.now() - metrics.sessionStartedAt
      : null;

    const lines: string[] = [
      'EMLAKIE AI LAB TEST REPORT',
      '==========================',
      `Date:              ${now.toISOString()}`,
      `Browser:           ${metrics.browserName}`,
      `Microphone:        ${metrics.micPermission}`,
      '',
      'CONNECTION',
      `Status:            ${metrics.status}`,
      `Session duration:  ${durationMs !== null ? formatDurationMs(durationMs) : '—'}`,
      '',
      'ASSISTANT STATE',
      `Current state:     ${metrics.assistantState}`,
      '',
      'CONVERSATION',
      `Turns:             ${metrics.totalTurns}`,
      `Transcriptions:    ${metrics.transcriptionCount}`,
      `Detected language: ${metrics.detectedLanguage ?? '—'}`,
      '',
      'PERFORMANCE',
      `Last latency:      ${metrics.lastLatencyMs !== null ? `${metrics.lastLatencyMs}ms` : '—'}`,
      `Average latency:   ${metrics.avgLatencyMs !== null ? `${metrics.avgLatencyMs}ms` : '—'}`,
      `Latency history:   ${metrics.latencies.length > 0 ? metrics.latencies.map((n) => `${n}ms`).join(', ') : '—'}`,
      '',
      'RELIABILITY',
      `Interruptions:     ${metrics.interruptionCount}`,
      `Errors:            ${metrics.errorCount}`,
      `Last error:        ${metrics.lastError ?? 'none'}`,
      '',
      'MODEL',
      `Model:             ${LAB_REALTIME_MODEL}`,
      `Voice:             ${LAB_VOICE}`,
    ];

    void navigator.clipboard.writeText(lines.join('\n'));
  }, [metrics]);

  return { metrics, startSession, stopSession, copyReport };
}
