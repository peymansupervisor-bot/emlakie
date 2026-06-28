'use client';

import { useEffect, useRef } from 'react';
import { useAssistantPanel } from '@/hooks/assistant/useAssistantPanel';
import { useRealtimeSession } from '@/hooks/assistant/useRealtimeSession';
import AssistantLauncher from './AssistantLauncher';
import AssistantPanel from './AssistantPanel';

/**
 * Client-side root of the AI Leasing Assistant.
 *
 * Mounted only when ENABLE_AI_ASSISTANT=true (guarded by AssistantShell).
 * Owns the <audio> element that receives the assistant's voice output.
 */
export default function AssistantClient() {
  const audioRef = useRef<HTMLAudioElement>(null);

  const { open, openPanel, closePanel, launcherRef, panelRef } =
    useAssistantPanel();

  const {
    displayState,
    recommendations,
    open: openSession,
    close: closeSession,
    cancel,
  } = useRealtimeSession(audioRef);

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
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} autoPlay />

      <AssistantLauncher
        onClick={open ? closePanel : openPanel}
        panelOpen={open}
        displayState={displayState}
        buttonRef={launcherRef}
      />
      <AssistantPanel
        open={open}
        displayState={displayState}
        onClose={closePanel}
        onCancel={cancel}
        panelRef={panelRef}
        recommendations={recommendations}
      />
    </>
  );
}
