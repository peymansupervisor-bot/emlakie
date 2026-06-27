'use client';

import { useRouter } from 'next/navigation';
import { useState, useEffect, useRef, useCallback } from 'react';
import { isAddressQuery } from '@/lib/address-utils';
import VoiceOrb, { type OrbState, type OrbTranscript } from '@/components/VoiceOrb';

interface Suggestion {
  type: 'city' | 'address' | 'listing';
  label: string;
  value: string;
  slug?: string | null;
}

type Mode = 'location' | 'describe' | 'nearby';

const MODES: { id: Mode; label: string; sublabel: string; icon: React.ReactNode }[] = [
  {
    id: 'location',
    label: 'Location',
    sublabel: 'City, ZIP, or address',
    icon: (
      <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-4 w-4 shrink-0" aria-hidden="true">
        <circle cx="9" cy="9" r="5.5" />
        <path d="m16 16-2.5-2.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'describe',
    label: 'Describe',
    sublabel: 'Your ideal rental',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
        <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v1a.75.75 0 0 0 1.5 0v-1ZM10 6.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM17.25 9.25a.75.75 0 0 0 0 1.5h1a.75.75 0 0 0 0-1.5h-1ZM10 17a.75.75 0 0 0-.75.75v1a.75.75 0 0 0 1.5 0v-1A.75.75 0 0 0 10 17ZM2.75 9.25a.75.75 0 0 0 0 1.5h1a.75.75 0 0 0 0-1.5h-1ZM4.22 4.22a.75.75 0 0 0 0 1.06l.707.707a.75.75 0 0 0 1.06-1.06L5.28 4.22a.75.75 0 0 0-1.06 0ZM15.78 4.22a.75.75 0 0 0-1.06 0l-.707.707a.75.75 0 0 0 1.06 1.06l.707-.707a.75.75 0 0 0 0-1.06ZM4.22 15.78a.75.75 0 0 0 1.06 0l.707-.707a.75.75 0 0 0-1.06-1.06l-.707.707a.75.75 0 0 0 0 1.06ZM14.013 14.013a.75.75 0 0 0 0 1.06l.707.707a.75.75 0 0 0 1.06-1.06l-.707-.707a.75.75 0 0 0-1.06 0Z" />
      </svg>
    ),
  },
  {
    id: 'nearby',
    label: 'Nearby',
    sublabel: 'Use my location',
    icon: (
      <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
        <path fillRule="evenodd" d="M9.69 18.933l.003.001C9.89 19.02 10 19 10 19s.11.02.308-.066l.002-.001.006-.003.018-.008a5.741 5.741 0 0 0 .281-.14c.186-.096.446-.24.757-.433.62-.384 1.445-.966 2.274-1.765C15.302 14.988 17 12.493 17 9A7 7 0 1 0 3 9c0 3.492 1.698 5.988 3.355 7.584a13.731 13.731 0 0 0 2.273 1.765 11.842 11.842 0 0 0 .976.544l.062.029.018.008.006.003ZM10 11.25a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" clipRule="evenodd" />
      </svg>
    ),
  },
];

// ── Speech recognition (Web Speech API) ──────────────────────────────────────
// supported is derived in useEffect so SSR and client hydrate identically.
type SpeechError = 'not-allowed' | 'no-speech' | 'other' | null;

function useSpeechRecognition(onResult: (text: string) => void) {
  const [supported, setSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState<SpeechError>(null);
  const recogRef = useRef<SpeechRecognition | null>(null);
  // Keep onResult in a ref so the recognition callback always calls the latest version
  const onResultRef = useRef(onResult);
  useEffect(() => { onResultRef.current = onResult; });

  useEffect(() => {
    setSupported('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
  }, []);

  // Auto-clear error when the user grants mic permission without reloading
  useEffect(() => {
    if (!error) return;
    navigator.permissions.query({ name: 'microphone' as PermissionName }).then((status) => {
      if (status.state === 'granted') setError(null);
      status.onchange = () => { if (status.state === 'granted') setError(null); };
    }).catch(() => {});
  }, [error]);

  // Track whether mic permission has already been granted this session.
  // getUserMedia must be called from a user gesture — subsequent starts
  // (from async TTS callbacks) skip it since iOS blocks it there.
  const permittedRef = useRef(false);

  async function start() {
    if (!supported || listening) return;
    setError(null);

    if (!permittedRef.current) {
      // First start: trigger permission dialog via getUserMedia (user gesture)
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        stream.getTracks().forEach((t) => t.stop());
        permittedRef.current = true;
      } catch (err) {
        console.error('[mic] getUserMedia failed:', err);
        setError('not-allowed');
        return;
      }
    }

    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    const recog: SpeechRecognition = new SR();
    recog.lang = 'en-US';
    recog.interimResults = false;
    recog.maxAlternatives = 1;
    recog.onresult = (e: SpeechRecognitionEvent) => {
      const text = e.results[0]?.[0]?.transcript ?? '';
      if (text) {
        setError(null);
        onResultRef.current(text);
      }
    };
    recog.onend = () => setListening(false);
    recog.onerror = (e: SpeechRecognitionErrorEvent) => {
      console.error('[mic] SpeechRecognition error:', e.error, e.message);
      setListening(false);
      if (e.error === 'not-allowed') setError('not-allowed');
      else if (e.error === 'no-speech') setError('no-speech');
      else setError('other');
    };
    recogRef.current = recog;
    try {
      recog.start();
      setListening(true);
    } catch {
      setError('other');
    }
  }

  function stop() {
    recogRef.current?.stop();
    setListening(false);
  }

  function clearError() { setError(null); }

  return { supported, listening, error, start, stop, clearError };
}

// ── Text-to-speech via Web Audio API ─────────────────────────────────────────
// iOS Safari blocks both speechSynthesis and <audio>.play() from async
// callbacks. Web Audio API (AudioContext) works as long as it was RESUMED
// during a user gesture — prime() does that on the mic tap.
// Audio bytes come from /api/voice/tts (server-side TTS proxy).
function useTTS() {
  const [speaking, setSpeaking] = useState(false);
  const ctxRef    = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  function getCtx(): AudioContext {
    if (!ctxRef.current || ctxRef.current.state === 'closed') {
      const AC = window.AudioContext ?? (window as any).webkitAudioContext;
      ctxRef.current = new AC();
    }
    return ctxRef.current;
  }

  // Call during the mic-button tap to resume the AudioContext on iOS.
  function prime() {
    if (typeof window === 'undefined') return;
    try {
      const ctx = getCtx();
      ctx.resume().catch(() => {});
      // Play a 1-sample silent buffer — fully unlocks the audio session on iOS
      const buf = ctx.createBuffer(1, 1, 22050);
      const src = ctx.createBufferSource();
      src.buffer = buf;
      src.connect(ctx.destination);
      src.start(0);
    } catch { /* AudioContext unavailable */ }
  }

  async function speak(text: string, onDone?: () => void) {
    if (typeof window === 'undefined') { onDone?.(); return; }
    try { sourceRef.current?.stop(); } catch {}

    setSpeaking(true);
    const fallback = setTimeout(
      () => { setSpeaking(false); onDone?.(); },
      Math.max(4000, text.length * 80),
    );

    try {
      const ctx = getCtx();
      if (ctx.state === 'suspended') await ctx.resume();

      const res = await fetch(`/api/voice/tts?text=${encodeURIComponent(text)}`);
      if (!res.ok) throw new Error(`TTS ${res.status}`);

      const arrayBuf = await res.arrayBuffer();
      const audioBuf = await ctx.decodeAudioData(arrayBuf);

      const source = ctx.createBufferSource();
      source.buffer = audioBuf;
      source.connect(ctx.destination);
      sourceRef.current = source;

      source.onended = () => { clearTimeout(fallback); setSpeaking(false); onDone?.(); };
      source.start(0);
    } catch (err) {
      console.error('[TTS]', err);
      clearTimeout(fallback);
      setSpeaking(false);
      onDone?.();
    }
  }

  function stop() {
    try { sourceRef.current?.stop(); } catch {}
    setSpeaking(false);
  }

  return { speaking, speak, stop, prime };
}

export default function SearchBar({ large = false }: { large?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [mode, setMode] = useState<Mode>('location');
  const [interpreting, setInterpreting] = useState(false);
  const [geoState, setGeoState] = useState<'idle' | 'loading' | 'error'>('idle');
  const [orbState, setOrbState] = useState<OrbState>('idle');
  const [transcript, setTranscript] = useState<OrbTranscript>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const tts = useTTS();

  // ── Conversation state ────────────────────────────────────────────────────
  const [convActive, setConvActive] = useState(false);
  const convActiveRef = useRef(false);
  useEffect(() => { convActiveRef.current = convActive; }, [convActive]);
  const convMessagesRef = useRef<Array<{ role: 'user' | 'assistant'; content: string }>>([]);

  // Ref so continueListening always calls the latest speech.start (avoids stale closure)
  const speechStartRef = useRef<() => void>(() => {});

  // Called after the AI responds — restart listening if still in conversation
  const continueListening = useCallback(() => {
    if (!convActiveRef.current) return;
    setOrbState('listening');
    speechStartRef.current();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleVoiceResult = useCallback(async (text: string) => {
    if (!convActiveRef.current) return;

    setTranscript({ user: text, ai: '' });
    setOrbState('thinking');

    const messages = [
      ...convMessagesRef.current,
      { role: 'user' as const, content: text },
    ];
    convMessagesRef.current = messages;

    try {
      const res = await fetch('/api/voice/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages }),
      });
      const data: { speak: string; action?: { type: string; params: Record<string, unknown> } } = await res.json();
      const aiText = data.speak || "Sorry, I didn't catch that.";

      convMessagesRef.current = [...messages, { role: 'assistant', content: aiText }];
      setTranscript({ user: text, ai: aiText });
      setOrbState('speaking');

      if (data.action?.type === 'search') {
        const p = (data.action.params ?? {}) as Record<string, unknown>;
        const params = new URLSearchParams();
        if (p.city) params.set('city', String(p.city));
        if (p.state && !p.city) params.set('q', String(p.state));
        if (p.maxPrice) params.set('maxPrice', String(p.maxPrice));
        if (p.minPrice) params.set('minPrice', String(p.minPrice));
        if (p.bedrooms) params.set('bedrooms', String(p.bedrooms));
        if (p.propertyType) params.set('propertyType', String(p.propertyType));
        if (Array.isArray(p.amenities) && p.amenities.length) params.set('amenities', (p.amenities as string[]).join(','));
        // Speak then navigate
        tts.speak(aiText);
        setTimeout(() => {
          setConvActive(false);
          setOrbState('idle');
          router.push(`/rentals?${params.toString()}`);
        }, 1800);
      } else {
        // Continue conversation after TTS finishes
        tts.speak(aiText, continueListening);
      }
    } catch {
      tts.speak("Sorry, something went wrong. Try again!", continueListening);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [continueListening]);

  const speech = useSpeechRecognition(handleVoiceResult);
  speechStartRef.current = speech.start;

  function playActivationChime() {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const now = ctx.currentTime;
      const play = (freq: number, start: number, dur: number) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(0.25, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, start + dur);
        osc.start(start);
        osc.stop(start + dur);
      };
      play(523, now,        0.18); // C5
      play(784, now + 0.13, 0.22); // G5
      setTimeout(() => ctx.close(), 800);
    } catch { /* AudioContext not available */ }
  }

  function startConversation() {
    tts.prime(); // unlock iOS audio session during user tap
    playActivationChime();
    convMessagesRef.current = [];
    setTranscript({});
    setConvActive(true);
    setOrbState('listening');
    speech.start();
  }

  function stopConversation() {
    setConvActive(false);
    speech.stop();
    tts.stop();
    setOrbState('idle');
    setTranscript({});
  }

  // Keep orbState in sync with speech/tts when NOT in conversation mode
  useEffect(() => {
    if (convActive) return;
    if (!speech.listening && !tts.speaking && !interpreting) setOrbState('idle');
    else if (speech.listening) setOrbState('listening');
    else if (interpreting) setOrbState('thinking');
    else if (tts.speaking) setOrbState('speaking');
  }, [speech.listening, tts.speaking, interpreting, convActive]);

  useEffect(() => {
    if (mode !== 'location') { setSuggestions([]); setOpen(false); return; }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setSuggestions([]); setOpen(false); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/autocomplete?q=${encodeURIComponent(q.trim())}`);
        const data: Suggestion[] = await res.json();
        setSuggestions(data);
        setOpen(data.length > 0);
        setActiveIdx(-1);
      } catch {
        setSuggestions([]);
      }
    }, 220);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, mode]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  function handleModeChange(next: Mode) {
    setMode(next);
    setQ('');
    setSuggestions([]);
    setOpen(false);
    setGeoState('idle');

    if (next === 'nearby') {
      setGeoState('loading');
      if (!navigator.geolocation) {
        setGeoState('error');
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          router.push(`/rentals?lat=${latitude.toFixed(5)}&lng=${longitude.toFixed(5)}`);
        },
        () => {
          setGeoState('error');
        },
        { timeout: 8000, maximumAge: 60000 },
      );
    }
  }

  function navigate(s?: Suggestion, rawVal?: string) {
    setOpen(false);
    const val = (s?.value ?? rawVal ?? '').trim();
    setQ(val);
    if (s?.type === 'listing' && s.slug) {
      router.push(`/rentals/${s.slug}`);
    } else {
      router.push(`/rentals?q=${encodeURIComponent(val)}`);
    }
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (mode === 'describe') {
      const query = q.trim();
      if (!query) return;
      setInterpreting(true);
      try {
        const res = await fetch('/api/search/interpret', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });
        if (res.ok) {
          const data = await res.json();
          const params = new URLSearchParams();
          if (data.city) params.set('city', data.city);
          if (data.state && !data.city) params.set('q', data.state);
          if (data.minPrice) params.set('minPrice', String(data.minPrice));
          if (data.maxPrice) params.set('maxPrice', String(data.maxPrice));
          if (data.bedrooms) params.set('bedrooms', data.bedrooms);
          if (data.propertyType) params.set('propertyType', data.propertyType);
          if (data.amenities?.length) params.set('amenities', data.amenities.join(','));
          if (!data.city && !data.state) params.set('q', query);
          // Build a spoken summary of what we found
          const parts: string[] = [];
          if (data.bedrooms) parts.push(`${data.bedrooms}-bedroom`);
          if (data.propertyType) parts.push(data.propertyType);
          parts.push('rentals');
          if (data.city) parts.push(`in ${data.city}`);
          else if (data.state) parts.push(`in ${data.state}`);
          if (data.maxPrice) parts.push(`under $${Number(data.maxPrice).toLocaleString()} a month`);
          if (data.amenities?.length) parts.push(`with ${(data.amenities as string[]).join(' and ')}`);
          const summary = `Got it. Finding ${parts.join(' ')}.`;
          setInterpreting(false);
          tts.speak(summary);
          // Small delay so TTS has a chance to start before navigation kills the page
          setTimeout(() => router.push(`/rentals?${params.toString()}`), 1800);
        } else {
          router.push(`/rentals?q=${encodeURIComponent(query)}`);
        }
      } catch {
        router.push(`/rentals?q=${encodeURIComponent(query)}`);
      } finally {
        setInterpreting(false);
      }
      return;
    }

    const active = activeIdx >= 0 ? suggestions[activeIdx] : undefined;
    const val = (active?.value ?? q).trim();
    if (!val) { router.push('/rentals'); return; }
    navigate(active, val);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (!open || suggestions.length === 0) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => Math.max(i - 1, -1));
    } else if (e.key === 'Escape') {
      setOpen(false);
      setActiveIdx(-1);
    }
  }

  const placeholder =
    mode === 'describe'
      ? 'e.g. "Pet-friendly 2BR near downtown Austin under $2,000"'
      : 'City, ZIP, address, or neighborhood';

  const isDescribe = mode === 'describe';
  const isNearby = mode === 'nearby';

  function stopAll() {
    stopConversation();
  }

  // ── Compact (non-homepage) variant ──────────────────────────────────────────
  if (!large) {
    return (
      <div ref={containerRef} className="relative w-full max-w-md">
        <VoiceOrb state={orbState} transcript={transcript} onStop={stopAll} />
        <form
          role="search"
          aria-label="Search rental listings"
          onSubmit={onSubmit}
          className="flex w-full overflow-hidden rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.10)] transition-shadow hover:shadow-[0_6px_32px_rgba(0,0,0,0.14)]"
        >
          <label htmlFor="search-q-sm" className="sr-only">Search rentals</label>
          <input
            id="search-q-sm"
            role="combobox"
            type="text"
            autoComplete="off"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder="City, ZIP, address"
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="search-suggestions-sm"
            aria-activedescendant={activeIdx >= 0 ? `search-suggestions-sm-${activeIdx}` : undefined}
            className="min-w-0 flex-1 px-4 py-3 text-base text-gray-900 placeholder-gray-500 outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
          />
          {speech.supported && (
            <button
              type="button"
              onClick={convActive ? stopConversation : startConversation}
              aria-label={convActive ? 'End voice conversation' : 'Start voice search'}
              className={[
                'flex items-center justify-center px-3 transition-colors',
                convActive ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-brand-600',
              ].join(' ')}
            >
              {convActive ? (
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4Zm-1.5 14.9A7.01 7.01 0 0 1 5 9H3a9 9 0 0 0 8 8.94V20H8v2h8v-2h-3v-2.06A9 9 0 0 0 21 9h-2a7 7 0 0 1-7 7 6.98 6.98 0 0 1-1.5-.1Z" />
                  </svg>
                </span>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4Zm-1.5 14.9A7.01 7.01 0 0 1 5 9H3a9 9 0 0 0 8 8.94V20H8v2h8v-2h-3v-2.06A9 9 0 0 0 21 9h-2a7 7 0 0 1-7 7 6.98 6.98 0 0 1-1.5-.1Z" />
                </svg>
              )}
            </button>
          )}
          <button
            type="submit"
            aria-label="Search"
            className="flex items-center gap-1.5 bg-brand-700 px-5 font-semibold text-white transition hover:bg-brand-800"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="m20 20-3.5-3.5" strokeLinecap="round" />
            </svg>
            <span className="hidden sm:inline text-sm">Search</span>
          </button>
        </form>

        {open && suggestions.length > 0 && (
          <SuggestionList
            id="search-suggestions-sm"
            suggestions={suggestions}
            activeIdx={activeIdx}
            onSelect={navigate}
            onHover={setActiveIdx}
          />
        )}
        {speech.error && (
          <MicError error={speech.error} onDismiss={speech.clearError} onRetry={() => { speech.clearError(); speech.start(); }} />
        )}
      </div>
    );
  }

  // ── Homepage (large) variant ─────────────────────────────────────────────────
  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <VoiceOrb state={orbState} onStop={stopAll} />

      {/* Mode selector — three tabs */}
      <div className="mb-3 grid grid-cols-3 gap-2" role="tablist" aria-label="Search mode">
        {MODES.map((m) => {
          const isActive = mode === m.id;
          const isViolet = m.id === 'describe' && isActive;
          return (
            <button
              key={m.id}
              role="tab"
              aria-selected={isActive}
              aria-controls="search-panel"
              type="button"
              onClick={() => handleModeChange(m.id)}
              className={[
                'group relative flex items-center gap-2.5 rounded-2xl border px-3.5 py-3 text-left transition-all duration-200',
                isActive
                  ? isViolet
                    ? 'border-violet-200 bg-white shadow-sm shadow-violet-100'
                    : 'border-gray-200 bg-white shadow-sm'
                  : 'border-transparent bg-gray-50 hover:bg-gray-100 hover:border-gray-100',
              ].join(' ')}
            >
              <span className={[
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-colors',
                isActive
                  ? isViolet ? 'bg-violet-100 text-violet-600' : 'bg-brand-50 text-brand-600'
                  : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-500',
              ].join(' ')}>
                {m.icon}
              </span>
              <span className="min-w-0">
                <span className={[
                  'block text-[13px] font-semibold leading-tight truncate',
                  isActive
                    ? isViolet ? 'text-violet-700' : 'text-gray-900'
                    : 'text-gray-500 group-hover:text-gray-700',
                ].join(' ')}>
                  {m.label}
                </span>
                <span className={[
                  'block text-[11px] leading-tight truncate mt-0.5',
                  isActive
                    ? isViolet ? 'text-violet-500' : 'text-gray-400'
                    : 'text-gray-400',
                ].join(' ')}>
                  {m.sublabel}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {/* Nearby state */}
      {isNearby && (
        <div className={[
          'flex h-[60px] items-center justify-center gap-3 rounded-xl border text-sm font-medium',
          geoState === 'error'
            ? 'border-red-200 bg-red-50 text-red-600'
            : 'border-gray-200 bg-white text-gray-500',
        ].join(' ')}>
          {geoState === 'loading' && (
            <>
              <svg className="h-4 w-4 animate-spin text-brand-500" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
              Finding nearby rentals…
            </>
          )}
          {geoState === 'error' && (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
              </svg>
              Location access denied.{' '}
              <button
                type="button"
                onClick={() => handleModeChange('location')}
                className="underline underline-offset-2 hover:no-underline"
              >
                Search by city instead
              </button>
            </>
          )}
        </div>
      )}

      {/* Search form — hidden only when nearby is loading/erroring */}
      {!isNearby && (
        <form
          id="search-panel"
          role="search"
          aria-label="Search rental listings"
          onSubmit={onSubmit}
          className={[
            'flex w-full overflow-hidden rounded-xl bg-white transition-all duration-200',
            isDescribe
              ? 'shadow-[0_4px_24px_rgba(139,92,246,0.15)] ring-1 ring-violet-200 hover:shadow-[0_6px_32px_rgba(139,92,246,0.22)]'
              : 'shadow-[0_4px_24px_rgba(0,0,0,0.10)] hover:shadow-[0_6px_32px_rgba(0,0,0,0.14)]',
          ].join(' ')}
        >
          {isDescribe && (
            <span className="flex items-center pl-4 text-violet-400" aria-hidden="true">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 shrink-0">
                <path d="M10.75 2.75a.75.75 0 0 0-1.5 0v1a.75.75 0 0 0 1.5 0v-1ZM10 6.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7ZM17.25 9.25a.75.75 0 0 0 0 1.5h1a.75.75 0 0 0 0-1.5h-1ZM10 17a.75.75 0 0 0-.75.75v1a.75.75 0 0 0 1.5 0v-1A.75.75 0 0 0 10 17ZM2.75 9.25a.75.75 0 0 0 0 1.5h1a.75.75 0 0 0 0-1.5h-1ZM4.22 4.22a.75.75 0 0 0 0 1.06l.707.707a.75.75 0 0 0 1.06-1.06L5.28 4.22a.75.75 0 0 0-1.06 0ZM15.78 4.22a.75.75 0 0 0-1.06 0l-.707.707a.75.75 0 0 0 1.06 1.06l.707-.707a.75.75 0 0 0 0-1.06ZM4.22 15.78a.75.75 0 0 0 1.06 0l.707-.707a.75.75 0 0 0-1.06-1.06l-.707.707a.75.75 0 0 0 0 1.06ZM14.013 14.013a.75.75 0 0 0 0 1.06l.707.707a.75.75 0 0 0 1.06-1.06l-.707-.707a.75.75 0 0 0-1.06 0Z" />
              </svg>
            </span>
          )}
          <label htmlFor="search-q" className="sr-only">Search rentals</label>
          <input
            id="search-q"
            role="combobox"
            type="text"
            autoComplete="off"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => mode === 'location' && suggestions.length > 0 && setOpen(true)}
            placeholder={placeholder}
            aria-autocomplete="list"
            aria-expanded={open}
            aria-controls="search-suggestions"
            aria-activedescendant={activeIdx >= 0 ? `suggestion-${activeIdx}` : undefined}
            className={[
              'min-w-0 flex-1 py-4 text-lg text-gray-900 placeholder-gray-300 outline-none',
              isDescribe ? 'px-3 focus:ring-0' : 'px-5 focus:ring-2 focus:ring-inset focus:ring-brand-500',
              'placeholder-gray-500',
            ].join(' ')}
          />
          {q && (
            <button
              type="button"
              onClick={() => { setQ(''); setSuggestions([]); setOpen(false); }}
              className="px-3 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Clear search"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
          {speech.supported && (
            <button
              type="button"
              onClick={convActive ? stopConversation : startConversation}
              aria-label={convActive ? 'End voice conversation' : 'Start voice search'}
              className={[
                'flex items-center justify-center px-3 transition-colors',
                convActive ? 'text-red-500 hover:text-red-600' : 'text-gray-400 hover:text-brand-600',
              ].join(' ')}
            >
              {convActive ? (
                <span className="relative flex h-5 w-5 items-center justify-center">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-60" />
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                    <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4Zm-1.5 14.9A7.01 7.01 0 0 1 5 9H3a9 9 0 0 0 8 8.94V20H8v2h8v-2h-3v-2.06A9 9 0 0 0 21 9h-2a7 7 0 0 1-7 7 6.98 6.98 0 0 1-1.5-.1Z" />
                  </svg>
                </span>
              ) : (
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4Zm-1.5 14.9A7.01 7.01 0 0 1 5 9H3a9 9 0 0 0 8 8.94V20H8v2h8v-2h-3v-2.06A9 9 0 0 0 21 9h-2a7 7 0 0 1-7 7 6.98 6.98 0 0 1-1.5-.1Z" />
                </svg>
              )}
            </button>
          )}
          <button
            type="submit"
            aria-label={isDescribe ? 'Search with AI' : 'Search'}
            disabled={interpreting}
            className={[
              'flex items-center gap-2 px-7 font-semibold text-white transition disabled:opacity-70',
              isDescribe ? 'bg-violet-600 hover:bg-violet-700' : 'bg-brand-600 hover:bg-brand-700',
            ].join(' ')}
          >
            {interpreting ? (
              <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
                <circle cx="11" cy="11" r="7" />
                <path d="m20 20-3.5-3.5" strokeLinecap="round" />
              </svg>
            )}
            <span className="hidden sm:inline">Search</span>
          </button>
        </form>
      )}

      {/* Autocomplete dropdown */}
      {open && suggestions.length > 0 && mode === 'location' && (
        <SuggestionList
          id="search-suggestions"
          suggestions={suggestions}
          activeIdx={activeIdx}
          onSelect={navigate}
          onHover={setActiveIdx}
        />
      )}
      {speech.error && (
        <MicError error={speech.error} onDismiss={speech.clearError} onRetry={() => { speech.clearError(); speech.start(); }} />
      )}
    </div>
  );
}

// ── Mic error banner ─────────────────────────────────────────────────────────
function MicError({ error, onDismiss, onRetry }: { error: SpeechError; onDismiss: () => void; onRetry: () => void }) {
  if (!error) return null;
  const isBlocked = error === 'not-allowed';
  return (
    <div
      role="alert"
      className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-red-100 bg-red-50 px-4 py-3 shadow-sm"
    >
      <div className="flex items-start gap-2.5">
        <svg viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0 text-red-400" aria-hidden="true">
          <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-8-5a.75.75 0 0 1 .75.75v4.5a.75.75 0 0 1-1.5 0v-4.5A.75.75 0 0 1 10 5Zm0 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2Z" clipRule="evenodd" />
        </svg>
        <div className="flex-1">
          <p className="text-sm text-red-700">
            {isBlocked
              ? 'Microphone blocked for this site.'
              : error === 'no-speech' ? 'No speech detected.' : 'Voice search failed.'}
          </p>
          {isBlocked && (
            <p className="mt-0.5 text-xs text-red-500">
              Click the icon at the left of your address bar → Site settings → Microphone → Allow, then click the mic button again.
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!isBlocked && (
            <button type="button" onClick={onRetry} className="text-xs font-semibold text-red-600 hover:text-red-800 underline underline-offset-2">
              Try again
            </button>
          )}
          <button type="button" onClick={onDismiss} className="text-red-400 hover:text-red-600" aria-label="Dismiss">
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Shared suggestion list ───────────────────────────────────────────────────
function SuggestionList({
  id,
  suggestions,
  activeIdx,
  onSelect,
  onHover,
}: {
  id: string;
  suggestions: Suggestion[];
  activeIdx: number;
  onSelect: (s: Suggestion) => void;
  onHover: (i: number) => void;
}) {
  return (
    <ul
      id={id}
      role="listbox"
      aria-label="Search suggestions"
      className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg"
    >
      {suggestions.map((s, i) => (
        <li
          key={i}
          id={`${id}-${i}`}
          role="option"
          aria-selected={i === activeIdx}
          onMouseDown={() => onSelect(s)}
          onMouseEnter={() => onHover(i)}
          className={`flex cursor-pointer items-center gap-3 px-4 py-3 text-sm transition-colors ${
            i === activeIdx ? 'bg-brand-50' : 'hover:bg-gray-50'
          }`}
        >
          {s.type === 'city' ? (
            <svg className="h-4 w-4 shrink-0 text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ) : (
            <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          )}
          <span className="truncate text-gray-800">{s.label}</span>
          <span className={`ml-auto shrink-0 rounded px-1.5 py-0.5 text-xs font-medium ${
            s.type === 'listing' ? 'bg-brand-50 text-brand-700' : 'text-gray-400'
          }`}>
            {s.type === 'city' ? 'City' : s.type === 'listing' ? 'Rental' : 'Address'}
          </span>
        </li>
      ))}
    </ul>
  );
}
