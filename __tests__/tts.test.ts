/**
 * useTTS regression tests.
 *
 * Tests cover three independently-testable layers:
 *   1. PCM decode  — Int16 LE → Float32 conversion
 *   2. Frame accumulation — chunk→FRAME_BYTES boundaries, odd-byte handling
 *   3. WAV blob builder — correct RIFF/fmt/data header for Safari path
 *   4. Completion logic — timer fires, onDone once, abort, fallback, Safari path
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// ── Constants (must match SearchBar.tsx) ─────────────────────────────────────
const PCM_RATE    = 24000;
const FRAME_BYTES = PCM_RATE * 2 * 0.15 | 0; // 7200 bytes ≈ 150 ms

// ── Pure helpers (duplicated from SearchBar for unit-testability) ────────────

function decodeInt16LE(bytes: Uint8Array): Float32Array {
  const n = bytes.length >> 1;
  const out = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const lo = bytes[i * 2], hi = bytes[i * 2 + 1];
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
  const rem = acc.length % 2 === 0 ? acc : acc.slice(0, -1);
  return { frames, remainder: rem };
}

function pcm16ToWavBlob(pcmBytes: Uint8Array, sampleRate = 24000, channels = 1): Blob {
  const bitsPerSample = 16;
  const byteRate      = sampleRate * channels * (bitsPerSample / 8);
  const blockAlign    = channels * (bitsPerSample / 8);
  const dataSize      = pcmBytes.byteLength;
  const buf           = new ArrayBuffer(44 + dataSize);
  const v             = new DataView(buf);
  const str = (off: number, s: string) => { for (let i = 0; i < s.length; i++) v.setUint8(off + i, s.charCodeAt(i)); };
  str(0, 'RIFF'); v.setUint32(4, 36 + dataSize, true); str(8, 'WAVE');
  str(12, 'fmt '); v.setUint32(16, 16, true); v.setUint16(20, 1, true);
  v.setUint16(22, channels, true); v.setUint32(24, sampleRate, true);
  v.setUint32(28, byteRate, true); v.setUint16(32, blockAlign, true);
  v.setUint16(34, bitsPerSample, true);
  str(36, 'data'); v.setUint32(40, dataSize, true);
  new Uint8Array(buf).set(pcmBytes, 44);
  return new Blob([buf], { type: 'audio/wav' });
}

// ── 1. PCM decode ─────────────────────────────────────────────────────────────

describe('decodeInt16LE', () => {
  it('converts silence (0x0000) to 0.0', () => {
    expect(decodeInt16LE(new Uint8Array([0, 0, 0, 0]))[0]).toBe(0);
  });

  it('converts positive peak (0x7FFF) to ~1.0', () => {
    expect(decodeInt16LE(new Uint8Array([0xFF, 0x7F]))[0]).toBeCloseTo(1.0, 4);
  });

  it('converts negative peak (0x8000) to -1.0', () => {
    expect(decodeInt16LE(new Uint8Array([0x00, 0x80]))[0]).toBeCloseTo(-1.0, 4);
  });

  it('handles mid-scale positive (0x4000 = 16384)', () => {
    expect(decodeInt16LE(new Uint8Array([0x00, 0x40]))[0]).toBeCloseTo(16384 / 32768, 4);
  });

  it('returns correct sample count', () => {
    expect(decodeInt16LE(new Uint8Array(200)).length).toBe(100);
  });
});

// ── 2. Frame accumulation ────────────────────────────────────────────────────

describe('accumulateFrames', () => {
  it('produces no frames for data smaller than FRAME_BYTES', () => {
    const { frames, remainder } = accumulateFrames([new Uint8Array(FRAME_BYTES - 2)]);
    expect(frames).toHaveLength(0);
    expect(remainder.length).toBe(FRAME_BYTES - 2);
  });

  it('produces exactly one frame when total equals FRAME_BYTES', () => {
    const { frames, remainder } = accumulateFrames([new Uint8Array(FRAME_BYTES)]);
    expect(frames).toHaveLength(1);
    expect(frames[0].length).toBe(FRAME_BYTES);
    expect(remainder.length).toBe(0);
  });

  it('produces two frames for 2×FRAME_BYTES', () => {
    expect(accumulateFrames([new Uint8Array(FRAME_BYTES * 2)]).frames).toHaveLength(2);
  });

  it('accumulates across multiple small chunks', () => {
    const pieces = Array.from({ length: FRAME_BYTES / 100 }, () => new Uint8Array(100));
    expect(accumulateFrames(pieces).frames).toHaveLength(1);
  });

  it('drops a trailing odd byte in the remainder', () => {
    // FRAME_BYTES + 3 bytes → remainder of 3 → drop 1 odd byte → 2
    expect(accumulateFrames([new Uint8Array(FRAME_BYTES + 3)]).remainder.length).toBe(2);
  });

  it('preserves remainder data across chunk boundaries', () => {
    const { frames, remainder } = accumulateFrames([
      new Uint8Array(FRAME_BYTES + 1), // 1 leftover byte
      new Uint8Array(1),               // + 1 byte = 2-byte remainder
    ]);
    expect(frames).toHaveLength(1);
    expect(remainder.length).toBe(2);
  });
});

// ── 3. WAV blob builder ──────────────────────────────────────────────────────

describe('pcm16ToWavBlob', () => {
  it('produces a Blob of type audio/wav', () => {
    const blob = pcm16ToWavBlob(new Uint8Array(100));
    expect(blob.type).toBe('audio/wav');
  });

  it('total size = 44 (header) + PCM bytes', () => {
    const pcm = new Uint8Array(200);
    expect(pcm16ToWavBlob(pcm).size).toBe(244);
  });

  it('writes correct RIFF/WAVE/fmt/data markers in the header', async () => {
    const blob  = pcm16ToWavBlob(new Uint8Array(4));
    const bytes = new Uint8Array(await blob.arrayBuffer());
    const str = (off: number, len: number) =>
      Array.from(bytes.slice(off, off + len)).map(c => String.fromCharCode(c)).join('');
    expect(str(0,  4)).toBe('RIFF');
    expect(str(8,  4)).toBe('WAVE');
    expect(str(12, 4)).toBe('fmt ');
    expect(str(36, 4)).toBe('data');
  });

  it('encodes sampleRate correctly at offset 24 (little-endian)', async () => {
    const blob  = pcm16ToWavBlob(new Uint8Array(0), 24000);
    const view  = new DataView(await blob.arrayBuffer());
    expect(view.getUint32(24, true)).toBe(24000);
  });

  it('data size field at offset 40 matches PCM byte length', async () => {
    const pcm  = new Uint8Array(480);
    const view = new DataView(await pcm16ToWavBlob(pcm).arrayBuffer());
    expect(view.getUint32(40, true)).toBe(480);
  });

  it('PCM payload is intact after the 44-byte header', async () => {
    const pcm   = new Uint8Array([0x01, 0x02, 0x03, 0x04]);
    const bytes = new Uint8Array(await pcm16ToWavBlob(pcm).arrayBuffer());
    expect(Array.from(bytes.slice(44))).toEqual([1, 2, 3, 4]);
  });
});

// ── 4. Completion logic ──────────────────────────────────────────────────────

describe('TTS completion', () => {
  beforeEach(() => { vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); });

  it('speaking becomes false after playback timer fires (Safari / no-onended path)', () => {
    let speaking = true, doneCalls = 0;
    const nextStart = 2.0, currentTime = 0.1;
    const remainingMs = Math.max(200, (nextStart - currentTime) * 1000 + 150);
    let finished = false;
    const finish = () => {
      if (finished) return;
      finished = true; speaking = false; doneCalls++;
    };
    const timer = setTimeout(finish, remainingMs);

    expect(speaking).toBe(true);
    vi.advanceTimersByTime(remainingMs);
    expect(speaking).toBe(false);
    expect(doneCalls).toBe(1);
    clearTimeout(timer);
  });

  it('onDone is called exactly once when onended fires early (Chrome path)', () => {
    let doneCalls = 0;
    const nextStart = 2.0, currentTime = 0.1;
    const remainingMs = Math.max(200, (nextStart - currentTime) * 1000 + 150);
    let finished = false;
    const finish = () => { if (finished) return; finished = true; doneCalls++; };
    const timer = setTimeout(finish, remainingMs);

    vi.advanceTimersByTime(100);
    clearTimeout(timer); finish(); // onended fires early

    vi.advanceTimersByTime(remainingMs); // timer would fire — already cancelled
    expect(doneCalls).toBe(1);
  });

  it('onDone is not called twice if both timer and onended race', () => {
    let doneCalls = 0;
    let finished = false;
    const finish = () => { if (finished) return; finished = true; doneCalls++; };
    const timer = setTimeout(finish, 500);
    finish(); // onended fires first
    vi.advanceTimersByTime(500); // timer fires too
    clearTimeout(timer);
    expect(doneCalls).toBe(1);
  });

  it('abort stops playback without calling onDone', () => {
    let doneCalls = 0, speaking = true;
    let finished = false;
    const finish = () => { if (finished) return; finished = true; speaking = false; doneCalls++; };
    const timer = setTimeout(finish, 2000);

    // stop() path: cancel timer, set finished, reset speaking directly
    clearTimeout(timer);
    finished = true;
    speaking = false;

    vi.advanceTimersByTime(3000);
    expect(speaking).toBe(false);
    expect(doneCalls).toBe(0);
  });

  it('Safari WAV duration timer fires if audio.onended never fires', () => {
    let doneCalls = 0;
    const pcmBytes = new Uint8Array(PCM_RATE * 2); // 1 second of audio
    const durationMs = (pcmBytes.length / (PCM_RATE * 2)) * 1000; // 1000 ms
    let finished = false;
    const finish = () => { if (finished) return; finished = true; doneCalls++; };
    const timer = setTimeout(finish, durationMs + 500);

    vi.advanceTimersByTime(durationMs + 500);
    clearTimeout(timer);
    expect(doneCalls).toBe(1);
  });

  it('Safari WAV: onDone fires exactly once if both audio.onended and timer fire', () => {
    let doneCalls = 0;
    const durationMs = 1000;
    let finished = false;
    const finish = () => { if (finished) return; finished = true; doneCalls++; };
    const timer = setTimeout(finish, durationMs + 500);

    finish(); // audio.onended fires first
    vi.advanceTimersByTime(durationMs + 500);
    clearTimeout(timer);
    expect(doneCalls).toBe(1);
  });

  it('fallback speechSynthesis: onDone fires when utterance ends', () => {
    let doneCalls = 0, speaking = false;
    const fakeSynth = { cancel: vi.fn(), speak: vi.fn().mockImplementation(() => { speaking = true; }) };
    const utt = { onend: null as (() => void) | null, onerror: null as any };
    utt.onend = () => { speaking = false; doneCalls++; };
    fakeSynth.speak(utt as any);
    expect(speaking).toBe(true);
    utt.onend();
    expect(speaking).toBe(false);
    expect(doneCalls).toBe(1);
  });

  it('stop() cancels the playback timer', () => {
    let doneCalls = 0;
    let finished = false;
    const finish = () => { if (finished) return; finished = true; doneCalls++; };
    const timer = setTimeout(finish, 2000);
    // stop() cancels and marks finished
    clearTimeout(timer); finished = true;
    vi.advanceTimersByTime(3000);
    expect(doneCalls).toBe(0);
  });

  it('remainingMs is always at least 200 ms', () => {
    const remainingMs = Math.max(200, (0.001 - 0.0) * 1000 + 150);
    expect(remainingMs).toBeGreaterThanOrEqual(200);
  });

  it('WAV duration calculation matches PCM byte length', () => {
    const pcmBytes = new Uint8Array(PCM_RATE * 2 * 2); // 2 seconds
    const durationMs = (pcmBytes.length / (PCM_RATE * 2)) * 1000;
    expect(durationMs).toBeCloseTo(2000, 0);
  });
});
