'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isDemo, isSignedIn, signOut } from '@/lib/landlord/client';

export default function LandlordLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/landlord/login';
  const [ready, setReady] = useState(false);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    if (!isLogin && !isSignedIn()) {
      router.replace('/landlord/login');
      return;
    }
    setDemo(isDemo());
    setReady(true);
  }, [isLogin, pathname, router]);

  if (isLogin) return <>{children}</>;
  if (!ready) return <div className="py-24 text-center text-gray-400">Loading…</div>;

  const tabs = [
    { href: '/landlord', label: 'Properties' },
    { href: '/landlord/messages', label: 'Messages' },
  ];

  return (
    <div>
      {demo && (
        <div className="bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white">
          Demo dashboard — sample data.{' '}
          <Link href="/landlord/login" className="underline hover:text-brand-300">
            Sign in with your phone
          </Link>{' '}
          to manage real listings.
        </div>
      )}

      <div className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6">
          <nav className="flex gap-1">
            {tabs.map((tab) => {
              const active =
                tab.href === '/landlord'
                  ? pathname === '/landlord' || pathname.startsWith('/landlord/properties')
                  : pathname.startsWith(tab.href);
              return (
                <Link
                  key={tab.href}
                  href={tab.href}
                  className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
                    active
                      ? 'border-brand-600 text-brand-700'
                      : 'border-transparent text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </nav>
          <button
            onClick={() => {
              signOut();
              router.push('/landlord/login');
            }}
            className="text-sm font-semibold text-gray-500 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</div>
    </div>
  );
}
