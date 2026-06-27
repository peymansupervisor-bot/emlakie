/**
 * MOCK TRANSPORT — Phase 1C only.
 *
 * Simulates the future WebSocket backend with predictable, canned responses.
 * No network calls. No audio. No AI. No real data.
 *
 * HOW TO DELETE THIS IN PHASE 1D:
 *   1. Delete this file.
 *   2. In useAssistantSession.ts, replace `createMockTransport()` with
 *      `createWebSocketTransport(url)`.
 *   3. Done. The state machine and all components are unchanged.
 *
 * Timing:
 *   connect()         → 600ms → fires greeting
 *   sendUserMessage() → 900ms → fires response
 *                     → +700ms → fires recommendations (2 mock cards)
 */

import type { AssistantTransport } from './transport';
import type { ListingRecommendation } from '@/types/assistant';

// ---------------------------------------------------------------------------
// Canned content — clearly labelled as demo, never mistaken for real AI
// ---------------------------------------------------------------------------

const GREETING =
  '[Demo] Hi! I\'m the Emlakie AI Leasing Assistant. ' +
  'In the real version, I\'ll have a live conversation with you to find the perfect home. ' +
  'For now, try sending a test message below.';

const RESPONSE =
  '[Demo] Thanks — I heard your request. ' +
  'In the real assistant, I\'ll search Emlakie listings based on exactly what you described ' +
  'and explain why each result fits your needs. Here are some placeholder results:';

const MOCK_RECOMMENDATIONS: ListingRecommendation[] = [
  {
    listingId: 'mock-listing-001',
    rank: 1,
    explanation:
      '[Demo] 2-bed apartment on Oak Street — $1,750/mo, within your stated budget. ' +
      'In-unit laundry, parking included. Listed 3 days ago.',
    confidence: 0.91,
    generatedAt: new Date().toISOString(),
  },
  {
    listingId: 'mock-listing-002',
    rank: 2,
    explanation:
      '[Demo] 2-bed house on Maple Ave — $1,925/mo. ' +
      'Pet-friendly, private yard, quiet street. Owner-direct listing.',
    confidence: 0.78,
    generatedAt: new Date().toISOString(),
  },
  {
    listingId: 'mock-listing-003',
    rank: 3,
    explanation:
      '[Demo] 2-bed condo downtown — $1,850/mo. ' +
      'Gym and pool in building, covered parking, 2 blocks from transit.',
    confidence: 0.72,
    generatedAt: new Date().toISOString(),
  },
];

// ---------------------------------------------------------------------------
// Simple EventEmitter helper — avoids any external dependency
// ---------------------------------------------------------------------------

type Callback<T extends unknown[]> = (...args: T) => void;

function makeEmitter<T extends unknown[]>() {
  const listeners = new Set<Callback<T>>();
  return {
    subscribe(cb: Callback<T>): () => void {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    emit(...args: T): void {
      listeners.forEach((cb) => cb(...args));
    },
  };
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Returns a new mock transport instance.
 * Each call returns a fresh, independent instance with no shared state.
 */
export function createMockTransport(): AssistantTransport {
  const greetingEmitter = makeEmitter<[string]>();
  const responseEmitter = makeEmitter<[string]>();
  const recsEmitter = makeEmitter<[ListingRecommendation[]]>();
  const errorEmitter = makeEmitter<[string, string]>();

  let connected = false;
  const timers: ReturnType<typeof setTimeout>[] = [];

  function schedule(fn: () => void, ms: number) {
    const t = setTimeout(fn, ms);
    timers.push(t);
    return t;
  }

  function clearAll() {
    timers.forEach(clearTimeout);
    timers.length = 0;
  }

  return {
    async connect(): Promise<void> {
      if (connected) return;
      connected = true;
      // Simulate connection latency, then fire greeting
      await new Promise<void>((resolve) => {
        schedule(() => {
          greetingEmitter.emit(GREETING);
          resolve();
        }, 600);
      });
    },

    disconnect(): void {
      clearAll();
      connected = false;
    },

    sendUserMessage(_text: string): void {
      if (!connected) return;
      // Simulate thinking delay, then fire response
      schedule(() => {
        responseEmitter.emit(RESPONSE);
        // Simulate recommendations arriving shortly after response
        schedule(() => {
          recsEmitter.emit(MOCK_RECOMMENDATIONS);
        }, 700);
      }, 900);
    },

    cancel(): void {
      clearAll();
      // Re-mark connected so the user can send another message
      connected = true;
    },

    onGreeting: (cb) => greetingEmitter.subscribe(cb),
    onResponse: (cb) => responseEmitter.subscribe(cb),
    onRecommendations: (cb) => recsEmitter.subscribe(cb),
    onError: (cb) => errorEmitter.subscribe(cb),
  };
}
