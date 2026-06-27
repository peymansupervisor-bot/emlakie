/**
 * Environment variable validation for the AI Leasing Assistant.
 *
 * USAGE:
 *   Import `assertAssistantEnv()` at the top of any server route that needs
 *   assistant services. It throws a descriptive error if a required variable
 *   is missing, so misconfiguration fails loudly at route invocation rather
 *   than silently at the point of use.
 *
 * IMPORTANT:
 *   This file is server-only. Never import it in client components.
 *   Variables prefixed NEXT_PUBLIC_ are intentionally excluded — they are
 *   validated by the existing app bootstrap.
 *
 * STATUS (Phase 1A):
 *   All variables are documented but NOT yet required at runtime.
 *   The assistant feature flag (ENABLE_AI_ASSISTANT) must be false
 *   until Phase 1B activates services. Validation is additive — each
 *   phase will call the appropriate assertion function.
 */

// ---------------------------------------------------------------------------
// Variable declarations
// ---------------------------------------------------------------------------

/**
 * Variables required when the assistant is enabled.
 * None of these need to be set while ENABLE_AI_ASSISTANT=false.
 */
const ASSISTANT_ENV_VARS = {
  // OpenAI Realtime API — Phase 1B
  OPENAI_API_KEY: {
    description: 'OpenAI API key with Realtime API access (gpt-4o-realtime-preview)',
    phase: '1B',
    required: false, // becomes true in Phase 1B
  },

  // Claude (Anthropic) — Phase 1B (normalization bridge + recommendation engine)
  // Note: ANTHROPIC_API_KEY may already exist via @anthropic-ai/sdk usage elsewhere.
  // The assistant uses a separate variable so it can be scoped and rate-limited.
  ANTHROPIC_ASSISTANT_API_KEY: {
    description: 'Anthropic API key for the assistant normalization and recommendation engine',
    phase: '1B',
    required: false,
  },

  // Redis / Upstash — Phase 1B (in-session state)
  UPSTASH_REDIS_REST_URL: {
    description: 'Upstash Redis REST URL for assistant session state',
    phase: '1B',
    required: false,
  },
  UPSTASH_REDIS_REST_TOKEN: {
    description: 'Upstash Redis REST token',
    phase: '1B',
    required: false,
  },

  // WebSocket server — Phase 1B
  ASSISTANT_WS_SERVER_URL: {
    description: 'URL of the persistent WebSocket server (Fly.io / Railway)',
    phase: '1B',
    required: false,
  },
  ASSISTANT_WS_SERVER_SECRET: {
    description: 'Shared secret for browser → server WebSocket authentication',
    phase: '1B',
    required: false,
  },

  // Rate limiting — Phase 1B
  ASSISTANT_RATE_LIMIT_SECRET: {
    description: 'Secret used to sign rate-limit tokens',
    phase: '1B',
    required: false,
  },
} as const;

type AssistantEnvVar = keyof typeof ASSISTANT_ENV_VARS;

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

/**
 * Validates that all currently-required assistant environment variables are set.
 *
 * Call this at the top of any server route that uses assistant services.
 * Throws in development; logs and returns false in production to avoid
 * hard crashes on misconfiguration.
 *
 * @param required - specific variable names to check; defaults to all required ones
 */
export function assertAssistantEnv(required?: AssistantEnvVar[]): void {
  const toCheck = required ?? (
    Object.entries(ASSISTANT_ENV_VARS)
      .filter(([, cfg]) => cfg.required)
      .map(([key]) => key as AssistantEnvVar)
  );

  const missing: string[] = [];

  for (const key of toCheck) {
    if (!process.env[key]) {
      missing.push(key);
    }
  }

  if (missing.length === 0) return;

  const details = missing
    .map((k) => `  ${k}: ${ASSISTANT_ENV_VARS[k as AssistantEnvVar].description}`)
    .join('\n');

  const message =
    `[Assistant] Missing required environment variables:\n${details}\n` +
    `Set these in .env.local or your deployment environment.`;

  if (process.env.NODE_ENV === 'development') {
    throw new Error(message);
  } else {
    // In production, log and let the route fail gracefully downstream
    console.error(message);
  }
}

/**
 * Returns a map of which assistant env vars are configured.
 * Used by the health-check endpoint (Phase 1B) to surface configuration status.
 * Never returns the values — only presence booleans.
 */
export function getAssistantEnvStatus(): Record<AssistantEnvVar, boolean> {
  return Object.fromEntries(
    Object.keys(ASSISTANT_ENV_VARS).map((key) => [
      key as AssistantEnvVar,
      Boolean(process.env[key]),
    ])
  ) as Record<AssistantEnvVar, boolean>;
}

/**
 * Returns the phase annotation for each variable.
 * Used in documentation generation and the admin health-check panel.
 */
export function getAssistantEnvManifest(): Array<{
  key: AssistantEnvVar;
  description: string;
  phase: string;
  required: boolean;
  present: boolean;
}> {
  return Object.entries(ASSISTANT_ENV_VARS).map(([key, cfg]) => ({
    key: key as AssistantEnvVar,
    description: cfg.description,
    phase: cfg.phase,
    required: cfg.required,
    present: Boolean(process.env[key]),
  }));
}
