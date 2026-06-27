/**
 * Transport interface for the Emlakie AI Leasing Assistant.
 *
 * Concrete implementations:
 *   Phase 1C  → MockTransport  (lib/assistant/mockTransport.ts)
 *   Phase 1D+ → WebSocketTransport  (server/assistant/wsTransport.ts)
 *
 * The transport fires callbacks; the session hook (useAssistantSession)
 * converts them into state machine events via dispatch().
 * The transport never touches React state directly.
 */

import type { ListingRecommendation } from '@/types/assistant';

export interface AssistantTransport {
  /**
   * Open the connection and start the session.
   * Resolves when the transport is ready.
   * Implementations fire onGreeting() once connected.
   */
  connect(): Promise<void>;

  /**
   * Close the connection. Safe to call multiple times.
   * Implementations must be idempotent.
   */
  disconnect(): void;

  /**
   * Send a user text message.
   * Implementations fire onResponse() and/or onRecommendations() asynchronously.
   */
  sendUserMessage(text: string): void;

  /**
   * Cancel any in-progress response.
   * Implementations should stop firing onResponse() immediately.
   */
  cancel(): void;

  /**
   * Register a callback for the assistant's opening greeting.
   * @returns unsubscribe function — call it on cleanup.
   */
  onGreeting(cb: (message: string) => void): () => void;

  /**
   * Register a callback for text responses from the assistant.
   * @returns unsubscribe function.
   */
  onResponse(cb: (message: string) => void): () => void;

  /**
   * Register a callback for listing recommendations.
   * @returns unsubscribe function.
   */
  onRecommendations(cb: (recs: ListingRecommendation[]) => void): () => void;

  /**
   * Register a callback for transport-level errors.
   * @param cb receives (errorCode, humanReadableMessage)
   * @returns unsubscribe function.
   */
  onError(cb: (code: string, message: string) => void): () => void;
}
