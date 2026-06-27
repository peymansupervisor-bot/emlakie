'use client';

import { useEffect, useRef } from 'react';
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

  // Track whether the session was ever opened so we don't dispatch CLOSE on
  // initial mount (state machine would transition idle → closed unnecessarily).
  const sessionStartedRef = useRef(false);

  useEffect(() => {
    if (open) {
      sessionStartedRef.current = true;
      openSession();
    } else if (sessionStartedRef.current) {
      closeSession();
    }
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
