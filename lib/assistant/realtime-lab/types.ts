/**
 * Types for the OpenAI Realtime validation lab.
 * Isolated to lib/assistant/realtime-lab/ — not imported anywhere else.
 */

// ---------------------------------------------------------------------------
// Connection status
// ---------------------------------------------------------------------------

export type LabConnectionStatus =
  | 'idle'
  | 'requesting-mic'
  | 'fetching-token'
  | 'connecting'
  | 'connected'
  | 'stopped'
  | 'error';

// ---------------------------------------------------------------------------
// Event log entry — no user content ever stored here
// ---------------------------------------------------------------------------

export interface LabEventEntry {
  id: string;
  /** ISO 8601 */
  ts: string;
  /** OpenAI Realtime event type or internal lifecycle event */
  type: string;
  /** Optional non-content annotation (e.g. "interruption", "latency 847ms") */
  note?: string;
}

// ---------------------------------------------------------------------------
// Metrics collected during a session
// ---------------------------------------------------------------------------

export interface LabMetrics {
  status: LabConnectionStatus;
  /** epoch ms when session.created fired */
  sessionStartedAt: number | null;
  /** All measured response latencies in ms (speech_stopped → first audio delta) */
  latencies: number[];
  lastLatencyMs: number | null;
  avgLatencyMs: number | null;
  errorCount: number;
  /** Last error code — never user content */
  lastError: string | null;
  /** Number of transcription.completed events received */
  transcriptionCount: number;
  /** Number of times user speech started while assistant was responding */
  interruptionCount: number;
  /** Number of completed assistant turns (response.done events) */
  totalTurns: number;
  /** Recent events — newest first, capped at LAB_MAX_EVENT_LOG */
  events: LabEventEntry[];
}

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

export const INITIAL_LAB_METRICS: LabMetrics = {
  status: 'idle',
  sessionStartedAt: null,
  latencies: [],
  lastLatencyMs: null,
  avgLatencyMs: null,
  errorCount: 0,
  lastError: null,
  transcriptionCount: 0,
  interruptionCount: 0,
  totalTurns: 0,
  events: [],
};
