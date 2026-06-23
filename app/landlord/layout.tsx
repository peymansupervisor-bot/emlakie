'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getProfile, isSignedIn, signOut } from '@/lib/landlord/client';
import { LandlordProfile } from '@/lib/landlord/types';
import ErrorReporter from '@/components/ErrorReporter';

const TABS = [
  { href: '/landlord', exact: true, label: 'My Listings' },
  { href: '/landlord/leads',    label: 'Inquiries'      },
  { href: '/landlord/messages', label: 'Messages'       },
  { href: '/landlord/alerts',   label: 'Notifications'  },
  { href: '/landlord/screening', label: 'Screening'      },
  { href: '/landlord/payments', label: '⚡ Boost'        },
  { href: '/landlord/profile',  label: 'Profile'        },
];

function isProfileComplete(p: LandlordProfile | null): boolean {
  if (!p) return false;
  return !!(p.first_name && p.last_name && p.phone && p.email && p.account_id);
}

export default function LandlordLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router   = useRouter();
  const isLogin  = pathname === '/landlord/login';
  const [ready, setReady] = useState(false);
  const [profile, setProfile] = useState<LandlordProfile | null>(null);

  useEffect(() => {
    async function check() {
      const signedIn = await isSignedIn();
      if (!isLogin && !signedIn) {
        router.replace('/landlord/login');
        return;
      }
      const p = await getProfile();
      setProfile(p);
      setReady(true);

      if (signedIn && !isProfileComplete(p) && pathname !== '/landlord/profile') {
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
      <div style={{ backgroundColor: '#16a34a' }} className="text-white">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-green-200">Landlord Portal</p>
              <p className="text-xl font-extrabold leading-tight">
                {profile?.first_name
                  ? `Welcome, ${profile.first_name}`
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
              <Link
                href="/landlord/reset-password"
                className="rounded-xl border border-green-400 px-3 py-2 text-xs font-semibold text-green-100 transition hover:bg-green-700"
              >
                Change Password
              </Link>
              <button
                onClick={() => { signOut(); router.push('/landlord/login'); }}
                className="rounded-xl border border-green-400 px-3 py-2 text-xs font-semibold text-green-100 transition hover:bg-green-700"
              >
                Sign out
              </button>
            </div>
          </div>

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

      {/* Page content */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        {children}
      </main>
      <ErrorReporter userId={profile?.account_id ?? undefined} />
    </div>
  );
}
