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

        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="/rentals"
            className="text-sm font-semibold text-gray-700 hover:text-brand-600"
          >
            Find Rentals
          </Link>
          <Link
            href="/landlords"
            className="text-sm font-semibold text-gray-700 hover:text-brand-600"
          >
            For Landlords
          </Link>
          <Link
            href="/app"
            className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            Get the App
          </Link>
        </div>

        {/* Mobile */}
        <div className="flex items-center gap-4 md:hidden">
          <Link href="/rentals" className="text-sm font-semibold text-gray-700">
            Rentals
          </Link>
          <Link
            href="/app"
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white"
          >
            App
          </Link>
        </div>
      </nav>
    </header>
  );
}
