'use client';

import Link from 'next/link';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import Logo from './Logo';
import SignInModal from './SignInModal';
import Button from '@/components/ui/Button';
import { supabase } from '@/lib/supabase';

type AuthState = 'loading' | 'out' | 'in';

const menus = [
  {
    label: 'Rentals',
    items: [
      { href: '/rentals',              label: 'Browse All Rentals',   desc: 'Search every active listing' },
      { href: '/rentals/apartments',   label: 'Apartments',           desc: 'Studio to multi-bedroom' },
      { href: '/rentals/houses',       label: 'Houses',               desc: 'Single-family homes' },
      { href: '/rentals/pet-friendly', label: 'Pet-Friendly',         desc: 'Properties that welcome pets' },
      { href: '/rentals/furnished',    label: 'Furnished',            desc: 'Move-in ready' },
      { href: '/rentals/short-term',   label: 'Short-Term',           desc: 'Flexible lease lengths' },
      { href: '/rentals/section-8',    label: 'Section 8',            desc: 'Housing voucher accepted' },
    ],
  },
  {
    label: 'Landlords',
    items: [
      { href: '/for-landlords',    label: 'Why EMLAKIE?',       desc: 'See how we work for you' },
      { href: '/landlord/login',   label: 'List a Property',    desc: 'Free — takes under 5 min' },
      { href: '/rent-estimate',    label: 'E-Rent Value™',      desc: 'See what your home rents for' },
      { href: '/landlord',         label: 'Landlord Dashboard', desc: 'Manage your listings' },
    ],
  },
  {
    label: 'Resources',
    items: [
      { href: '/blog',          label: 'Blog',         desc: 'Renter and landlord guides' },
      { href: '/rent-check',    label: 'Rent Check',   desc: 'Is my rent fair?' },
      { href: '/how-it-works',  label: 'How It Works', desc: 'The EMLAKIE process' },
      { href: '/cities',        label: 'Cities',       desc: 'Browse by location' },
      { href: '/about',         label: 'About',        desc: 'Our story' },
      { href: '/contact',       label: 'Contact',      desc: 'Get in touch' },
    ],
  },
];

// ── Desktop dropdown — click-to-open, fully keyboard accessible (WCAG 2.1 AA) ─
function DropdownMenu({
  menu,
  open,
  onOpen,
  onClose,
}: {
  menu: typeof menus[0];
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
}) {
  const id = useId();
  const panelId = `nav-panel-${id}`;
  const triggerRef = useRef<HTMLButtonElement>(null);
  const itemRefs = useRef<(HTMLAnchorElement | null)[]>([]);

  const closeAndRefocus = useCallback(() => {
    onClose();
    triggerRef.current?.focus();
  }, [onClose]);

  function handleTriggerKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      if (!open) { onOpen(); requestAnimationFrame(() => itemRefs.current[0]?.focus()); }
    }
    if (e.key === 'Escape') closeAndRefocus();
  }

  function handleItemKeyDown(e: React.KeyboardEvent, idx: number) {
    if (e.key === 'Escape') { e.preventDefault(); closeAndRefocus(); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); itemRefs.current[Math.min(idx + 1, menu.items.length - 1)]?.focus(); }
    if (e.key === 'ArrowUp')   { e.preventDefault(); idx === 0 ? triggerRef.current?.focus() : itemRefs.current[idx - 1]?.focus(); }
    if (e.key === 'Home')      { e.preventDefault(); itemRefs.current[0]?.focus(); }
    if (e.key === 'End')       { e.preventDefault(); itemRefs.current[menu.items.length - 1]?.focus(); }
    if (e.key === 'Tab')       onClose();
  }

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={panelId}
        onKeyDown={handleTriggerKeyDown}
        onClick={() => open ? onClose() : onOpen()}
        className={`flex items-center gap-1 rounded-lg px-3 py-2 font-display text-sm font-medium tracking-tight transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1 ${
          open ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
        }`}
      >
        {menu.label}
        <svg
          viewBox="0 0 10 6"
          className={`h-[9px] w-[9px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>

      <div
        id={panelId}
        role="region"
        aria-label={`${menu.label} menu`}
        className={`absolute right-0 top-full z-50 mt-1 w-64 transition-all duration-150 ${
          open ? 'pointer-events-auto translate-y-0 opacity-100' : 'pointer-events-none -translate-y-1 opacity-0'
        }`}
      >
        <div className="mx-auto mb-[-1px] h-2 w-4 overflow-hidden" aria-hidden="true">
          <div className="mx-auto h-3 w-3 origin-bottom-left rotate-45 border-l border-t border-gray-200/80 bg-white shadow-sm" />
        </div>
        <div className="overflow-hidden rounded-2xl border border-gray-200/80 bg-white/95 shadow-xl shadow-black/[0.08] backdrop-blur-sm">
          <ul role="list" className="py-2">
            {menu.items.map((item, idx) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  ref={(el) => { itemRefs.current[idx] = el; }}
                  onKeyDown={(e) => handleItemKeyDown(e, idx)}
                  onClick={onClose}
                  className="flex flex-col px-4 py-3 transition hover:bg-gray-50 focus-visible:bg-gray-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600"
                >
                  <span className="text-sm font-semibold text-gray-900">{item.label}</span>
                  <span className="mt-0.5 text-xs text-gray-500">{item.desc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

// ── Mobile accordion — keyboard accessible ───────────────────────────────────
function MobileAccordion({
  menu,
  onNavigate,
}: {
  menu: typeof menus[0];
  onNavigate: () => void;
}) {
  const id = useId();
  const panelId = `mob-panel-${id}`;
  const [open, setOpen] = useState(false);

  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3.5 font-display text-sm font-semibold text-gray-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600"
      >
        {menu.label}
        <svg
          viewBox="0 0 10 6"
          className={`h-[9px] w-[9px] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <path d="M1 1l4 4 4-4" />
        </svg>
      </button>

      <ul
        id={panelId}
        role="list"
        hidden={!open}
        className="bg-gray-50 pb-1 pt-0.5"
      >
        {menu.items.map((item) => (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              className="flex items-center gap-3 px-5 py-3 text-sm text-gray-600 transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-600"
            >
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

// ── Main navbar ──────────────────────────────────────────────────────────────
export default function Navbar() {
  const [auth, setAuth] = useState<AuthState>('out');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [modal, setModal] = useState<'listing' | 'signin' | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session ? 'in' : 'out');
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setAuth(session ? 'in' : 'out');
    });
    return () => subscription.unsubscribe();
  }, []);

  // Close open dropdown when clicking outside the nav
  useEffect(() => {
    if (!openMenu) return;
    function handleClick(e: MouseEvent) {
      if (navRef.current && !navRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [openMenu]);

  function closeMobile() { setMobileOpen(false); }

  return (
    <>
      <header ref={navRef} className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <nav
          aria-label="Main navigation"
          className="mx-auto flex h-[64px] max-w-7xl items-center justify-between gap-4 px-4 sm:px-6"
        >
          {/* Logo */}
          <Link
            href="/"
            aria-label="EMLAKIE home"
            className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 rounded"
          >
            <Logo className="h-9" textClassName="text-2xl" />
          </Link>

          {/* Desktop nav + CTAs — all right-aligned */}
          <div className="hidden items-center gap-1 md:flex">
            {menus.map((menu) => (
              <DropdownMenu
                key={menu.label}
                menu={menu}
                open={openMenu === menu.label}
                onOpen={() => setOpenMenu(menu.label)}
                onClose={() => setOpenMenu(null)}
              />
            ))}

            <div className="ml-3 flex items-center gap-3 border-l border-gray-200 pl-3">
              {auth === 'in' ? (
                <>
                  <Button href="/landlord" variant="ghost" size="md">My Rentals</Button>
                  <Button href="/landlord/properties/new" size="md">+ New Listing</Button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setModal('signin')}
                    className="rounded-lg px-3 py-2 font-display text-sm font-medium tracking-tight text-gray-500 transition hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-1"
                  >
                    Sign In
                  </button>
                  <Button type="button" size="md" onClick={() => setModal('listing')}>
                    List Free
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Mobile right side */}
          <div className="flex items-center gap-2 md:hidden">
            {auth === 'in' ? (
              <Button href="/landlord/properties/new" size="sm">+ New</Button>
            ) : (
              <Button type="button" size="sm" onClick={() => setModal('listing')}>List Free</Button>
            )}
            <button
              type="button"
              onClick={() => setMobileOpen((o) => !o)}
              aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileOpen}
              aria-controls="mobile-nav"
              className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
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
        <div
          id="mobile-nav"
          hidden={!mobileOpen}
          className="border-t border-gray-100 bg-white md:hidden"
        >
          {menus.map((menu) => (
            <MobileAccordion key={menu.label} menu={menu} onNavigate={closeMobile} />
          ))}

          <div className="px-4 pb-5 pt-2">
            <div className="flex flex-col gap-2 border-t border-gray-100 pt-4">
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
          </div>
        </div>
      </header>

      <SignInModal
        open={modal === 'listing'}
        onClose={() => setModal(null)}
        initialStep="choice"
        next="/landlord/properties/new"
        title="Start Listing Your Property"
        subtitle="Create your free account and publish your rental in under 5 minutes."
        primaryLabel="Create Free Account"
      />
      <SignInModal
        open={modal === 'signin'}
        onClose={() => setModal(null)}
        initialStep="login"
        next="/landlord"
      />
    </>
  );
}
