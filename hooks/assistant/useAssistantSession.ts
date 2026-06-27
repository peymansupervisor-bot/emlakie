'use client';

import { useReducer, useEffect, useRef, useCallback, useState } from 'react';
import {
  transition,
  INITIAL_STATE,
  toDisplayState,
  canSendMessage,
  getRecommendations,
} from '@/lib/assistant/stateMachine';
import { createMockTransport } from '@/lib/assistant/mockTransport';
import type { AssistantTransport } from '@/lib/assistant/transport';
import type { AssistantMessage, ListingRecommendation } from '@/types/assistant';
import type { AssistantSessionState } from '@/lib/assistant/stateMachine';
import type { AssistantState } from '@/types/assistant';
import { DEFAULT_LANGUAGE } from '@/lib/assistant/config';

// ---------------------------------------------------------------------------
// Public return type
// ---------------------------------------------------------------------------

export interface UseAssistantSessionReturn {
  /** Full discriminated-union state for conditional rendering. */
  sessionState: AssistantSessionState;
  /** Simplified display state for AssistantStateDisplay + Launcher. */
  displayState: AssistantState;
  /** In-session messages (ephemeral — cleared when session closes). */
  messages: AssistantMessage[];
  /** Active recommendations (empty until showingRecommendations phase). */
  recommendations: ListingRecommendation[];
  /** Whether the text input should accept messages right now. */
  inputEnabled: boolean;
  /** Start the session: fires OPEN → transport.connect(). */
  open: () => void;
  /** End the session: fires CLOSE → transport.disconnect() + clears messages. */
  close: () => void;
  /** Submit a user message. No-op when inputEnabled is false. */
  sendMessage: (text: string) => void;
  /** Abort an in-progress response and return to listening. */
  cancel: () => void;
}

// ---------------------------------------------------------------------------
// ID generator for messages
// ---------------------------------------------------------------------------

let _seq = 0;
function nextId() {
  return `amsg-${Date.now()}-${++_seq}`;
}

function makeMessage(
  role: AssistantMessage['role'],
  text: string,
): AssistantMessage {
  return {
    id: nextId(),
    role,
    timestamp: new Date().toISOString(),
    language: DEFAULT_LANGUAGE,
    displayText: text,
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Manages the AI Leasing Assistant session lifecycle.
 *
 * Phase 1C: Uses MockTransport internally.
 * Phase 1D: Replace `createMockTransport()` with `createWebSocketTransport()`.
 *           The state machine, this hook's public API, and all components are unchanged.
 */
export function useAssistantSession(): UseAssistantSessionReturn {
  const [sessionState, dispatch] = useReducer(transition, INITIAL_STATE);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);

  // Stable refs — don't trigger re-renders
  const transportRef = useRef<AssistantTransport | null>(null);
  const unsubsRef = useRef<Array<() => void>>([]);

  // Stable message helpers — useCallback with [] deps, safe to capture in open()
  const pushMessage = useCallback((msg: AssistantMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  // ---------------------------------------------------------------------------
  // open — creates transport, wires all callbacks, then connects
  // ---------------------------------------------------------------------------

  const open = useCallback(() => {
    dispatch({ type: 'OPEN' });

    const transport = createMockTransport();
    transportRef.current = transport;

    // Wire transport callbacks → state machine events.
    // All unsubs stored in ref so close() and unmount can clean up correctly.
    unsubsRef.current = [
      transport.onGreeting((message) => {
        dispatch({ type: 'GREETING_RECEIVED', message });
        pushMessage(makeMessage('assistant', message));
        // Simulate TTS finishing: advance to listening after a fixed delay
        setTimeout(() => dispatch({ type: 'GREETING_COMPLETE' }), 2_200);
      }),

      transport.onResponse((message) => {
        dispatch({ type: 'RESPONSE_RECEIVED', message });
        pushMessage(makeMessage('assistant', message));
        // Recommendations arrive separately via onRecommendations
      }),

      transport.onRecommendations((recommendations) => {
        dispatch({ type: 'RECOMMENDATIONS_RECEIVED', recommendations });
      }),

      transport.onError((code, message) => {
        dispatch({ type: 'ERROR', code, message });
      }),
    ];

    // Connect; surface any rejection as an error state
    transport.connect().catch((err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Connection failed';
      dispatch({ type: 'ERROR', code: 'connect_failed', message: msg });
    });
  }, [pushMessage]);

  // ---------------------------------------------------------------------------
  // close — tears down transport, clears ephemeral state
  // ---------------------------------------------------------------------------

  const close = useCallback(() => {
    dispatch({ type: 'CLOSE' });
    unsubsRef.current.forEach((u) => u());
    unsubsRef.current = [];
    transportRef.current?.disconnect();
    transportRef.current = null;
    clearMessages();
  }, [clearMessages]);

  // ---------------------------------------------------------------------------
  // sendMessage
  // ---------------------------------------------------------------------------

  const sendMessage = useCallback(
    (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !transportRef.current) return;
      dispatch({ type: 'USER_MESSAGE', text: trimmed });
      pushMessage(makeMessage('user', trimmed));
      transportRef.current.sendUserMessage(trimmed);
    },
    [pushMessage],
  );

  // ---------------------------------------------------------------------------
  // cancel
  // ---------------------------------------------------------------------------

  const cancel = useCallback(() => {
    dispatch({ type: 'CANCEL' });
    transportRef.current?.cancel();
  }, []);

  // ---------------------------------------------------------------------------
  // Cleanup on unmount (safety net — close() should be called first by callers)
  // ---------------------------------------------------------------------------

  useEffect(() => {
    return () => {
      unsubsRef.current.forEach((u) => u());
      transportRef.current?.disconnect();
    };
  }, []);

  return {
    sessionState,
    displayState: toDisplayState(sessionState),
    messages,
    recommendations: getRecommendations(sessionState),
    inputEnabled: canSendMessage(sessionState),
    open,
    close,
    sendMessage,
    cancel,
  };
}
