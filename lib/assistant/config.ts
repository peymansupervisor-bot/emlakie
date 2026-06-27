/**
 * Centralized configuration for the Emlakie AI Leasing Assistant.
 *
 * All assistant-wide constants live here. Business logic does not.
 * This file is safe to import in both server and client code — it has
 * no side effects and no imports from Next.js or browser APIs.
 */

import type { LanguageCode, TextDirection } from '@/types/assistant';

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
// Supported languages
// ---------------------------------------------------------------------------

export interface LanguageConfig {
  code: LanguageCode;
  /** Human-readable name in English. */
  nameEn: string;
  /** Human-readable name in the language itself. */
  nameSelf: string;
  direction: TextDirection;
  /** Phase in which this language becomes active. */
  phase: 1 | 2 | 3;
  /**
   * Whether this language is in beta quality.
   * Beta languages show a quality disclaimer to the user.
   */
  beta: boolean;
}

export const SUPPORTED_LANGUAGES: Readonly<LanguageConfig[]> = [
  {
    code: 'en',
    nameEn: 'English',
    nameSelf: 'English',
    direction: 'ltr',
    phase: 1,
    beta: false,
  },
  {
    code: 'es',
    nameEn: 'Spanish',
    nameSelf: 'Español',
    direction: 'ltr',
    phase: 1,
    beta: false,
  },
  {
    code: 'fa',
    nameEn: 'Persian / Farsi',
    nameSelf: 'فارسی',
    direction: 'rtl',
    phase: 2,
    beta: true,
  },
  {
    code: 'ru',
    nameEn: 'Russian',
    nameSelf: 'Русский',
    direction: 'ltr',
    phase: 2,
    beta: false,
  },
  {
    code: 'ar',
    nameEn: 'Arabic',
    nameSelf: 'العربية',
    direction: 'rtl',
    phase: 3,
    beta: false,
  },
  {
    code: 'hy',
    nameEn: 'Armenian',
    nameSelf: 'Հայerén',
    direction: 'ltr',
    phase: 3,
    beta: true,
  },
] as const;

/** ISO 639-1 codes of languages active in the current deployment phase. */
export const ACTIVE_LANGUAGE_CODES: LanguageCode[] = SUPPORTED_LANGUAGES
  .filter((l) => l.phase === 1) // Phase 1: English + Spanish only
  .map((l) => l.code);

/** Default/fallback language when detection fails. */
export const DEFAULT_LANGUAGE: LanguageCode = 'en';

/** Languages that render right-to-left. */
export const RTL_LANGUAGES: LanguageCode[] = SUPPORTED_LANGUAGES
  .filter((l) => l.direction === 'rtl')
  .map((l) => l.code);

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
