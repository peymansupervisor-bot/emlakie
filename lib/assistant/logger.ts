/**
 * Structured logging utilities for the Emlakie AI Leasing Assistant.
 *
 * Design principles:
 * - Logs are structured (JSON lines) so they are queryable in Vercel Log Drain
 *   or any future log aggregation tool.
 * - NEVER log transcript text, raw user speech, or any personally identifiable
 *   information. Only log session IDs (anonymous), latency metrics, error codes,
 *   and structured metadata.
 * - Log levels follow the standard severity ladder: debug < info < warn < error.
 * - In production, debug logs are suppressed unless ASSISTANT_DEBUG=true.
 * - This logger is safe to use in both server routes and the WebSocket server.
 *   It has no dependency on Next.js APIs.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface AssistantLogEntry {
  /** ISO 8601 timestamp. */
  ts: string;
  level: LogLevel;
  /** Short label identifying the subsystem that produced the log. */
  subsystem: AssistantSubsystem;
  /** Human-readable message — must not contain user content. */
  message: string;
  /** Anonymous session ID. Never a user ID. */
  sessionId?: string;
  /** Structured metadata — must not contain user content. */
  meta?: Record<string, unknown>;
}

/**
 * Subsystem labels used in log entries.
 * Extend this union as new subsystems are added in later phases.
 */
export type AssistantSubsystem =
  | 'session'          // Session lifecycle (open, close, timeout)
  | 'audio'            // Audio capture and playback
  | 'websocket'        // WebSocket connection management
  | 'normalization'    // Language normalization bridge (Claude)
  | 'recommendation'   // Recommendation engine (Claude)
  | 'function'         // Tool/function executor
  | 'memory'           // Session state and renter profile
  | 'telemetry'        // Analytics event emission
  | 'config'           // Configuration and env validation
  | 'fair-housing';    // Fair Housing guardrail triggers

// ---------------------------------------------------------------------------
// Logger implementation
// ---------------------------------------------------------------------------

const IS_PRODUCTION = process.env.NODE_ENV === 'production';
const DEBUG_ENABLED = process.env.ASSISTANT_DEBUG === 'true';

function shouldLog(level: LogLevel): boolean {
  if (level === 'debug' && IS_PRODUCTION && !DEBUG_ENABLED) return false;
  return true;
}

function emit(entry: AssistantLogEntry): void {
  if (!shouldLog(entry.level)) return;

  // Structured output for log aggregation tools
  const line = JSON.stringify(entry);

  switch (entry.level) {
    case 'debug': console.debug(line); break;
    case 'info':  console.info(line);  break;
    case 'warn':  console.warn(line);  break;
    case 'error': console.error(line); break;
  }
}

function makeEntry(
  level: LogLevel,
  subsystem: AssistantSubsystem,
  message: string,
  context?: { sessionId?: string; meta?: Record<string, unknown> },
): AssistantLogEntry {
  return {
    ts: new Date().toISOString(),
    level,
    subsystem,
    message,
    ...(context?.sessionId ? { sessionId: context.sessionId } : {}),
    ...(context?.meta ? { meta: context.meta } : {}),
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const assistantLogger = {
  debug(
    subsystem: AssistantSubsystem,
    message: string,
    context?: { sessionId?: string; meta?: Record<string, unknown> },
  ): void {
    emit(makeEntry('debug', subsystem, message, context));
  },

  info(
    subsystem: AssistantSubsystem,
    message: string,
    context?: { sessionId?: string; meta?: Record<string, unknown> },
  ): void {
    emit(makeEntry('info', subsystem, message, context));
  },

  warn(
    subsystem: AssistantSubsystem,
    message: string,
    context?: { sessionId?: string; meta?: Record<string, unknown> },
  ): void {
    emit(makeEntry('warn', subsystem, message, context));
  },

  error(
    subsystem: AssistantSubsystem,
    message: string,
    context?: { sessionId?: string; meta?: Record<string, unknown> },
  ): void {
    emit(makeEntry('error', subsystem, message, context));
  },

  /**
   * Logs a function call result (timing + success/failure).
   * Use this after every tool/function executor call.
   * NEVER include function arguments or return values that may contain user data.
   */
  functionCall(
    sessionId: string,
    toolName: string,
    durationMs: number,
    success: boolean,
    errorCode?: string,
  ): void {
    emit(makeEntry('info', 'function', 'function_call_completed', {
      sessionId,
      meta: { toolName, durationMs, success, ...(errorCode ? { errorCode } : {}) },
    }));
  },

  /**
   * Logs a Fair Housing guardrail trigger.
   * Records THAT a guardrail fired, but never WHY in a way that reveals user content.
   */
  fairHousingGuardrail(
    sessionId: string,
    guardrailType: 'protected_class_inference' | 'immigration_question' | 'steering_risk',
  ): void {
    emit(makeEntry('warn', 'fair-housing', 'guardrail_triggered', {
      sessionId,
      meta: { guardrailType },
    }));
  },
} as const;

// ---------------------------------------------------------------------------
// Latency measurement helper
// ---------------------------------------------------------------------------

/**
 * Returns a function that, when called, returns elapsed milliseconds.
 * Use to measure async operation duration for logging.
 *
 * @example
 * const elapsed = startTimer();
 * await doWork();
 * assistantLogger.functionCall(sessionId, 'search_listings', elapsed(), true);
 */
export function startTimer(): () => number {
  const start = Date.now();
  return () => Date.now() - start;
}
