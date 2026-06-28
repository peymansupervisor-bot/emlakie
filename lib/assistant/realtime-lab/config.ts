/**
 * Configuration for the OpenAI Realtime validation lab.
 * Isolated to lib/assistant/realtime-lab/ — not imported anywhere else.
 */

/** OpenAI Realtime model used for the lab. */
export const LAB_REALTIME_MODEL = 'gpt-realtime-2';

/** Assistant voice — 'marin' is the current default in the OpenAI Realtime API. */
export const LAB_VOICE = 'marin' as const;

/** System instruction given to the model at session.update. */
export const LAB_SYSTEM_INSTRUCTION =
  "You are Emlakie's AI Leasing Assistant. Help users find rental homes. " +
  'Do not give legal advice. If unsure, ask a follow-up question. ' +
  'Respond in the same language the user uses.';

/** Maximum number of events stored in the rolling event log. */
export const LAB_MAX_EVENT_LOG = 50;

/** Next.js API route that issues the ephemeral OpenAI token. */
export const LAB_TOKEN_URL = '/api/assistant/realtime-lab/token';

/** SDP exchange endpoint for the OpenAI Realtime WebRTC API. */
export const LAB_OPENAI_REALTIME_URL = 'https://api.openai.com/v1/realtime/calls';

/** Server VAD config — standard values for leasing conversation cadence. */
export const LAB_VAD_CONFIG = {
  type: 'server_vad' as const,
  threshold: 0.5,
  prefix_padding_ms: 300,
  silence_duration_ms: 500,
};
