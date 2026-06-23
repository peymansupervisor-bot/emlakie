'use client';

import { useEffect } from 'react';

interface ReportPayload {
  source: string;
  message: string;
  details?: string;
  user_id?: string;
  endpoint?: string;
  http_status?: number;
  context?: Record<string, unknown>;
}

function send(payload: ReportPayload) {
  // Use sendBeacon so it fires even during page unload
  const data = JSON.stringify(payload);
  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/diagnostics/log', new Blob([data], { type: 'application/json' }));
  } else {
    fetch('/api/diagnostics/log', { method: 'POST', body: data, headers: { 'Content-Type': 'application/json' }, keepalive: true }).catch(() => {});
  }
}

export function reportError(payload: ReportPayload) {
  send(payload);
}

interface Props {
  userId?: string;
}

export default function ErrorReporter({ userId }: Props) {
  useEffect(() => {
    // Unhandled JS exceptions
    const onError = (event: ErrorEvent) => {
      send({
        source: 'Client JS',
        message: event.message || 'Unhandled error',
        details: event.error?.stack,
        user_id: userId,
        context: { file: event.filename, line: event.lineno, col: event.colno },
      });
    };

    // Unhandled promise rejections
    const onUnhandled = (event: PromiseRejectionEvent) => {
      const msg = event.reason instanceof Error
        ? event.reason.message
        : String(event.reason ?? 'Unhandled promise rejection');
      send({
        source: 'Client JS',
        message: msg,
        details: event.reason instanceof Error ? event.reason.stack : undefined,
        user_id: userId,
      });
    };

    window.addEventListener('error', onError);
    window.addEventListener('unhandledrejection', onUnhandled);
    return () => {
      window.removeEventListener('error', onError);
      window.removeEventListener('unhandledrejection', onUnhandled);
    };
  }, [userId]);

  return null;
}
