/**
 * Centralized configuration for the Emlakie AI Leasing Assistant.
 *
 * All assistant-wide constants live here. Business logic does not.
 * This file is safe to import in both server and client code — it has
 * no side effects and no imports from Next.js or browser APIs.
 *
 * Language configuration has been moved to lib/assistant/languages.ts.
 * The constants below are re-exported for backwards compatibility so that
 * all existing import sites continue to work without modification.
 */

import type { LanguageCode } from '@/types/assistant';

// ---------------------------------------------------------------------------
// Feature flags
// ---------------------------------------------------------------------------

/**
 * Master switch for the AI assistant.
 *
 * When false, all assistant UI and server routes must be unreachable.
 * Set via ENABLE_AI_ASSISTANT environment variable.
 * Default: false (must be explicitly enabled).
 */
export const ASSISTANT_ENABLED =
  process.env.ENABLE_AI_ASSISTANT === 'true';

// ---------------------------------------------------------------------------
// Language configuration
// — Definitions live in lib/assistant/languages.ts.
// — These re-exports keep all existing call sites unchanged.
// ---------------------------------------------------------------------------

export type { LanguageDefinition as LanguageConfig } from './languages';
export {
  LANGUAGE_ROSTER as SUPPORTED_LANGUAGES,
  ACTIVE_LANGUAGES,
  ACTIVE_LANGUAGE_CODES,
  RTL_LANGUAGE_CODES as RTL_LANGUAGES,
  DEFAULT_LANGUAGE,
  isRTL,
  getLanguage,
  getDirection,
} from './languages';

// ---------------------------------------------------------------------------
// Voice settings
// ---------------------------------------------------------------------------

export const VOICE_SETTINGS = {
  /** Maximum seconds the assistant listens before auto-cancelling. */
  MAX_LISTENING_SECONDS: 30,

  /**
   * Seconds of silence after speech ends before the server closes the turn.
   * OpenAI Realtime VAD manages this natively; this is our local timeout guard.
   */
  SILENCE_TIMEOUT_SECONDS: 3,

  /** Audio sample rate for browser capture. */
  SAMPLE_RATE_HZ: 16_000,

  /** Number of audio channels (mono). */
  CHANNELS: 1,

  /** Audio bit depth. */
  BIT_DEPTH: 16,

  /** PCM frame size in milliseconds. */
  FRAME_MS: 20,
} as const;

// ---------------------------------------------------------------------------
// Session timeouts
// ---------------------------------------------------------------------------

export const SESSION_TIMEOUTS = {
  /** Seconds of inactivity before the Redis session key expires. */
  REDIS_TTL_SECONDS: 4 * 60 * 60, // 4 hours

  /** Milliseconds before a WebSocket connection is considered stale and dropped. */
  WEBSOCKET_IDLE_MS: 5 * 60 * 1_000, // 5 minutes

  /**
   * Milliseconds to wait for a function call result before treating it as failed.
   * This governs search_listings, explain_recommendation, etc.
   */
  FUNCTION_CALL_TIMEOUT_MS: 6_000,

  /** Milliseconds to wait for Claude normalization before returning raw filters. */
  NORMALIZATION_TIMEOUT_MS: 3_000,
} as const;

// ---------------------------------------------------------------------------
// Rate limits (enforced server-side — these are reference values)
// ---------------------------------------------------------------------------

export const RATE_LIMITS = {
  /** Maximum new assistant sessions per IP per hour. */
  SESSIONS_PER_HOUR_PER_IP: 10,

  /** Maximum function calls within a single session. */
  FUNCTION_CALLS_PER_SESSION: 50,

  /** Maximum listing IDs returned per search_listings call. */
  MAX_LISTINGS_PER_SEARCH: 20,

  /** Maximum listing IDs the assistant presents verbally per session. */
  MAX_LISTINGS_PRESENTED_PER_SESSION: 15,
} as const;

// ---------------------------------------------------------------------------
// Listing recommendation thresholds
// ---------------------------------------------------------------------------

export const RECOMMENDATION = {
  /** Minimum confidence score (0–1) for a listing to be presented. */
  MIN_CONFIDENCE: 0.5,

  /** Maximum listings presented verbally per recommendation set. */
  MAX_PER_PRESENTATION: 3,

  /** Minimum days-on-market before availability is flagged as "likely available". */
  AVAILABILITY_FRESHNESS_DAYS: 14,
} as const;

// ---------------------------------------------------------------------------
// Normalization
// ---------------------------------------------------------------------------

/**
 * Property type enum values as stored in Supabase.
 * The normalization bridge maps all language variants to one of these.
 */
export const PROPERTY_TYPE_VALUES = [
  'apartment',
  'house',
  'condo',
  'townhouse',
  'studio',
  'room',
  'adu',
  'jadu',
] as const;

export type PropertyTypeValue = typeof PROPERTY_TYPE_VALUES[number];

/**
 * Amenity strings as stored in Supabase.
 * The normalization bridge maps all language variants to one of these.
 */
export const AMENITY_VALUES = [
  'Air conditioning',
  'Heating',
  'In-unit laundry',
  'Laundry in building',
  'Dishwasher',
  'Parking',
  'Garage',
  'Pet-friendly',
  'Pool',
  'Gym',
  'Balcony',
  'Furnished',
  'Hardwood floors',
  'EV charging',
  'Storage',
  'Fireplace',
] as const;

export type AmenityValue = typeof AMENITY_VALUES[number];

/** Price range guardrails for normalization bridge validation. */
export const PRICE_BOUNDS = {
  MIN_MONTHLY_RENT: 300,
  MAX_MONTHLY_RENT: 20_000,
} as const;

/** Bedroom count guardrails. */
export const BEDROOM_BOUNDS = {
  MIN: 0,  // studio
  MAX: 9,
} as const;
