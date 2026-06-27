/**
 * Public API surface for lib/assistant.
 *
 * Import from here rather than from individual files to keep the import graph
 * stable as the library grows. Future phases add to this barrel without
 * changing existing call sites.
 *
 * Server-only utilities (env.ts) are NOT re-exported here because this barrel
 * may be imported in client components. Import env.ts directly in server routes.
 */

export { ASSISTANT_ENABLED } from './config';
export type { LanguageConfig } from './config';
export {
  SUPPORTED_LANGUAGES,
  ACTIVE_LANGUAGE_CODES,
  DEFAULT_LANGUAGE,
  RTL_LANGUAGES,
  VOICE_SETTINGS,
  SESSION_TIMEOUTS,
  RATE_LIMITS,
  RECOMMENDATION,
  PROPERTY_TYPE_VALUES,
  AMENITY_VALUES,
  PRICE_BOUNDS,
  BEDROOM_BOUNDS,
} from './config';
export type { PropertyTypeValue, AmenityValue } from './config';

export { assistantLogger, startTimer } from './logger';
export type { LogLevel, AssistantLogEntry, AssistantSubsystem } from './logger';

export {
  transition,
  INITIAL_STATE,
  toDisplayState,
  canSendMessage,
  canOpen,
  getRecommendations,
  getAssistantMessage,
} from './stateMachine';
export type { AssistantSessionState, AssistantEvent } from './stateMachine';

export type { AssistantTransport } from './transport';

// createMockTransport is intentionally NOT re-exported here.
// It is only used directly in useAssistantSession.ts and will be deleted in Phase 1D.
