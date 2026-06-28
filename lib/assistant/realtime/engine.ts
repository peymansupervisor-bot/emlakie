/**
 * RealtimeEngine — shared WebRTC + OpenAI Realtime session logic.
 *
 * Used by both the production assistant (hooks/assistant/useRealtimeSession.ts)
 * and the diagnostic lab (hooks/assistant/realtime-lab/useRealtimeLab.ts).
 *
 * Not a React component or hook — no React imports needed.
 * Only instantiated client-side inside hooks that are already 'use client'.
 *
 * Security: OPENAI_API_KEY stays server-side. The engine fetches a short-lived
 * ephemeral token from our own API route and uses it for the SDP exchange.
 * No user transcript content is logged — only event types and numeric latencies.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface RealtimeEngineVadConfig {
  type: 'server_vad';
  threshold: number;
  prefix_padding_ms: number;
  silence_duration_ms: number;
}

export interface RealtimeEngineConfig {
  /** Our API route that issues the ephemeral token. */
  tokenUrl: string;
  /** OpenAI SDP exchange endpoint. */
  realtimeUrl: string;
  vadConfig: RealtimeEngineVadConfig;
  voice: string;
  /**
   * When true, sends response.create after setup to trigger an initial
   * model greeting. Use for production; leave false in the lab.
   */
  sendGreetingOnConnect?: boolean;
}

export interface RealtimeEngineCallbacks {
  /** Microphone permission granted and stream is live. */
  onMicGranted?(): void;
  /** SDP exchange complete; waiting for session.created on data channel. */
  onConnecting?(): void;
  /** Two-phase VAD setup complete; session is ready for conversation. */
  onConnected?(): void;
  /** Engine was cleanly stopped (via disconnect()). */
  onDisconnected?(): void;
  /** Any error — code is safe to log/display (never contains user content). */
  onError?(code: string, message?: string): void;

  /** session.created received (diagnostic hook). */
  onSessionCreated?(): void;
  /**
   * session.updated received.
   * isSetup=true on the first update (two-phase setup); false on subsequent.
   */
  onSessionUpdated?(isSetup: boolean): void;

  /** VAD: user started speaking. interrupted=true if assistant was mid-response. */
  onSpeechStarted?(interrupted: boolean): void;
  /** VAD: user stopped speaking. */
  onSpeechStopped?(): void;

  /** Whisper transcription complete. language is null if field is absent. */
  onTranscriptionCompleted?(language: string | null): void;

  /** OpenAI started generating a response. */
  onResponseCreated?(): void;
  /**
   * First audio chunk received. latencyMs is time from speech_stopped to this
   * chunk; null if speech_stopped wasn't captured (e.g. model-initiated turn).
   */
  onResponseAudioFirstChunk?(latencyMs: number | null): void;
  /** Response audio stream ended. */
  onResponseAudioDone?(): void;
  /** Full response complete (all modalities). */
  onResponseDone?(): void;
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

export class RealtimeEngine {
  private pc: RTCPeerConnection | null = null;
  private dc: RTCDataChannel | null = null;
  private stream: MediaStream | null = null;
  private setupComplete = false;
  private speechStoppedAt: number | null = null;
  private isRespondingAudio = false;

  constructor(
    private readonly audioRef: { current: HTMLAudioElement | null },
    private readonly config: RealtimeEngineConfig,
    private readonly cb: RealtimeEngineCallbacks,
  ) {}

  // -------------------------------------------------------------------------
  // Public API
  // -------------------------------------------------------------------------

  async connect(): Promise<void> {
    // Step 1: Microphone
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      const code =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'mic_permission_denied'
          : 'mic_unavailable';
      this.cb.onError?.(code);
      return;
    }
    this.stream = stream;
    this.cb.onMicGranted?.();

    // Step 2: Ephemeral token
    let ephemeralKey: string;
    try {
      const res = await fetch(this.config.tokenUrl, { method: 'POST' });
      if (!res.ok) throw new Error(`status_${res.status}`);
      const data = (await res.json()) as { value?: string; error?: string; detail?: string };
      if (!data.value) {
        const detail = data.detail ? ` (${data.detail})` : '';
        throw new Error(data.error ? `${data.error}${detail}` : 'no_ephemeral_key');
      }
      ephemeralKey = data.value;
    } catch (err) {
      stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
      this.cb.onError?.(
        err instanceof Error ? err.message.slice(0, 80) : 'token_error',
      );
      return;
    }

    // Step 3: RTCPeerConnection
    let pc: RTCPeerConnection;
    try {
      pc = new RTCPeerConnection();
    } catch {
      stream.getTracks().forEach((t) => t.stop());
      this.stream = null;
      this.cb.onError?.('webrtc_unsupported');
      return;
    }
    this.pc = pc;

    pc.ontrack = (ev: RTCTrackEvent) => {
      if (this.audioRef.current) {
        this.audioRef.current.srcObject = ev.streams[0];
      }
    };

    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    const dc = pc.createDataChannel('oai-events');
    this.dc = dc;

    dc.onmessage = (ev: MessageEvent) => {
      if (typeof ev.data === 'string') this.handleEvent(ev.data);
    };

    dc.onerror = () => this.cb.onError?.('datachannel_error');

    // Step 4: SDP exchange
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);

      const sdpRes = await fetch(this.config.realtimeUrl, {
        method: 'POST',
        body: offer.sdp,
        headers: {
          Authorization: `Bearer ${ephemeralKey}`,
          'Content-Type': 'application/sdp',
        },
      });

      if (!sdpRes.ok) throw new Error(`sdp_exchange_${sdpRes.status}`);

      const answerSdp = await sdpRes.text();
      await pc.setRemoteDescription({ type: 'answer', sdp: answerSdp });
      this.cb.onConnecting?.();
    } catch (err) {
      this.cleanupResources();
      this.cb.onError?.(
        err instanceof Error ? err.message.slice(0, 80) : 'sdp_error',
      );
    }
  }

  /** Cleanly stop the session. Safe to call multiple times. */
  disconnect(): void {
    this.cleanupResources();
    this.cb.onDisconnected?.();
  }

  // -------------------------------------------------------------------------
  // Session setup
  // -------------------------------------------------------------------------

  private sendPhase1Setup(): void {
    const dc = this.dc;
    if (!dc || dc.readyState !== 'open') return;
    dc.send(
      JSON.stringify({
        type: 'session.update',
        session: {
          type: 'realtime',
          output_modalities: ['audio'],
          audio: {
            input: {
              turn_detection: { ...this.config.vadConfig, create_response: false },
            },
            output: { voice: this.config.voice },
          },
        },
      }),
    );
  }

  private sendPhase2Setup(): void {
    const dc = this.dc;
    if (!dc || dc.readyState !== 'open') return;
    dc.send(
      JSON.stringify({
        type: 'session.update',
        session: {
          type: 'realtime',
          audio: {
            input: {
              turn_detection: { ...this.config.vadConfig, create_response: true },
            },
          },
        },
      }),
    );
  }

  private triggerGreeting(): void {
    const dc = this.dc;
    if (!dc || dc.readyState !== 'open') return;
    dc.send(JSON.stringify({ type: 'response.create' }));
  }

  // -------------------------------------------------------------------------
  // Event handling
  // -------------------------------------------------------------------------

  private handleEvent(raw: string): void {
    let event: Record<string, unknown>;
    try {
      event = JSON.parse(raw) as Record<string, unknown>;
    } catch {
      return;
    }

    const type = typeof event.type === 'string' ? event.type : 'unknown';

    switch (type) {
      case 'session.created':
        this.sendPhase1Setup();
        this.cb.onSessionCreated?.();
        break;

      case 'session.updated':
        if (!this.setupComplete) {
          this.setupComplete = true;
          const dc = this.dc;
          if (dc && dc.readyState === 'open') {
            dc.send(JSON.stringify({ type: 'input_audio_buffer.clear' }));
            this.sendPhase2Setup();
            if (this.config.sendGreetingOnConnect) {
              // Small delay so phase-2 update is applied before greeting
              setTimeout(() => this.triggerGreeting(), 300);
            }
          }
          this.cb.onSessionUpdated?.(true);
          this.cb.onConnected?.();
        } else {
          this.cb.onSessionUpdated?.(false);
        }
        break;

      case 'input_audio_buffer.speech_started':
        this.cb.onSpeechStarted?.(this.isRespondingAudio);
        break;

      case 'input_audio_buffer.speech_stopped':
        this.speechStoppedAt = Date.now();
        this.cb.onSpeechStopped?.();
        break;

      case 'response.created':
        this.cb.onResponseCreated?.();
        break;

      case 'response.audio.delta':
        if (!this.isRespondingAudio) {
          this.isRespondingAudio = true;
          const latency =
            this.speechStoppedAt !== null ? Date.now() - this.speechStoppedAt : null;
          this.speechStoppedAt = null;
          this.cb.onResponseAudioFirstChunk?.(latency);
        }
        break;

      case 'response.audio.done':
        this.isRespondingAudio = false;
        this.cb.onResponseAudioDone?.();
        break;

      case 'response.done':
        this.cb.onResponseDone?.();
        break;

      case 'conversation.item.input_audio_transcription.completed': {
        const lang =
          typeof event.language === 'string' ? event.language : null;
        this.cb.onTranscriptionCompleted?.(lang);
        break;
      }

      case 'error': {
        const errObj = event.error as Record<string, unknown> | undefined;
        const code =
          typeof errObj?.code === 'string' ? errObj.code : 'unknown_error';
        const message =
          typeof errObj?.message === 'string' ? errObj.message : undefined;
        // Safe to log: code and message describe API errors, not user speech
        console.error('[realtime-engine] OpenAI error:', { code, message });
        this.cb.onError?.(code, message);
        break;
      }

      default:
        break;
    }
  }

  // -------------------------------------------------------------------------
  // Internal cleanup
  // -------------------------------------------------------------------------

  private cleanupResources(): void {
    this.dc?.close();
    this.dc = null;
    this.pc?.close();
    this.pc = null;
    this.stream?.getTracks().forEach((t) => t.stop());
    this.stream = null;
    if (this.audioRef.current) this.audioRef.current.srcObject = null;
    this.setupComplete = false;
    this.speechStoppedAt = null;
    this.isRespondingAudio = false;
  }
}
