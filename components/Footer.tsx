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

          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-8 sm:grid-cols-3">
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
                <li><Link href="/landlord/login" className="hover:text-brand-600">List a property</Link></li>
                <li><Link href="/landlord/login#how-it-works" className="hover:text-brand-600">How it works</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-bold text-gray-900">Company</h3>
              <ul className="mt-3 space-y-2 text-sm text-gray-600">
                <li><Link href="/blog" className="hover:text-brand-600">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-brand-600">Contact</Link></li>
                <li><Link href="/privacy" className="hover:text-brand-600">Privacy</Link></li>
                <li><Link href="/terms" className="hover:text-brand-600">Terms</Link></li>
                <li><Link href="/accessibility" className="hover:text-brand-600">Accessibility</Link></li>
                <li><Link href="/disclaimer" className="hover:text-brand-600">Disclaimer</Link></li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-10 space-y-6 border-t border-gray-200 pt-6 text-xs text-gray-500">
          <p>
            This website is an informational platform only — listings are posted by independent landlords and no
            brokerage, agency, or property management services are provided through this site. No content
            constitutes legal, financial, or professional advice.
          </p>

          <div>
            <p className="font-semibold text-gray-600">Fair Housing Notice</p>
            <p className="mt-1">
              All properties and rentals advertised on this site are subject to the Fair Housing Act. It is illegal
              to advertise any preference, limitation, or discrimination because of race, color, religion, sex,
              handicap, familial status, or national origin, or intention to make any such preference, limitation,
              or discrimination. All dwellings advertised are available on an equal opportunity basis.
            </p>
          </div>

          <div>
            <p className="font-semibold text-gray-600">SMS &amp; Notification Consent</p>
            <p className="mt-1">
              By providing your phone number and submitting any form on this site, you consent to receive text
              messages (SMS), notifications, and alerts through automated technology regarding listings and our
              services. You are responsible for ensuring your consent is knowing and voluntary. Standard message and
              data rates may apply. We are not liable for any failure to obtain proper consent prior to submitting
              contact information. Your use of this site is subject to our{' '}
              <Link href="/privacy" className="underline hover:text-brand-600">Privacy Policy</Link>
              {' '}and{' '}
              <Link href="/terms" className="underline hover:text-brand-600">Terms of Service</Link>.
            </p>
          </div>

          <p>© {new Date().getFullYear()} EMLAKIE LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
