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
            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <a href="/app" className="flex items-center gap-2.5 rounded-xl bg-gray-900 px-4 py-2.5 text-white transition hover:bg-gray-800">
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-current" aria-hidden="true">
                  <path d="M18.7 12.6c0-2.5 2-3.7 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 2.9-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4.9-1.4 1.3-2.7 1.3-2.8-.1 0-2.4-1-2.4-3.8zM16.3 5.4c.7-.8 1.1-1.9 1-3-1 0-2.1.6-2.8 1.4-.6.7-1.2 1.9-1 3 1 .1 2.1-.6 2.8-1.4z" />
                </svg>
                <span className="text-left leading-tight">
                  <span className="block text-[10px] uppercase tracking-wide opacity-70">Download on the</span>
                  <span className="block text-sm font-semibold">App Store</span>
                </span>
              </a>
              <a href="/app" className="flex items-center gap-2.5 rounded-xl bg-gray-900 px-4 py-2.5 text-white transition hover:bg-gray-800">
                <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 fill-current" aria-hidden="true">
                  <path d="M3.6 1.8c-.3.3-.5.8-.5 1.4v17.6c0 .6.2 1.1.5 1.4l.1.1 9.9-9.9v-.2L3.7 1.7l-.1.1zm13.2 13.3-3.3-3.3v-.2l3.3-3.3 4 2.3c1.1.7 1.1 1.7 0 2.3l-4 2.2zm-.7.7L12.7 12 3.6 21.1c.4.4 1 .4 1.7 0l10.8-6.3zM3.6 2.9 12.7 12l3.4-3.4L5.3 2.4c-.7-.4-1.3-.4-1.7.1z" />
                </svg>
                <span className="text-left leading-tight">
                  <span className="block text-[10px] uppercase tracking-wide opacity-70">Get it on</span>
                  <span className="block text-sm font-semibold">Google Play</span>
                </span>
              </a>
            </div>
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

          {/* Platform disclaimer */}
          <p>
            This website is an informational platform only — listings are posted by independent landlords and no
            brokerage, agency, or property management services are provided through this site. No content
            constitutes legal, financial, or professional advice.
          </p>

          {/* Listing accuracy */}
          <div>
            <p className="font-semibold text-gray-600">Listing Accuracy</p>
            <p className="mt-1">
              Listing information on this site is deemed reliable but is not guaranteed accurate by EMLAKIE LLC.
              Some listings may be subject to prior lease, withdrawal, or change without notice. All information
              should be independently verified by the renter prior to entering into any rental agreement. EMLAKIE
              LLC assumes no liability for inaccuracies, errors, or omissions in any listing data displayed on
              this site.
            </p>
          </div>

          {/* MLS / ListHub data disclaimer */}
          <div>
            <p className="font-semibold text-gray-600">MLS &amp; Third-Party Listing Data</p>
            <p className="mt-1">
              Some listings displayed on this site are sourced from Multiple Listing Services (MLS) and third-party
              listing aggregators including ListHub. This data is provided for consumers' personal, non-commercial
              use and may not be used for any purpose other than to identify prospective rental properties.
              Information is deemed reliable but not guaranteed. Listing data is updated regularly but may not
              reflect the most current availability. The listing broker's offer of cooperation is made only to
              participants of the MLS where the listing is filed. EMLAKIE LLC is not a licensed real estate broker
              or agent and does not represent buyers, sellers, landlords, or tenants in any transaction.
            </p>
          </div>

          {/* Third-party content */}
          <div>
            <p className="font-semibold text-gray-600">Third-Party Content</p>
            <p className="mt-1">
              Listings, photos, descriptions, and other content posted by landlords or third parties are the sole
              responsibility of the party that submitted them. EMLAKIE LLC does not verify, endorse, or guarantee
              the accuracy of any user-submitted content. By posting content on this platform, landlords represent
              that they have the right to do so and that such content does not violate any applicable law or
              third-party rights.
            </p>
          </div>

          {/* Fair Housing */}
          <div>
            <div className="flex items-start gap-4">
              {/* Equal Housing Opportunity logo */}
              <svg viewBox="0 0 100 100" className="h-10 w-10 shrink-0 fill-gray-500" aria-label="Equal Housing Opportunity" xmlns="http://www.w3.org/2000/svg">
                <path d="M50 5 L95 45 H80 V95 H55 V65 H45 V95 H20 V45 H5 Z"/>
                <rect x="30" y="75" width="40" height="5"/>
                <rect x="30" y="83" width="40" height="5"/>
              </svg>
              <div>
                <p className="font-semibold text-gray-600">Fair Housing &amp; Equal Opportunity</p>
                <p className="mt-1">
                  All properties and rentals advertised on this site are subject to the Fair Housing Act and
                  applicable state and local fair housing laws. It is illegal to advertise any preference,
                  limitation, or discrimination because of race, color, religion, sex, handicap, familial
                  status, national origin, or any other protected class. All dwellings advertised are available
                  on an equal opportunity basis. EMLAKIE LLC is committed to the letter and spirit of the
                  U.S. policy for the achievement of equal housing opportunity throughout the nation.
                </p>
              </div>
            </div>
          </div>

          {/* SMS consent */}
          <div>
            <p className="font-semibold text-gray-600">SMS &amp; Notification Consent</p>
            <p className="mt-1">
              By providing your phone number and submitting any form on this site, you consent to receive text
              messages (SMS), notifications, and alerts through automated technology regarding listings and our
              services. Standard message and data rates may apply. Reply STOP at any time to opt out. Your use
              of this site is subject to our{' '}
              <Link href="/privacy" className="underline hover:text-brand-600">Privacy Policy</Link>
              {' '}and{' '}
              <Link href="/terms" className="underline hover:text-brand-600">Terms of Service</Link>.
            </p>
          </div>

          {/* CCPA */}
          <div>
            <p className="font-semibold text-gray-600">California Privacy Rights (CCPA)</p>
            <p className="mt-1">
              If you are a California resident, you have the right to know what personal information we collect,
              to request deletion of your personal information, to opt out of the sale of your personal
              information, and to non-discrimination for exercising your privacy rights. EMLAKIE LLC does not
              sell personal information to third parties. To submit a privacy request, contact us at{' '}
              <a href="mailto:privacy@emlakie.com" className="underline hover:text-brand-600">privacy@emlakie.com</a>.
              For more information, see our{' '}
              <Link href="/privacy" className="underline hover:text-brand-600">Privacy Policy</Link>.
            </p>
          </div>

          <p>© {new Date().getFullYear()} EMLAKIE LLC. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
