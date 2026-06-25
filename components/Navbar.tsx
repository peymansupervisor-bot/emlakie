'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import SignInModal from './SignInModal';
import { supabase } from '@/lib/supabase';

type AuthState = 'loading' | 'out' | 'in';

const navLinks = [
  { href: '/rentals', label: 'Browse Rentals' },
  { href: '/rent-estimate', label: 'Rent Estimate' },
  { href: '/blog', label: 'Blog' },
];

export default function Navbar() {
  const [auth, setAuth] = useState<AuthState>('out');
  const [mobileOpen, setMobileOpen] = useState(false);
  // 'listing' opens the "Start Listing" choice modal; 'signin' opens the sign-in flow
  const [modal, setModal] = useState<'listing' | 'signin' | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session ? 'in' : 'out');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuth(session ? 'in' : 'out');
    });
    return () => subscription.unsubscribe();
  }, []);

  function closeMobile() { setMobileOpen(false); }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
        >
          {/* Logo */}
          <Link href="/" aria-label="EMLAKIE home" className="shrink-0">
            <Logo />
          </Link>

          {/* Desktop centre links */}
          <div className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop right CTAs — auth-aware */}
          <div className="hidden items-center gap-3 md:flex">
            {auth === 'in' ? (
              <>
                <Link
                  href="/landlord"
                  className="rounded-lg px-4 py-2 text-sm font-medium text-gray-600 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  My Rentals
                </Link>
                <Link
                  href="/landlord/properties/new"
                  className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  + New Listing
                </Link>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setModal('signin')}
                  className="text-sm font-medium text-gray-500 transition hover:text-gray-900"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setModal('listing')}
                  className="rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700"
                >
                  List Property FREE
                </button>
              </>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex items-center gap-2 md:hidden">
            {auth === 'in' ? (
              <Link
                href="/landlord/properties/new"
                className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
              >
                + New Listing
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setModal('listing')}
                className="rounded-lg bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
              >
                List Free
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
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
          <div className="border-t border-gray-100 bg-white px-4 pb-5 md:hidden">
            <nav className="flex flex-col gap-1 pt-3">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={closeMobile}
                  className="rounded-lg px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
                >
                  {l.label}
                </Link>
              ))}

              <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
                {auth === 'in' ? (
                  <>
                    <Link
                      href="/landlord"
                      onClick={closeMobile}
                      className="flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      My Rentals
                    </Link>
                    <Link
                      href="/landlord/properties/new"
                      onClick={closeMobile}
                      className="flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                    >
                      + New Listing
                    </Link>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => { closeMobile(); setModal('listing'); }}
                      className="flex w-full items-center justify-center rounded-xl bg-brand-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-brand-700"
                    >
                      List Property FREE
                    </button>
                    <button
                      type="button"
                      onClick={() => { closeMobile(); setModal('signin'); }}
                      className="flex w-full items-center justify-center rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </header>

      {/* Listing onboarding modal */}
      <SignInModal
        open={modal === 'listing'}
        onClose={() => setModal(null)}
        initialStep="choice"
        next="/landlord/properties/new"
        title="Start Listing Your Property"
        subtitle="Create your free account and publish your rental in under 5 minutes."
        primaryLabel="Create Free Account"
      />

      {/* Sign-in modal */}
      <SignInModal
        open={modal === 'signin'}
        onClose={() => setModal(null)}
        initialStep="login"
        next="/landlord"
      />
    </>
  );
}
