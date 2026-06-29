'use client';

/**
 * useRealtimeSession — production AI Leasing Assistant session hook.
 *
 * Wraps RealtimeEngine and maps voice events to the assistant state machine.
 *
 * Voice flow:
 *   open()       → OPEN → state: opening
 *   onConnected  → CONNECTED → state: listening  (model greets via audio)
 *   speech ends  → VOICE_INPUT → state: thinking
 *   function call → executeFunctionCall → onFunctionCallResult → recommendations state
 *   response.created (audio) → RESPONSE_RECEIVED → state: speaking
 *   response.done    → SPEAKING_COMPLETE → state: listening
 *   error        → ERROR state
 *   close()      → CLOSE → state: closed
 *
 * No transcripts are stored. No user content is logged.
 */

import { useReducer, useRef, useCallback, useEffect, useState } from 'react';
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
  ASSISTANT_TOOLS,
} from '@/lib/assistant/realtime/config';
import type { AssistantSessionState } from '@/lib/assistant/stateMachine';
import type {
  AssistantState,
  AssistantMessage,
  ListingRecommendation,
  AssistantSearchResponse,
  AssistantActiveFilters,
} from '@/types/assistant';

export interface UseRealtimeSessionReturn {
  sessionState: AssistantSessionState;
  displayState: AssistantState;
  /** Always empty — voice-only, no text transcript display. */
  messages: AssistantMessage[];
  /** Populated when the model calls search_listings. Up to 10 listings. */
  recommendations: ListingRecommendation[];
  /** Filters from the most recent search_listings call — drives the filter strip. */
  activeFilters: AssistantActiveFilters | null;
  /** Always false — no text input. */
  inputEnabled: boolean;
  open: () => void;
  close: () => void;
  /** No-op — text input removed. */
  sendMessage: (text: string) => void;
  cancel: () => void;
}

export function useRealtimeSession(
  audioRef: React.RefObject<HTMLAudioElement>,
): UseRealtimeSessionReturn {
  const [sessionState, dispatch] = useReducer(transition, INITIAL_STATE);
  const [recommendations, setRecommendations] = useState<ListingRecommendation[]>([]);
  const [activeFilters, setActiveFilters] = useState<AssistantActiveFilters | null>(null);
  const engineRef = useRef<RealtimeEngine | null>(null);

  // -------------------------------------------------------------------------
  // open
  // -------------------------------------------------------------------------

  const open = useCallback(() => {
    if (!canOpen(sessionState)) return;
    dispatch({ type: 'OPEN' });
    setRecommendations([]);
    setActiveFilters(null);

    const engine = new RealtimeEngine(
      audioRef,
      {
        tokenUrl: REALTIME_TOKEN_URL,
        realtimeUrl: REALTIME_SDP_URL,
        vadConfig: REALTIME_VAD_CONFIG,
        voice: REALTIME_VOICE,
        sendGreetingOnConnect: true,
        tools: ASSISTANT_TOOLS,
      },
      {
        onConnected: () => dispatch({ type: 'CONNECTED' }),

        onSpeechStopped: () => dispatch({ type: 'VOICE_INPUT' }),

        onResponseCreated: () =>
          dispatch({ type: 'RESPONSE_RECEIVED', message: '' }),

        onResponseDone: () => dispatch({ type: 'SPEAKING_COMPLETE' }),

        onFunctionCallResult: (_name, result) => {
          const res = result as AssistantSearchResponse;
          if (Array.isArray(res?.results)) {
            setRecommendations(res.results);
            if (res.activeFilters) setActiveFilters(res.activeFilters);
            dispatch({ type: 'RECOMMENDATIONS_RECEIVED', recommendations: res.results });
          }
        },

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
    setRecommendations([]);
    setActiveFilters(null);
    dispatch({ type: 'CLOSE' });
  }, []);

  // -------------------------------------------------------------------------
  // cancel — return to listening if model is mid-response
  // -------------------------------------------------------------------------

  const cancel = useCallback(() => {
    engineRef.current?.cancel();
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
    recommendations,
    activeFilters,
    inputEnabled: false,
    open,
    close,
    sendMessage: () => {},
    cancel,
  };
}
