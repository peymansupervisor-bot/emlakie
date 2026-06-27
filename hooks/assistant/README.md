# hooks/assistant/

React hooks for the Emlakie AI Leasing Assistant.

## Phase 1A status

No hooks exist yet. Folder created to establish structure.

## What will live here (Phase 1B+)

```
hooks/assistant/
├── useAssistantSession.ts    # WebSocket session lifecycle (open/close/reconnect)
├── useAudioCapture.ts        # Microphone capture + PCM streaming
├── useAudioPlayback.ts       # AudioContext playback of server-streamed audio
├── useAssistantState.ts      # UI state machine (idle→listening→processing→speaking)
├── useLanguageDetection.ts   # Reads detectedLanguage from session state
└── README.md
```

## Rules

- All hooks are client-only (`'use client'` implied by hook convention).
- Hooks must check `ASSISTANT_ENABLED` and return inert state when disabled.
- `useAudioCapture` must request microphone permission lazily (on user gesture only).
- No hook may store transcript text in component state after a session ends.
- `useAssistantState` is the single source of truth for `AssistantState` —
  no component manages this state independently.
