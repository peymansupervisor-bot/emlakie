import { sendGAEvent } from '@next/third-parties/google';

// Thin wrapper around GA4 events. Safe no-op when GA isn't loaded — i.e. cookie
// consent was declined or NEXT_PUBLIC_GA_ID isn't set — so call sites never need
// to guard. Only call from client-side event handlers.
export function trackEvent(name: string, params: Record<string, unknown> = {}): void {
  try {
    sendGAEvent('event', name, params);
  } catch {
    /* GA not loaded — ignore */
  }
}
