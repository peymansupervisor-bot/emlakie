/**
 * Pure state machine for the Emlakie AI Leasing Assistant session.
 *
 * No React. No side effects. No browser APIs.
 * Every function is a pure transformation: (state, event) → state.
 * Trivial to unit-test in isolation.
 *
 * Phase 1C: Used with MockTransport only.
 * Phase 1D+: Same machine, real WebSocket transport — zero changes required here.
 */

import type { AssistantState, ListingRecommendation } from '@/types/assistant';

// ---------------------------------------------------------------------------
// Session state — discriminated union
// ---------------------------------------------------------------------------

export type AssistantSessionState =
  | { phase: 'idle' }
  | { phase: 'opening' }
  | { phase: 'greeting'; message: string }
  | { phase: 'listening' }
  | { phase: 'thinking'; userMessage: string }
  | { phase: 'speaking'; assistantMessage: string }
  | {
      phase: 'showingRecommendations';
      assistantMessage: string;
      recommendations: ListingRecommendation[];
    }
  | { phase: 'error'; code: string; message: string }
  | { phase: 'closed' };

export const INITIAL_STATE: AssistantSessionState = { phase: 'idle' };

// ---------------------------------------------------------------------------
// Events — everything that can cause a state transition
// ---------------------------------------------------------------------------

export type AssistantEvent =
  | { type: 'OPEN' }
  | { type: 'GREETING_RECEIVED'; message: string }
  | { type: 'GREETING_COMPLETE' }
  | { type: 'USER_MESSAGE'; text: string }
  | { type: 'RESPONSE_RECEIVED'; message: string }
  | { type: 'RECOMMENDATIONS_RECEIVED'; recommendations: ListingRecommendation[] }
  | { type: 'SPEAKING_COMPLETE' }
  | { type: 'ERROR'; code: string; message: string }
  | { type: 'CANCEL' }
  | { type: 'CLOSE' }
  | { type: 'RESET' };

// ---------------------------------------------------------------------------
// Transition — pure, exhaustive
// ---------------------------------------------------------------------------

export function transition(
  state: AssistantSessionState,
  event: AssistantEvent,
): AssistantSessionState {
  const { phase } = state;

  switch (event.type) {
    case 'OPEN':
      if (phase === 'idle' || phase === 'closed') return { phase: 'opening' };
      return state;

    case 'GREETING_RECEIVED':
      if (phase === 'opening')
        return { phase: 'greeting', message: event.message };
      return state;

    case 'GREETING_COMPLETE':
      if (phase === 'greeting') return { phase: 'listening' };
      return state;

    case 'USER_MESSAGE':
      if (phase === 'listening' || phase === 'showingRecommendations')
        return { phase: 'thinking', userMessage: event.text };
      return state;

    case 'RESPONSE_RECEIVED':
      if (phase === 'thinking')
        return { phase: 'speaking', assistantMessage: event.message };
      return state;

    case 'RECOMMENDATIONS_RECEIVED': {
      const priorMessage = phase === 'speaking' ? state.assistantMessage : '';
      if (phase === 'speaking' || phase === 'thinking')
        return {
          phase: 'showingRecommendations',
          assistantMessage: priorMessage,
          recommendations: event.recommendations,
        };
      return state;
    }

    case 'SPEAKING_COMPLETE':
      if (phase === 'speaking') return { phase: 'listening' };
      return state;

    case 'ERROR':
      return { phase: 'error', code: event.code, message: event.message };

    case 'CANCEL':
      // Return to listening from any active phase (not idle/closed/error)
      if (
        phase !== 'idle' &&
        phase !== 'closed' &&
        phase !== 'error' &&
        phase !== 'opening'
      )
        return { phase: 'listening' };
      return state;

    case 'CLOSE':
      return { phase: 'closed' };

    case 'RESET':
      return { phase: 'idle' };
  }
}

// ---------------------------------------------------------------------------
// Derived helpers — pure functions over state
// ---------------------------------------------------------------------------

/**
 * Maps the rich session state to the simple display state consumed by
 * AssistantStateDisplay and AssistantLauncher.
 */
export function toDisplayState(s: AssistantSessionState): AssistantState {
  switch (s.phase) {
    case 'idle':                   return 'idle';
    case 'opening':                return 'connecting';
    case 'greeting':               return 'greeting';
    case 'listening':              return 'listening';
    case 'thinking':               return 'processing';
    case 'speaking':               return 'speaking';
    case 'showingRecommendations': return 'showingRecommendations';
    case 'error':                  return 'error';
    case 'closed':                 return 'idle';
  }
}

/** Whether the user can submit a message in this state. */
export function canSendMessage(s: AssistantSessionState): boolean {
  return s.phase === 'listening' || s.phase === 'showingRecommendations';
}

/** Whether the session is in a state where it can be opened. */
export function canOpen(s: AssistantSessionState): boolean {
  return s.phase === 'idle' || s.phase === 'closed';
}

/** Extract recommendations if the state carries them; otherwise empty array. */
export function getRecommendations(s: AssistantSessionState): ListingRecommendation[] {
  if (s.phase === 'showingRecommendations') return s.recommendations;
  return [];
}

/** Extract the current assistant message if available; otherwise empty string. */
export function getAssistantMessage(s: AssistantSessionState): string {
  if (s.phase === 'greeting') return s.message;
  if (s.phase === 'speaking') return s.assistantMessage;
  if (s.phase === 'showingRecommendations') return s.assistantMessage;
  return '';
}
