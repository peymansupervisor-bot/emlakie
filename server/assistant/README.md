# server/assistant/

This directory will contain the **persistent WebSocket server** that manages
OpenAI Realtime API sessions for the Emlakie AI Leasing Assistant.

## Why a separate server directory?

Next.js serverless functions cannot maintain persistent WebSocket connections
(required for OpenAI Realtime API bidirectional audio streaming). The WebSocket
server runs as a separate long-lived process — deployed to Fly.io or Railway in
Phase 1B, with a migration path to Vercel native WebSockets when that matures.

## What will live here (Phase 1B+)

```
server/assistant/
├── ws-server.ts          # Entry point — WebSocket server bootstrap
├── session-manager.ts    # Per-connection session lifecycle
├── audio-bridge.ts       # Bidirectional PCM audio relay (browser ↔ OpenAI)
├── function-executor.ts  # Executes tool calls from OpenAI Realtime
├── context-engine.ts     # Claude system prompt generation + session enrichment
└── README.md             # This file
```

## Phase 1A status

No source files exist yet. Folder is created in Phase 1A to establish the
correct directory structure before implementation begins.

## Deployment model

The WebSocket server shares no runtime with the Next.js app. It communicates
with Supabase directly using the service role key. It has no dependency on
Next.js APIs, React, or any frontend framework.
