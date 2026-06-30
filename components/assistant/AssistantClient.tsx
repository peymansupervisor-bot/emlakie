'use client';

import { useEffect, useRef, useCallback } from 'react';
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
    sessionState,
    displayState,
    recommendations,
    activeFilters,
    open: openSession,
    close: closeSession,
    cancel,
  } = useRealtimeSession(audioRef);

  const errorCode = sessionState.phase === 'error' ? sessionState.code : undefined;

  const sessionStartedRef = useRef(false);
  const closePanelTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (open) {
      sessionStartedRef.current = true;
      openSession();
    } else if (sessionStartedRef.current) {
      closeSession();
    }
  }, [open, openSession, closeSession]);

  // Clear any pending close-panel timer on unmount
  useEffect(() => {
    return () => {
      if (closePanelTimerRef.current) clearTimeout(closePanelTimerRef.current);
    };
  }, []);

  // Disconnect immediately; keep panel visible for 1.5s so the user sees "Session ended"
  const handleClose = useCallback(() => {
    closeSession();
    if (closePanelTimerRef.current) clearTimeout(closePanelTimerRef.current);
    closePanelTimerRef.current = setTimeout(() => {
      closePanelTimerRef.current = null;
      closePanel();
    }, 1500);
  }, [closeSession, closePanel]);

  return (
    <>
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} autoPlay />

      <AssistantLauncher
        onClick={open ? handleClose : openPanel}
        panelOpen={open}
        displayState={displayState}
        buttonRef={launcherRef}
      />
      <AssistantPanel
        open={open}
        displayState={displayState}
        onClose={handleClose}
        onCancel={cancel}
        panelRef={panelRef}
        recommendations={recommendations}
        activeFilters={activeFilters ?? undefined}
        errorCode={errorCode}
      />
    </>
  );
}
