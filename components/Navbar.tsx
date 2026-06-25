'use client';

import Link from 'next/link';
import { useState } from 'react';
import Logo from './Logo';
import SignInModal from './SignInModal';

const navLinks = [
  { href: '/rentals', label: 'Browse Rentals' },
  { href: '/rent-estimate', label: 'E-rent Value™' },
  { href: '/rent-check', label: 'Rent Check' },
  { href: '/blog', label: 'Blog' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
        <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">

          {/* Logo */}
          <Link href="/" aria-label="EMLAKIE home" className="shrink-0">
            <Logo />
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
              >
                {l.label}
              </Link>
            ))}
            <Link
              href="/landlord"
              className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Dashboard
            </Link>
          </div>

          {/* Desktop CTAs */}
          <div className="hidden items-center gap-3 md:flex">
            <button
              type="button"
              onClick={() => setSignInOpen(true)}
              className="text-sm font-semibold text-gray-600 transition hover:text-gray-900"
            >
              Sign In
            </button>
            <Link
              href="/landlord/login"
              className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-brand-700"
            >
              List Property FREE
            </Link>
          </div>

          {/* Mobile: primary CTA + hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/landlord/login"
              className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-brand-700"
            >
              List Free
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
            >
              {mobileOpen ? (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="border-t border-gray-100 bg-white px-4 pb-4 md:hidden">
            <nav className="flex flex-col gap-1 pt-2">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {l.label}
                </Link>
              ))}
              <Link
                href="/landlord"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                Landlord Dashboard
              </Link>
              <Link
                href="/for-landlords"
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-4 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                For Landlords
              </Link>
              <div className="mt-2 flex flex-col gap-2 border-t border-gray-100 pt-3">
                <Link
                  href="/landlord/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-bold text-white transition hover:bg-brand-700"
                >
                  List Property FREE
                </Link>
                <button
                  type="button"
                  onClick={() => { setMobileOpen(false); setSignInOpen(true); }}
                  className="flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Sign In
                </button>
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Sign-in modal */}
      <SignInModal
        open={signInOpen}
        onClose={() => setSignInOpen(false)}
        initialStep="login"
        next="/landlord"
      />
    </>
  );
}
