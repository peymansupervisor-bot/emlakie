import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="flex flex-col gap-8 md:flex-row md:justify-between">
          <div className="max-w-sm">
            <Logo className="h-7" textClassName="text-xl" />
            <p className="mt-3 text-sm text-gray-600">
              The simple way to find your next rental home — and the easiest way
              for landlords to fill them.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              <p className="font-serif text-base font-bold tracking-tight text-gray-900">Renters</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-500">
                <li><Link href="/rentals" className="transition hover:text-brand-600">Browse all rentals</Link></li>
                <li><Link href="/rentals/apartments" className="transition hover:text-brand-600">Apartments for rent</Link></li>
                <li><Link href="/rentals/houses" className="transition hover:text-brand-600">Houses for rent</Link></li>
                <li><Link href="/rentals/condos" className="transition hover:text-brand-600">Condos for rent</Link></li>
                <li><Link href="/rentals/townhomes" className="transition hover:text-brand-600">Townhomes for rent</Link></li>
                <li><Link href="/rentals/studios" className="transition hover:text-brand-600">Studios for rent</Link></li>
                <li><Link href="/rentals/pet-friendly" className="transition hover:text-brand-600">Pet-friendly rentals</Link></li>
                <li><Link href="/rentals/furnished" className="transition hover:text-brand-600">Furnished rentals</Link></li>
                <li><Link href="/rentals/short-term" className="transition hover:text-brand-600">Short-term rentals</Link></li>
                <li><Link href="/rentals/section-8" className="transition hover:text-brand-600">Section 8 rentals</Link></li>
                <li><Link href="/rent-check" className="transition hover:text-brand-600">Is my rent fair?</Link></li>
                <li><Link href="/app" className="transition hover:text-brand-600">Download the app</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-serif text-base font-bold tracking-tight text-gray-900">Landlords</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-500">
                <li><Link href="/for-landlords" className="transition hover:text-brand-600">Why EMLAKIE?</Link></li>
                <li><Link href="/landlord/login" className="transition hover:text-brand-600">List a property</Link></li>
                <li><Link href="/rent-estimate" className="transition hover:text-brand-600">E-rent Value™</Link></li>
                <li><Link href="/landlord" className="transition hover:text-brand-600">Landlord Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <p className="font-serif text-base font-bold tracking-tight text-gray-900">Company</p>
              <ul className="mt-4 space-y-3 text-sm text-gray-500">
                <li><Link href="/about" className="transition hover:text-brand-600">About</Link></li>
                <li><Link href="/blog" className="transition hover:text-brand-600">Blog</Link></li>
                <li><Link href="/contact" className="transition hover:text-brand-600">Contact</Link></li>
                <li><Link href="/privacy" className="transition hover:text-brand-600">Privacy</Link></li>
                <li><Link href="/terms" className="transition hover:text-brand-600">Terms</Link></li>
                <li><Link href="/accessibility" className="transition hover:text-brand-600">Accessibility</Link></li>
                <li><Link href="/disclaimer" className="transition hover:text-brand-600">Disclaimer</Link></li>
              </ul>
            </div>
          </nav>
        </div>

        <div className="mt-10 space-y-6 border-t border-gray-200 pt-6 text-xs text-gray-500">

          {/* Platform disclaimer */}
          <p>
            EMLAKIE is a direct-rental platform connecting property owners and tenants without the need for a
            broker. Listings marked <strong>By Owner</strong> are posted by the property owner. Listings
            marked <strong>Broker Listed</strong> are submitted by licensed real estate professionals on behalf
            of their clients. No brokerage, agency, or property management services are provided by EMLAKIE LLC
            through this site. No content constitutes legal, financial, or professional advice.
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
              {/*
                aria-allowed-attr fix: aria-label is only permitted on elements
                with a role that supports naming. An SVG without an explicit role
                gets the computed role "none" / "presentation", which does NOT
                support aria-label — axe flags this as an aria-allowed-attr
                violation. Adding role="img" gives the SVG a concrete ARIA role
                that allows aria-label as its accessible name, resolving the
                violation while keeping the logo meaningful to screen readers.
              */}
              <svg
                role="img"
                aria-label="Equal Housing Opportunity"
                viewBox="0 0 100 100"
                className="h-10 w-10 shrink-0 fill-gray-500"
                xmlns="http://www.w3.org/2000/svg"
              >
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
