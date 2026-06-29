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
 *
 * Function call flow (Phase 3+):
 *   1. Model sends response with type=function_call output item
 *   2. Engine accumulates arguments via response.function_call_arguments.delta
 *   3. On response.done (function-call response): engine POSTs to functionCallUrl
 *   4. Engine calls onFunctionCallResult with the result (for UI rendering)
 *   5. Engine sends conversation.item.create + response.create to continue
 *
 * Extension: to add new tools (compare_listings, save_listing, schedule_tour,
 * explain_listing), add cases to executeFunctionCall() below.
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
  /**
   * Tool definitions to register with the Realtime session.
   * Passed as-is in the session.update tools array.
   * Leave undefined for the lab (no function calls).
   */
  tools?: readonly unknown[];
  /**
   * Base URL for server-side function call execution.
   * Defaults to '/api/assistant/search' for search_listings.
   * Override in tests.
   */
  functionCallUrl?: string;
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

  /** OpenAI started generating an audio response (not a function call). */
  onResponseCreated?(): void;
  /**
   * First audio chunk received. latencyMs is time from speech_stopped to this
   * chunk; null if speech_stopped wasn't captured (e.g. model-initiated turn).
   */
  onResponseAudioFirstChunk?(latencyMs: number | null): void;
  /** Response audio stream ended. */
  onResponseAudioDone?(): void;
  /** Full audio response complete. Not fired for function-call-only responses. */
  onResponseDone?(): void;

  /**
   * A server-side function call completed and returned results.
   * The hook uses this to update the UI recommendations state.
   * `name` is the function name; `result` is the parsed JSON response.
   */
  onFunctionCallResult?(name: string, result: unknown): void;
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
  private isResponseActive = false;
  private micTrack: MediaStreamTrack | null = null;

  // Function call state — tracks the current response's function call, if any
  private fcCallId: string | null = null;
  private fcName: string | null = null;
  private fcArgsBuffer = '';
  private currentResponseIsFunctionCall = false;

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
      stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    } catch (err) {
      const code =
        err instanceof Error && err.name === 'NotAllowedError'
          ? 'mic_permission_denied'
          : 'mic_unavailable';
      this.cb.onError?.(code);
      return;
    }
    this.stream = stream;
    this.micTrack = stream.getAudioTracks()[0] ?? null;
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

      if (!sdpRes.ok) {
        let oaiCode = '';
        try {
          const errBody = (await sdpRes.json()) as { error?: { code?: string; message?: string } };
          oaiCode = errBody?.error?.code ?? errBody?.error?.message ?? '';
        } catch { /* body was not JSON (e.g. plain text SDP error) */ }
        throw new Error(`sdp_exchange_${sdpRes.status}${oaiCode ? `:${oaiCode}` : ''}`);
      }

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

  /** Cancel the model's current audio response and return to listening. */
  cancel(): void {
    const dc = this.dc;
    if (dc && dc.readyState === 'open') {
      dc.send(JSON.stringify({ type: 'response.cancel' }));
    }
    if (this.audioRef.current) {
      // Pause audio but keep srcObject — nulling it breaks the WebRTC pipeline
      // and prevents subsequent responses from playing.
      this.audioRef.current.pause();
    }
    this.isRespondingAudio = false;
    // Unmute mic immediately so user can speak after cancelling
    if (this.micTrack) this.micTrack.enabled = true;
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

    const session: Record<string, unknown> = {
      type: 'realtime',
      audio: {
        input: {
          // create_response stays false — we send explicit response.create after
          // every user turn via onSpeechStopped. This prevents OpenAI from
          // auto-firing responses to mic noise or the model's own echo.
          turn_detection: { ...this.config.vadConfig, create_response: false },
        },
      },
    };

    if (this.config.tools && this.config.tools.length > 0) {
      session.tools = this.config.tools;
      session.tool_choice = 'auto';
    }

    dc.send(JSON.stringify({ type: 'session.update', session }));
  }

  private triggerGreeting(): void {
    const dc = this.dc;
    if (!dc || dc.readyState !== 'open') return;
    dc.send(JSON.stringify({ type: 'response.create' }));
  }

  // -------------------------------------------------------------------------
  // Function call execution
  // -------------------------------------------------------------------------

  private async executeFunctionCall(callId: string, name: string, argsJson: string): Promise<void> {
    let result: unknown;

    try {
      let args: Record<string, unknown>;
      try {
        args = JSON.parse(argsJson) as Record<string, unknown>;
      } catch {
        args = {};
      }

      if (name === 'search_listings') {
        const url = this.config.functionCallUrl ?? '/api/assistant/search';
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(args),
        });

        if (!res.ok) {
          result = { error: `search_failed_${res.status}`, shown: 0, total: 0, speakCount: 0, results: [] };
        } else {
          result = await res.json();
          // Notify the hook immediately so UI cards appear before the model speaks
          this.cb.onFunctionCallResult?.(name, result);
        }
      } else {
        // Placeholder for future tools: compare_listings, explain_listing,
        // save_listing, schedule_tour — add cases here without changing the
        // rest of the engine.
        result = { error: `unknown_function:${name}` };
      }
    } catch {
      result = { error: 'function_execution_error', shown: 0, total: 0, speakCount: 0, results: [] };
    }

    this.sendFunctionResult(callId, result);
  }

  private sendFunctionResult(callId: string, result: unknown): void {
    const dc = this.dc;
    if (!dc || dc.readyState !== 'open') return;

    dc.send(
      JSON.stringify({
        type: 'conversation.item.create',
        item: {
          type: 'function_call_output',
          call_id: callId,
          output: JSON.stringify(result),
        },
      }),
    );

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
        // Only send response.create if no response is currently active.
        // Sending it while a response is running causes the OpenAI error
        // "conversation_already_has_active_response" and triggers self-talk.
        if (this.dc && this.dc.readyState === 'open' && !this.isResponseActive) {
          this.dc.send(JSON.stringify({ type: 'response.create' }));
        }
        break;

      case 'response.created':
        // Mark response active immediately — mute mic now, not at first audio
        // chunk. The gap between response.created and response.audio.delta
        // (~300–500ms) is when model audio leaked into the mic and caused
        // VAD to fire speech_stopped, creating the self-talk loop.
        this.isResponseActive = true;
        if (this.micTrack) this.micTrack.enabled = false;
        this.currentResponseIsFunctionCall = false;
        this.fcCallId = null;
        this.fcName = null;
        this.fcArgsBuffer = '';
        break;

      case 'response.output_item.added': {
        const item = event.item as Record<string, unknown> | undefined;
        if (item?.type === 'function_call') {
          this.currentResponseIsFunctionCall = true;
          this.fcCallId = typeof item.call_id === 'string' ? item.call_id : null;
          this.fcName = typeof item.name === 'string' ? item.name : null;
          this.fcArgsBuffer = '';
        } else if (item?.type === 'message' && !this.currentResponseIsFunctionCall) {
          // This is an audio/text response — safe to emit onResponseCreated now
          this.cb.onResponseCreated?.();
        }
        break;
      }

      case 'response.function_call_arguments.delta': {
        const delta = typeof event.delta === 'string' ? event.delta : '';
        this.fcArgsBuffer += delta;
        break;
      }

      case 'response.function_call_arguments.done': {
        // Arguments are complete — update call_id and name from this event in
        // case they weren't set on output_item.added
        if (typeof event.call_id === 'string') this.fcCallId = event.call_id;
        if (typeof event.name === 'string') this.fcName = event.name;
        const finalArgs = typeof event.arguments === 'string' ? event.arguments : this.fcArgsBuffer;
        this.fcArgsBuffer = finalArgs;
        break;
      }

      case 'response.audio.delta':
        if (!this.isRespondingAudio) {
          this.isRespondingAudio = true;
          // Mute mic while model is speaking — prevents its voice from leaking
          // back into the VAD as user speech (echo loop) regardless of whether
          // the browser's echoCancellation handles WebRTC srcObject audio.
          if (this.micTrack) this.micTrack.enabled = false;
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
        // Response fully complete — unmute mic and clear active flag.
        // Unmuting here (not at response.audio.done) ensures the mic stays
        // muted for the full duration including any trailing processing.
        this.isResponseActive = false;
        if (this.micTrack) this.micTrack.enabled = true;
        if (this.currentResponseIsFunctionCall) {
          // Execute the function call and send result back to the model
          const callId = this.fcCallId;
          const name = this.fcName;
          const args = this.fcArgsBuffer;
          this.currentResponseIsFunctionCall = false;
          this.fcCallId = null;
          this.fcName = null;
          this.fcArgsBuffer = '';

          if (callId && name) {
            void this.executeFunctionCall(callId, name, args);
          }
        } else {
          this.cb.onResponseDone?.();
        }
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
    this.currentResponseIsFunctionCall = false;
    this.fcCallId = null;
    this.fcName = null;
    this.fcArgsBuffer = '';
  }
}
