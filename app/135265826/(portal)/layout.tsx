import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getModeratorSession, adminClient } from '@/lib/moderator';
import AdminSignOut from './AdminSignOut';
import ChangePasswordButton from './ChangePasswordButton';

export const metadata = { title: 'Moderator Dashboard — EMLAKIE', robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getModeratorSession();
  if (!session) redirect('/135265826/login');

  const { count: openFlags } = await adminClient()
    .from('listing_reports')
    .select('*', { count: 'exact', head: true })
    .eq('reviewed', false);

  const flagCount = openFlags ?? 0;

  const NAV = [
    { href: '/135265826', label: 'All Listings', badge: null },
    { href: '/135265826/flags', label: 'Flagged Reports', badge: flagCount > 0 ? flagCount : null },
    { href: '/135265826/ada', label: 'ADA Audit', badge: null },
    { href: '/135265826/seo', label: 'SEO Audit', badge: null },
    { href: '/135265826/health', label: '⬤ Health', badge: null },
    { href: '/135265826/landlords', label: 'Landlords', badge: null },
    { href: '/135265826/moderators', label: 'Moderators', badge: null },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <header className="border-b border-gray-800 bg-gray-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-4">
              <span className="text-lg font-extrabold tracking-tight text-white">EMLAKIE</span>
              <span className="rounded bg-red-600 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-white">Moderator</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-xs text-gray-400">{session.email}</span>
              <ChangePasswordButton />
              <AdminSignOut />
            </div>
          </div>
          <nav className="flex gap-1 pb-0">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="relative rounded-t-lg px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition flex items-center gap-2"
              >
                {n.label}
                {n.badge !== null && (
                  <span className="inline-flex items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-bold text-white min-w-[18px]">
                    {n.badge}
                  </span>
                )}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {children}
      </main>
    </div>
  );
}
