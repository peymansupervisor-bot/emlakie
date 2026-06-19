import Link from 'next/link';
import Logo from './Logo';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <nav aria-label="Main navigation" className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="EMLAKIE home">
            <Logo />
          </Link>
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <Link
            href="/rent-estimate"
            className="text-xs font-bold uppercase tracking-widest text-gray-600 transition hover:text-brand-600"
          >
            E-rent Value™
          </Link>
          <Link
            href="/rentals"
            className="text-xs font-bold uppercase tracking-widest text-gray-600 transition hover:text-brand-600"
          >
            Browse Rentals
          </Link>
          <Link
            href="/rent-check"
            className="text-xs font-bold uppercase tracking-widest text-gray-600 transition hover:text-brand-600"
          >
            Rent Check
          </Link>
          <Link
            href="/blog"
            className="text-xs font-bold uppercase tracking-widest text-gray-600 transition hover:text-brand-600"
          >
            Blog
          </Link>
          {/* Pulsing LIST FREE pill — eye-catch for landlords */}
          <Link
            href="/landlord/login"
            className="animate-glow-pulse rounded-full bg-brand-600 px-5 py-2 text-xs font-extrabold uppercase tracking-widest text-white transition hover:bg-brand-700"
          >
            List Free
          </Link>
          <Link
            href="/landlords"
            className="rounded-full border border-gray-300 px-5 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 transition hover:border-brand-600 hover:text-brand-600"
          >
            For Landlords
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center md:hidden">
          <Link href="/landlord" className="inline-flex items-center rounded px-3 py-3 text-xs font-semibold text-gray-600 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1">
            Landlords
          </Link>
          <span className="text-gray-300" aria-hidden="true">·</span>
          <Link href="/rentals" className="inline-flex items-center rounded px-3 py-3 text-xs font-semibold text-gray-600 hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1">
            Tenants
          </Link>
          <Link
            href="/app"
            className="ml-1 inline-flex items-center rounded-full bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-1"
          >
            APP
          </Link>
        </div>
      </nav>
    </header>
  );
}
