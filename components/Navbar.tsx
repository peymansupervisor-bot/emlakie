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
            href="/landlord"
            className="text-xs font-bold uppercase tracking-widest text-gray-600 transition hover:text-brand-600"
          >
            For Landlords
          </Link>
          <Link
            href="/rentals"
            className="text-xs font-bold uppercase tracking-widest text-gray-600 transition hover:text-brand-600"
          >
            For Tenants
          </Link>
          <Link
            href="/rent-check"
            className="text-xs font-bold uppercase tracking-widest text-brand-600 transition hover:text-brand-700"
          >
            Rent Check ✓
          </Link>
          <Link
            href="/blog"
            className="text-xs font-bold uppercase tracking-widest text-gray-600 transition hover:text-brand-600"
          >
            Blog
          </Link>
          <Link
            href="/support"
            className="text-xs font-bold uppercase tracking-widest text-gray-600 transition hover:text-brand-600"
          >
            Support
          </Link>
          <Link
            href="/app"
            className="rounded-full bg-brand-600 px-5 py-2 text-xs font-bold uppercase tracking-widest text-white transition hover:bg-brand-700"
          >
            Get the App
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-2 md:hidden">
          <Link href="/landlord" className="text-xs font-semibold text-gray-600 hover:text-brand-600">
            Landlords
          </Link>
          <span className="text-gray-300">·</span>
          <Link href="/rentals" className="text-xs font-semibold text-gray-600 hover:text-brand-600">
            Tenants
          </Link>
          <Link
            href="/app"
            className="ml-2 rounded-full bg-brand-600 px-3 py-1.5 text-xs font-bold text-white"
          >
            APP
          </Link>
        </div>
      </nav>
    </header>
  );
}
