'use client';

import { useEffect, useState } from 'react';
import { GoogleAnalytics as NextGoogleAnalytics } from '@next/third-parties/google';

// Loads Google Analytics 4 ONLY after the visitor accepts cookies (the cookie
// banner stores 'emlakie_cookie_consent'). If they decline, GA never loads.
// No-ops entirely when NEXT_PUBLIC_GA_ID is unset, so it's safe to ship before
// the Measurement ID is configured.
export default function GoogleAnalytics() {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;
  const [consented, setConsented] = useState(false);

  useEffect(() => {
    const check = () => {
      try { setConsented(localStorage.getItem('emlakie_cookie_consent') === 'accepted'); } catch { /* ignore */ }
    };
    check();
    // React to the user accepting in this session, or in another tab.
    window.addEventListener('emlakie-consent-changed', check);
    window.addEventListener('storage', check);
    return () => {
      window.removeEventListener('emlakie-consent-changed', check);
      window.removeEventListener('storage', check);
    };
  }, []);

  if (!gaId || !consented) return null;
  return <NextGoogleAnalytics gaId={gaId} />;
}
