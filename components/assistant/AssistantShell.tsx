/**
 * Server component — reads ENABLE_AI_ASSISTANT and either renders nothing
 * or mounts the client-side assistant shell.
 *
 * No 'use client' directive — this is a React Server Component. It can read
 * process.env directly. When the flag is false, zero bytes of assistant JS
 * are included in the page's client bundle.
 *
 * Usage: add <AssistantShell /> to app/layout.tsx inside <body>.
 */

import { ASSISTANT_ENABLED } from '@/lib/assistant/config';
import AssistantClient from './AssistantClient';

export default function AssistantShell() {
  if (!ASSISTANT_ENABLED) return null;
  return <AssistantClient />;
}
