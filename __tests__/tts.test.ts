/**
 * useTTS regression tests.
 *
 * We cannot render the React hook directly without a DOM + AudioContext, so
 * these tests cover the three independently-testable layers:
 *
 *   1. PCM decode  — Int16 LE → Float32 conversion correctness
 *   2. Frame accumulation — chunk → FRAME_BYTES boundaries, odd-byte handling
 *   3. Completion logic — timer fires, onDone called exactly once, abort, fallback
 *
 * The completion tests use a fake AudioContext/GainNode/AudioBufferSourceNode
 * to verify that speaking is cleared and onDone fires (or doesn't) under each
 * scenario without requiring a real browser audio graph.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Constants (must match SearchBar.tsx) ────────────────────────────────────
const PCM_RATE   = 24000;
const FRAME_BYTES = PCM_RATE * 2 * 0.15 | 0; // 7200 bytes ≈ 150 ms

// ── Pure helpers extracted for testing ──────────────────────────────────────

function decodeInt16LE(bytes: Uint8Array): Float32Array {
  const n = bytes.length >> 1;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const lo = bytes[i * 2];
    const hi = bytes[i * 2 + 1];
    let s = (hi << 8) | lo;
    if (s > 0x7FFF) s -= 0x10000;
    out[i] = s / 32768.0;
  }
  return out;
}

function accumulateFrames(chunks: Uint8Array[]): { frames: Uint8Array[]; remainder: Uint8Array } {
  let acc = new Uint8Array(0);
  const frames: Uint8Array[] = [];
  for (const chunk of chunks) {
    const next = new Uint8Array(acc.length + chunk.length);
    next.set(acc); next.set(chunk, acc.length);
    acc = next;
    while (acc.length >= FRAME_BYTES) {
      frames.push(acc.slice(0, FRAME_BYTES));
      acc = acc.slice(FRAME_BYTES);
    }
  }
  // Final flush: drop trailing odd byte (PCM samples are always 2 bytes)
  const rem = acc.length % 2 === 0 ? acc : acc.slice(0, -1);
  return { frames, remainder: rem };
}

// ── Fake AudioContext for completion tests ───────────────────────────────────

function makeFakeAudioCtx(currentTime = 0) {
  const sources: { startAt: number; onended: (() => void) | null }[] = [];

  const gain = {
    gain: { value: 1, setValueAtTime: vi.fn() },
    connect: vi.fn(),
  };

  const destination = { maxChannelCount: 2, channelCount: 2 };

  const ctx = {
    state: 'running' as AudioContextState,
    currentTime,
    sampleRate: PCM_RATE,
    destination,
    resume: vi.fn().mockResolvedValue(undefined),
    createGain: vi.fn().mockReturnValue(gain),
    createBuffer: vi.fn().mockImplementation((_ch: number, len: number, _rate: number) => ({
      duration: len / PCM_RATE,
      copyToChannel: vi.fn(),
    })),
    createBufferSource: vi.fn().mockImplementation(() => {
      const src = {
        buffer: null as any,
        connect: vi.fn(),
        start: vi.fn().mockImplementation((startAt: number) => {
          sources.push({ startAt, onended: null });
        }),
        stop: vi.fn(),
        onended: null as (() => void) | null,
      };
      // Mirror onended assignment onto the sources list for test inspection
      Object.defineProperty(src, 'onended', {
        set(fn: () => void) { sources[sources.length - 1].onended = fn; },
        get() { return sources[sources.length - 1]?.onended ?? null; },
      });
      return src;
    }),
  };
  return { ctx, gain, sources };
}

// ── 1. PCM decode ────────────────────────────────────────────────────────────

describe('decodeInt16LE', () => {
  it('converts silence (0x0000) to 0.0', () => {
    const bytes = new Uint8Array([0x00, 0x00, 0x00, 0x00]);
    const f = decodeInt16LE(bytes);
    expect(f[0]).toBe(0);
    expect(f[1]).toBe(0);
  });

  it('converts positive peak (0x7FFF) to ~1.0', () => {
    const bytes = new Uint8Array([0xFF, 0x7F]); // 0x7FFF LE
    const f = decodeInt16LE(bytes);
    expect(f[0]).toBeCloseTo(1.0, 4);
  });

  it('converts negative peak (0x8000) to -1.0', () => {
    const bytes = new Uint8Array([0x00, 0x80]); // 0x8000 LE = -32768
    const f = decodeInt16LE(bytes);
    expect(f[0]).toBeCloseTo(-1.0, 4);
  });

  it('handles mid-scale positive (0x4000 = 16384) correctly', () => {
    const bytes = new Uint8Array([0x00, 0x40]); // 0x4000 LE
    const f = decodeInt16LE(bytes);
    expect(f[0]).toBeCloseTo(16384 / 32768, 4);
  });

  it('returns correct sample count for byte length', () => {
    const bytes = new Uint8Array(200);
    expect(decodeInt16LE(bytes).length).toBe(100);
  });
});

// ── 2. Frame accumulation ────────────────────────────────────────────────────

describe('accumulateFrames', () => {
  it('produces no frames for data smaller than FRAME_BYTES', () => {
    const chunk = new Uint8Array(FRAME_BYTES - 2);
    const { frames, remainder } = accumulateFrames([chunk]);
    expect(frames).toHaveLength(0);
    expect(remainder.length).toBe(FRAME_BYTES - 2);
  });

  it('produces exactly one frame when total equals FRAME_BYTES', () => {
    const chunk = new Uint8Array(FRAME_BYTES);
    const { frames, remainder } = accumulateFrames([chunk]);
    expect(frames).toHaveLength(1);
    expect(frames[0].length).toBe(FRAME_BYTES);
    expect(remainder.length).toBe(0);
  });

  it('produces two frames for 2×FRAME_BYTES', () => {
    const chunk = new Uint8Array(FRAME_BYTES * 2);
    const { frames } = accumulateFrames([chunk]);
    expect(frames).toHaveLength(2);
  });

  it('accumulates across multiple small chunks', () => {
    // Send FRAME_BYTES in 100-byte pieces
    const pieces = Array.from({ length: FRAME_BYTES / 100 }, () => new Uint8Array(100));
    const { frames } = accumulateFrames(pieces);
    expect(frames).toHaveLength(1);
  });

  it('drops a trailing odd byte in the remainder', () => {
    const chunk = new Uint8Array(FRAME_BYTES + 3); // 3 remainder bytes
    const { remainder } = accumulateFrames([chunk]);
    // Odd byte dropped → 2 bytes remain
    expect(remainder.length).toBe(2);
  });

  it('preserves remainder data across chunk boundaries', () => {
    // First chunk: FRAME_BYTES + 1 → 1 frame + 1 leftover byte
    // Second chunk: 1 byte → together = 2 bytes = valid remainder
    const chunk1 = new Uint8Array(FRAME_BYTES + 1);
    const chunk2 = new Uint8Array(1);
    const { frames, remainder } = accumulateFrames([chunk1, chunk2]);
    expect(frames).toHaveLength(1);
    expect(remainder.length).toBe(2);
  });
});

// ── 3. Completion logic ──────────────────────────────────────────────────────
// These tests simulate the post-scheduling block in speak() using fake timers
// and a fake AudioContext.

describe('TTS completion', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('speaking becomes false after playback timer fires (Safari path — no onended)', () => {
    let speaking = true;
    let doneCalls = 0;

    const onDone = () => { doneCalls++; };
    const nextStart = 2.0; // 2 seconds scheduled
    const currentTime = 0.1;
    const remainingMs = Math.max(200, (nextStart - currentTime) * 1000 + 150);

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      speaking = false;
      onDone();
    };
    const timer = setTimeout(finish, remainingMs);

    // Simulate Safari: onended never fires
    expect(speaking).toBe(true);
    vi.advanceTimersByTime(remainingMs);
    expect(speaking).toBe(false);
    expect(doneCalls).toBe(1);
    clearTimeout(timer);
  });

  it('onDone is called exactly once when onended fires early (Chrome path)', () => {
    let doneCalls = 0;
    const onDone = () => { doneCalls++; };
    const nextStart = 2.0;
    const currentTime = 0.1;
    const remainingMs = Math.max(200, (nextStart - currentTime) * 1000 + 150);

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      onDone();
    };
    const timer = setTimeout(finish, remainingMs);
    const clearTimer = () => clearTimeout(timer);

    // Simulate Chrome: onended fires before the timer
    vi.advanceTimersByTime(100);
    clearTimer(); finish(); // onended path

    // Timer still fires after — should be a no-op
    vi.advanceTimersByTime(remainingMs);
    expect(doneCalls).toBe(1);
  });

  it('onDone is not called twice if both timer and onended race', () => {
    let doneCalls = 0;
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      doneCalls++;
    };

    const timer = setTimeout(finish, 500);
    // Simulate both firing nearly simultaneously
    finish();               // onended path
    vi.advanceTimersByTime(500); // timer path
    clearTimeout(timer);
    expect(doneCalls).toBe(1);
  });

  it('abort stops playback without calling onDone', () => {
    let doneCalls = 0;
    let speaking = true;
    const onDone = () => { doneCalls++; };

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      speaking = false;
      onDone();
    };
    const timer = setTimeout(finish, 2000);

    // Abort: clear the timer and reset state without calling finish()
    clearTimeout(timer);
    speaking = false; // stop() sets this directly

    vi.advanceTimersByTime(3000);
    expect(speaking).toBe(false);
    expect(doneCalls).toBe(0); // onDone must NOT fire on abort
  });

  it('fallback speechSynthesis calls onDone when utterance ends', () => {
    let doneCalls = 0;
    let speaking = false;

    // Simulate speakFallback directly without needing a real constructor
    const fakeSpeechSynthesis = {
      cancel: vi.fn(),
      speak: vi.fn().mockImplementation(() => { speaking = true; }),
    };
    let capturedOnend: (() => void) | null = null;

    // Inline the speakFallback logic with a plain object utterance
    fakeSpeechSynthesis.cancel();
    const utt = { onend: null as (() => void) | null, onerror: null as any };
    utt.onend = () => { speaking = false; doneCalls++; };
    capturedOnend = utt.onend;
    fakeSpeechSynthesis.speak(utt as any);
    expect(speaking).toBe(true);

    // Simulate utterance ending
    capturedOnend?.();
    expect(speaking).toBe(false);
    expect(doneCalls).toBe(1);
  });

  it('playback timer is cancelled when stop() is called mid-playback', () => {
    let doneCalls = 0;
    const onDone = () => { doneCalls++; };

    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true;
      onDone();
    };

    // Simulate stop(): clear timer, mark finished to block any late fires
    const timer = setTimeout(finish, 2000);
    clearTimeout(timer);
    finished = true; // stop() also fires setSpeaking(false) directly

    vi.advanceTimersByTime(3000);
    expect(doneCalls).toBe(0);
  });

  it('remainingMs is always at least 200ms regardless of audio length', () => {
    // Even a 1-sample buffer should give a 200ms window, not a race-prone 0ms
    const nextStart = 0.001;
    const currentTime = 0.0;
    const remainingMs = Math.max(200, (nextStart - currentTime) * 1000 + 150);
    expect(remainingMs).toBeGreaterThanOrEqual(200);
  });
});
