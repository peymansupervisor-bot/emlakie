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
  // Holds the typed query from SearchBar until the session useEffect picks it up.
  const pendingContextRef = useRef<string | null>(null);

  // Listen for the custom event fired by SearchBar's "Talk to Emlakie" button.
  // detail.query carries any text the user had typed before clicking, so the
  // model can respond to it immediately without asking "Which city?" again.
  useEffect(() => {
    function handleOpenRequest(e: Event) {
      const query = (e as CustomEvent<{ query?: string }>).detail?.query;
      if (!open) openPanel();
      // Store typed context so it can be passed when the session actually opens.
      // We use a ref to avoid stale closure issues — the session opens in a
      // separate useEffect triggered by the `open` state change.
      pendingContextRef.current = query?.trim() || null;
    }
    window.addEventListener('emlakie:open-assistant', handleOpenRequest);
    return () => window.removeEventListener('emlakie:open-assistant', handleOpenRequest);
  }, [open, openPanel]);

  useEffect(() => {
    if (open) {
      sessionStartedRef.current = true;
      const ctx = pendingContextRef.current ?? undefined;
      pendingContextRef.current = null;
      openSession(ctx);
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
