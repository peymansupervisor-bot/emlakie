import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getModeratorSession } from '@/lib/moderator';
import AdminSignOut from './AdminSignOut';

export const metadata = { title: 'Moderator Dashboard — EMLAKIE', robots: { index: false } };

const NAV = [
  { href: '/admin', label: 'All Listings' },
  { href: '/admin/flags', label: 'Flagged Reports' },
  { href: '/admin/moderators', label: 'Moderators' },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getModeratorSession();
  if (!session) redirect('/admin/login');

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
              <AdminSignOut />
            </div>
          </div>
          <nav className="flex gap-1 pb-0">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-t-lg px-4 py-2 text-sm font-semibold text-gray-300 hover:bg-gray-800 hover:text-white transition"
              >
                {n.label}
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
