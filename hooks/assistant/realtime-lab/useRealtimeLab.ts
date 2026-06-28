'use client';

/**
 * useRealtimeLab — React hook for the OpenAI Realtime validation lab.
 *
 * Architecture: WebRTC directly browser → OpenAI.
 * The OPENAI_API_KEY never reaches the browser.
 * A short-lived ephemeral token is issued by /api/assistant/realtime-lab/token.
 *
 * What this hook does:
 *   1. Requests microphone permission
 *   2. Fetches an ephemeral token from our server
 *   3. Opens an RTCPeerConnection to OpenAI
 *   4. Routes remote audio to an <audio> element
 *   5. Processes data channel events for metrics
 *
 * What this hook does NOT do:
 *   - Query Supabase
 *   - Call Claude
 *   - Log user message content
 *   - Modify any existing assistant code
 */

import { useCallback, useEffect, useRef, useState } from 'react';
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
// Module-level helpers (stable, no React)
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
  // Initialize with 'Unknown' so server and client render the same value.
  // detectBrowser() runs only after mount (useEffect) to avoid hydration mismatch.
  const [metrics, setMetrics] = useState<LabMetrics>(INITIAL_LAB_METRICS);

  useEffect(() => {
    setMetrics((m) => ({ ...m, browserName: detectBrowser() }));
  }, []);

  // Stable refs — never trigger re-renders
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const dcRef = useRef<RTCDataChannel | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  /** Epoch ms when `input_audio_buffer.speech_stopped` fired. Cleared after latency measured. */
  const speechStoppedAtRef = useRef<number | null>(null);
  /** True from first `response.audio.delta` to `response.audio.done`. Used for interruption detection. */
  const isRespondingAudioRef = useRef<boolean>(false);

  // -------------------------------------------------------------------------
  // Event log — records event type + optional note, never user content
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
  // session.update — sent once after session.created
  // -------------------------------------------------------------------------

  const sendSessionUpdate = useCallback(() => {
    const dc = dcRef.current;
    if (!dc || dc.readyState !== 'open') return;

    // session.update uses the current nested format — old top-level fields
    // (modalities, input_audio_format, input_audio_transcription, voice) are
    // unknown_parameter in gpt-realtime-2 and cause missing_required_parameter
    // on audio.input.format.rate when the API tries to parse the pcm16 string.
    // Instructions and transcription are now configured in the client_secrets
    // body (token route) so session.update only reinforces turn_detection here.
    const sessionUpdatePayload = {
      type: 'session.update',
      session: {
        type: 'realtime',
        output_modalities: ['audio'],
        audio: {
          input: {
            turn_detection: LAB_VAD_CONFIG,
          },
          output: {
            voice: LAB_VOICE,
          },
        },
      },
    };
    console.log('[realtime-lab] session.update payload:', JSON.stringify(sessionUpdatePayload, null, 2));
    dc.send(JSON.stringify(sessionUpdatePayload));
    logEvent('session.update → sent');
  }, [logEvent]);

  // -------------------------------------------------------------------------
  // OpenAI Realtime event handler
  // NEVER logs event.transcript or any user-content field.
  // -------------------------------------------------------------------------

  const handleRealtimeEvent = useCallback(
    (raw: string) => {
      let event: Record<string, unknown>;
      try {
        event = JSON.parse(raw) as Record<string, unknown>;
      } catch {
        return;
      }

      const type = typeof event.type === 'string' ? event.type : 'unknown';

      switch (type) {
        // Session ready — configure it
        case 'session.created':
          sendSessionUpdate();
          setMetrics((m) => ({
            ...m,
            status: 'connected',
            assistantState: 'listening',
            sessionStartedAt: Date.now(),
          }));
          logEvent('session.created');
          break;

        case 'session.updated':
          logEvent('session.updated');
          break;

        // VAD: user started speaking
        case 'input_audio_buffer.speech_started':
          if (isRespondingAudioRef.current) {
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
          break;

        // VAD: user stopped speaking — start latency clock
        case 'input_audio_buffer.speech_stopped':
          speechStoppedAtRef.current = Date.now();
          setMetrics((m) => ({ ...m, assistantState: 'listening' }));
          logEvent('speech_stopped');
          break;

        case 'response.created':
          logEvent('response.created');
          break;

        // First audio chunk — measure latency, mark responding
        case 'response.audio.delta':
          if (!isRespondingAudioRef.current) {
            isRespondingAudioRef.current = true;
            if (speechStoppedAtRef.current !== null) {
              const latencyMs = Date.now() - speechStoppedAtRef.current;
              speechStoppedAtRef.current = null;
              setMetrics((m) => {
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
              logEvent('response.audio.delta', `first chunk — ${latencyMs}ms latency`);
            } else {
              setMetrics((m) => ({ ...m, assistantState: 'speaking' }));
              logEvent('response.audio.delta', 'first chunk (no speech_stopped timestamp)');
            }
          }
          break;

        // Response audio stream complete
        case 'response.audio.done':
          isRespondingAudioRef.current = false;
          setMetrics((m) => ({ ...m, assistantState: 'listening' }));
          logEvent('response.audio.done');
          break;

        // Full turn complete
        case 'response.done':
          setMetrics((m) => ({ ...m, totalTurns: m.totalTurns + 1 }));
          logEvent('response.done');
          break;

        // Transcription complete — count it, extract language code (NOT transcript text)
        case 'conversation.item.input_audio_transcription.completed': {
          const lang =
            typeof (event as Record<string, unknown>).language === 'string'
              ? (event as Record<string, unknown>).language as string
              : null;
          setMetrics((m) => ({
            ...m,
            transcriptionCount: m.transcriptionCount + 1,
            ...(lang ? { detectedLanguage: lang } : {}),
          }));
          logEvent('transcription.completed', lang ? `lang:${lang}` : undefined);
          break;
        }

        // OpenAI error
        case 'error': {
          const errObj = event.error as Record<string, unknown> | undefined;
          const errCode =
            typeof errObj?.code === 'string' ? errObj.code : 'unknown_error';
          // param identifies the exact missing/invalid field — safe to log (not user content)
          const errParam =
            typeof errObj?.param === 'string' ? errObj.param : null;
          // message is safe for missing_required_parameter errors (field name, not user speech)
          const errMessage =
            typeof errObj?.message === 'string' ? errObj.message : null;
          const errLabel = [errCode, errParam && `param:${errParam}`].filter(Boolean).join(' ');
          // Print full non-content error details to console for diagnostics
          console.error('[realtime-lab] OpenAI error event:', {
            code: errCode,
            param: errParam,
            message: errMessage,
            event_id: typeof event.event_id === 'string' ? event.event_id : undefined,
          });
          setMetrics((m) => ({
            ...m,
            errorCount: m.errorCount + 1,
            lastError: errLabel,
          }));
          logEvent('error', errLabel);
          break;
        }

        default:
          // Silently ignore all other events (audio deltas, text deltas, etc.)
          break;
      }
    },
    [sendSessionUpdate, logEvent],
  );

  // -------------------------------------------------------------------------
  // stopSession — public + used in cleanup
  // -------------------------------------------------------------------------

  const stopSession = useCallback(() => {
    dcRef.current?.close();
    dcRef.current = null;
    pcRef.current?.close();
    pcRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (audioRef.current) {
      audioRef.current.srcObject = null;
    }
    isRespondingAudioRef.current = false;
    speechStoppedAtRef.current = null;
    setMetrics((m) => ({ ...m, status: 'stopped', assistantState: 'idle' }));
    logEvent('session.stopped');
  }, [audioRef, logEvent]);

  // -------------------------------------------------------------------------
  // Cleanup on unmount
  // -------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      // Raw cleanup without state updates (component unmounted)
      dcRef.current?.close();
      pcRef.current?.close();
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // -------------------------------------------------------------------------
  // startSession — main entry point
  // -------------------------------------------------------------------------

  const startSession = useCallback(async () => {
    // Reset metrics for a fresh session, preserving the browser name already detected
    setMetrics((prev) => ({
      ...INITIAL_LAB_METRICS,
      browserName: prev.browserName,
      status: 'requesting-mic',
    }));
    isRespondingAudioRef.current = false;
    speechStoppedAtRef.current = null;

    // -- Step 1: Microphone permission --
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const code = err instanceof Error && err.name === 'NotAllowedError'
        ? 'mic_permission_denied'
        : 'mic_unavailable';
      setMetrics((m) => ({
        ...m,
        status: 'error',
        micPermission: 'denied',
        lastError: code,
        errorCount: 1,
      }));
      logEvent('error', code);
      return;
    }
    streamRef.current = stream;
    setMetrics((m) => ({ ...m, micPermission: 'granted' }));
    logEvent('mic_granted');

    // -- Step 2: Ephemeral token from our server --
    setMetrics((m) => ({ ...m, status: 'fetching-token' }));
    let ephemeralKey: string;
    try {
      const tokenRes = await fetch(LAB_TOKEN_URL, { method: 'POST' });
      if (!tokenRes.ok) {
        throw new Error(`status_${tokenRes.status}`);
      }
      const tokenData = (await tokenRes.json()) as {
        value?: string;
        error?: string;
        detail?: string;
        httpStatus?: number;
      };
      const key = tokenData?.value;
      if (!key) {
        const detail = tokenData.detail ? ` (${tokenData.detail})` : '';
        throw new Error(tokenData.error ? `${tokenData.error}${detail}` : 'no_ephemeral_key');
      }
      ephemeralKey = key;
    } catch (err) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      const code = err instanceof Error ? err.message.slice(0, 80) : 'token_error';
      setMetrics((m) => ({
        ...m,
        status: 'error',
        lastError: `token: ${code}`,
        errorCount: m.errorCount + 1,
      }));
      logEvent('error', `token_fetch_failed: ${code}`);
      return;
    }
    logEvent('token_received');

    // -- Step 3: RTCPeerConnection --
    setMetrics((m) => ({ ...m, status: 'connecting' }));

    let pc: RTCPeerConnection;
    try {
      pc = new RTCPeerConnection();
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      setMetrics((m) => ({
        ...m,
        status: 'error',
        lastError: 'webrtc_unsupported',
        errorCount: m.errorCount + 1,
      }));
      logEvent('error', 'webrtc_unsupported');
      return;
    }
    pcRef.current = pc;

    // Remote audio track → <audio> element
    pc.ontrack = (ev: RTCTrackEvent) => {
      if (audioRef.current) {
        audioRef.current.srcObject = ev.streams[0];
      }
    };

    // Microphone → peer connection
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    // Data channel for OpenAI Realtime events
    const dc = pc.createDataChannel('oai-events');
    dcRef.current = dc;

    dc.onmessage = (ev: MessageEvent) => {
      if (typeof ev.data === 'string') {
        handleRealtimeEvent(ev.data);
      }
    };

    dc.onerror = () => {
      setMetrics((m) => ({
        ...m,
        errorCount: m.errorCount + 1,
        lastError: 'datachannel_error',
      }));
      logEvent('error', 'datachannel_error');
    };

    // -- Step 4: SDP offer --
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch(LAB_OPENAI_REALTIME_URL, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpRes.ok) {
        throw new Error(`sdp_exchange_${sdpRes.status}`);
      }

      const answerSdp = await sdpRes.text();
      const answer: RTCSessionDescriptionInit = { type: 'answer', sdp: answerSdp };
      await pc.setRemoteDescription(answer);

      logEvent('webrtc_offer_answered');
      // session.created will arrive via data channel when WebRTC connects

    } catch (err) {
      stream.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      pc.close();
      pcRef.current = null;
      dcRef.current = null;
      const code = err instanceof Error ? err.message.slice(0, 80) : 'sdp_error';
      setMetrics((m) => ({
        ...m,
        status: 'error',
        lastError: code,
        errorCount: m.errorCount + 1,
      }));
      logEvent('error', `sdp: ${code}`);
    }
  }, [audioRef, handleRealtimeEvent, logEvent]);

  // -------------------------------------------------------------------------
  // Copy plain-text test report to clipboard
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
