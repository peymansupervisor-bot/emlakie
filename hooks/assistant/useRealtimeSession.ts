'use client';

/**
 * useRealtimeSession — production AI Leasing Assistant session hook.
 *
 * Wraps RealtimeEngine and maps voice events to the assistant state machine.
 * Replaces the Phase 1C MockTransport-based useAssistantSession.
 *
 * Voice flow:
 *   open()       → OPEN → state: opening
 *   onConnected  → CONNECTED → state: listening  (model greets via audio)
 *   speech ends  → VOICE_INPUT → state: thinking
 *   response.created → RESPONSE_RECEIVED → state: speaking
 *   response.done    → SPEAKING_COMPLETE → state: listening
 *   error        → ERROR state
 *   close()      → CLOSE → state: closed
 *
 * No transcripts are stored. No user content is logged.
 */

import { useReducer, useRef, useCallback, useEffect } from 'react';
import {
  transition,
  INITIAL_STATE,
  toDisplayState,
  canOpen,
} from '@/lib/assistant/stateMachine';
import { RealtimeEngine } from '@/lib/assistant/realtime/engine';
import {
  REALTIME_VAD_CONFIG,
  REALTIME_VOICE,
  REALTIME_SDP_URL,
  REALTIME_TOKEN_URL,
} from '@/lib/assistant/realtime/config';
import type { AssistantSessionState } from '@/lib/assistant/stateMachine';
import type { AssistantState, AssistantMessage, ListingRecommendation } from '@/types/assistant';

export interface UseRealtimeSessionReturn {
  sessionState: AssistantSessionState;
  displayState: AssistantState;
  /** Always empty in Phase 2 — voice-only, no text transcript display. */
  messages: AssistantMessage[];
  /** Always empty in Phase 2 — listing DB not connected yet. */
  recommendations: ListingRecommendation[];
  /** Always false in Phase 2 — no text input. */
  inputEnabled: boolean;
  open: () => void;
  close: () => void;
  /** No-op in Phase 2 — text input removed. */
  sendMessage: (text: string) => void;
  cancel: () => void;
}

export function useRealtimeSession(
  audioRef: React.RefObject<HTMLAudioElement>,
): UseRealtimeSessionReturn {
  const [sessionState, dispatch] = useReducer(transition, INITIAL_STATE);
  const engineRef = useRef<RealtimeEngine | null>(null);

  // -------------------------------------------------------------------------
  // open
  // -------------------------------------------------------------------------

  const open = useCallback(() => {
    if (!canOpen(sessionState)) return;
    dispatch({ type: 'OPEN' });

    const engine = new RealtimeEngine(
      audioRef,
      {
        tokenUrl: REALTIME_TOKEN_URL,
        realtimeUrl: REALTIME_SDP_URL,
        vadConfig: REALTIME_VAD_CONFIG,
        voice: REALTIME_VOICE,
        sendGreetingOnConnect: true,
      },
      {
        onConnected: () => dispatch({ type: 'CONNECTED' }),

        onSpeechStopped: () => dispatch({ type: 'VOICE_INPUT' }),

        onResponseCreated: () =>
          dispatch({ type: 'RESPONSE_RECEIVED', message: '' }),

        onResponseDone: () => dispatch({ type: 'SPEAKING_COMPLETE' }),

        onError: (code) =>
          dispatch({ type: 'ERROR', code, message: code }),

        onDisconnected: () => dispatch({ type: 'CLOSE' }),
      },
    );

    engineRef.current = engine;
    void engine.connect();
  }, [audioRef, sessionState]);

  // -------------------------------------------------------------------------
  // close
  // -------------------------------------------------------------------------

  const close = useCallback(() => {
    engineRef.current?.disconnect();
    engineRef.current = null;
    dispatch({ type: 'CLOSE' });
  }, []);

  // -------------------------------------------------------------------------
  // cancel — return to listening if model is mid-response
  // -------------------------------------------------------------------------

  const cancel = useCallback(() => {
    dispatch({ type: 'CANCEL' });
  }, []);

  // -------------------------------------------------------------------------
  // Cleanup on unmount
  // -------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      engineRef.current?.disconnect();
    };
  }, []);

  return {
    sessionState,
    displayState: toDisplayState(sessionState),
    messages: [],
    recommendations: [],
    inputEnabled: false,
    open,
    close,
    sendMessage: () => {},
    cancel,
  };
}
