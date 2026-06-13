import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo className="h-7" />
            <p className="mt-3 text-sm text-gray-600">
              The simple way to find your next rental home — and the easiest way
              for landlords to fill them.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Renters</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li><Link href="/rentals" className="hover:text-brand-600">Browse rentals</Link></li>
                <li><Link href="/app" className="hover:text-brand-600">Download the app</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Landlords</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li><Link href="/landlords" className="hover:text-brand-600">List a property</Link></li>
                <li><Link href="/landlords#how-it-works" className="hover:text-brand-600">How it works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Company</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li><Link href="/privacy" className="hover:text-brand-600">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-brand-600">Terms</Link></li>
                <li><Link href="/accessibility" className="hover:text-brand-600">Accessibility</Link></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-gray-200 pt-6 text-xs text-gray-500">
          <p>
            © {new Date().getFullYear()} EMLAKIE. All rights reserved. EMLAKIE is
            committed to the principles of the Fair Housing Act and Equal Opportunity.
          </p>
        </div>
      </div>
    </footer>
  );
}
