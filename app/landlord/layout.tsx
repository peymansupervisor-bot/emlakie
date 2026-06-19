'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProfile, isDemo, isSignedIn, signOut } from '@/lib/landlord/client';
import { LandlordProfile } from '@/lib/landlord/types';

const TABS = [
  { href: '/landlord', exact: true, label: 'My Listings' },
  { href: '/landlord/leads',    label: 'Inquiries'      },
  { href: '/landlord/messages', label: 'Messages'       },
  { href: '/landlord/alerts',   label: 'Notifications'  },
  { href: '/landlord/payments', label: '⚡ Boost'        },
  { href: '/landlord/profile',  label: 'Profile'        },
];

export default function LandlordLayout({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const router    = useRouter();
  const isLogin   = pathname === '/landlord/login';
  const [ready, setReady] = useState(false);
  const [demo,  setDemo]  = useState(false);
  const [profile, setProfile] = useState<LandlordProfile | null>(null);

  useEffect(() => {
    async function check() {
      const signedIn = await isSignedIn();
      if (!isLogin && !signedIn) {
        router.replace('/landlord/login');
        return;
      }
      const p = await getProfile();
      setDemo(isDemo());
      setProfile(p);
      setReady(true);

      // Force profile completion before accessing anything else
      const profileIncomplete = p && !isDemo() && (!p.first_name || !p.last_name || !p.phone);
      if (profileIncomplete && pathname !== '/landlord/profile') {
        router.replace('/landlord/profile');
      }
    }
    check();
  }, [isLogin, pathname, router]);

  if (isLogin) return <>{children}</>;
  if (!ready)  return <div className="py-24 text-center text-gray-500">Loading…</div>;

  function isActive(tab: typeof TABS[0]) {
    return tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard header */}
      <div style={{ backgroundColor: '#16a34a' }} className="text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          {demo && (
            <div className="border-b border-green-500 py-2 text-center text-xs font-semibold text-green-100">
              Demo mode —{' '}
              <Link href="/landlord/login" className="underline text-white">sign in with your email</Link>
              {' '}to manage real listings
            </div>
          )}

          {/* Top bar */}
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-green-200">Landlord Portal</p>
              <p className="text-xl font-extrabold leading-tight">
                {profile?.first_name
                  ? `Welcome, ${profile.first_name}`
                  : profile?.display_name
                    ? `Welcome, ${profile.display_name.split(' ')[0]}`
                    : profile?.email
                      ? `Welcome, ${profile.email.split('@')[0]}`
                      : 'Welcome back'}
              </p>
              {profile?.account_id && (
                <p className="text-xs text-green-300 mt-0.5">Account {profile.account_id}</p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/landlord/properties/new"
                className="rounded-xl bg-white px-4 py-2 text-sm font-bold text-green-700 shadow-sm transition hover:bg-green-50"
              >
                + Add Listing
              </Link>
              <button
                onClick={() => { signOut(); router.push('/landlord/login'); }}
                className="rounded-xl border border-green-400 px-3 py-2 text-xs font-semibold text-green-100 transition hover:bg-green-700"
              >
                Sign out
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 overflow-x-auto pb-0">
            {TABS.map((tab) => {
              const active = isActive(tab);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`shrink-0 rounded-t-xl px-5 py-2.5 text-sm font-semibold transition ${
                    active
                      ? 'bg-gray-50 text-green-700'
                      : 'text-green-100 hover:bg-green-700'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Profile completion banner */}
      {profile && (!profile.first_name || !profile.last_name || !profile.phone) && !demo && pathname !== '/landlord/profile' && (
        <div className="border-b border-amber-200 bg-amber-50 px-4 py-3">
          <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 sm:px-6">
            <p className="text-sm font-medium text-amber-800">
              Complete your profile so tenants can contact you — first name, last name, and phone number are required.
            </p>
            <Link href="/landlord/profile"
              className="shrink-0 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-amber-700">
              Complete profile →
            </Link>
          </div>
        </div>
      )}

      {/* Page content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
