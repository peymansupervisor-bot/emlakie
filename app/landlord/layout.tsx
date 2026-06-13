'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isDemo, isSignedIn, signOut } from '@/lib/landlord/client';

const NAV = [
  {
    href: '/landlord',
    exact: true,
    label: 'Properties',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 12 11.204 3.045c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
    ),
  },
  {
    href: '/landlord/leads',
    label: 'Leads',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
    ),
  },
  {
    href: '/landlord/messages',
    label: 'Messages',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" />
    ),
  },
  {
    href: '/landlord/payments',
    label: 'Payments',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
    ),
  },
  {
    href: '/landlord/alerts',
    label: 'Alerts',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round"
        d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
    ),
  },
];

export default function LandlordLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === '/landlord/login';
  const [ready, setReady] = useState(false);
  const [demo, setDemo] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  function isActive(item: typeof NAV[0]) {
    if (item.exact) return pathname === item.href;
    return pathname.startsWith(item.href);
  }

  return (
    <div className="flex min-h-[calc(100vh-64px)]">
      {/* Sidebar — desktop */}
      <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white md:flex md:flex-col">
        {demo && (
          <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
            Demo mode —{' '}
            <Link href="/landlord/login" className="underline">sign in</Link>
            {' '}to manage real listings
          </div>
        )}

        <nav className="flex flex-1 flex-col gap-1 p-3">
          {NAV.map((item) => {
            const active = isActive(item);
            return (
              <Link key={item.href} href={item.href}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}>
                <svg viewBox="0 0 24 24" className={`h-5 w-5 shrink-0 ${active ? 'stroke-brand-600' : 'stroke-gray-500'}`}
                  fill="none" strokeWidth="1.75">
                  {item.icon}
                </svg>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-3">
          <button onClick={() => { signOut(); router.push('/landlord/login'); }}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-gray-500 transition hover:bg-gray-100 hover:text-gray-900">
            <svg viewBox="0 0 24 24" className="h-5 w-5 stroke-gray-400" fill="none" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" />
            </svg>
            Sign out
          </button>
          <div className="mt-2 flex items-center gap-2 px-3 py-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600">
              <Image src="/logo.png" alt="" width={28} height={28} className="rounded-full" />
            </div>
            <span className="truncate text-xs text-gray-500">Emlakie Landlord</span>
          </div>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 flex border-t border-gray-200 bg-white md:hidden">
        {NAV.map((item) => {
          const active = isActive(item);
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs font-semibold transition ${
                active ? 'text-brand-600' : 'text-gray-500'
              }`}>
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" strokeWidth="1.75"
                stroke={active ? '#16a34a' : '#9ca3af'}>
                {item.icon}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {demo && (
          <div className="bg-gray-900 px-4 py-2 text-center text-sm font-medium text-white md:hidden">
            Demo dashboard —{' '}
            <Link href="/landlord/login" className="underline hover:text-brand-300">
              sign in with your phone
            </Link>
          </div>
        )}
        <div className="mx-auto max-w-5xl px-4 py-8 pb-24 sm:px-6 md:pb-8">
          {children}
        </div>
      </main>
    </div>
  );
}
