'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const acceptRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const consent = localStorage.getItem('emlakie_cookie_consent');
    if (!consent) setVisible(true);
  }, []);

  useEffect(() => {
    if (visible) acceptRef.current?.focus();
  }, [visible]);

  function accept() {
    localStorage.setItem('emlakie_cookie_consent', 'accepted');
    // Let analytics start immediately on accept, without requiring a reload.
    window.dispatchEvent(new Event('emlakie-consent-changed'));
    setVisible(false);
  }

  function decline() {
    localStorage.setItem('emlakie_cookie_consent', 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6"
      style={{ pointerEvents: 'none' }}
    >
      <div
        role="dialog"
        aria-label="Cookie consent"
        aria-modal="true"
        className="max-w-3xl mx-auto rounded-2xl shadow-2xl flex flex-col sm:flex-row items-start sm:items-center gap-4 px-6 py-5"
        style={{
          background: '#fff',
          border: '1px solid #e5e7eb',
          boxShadow: '0 8px 40px rgba(0,0,0,0.13)',
          pointerEvents: 'auto',
        }}
      >
        {/* Icon */}
        <span className="text-2xl flex-shrink-0" aria-hidden="true">🍪</span>

        {/* Text */}
        <p className="flex-1 text-sm text-gray-600 leading-relaxed">
          We use essential cookies to keep this site running. By continuing, you agree to our{' '}
          <Link href="/privacy" className="underline font-medium" style={{ color: '#16a34a' }}>
            Privacy Policy
          </Link>
          .
        </p>

        {/* Buttons */}
        <div className="flex gap-3 flex-shrink-0">
          <button
            onClick={decline}
            className="text-sm px-4 py-2 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Decline
          </button>
          <button
            ref={acceptRef}
            onClick={accept}
            className="text-sm px-5 py-2 rounded-lg font-semibold text-white transition-colors"
            style={{ background: '#16a34a' }}
            onMouseOver={e => (e.currentTarget.style.background = '#15803d')}
            onMouseOut={e => (e.currentTarget.style.background = '#16a34a')}
          >
            Accept
          </button>
        </div>
      </div>
    </div>
  );
}
