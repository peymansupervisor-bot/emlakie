'use client';

import { useAssistantPanel } from '@/hooks/assistant/useAssistantPanel';
import AssistantLauncher from './AssistantLauncher';
import AssistantPanel from './AssistantPanel';

/**
 * Client-side root of the AI Leasing Assistant.
 *
 * Imported by AssistantShell (server component) which guards the feature flag.
 * This component is only mounted when ENABLE_AI_ASSISTANT=true.
 *
 * Phase 1B: Shell only — no audio, AI, WebSocket, or API connections.
 */
export default function AssistantClient() {
  const { open, assistantState, openPanel, closePanel, launcherRef, panelRef } =
    useAssistantPanel();

  return (
    <>
      <AssistantLauncher
        onClick={open ? closePanel : openPanel}
        panelOpen={open}
        assistantState={assistantState}
        buttonRef={launcherRef}
      />
      <AssistantPanel
        open={open}
        assistantState={assistantState}
        onClose={closePanel}
        panelRef={panelRef}
      />
    </>
  );
}
