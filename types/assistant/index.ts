/**
 * Shared TypeScript types for the Emlakie AI Leasing Assistant.
 *
 * Rules:
 * - No business logic here. Types and interfaces only.
 * - No imports from application code (would create circular dependencies).
 * - All enums are string unions, not TypeScript enums, for tree-shaking safety.
 */

// ---------------------------------------------------------------------------
// Language
// ---------------------------------------------------------------------------

/**
 * ISO 639-1 / BCP-47 codes for all languages in the assistant language roster.
 *
 * Codes follow BCP-47 convention:
 *   zh-Hans — Chinese Simplified
 *   zh-Hant — Chinese Traditional
 * All other codes are plain ISO 639-1 two-letter codes.
 *
 * Adding a new language:
 *   1. Add its code here.
 *   2. Add a LanguageDefinition entry in lib/assistant/languages.ts.
 *   3. Set enabled: true when ready to activate.
 *   No other files need to change.
 */
export type LanguageCode =
  | 'en'       // English
  | 'es'       // Spanish
  | 'fa'       // Persian / Farsi
  | 'hy'       // Armenian
  | 'ru'       // Russian
  | 'ar'       // Arabic
  | 'zh-Hans'  // Chinese Simplified
  | 'zh-Hant'  // Chinese Traditional
  | 'ko'       // Korean
  | 'vi'       // Vietnamese
  | 'tr';      // Turkish

/** Whether a language renders right-to-left. */
export type TextDirection = 'ltr' | 'rtl';

// ---------------------------------------------------------------------------
// Assistant lifecycle
// ---------------------------------------------------------------------------

/**
 * Display-oriented UI state for AssistantStateDisplay and AssistantLauncher.
 * Derived from AssistantSessionState via toDisplayState() in stateMachine.ts.
 *
 * idle                  — not yet started, or session closed
 * connecting            — transport connect() in flight
 * greeting              — assistant speaking its opening line
 * listening             — ready to receive user input
 * processing            — thinking / searching
 * speaking              — assistant delivering a response
 * showingRecommendations — listings are on screen, conversation can continue
 * error                 — non-recoverable; resets to idle after toast
 */
export type AssistantState =
  | 'idle'
  | 'connecting'
  | 'greeting'
  | 'listening'
  | 'processing'
  | 'speaking'
  | 'showingRecommendations'
  | 'error';

// ---------------------------------------------------------------------------
// Conversation
// ---------------------------------------------------------------------------

/**
 * The five phases of a leasing assistant conversation.
 * The assistant tracks which phase it is in to calibrate its questions.
 */
export type ConversationPhase =
  | 'orientation'   // Establish location, timeline, property type
  | 'refinement'    // Probe priorities based on candidate listings
  | 'presentation'  // Present 2–3 specific listings with reasons
  | 'evaluation'    // Handle objections, pivots, follow-up questions
  | 'action';       // Tour scheduling, saving, landlord contact

/** A single message in the conversation — either from the user or the assistant. */
export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  /** Wall-clock time the message was generated (ISO 8601). */
  timestamp: string;
  /**
   * Detected language of this specific message.
   * May differ from session dominant language during code-switching.
   */
  language: LanguageCode;
  /**
   * NEVER contains raw transcript text in persistent storage.
   * This field is ephemeral — used only in the browser's in-memory
   * conversation display during an active session.
   */
  displayText: string;
}

// ---------------------------------------------------------------------------
// Listings
// ---------------------------------------------------------------------------

/**
 * A listing result returned by the search_listings function call.
 * Rendered as a compact card in AssistantPanel while the model speaks.
 */
export interface ListingRecommendation {
  id: string;
  title: string;
  address: string;
  city: string;
  state?: string | null;
  zip?: string | null;
  price: number;
  bedrooms: number;
  bathrooms: number;
  sqft: number;
  property_type: string;
  amenities: string[];
  available_from?: string | null;
  slug?: string | null;
  photos: string[];
}

/** Shape of the full response from POST /api/assistant/search. */
export interface AssistantSearchResponse {
  /** Total matching listings in Supabase. */
  total: number;
  /** Number of listings in this response (max 10). */
  shown: number;
  /** Number the model should summarize aloud (max 3). */
  speakCount: number;
  results: ListingRecommendation[];
}

// ---------------------------------------------------------------------------
// Session
// ---------------------------------------------------------------------------

/**
 * The structured in-session state maintained server-side in Redis.
 *
 * This is the only "memory" that persists during a conversation.
 * Raw transcript text is never stored here.
 */
export interface SessionState {
  sessionId: string;
  /** Supabase user ID — null for anonymous users. */
  userId: string | null;
  startedAt: string;
  lastActivityAt: string;
  phase: ConversationPhase;
  detectedLanguage: LanguageCode;

  /** Filters extracted from conversation — mirrors ListingFilters from lib/types.ts */
  filters: {
    city: string | null;
    state: string | null;
    zip: string | null;
    minPrice: number | null;
    maxPrice: number | null;
    bedrooms: number | null;
    propertyType: string | null;
    amenities: string[];
    /** Soft signals that inform ranking but are not Supabase filter values. */
    keywords: string[];
  };

  /** Listing IDs the assistant has spoken about this session. */
  presentedListingIds: string[];
  /** Listing IDs the user explicitly rejected. */
  rejectedListingIds: string[];
  /** Listing IDs the user asked to save. */
  savedListingIds: string[];
  /** Listing IDs the user asked follow-up questions about (interest signal). */
  interestedListingIds: string[];

  /** Behavioral signals extracted from the conversation. */
  signals: SessionSignals;
}

/**
 * Soft behavioral signals extracted during a conversation.
 * Used by the recommendation engine to rank listings.
 * None of these may contain protected class information.
 */
export interface SessionSignals {
  mentionedSchoolProximity: boolean;
  mentionedCommuteProximity: boolean;
  mentionedNoiseSensitivity: boolean;
  mentionedPetOwnership: boolean;
  mentionedParkingNeed: boolean;
  movingUrgency: 'immediate' | 'flexible' | 'unknown';
  priceFlexibility: 'firm' | 'flexible' | 'unknown';
  layoutPreference: 'open' | 'traditional' | 'unknown';
}

// ---------------------------------------------------------------------------
// Tool calls (function executor)
// ---------------------------------------------------------------------------

/** Names of all server-side tools exposed to the OpenAI Realtime session. */
export type ToolName =
  | 'search_listings'
  | 'compare_listings'
  | 'explain_listing'
  | 'save_listing'
  | 'schedule_tour';

/** A record of a tool invocation during a session. Used for debugging only. */
export interface ToolCall {
  id: string;
  name: ToolName;
  /** Wall-clock time the call was initiated. */
  startedAt: string;
  /** Milliseconds from start to result return. */
  durationMs: number | null;
  /** Whether the call succeeded. */
  success: boolean;
  /** Short error message if success is false. Never contains user data. */
  errorMessage: string | null;
}

// ---------------------------------------------------------------------------
// Telemetry events
// ---------------------------------------------------------------------------

/**
 * Session-level analytics event fired to GA4.
 * Never contains transcript text, user language tied to identity,
 * audio data, or protected class proxies.
 */
export interface AssistantSessionEvent {
  /** GA4 event name. Must be one of the approved names. */
  name:
    | 'assistant_session_started'
    | 'assistant_session_ended'
    | 'assistant_session_abandoned'
    | 'assistant_listing_presented'
    | 'assistant_listing_saved'
    | 'assistant_tour_requested'
    | 'assistant_listing_rejected'
    | 'assistant_function_call_latency';
  /** Anonymous session ID — not tied to user identity. */
  sessionId: string;
  params: Record<string, string | number | boolean>;
}
