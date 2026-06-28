/**
 * Lab configuration — re-exports production constants so the Lab and
 * production assistant share the same model, voice, VAD settings,
 * and system instruction. Only the token URL and event log cap are lab-specific.
 */

export {
  REALTIME_MODEL as LAB_REALTIME_MODEL,
  REALTIME_VOICE as LAB_VOICE,
  REALTIME_SDP_URL as LAB_OPENAI_REALTIME_URL,
  REALTIME_VAD_CONFIG as LAB_VAD_CONFIG,
  ASSISTANT_SYSTEM_INSTRUCTION as LAB_SYSTEM_INSTRUCTION,
} from '@/lib/assistant/realtime/config';

/** Maximum number of events stored in the rolling event log. */
export const LAB_MAX_EVENT_LOG = 50;

/** Next.js API route that issues the ephemeral token for the Lab. */
export const LAB_TOKEN_URL = '/api/assistant/realtime-lab/token';
