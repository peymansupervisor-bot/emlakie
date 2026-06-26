'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import Logo from './Logo';
import SignInModal from './SignInModal';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

type AuthState = 'loading' | 'out' | 'in';

const navLinks = [
  { href: '/rentals', label: 'Browse Rentals' },
  { href: '/rent-estimate', label: 'E-Rent Value™' },
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
          className="mx-auto flex h-[72px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
        >
          {/* Logo */}
          <Link href="/" aria-label="EMLAKIE home" className="shrink-0">
            <Logo className="h-10" textClassName="text-3xl" />
          </Link>

          {/* Desktop centre links */}
          <div className="hidden items-center gap-0.5 md:flex">
            {navLinks.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-lg px-3 py-2 font-display text-sm font-medium tracking-tight text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
              >
                {l.label}
              </Link>
            ))}
          </div>

          {/* Desktop right CTAs — auth-aware */}
          <div className="hidden items-center gap-3 md:flex">
            {auth === 'in' ? (
              <>
                <Button href="/landlord" variant="ghost" size="md">My Rentals</Button>
                <Button href="/landlord/properties/new" size="md">+ New Listing</Button>
              </>
            ) : (
              <>
                <Button type="button" variant="ghost" size="md" onClick={() => setModal('signin')}>
                  Sign In
                </Button>
                <Button type="button" size="lg" onClick={() => setModal('listing')}>
                  List Property FREE
                </Button>
              </>
            )}
          </div>

          {/* Mobile right side */}
          <div className="flex items-center gap-2 md:hidden">
            {auth === 'in' ? (
              <Button href="/landlord/properties/new" size="sm">+ New Listing</Button>
            ) : (
              <Button type="button" size="sm" onClick={() => setModal('listing')}>List Free</Button>
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
            <nav aria-label="Mobile navigation" className="flex flex-col gap-1 pt-3">
              {navLinks.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  onClick={closeMobile}
                  className="rounded-lg px-4 py-2.5 font-display text-sm font-medium tracking-tight text-gray-700 transition hover:bg-gray-50"
                >
                  {l.label}
                </Link>
              ))}

              <div className="mt-3 flex flex-col gap-2 border-t border-gray-100 pt-3">
                {auth === 'in' ? (
                  <>
                    <Button href="/landlord" variant="secondary" size="lg" fullWidth onClick={closeMobile}>
                      My Rentals
                    </Button>
                    <Button href="/landlord/properties/new" size="lg" fullWidth onClick={closeMobile}>
                      + New Listing
                    </Button>
                  </>
                ) : (
                  <>
                    <Button type="button" size="lg" fullWidth onClick={() => { closeMobile(); setModal('listing'); }}>
                      List Property FREE
                    </Button>
                    <Button type="button" variant="secondary" size="lg" fullWidth onClick={() => { closeMobile(); setModal('signin'); }}>
                      Sign In
                    </Button>
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
