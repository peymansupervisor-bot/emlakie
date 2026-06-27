'use client';

import { useEffect } from 'react';
import { useAssistantPanel } from '@/hooks/assistant/useAssistantPanel';
import { useAssistantSession } from '@/hooks/assistant/useAssistantSession';
import AssistantLauncher from './AssistantLauncher';
import AssistantPanel from './AssistantPanel';

/**
 * Client-side root of the AI Leasing Assistant.
 *
 * Imported by AssistantShell (server component) which guards the feature flag.
 * This component is only mounted when ENABLE_AI_ASSISTANT=true.
 *
 * Phase 1C: useAssistantSession drives state via MockTransport.
 * Phase 1D: Replace MockTransport inside useAssistantSession — this file unchanged.
 */
export default function AssistantClient() {
  const { open, openPanel, closePanel, launcherRef, panelRef } =
    useAssistantPanel();

  const {
    displayState,
    messages,
    recommendations,
    inputEnabled,
    open: openSession,
    close: closeSession,
    sendMessage,
  } = useAssistantSession();

  // When the panel opens, start the session; when it closes, end it.
  useEffect(() => {
    if (open) {
      openSession();
    } else {
      closeSession();
    }
    // openSession / closeSession are stable useCallback refs — safe to list
  }, [open, openSession, closeSession]);

  return (
    <>
      <AssistantLauncher
        onClick={open ? closePanel : openPanel}
        panelOpen={open}
        displayState={displayState}
        buttonRef={launcherRef}
      />
      <AssistantPanel
        open={open}
        displayState={displayState}
        messages={messages}
        recommendations={recommendations}
        inputEnabled={inputEnabled}
        onClose={closePanel}
        onSendMessage={sendMessage}
        panelRef={panelRef}
      />
    </>
  );
}
