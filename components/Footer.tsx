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
              The simple way to find your next tenant.
            </p>
          </div>

          <nav aria-label="Footer navigation" className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            <div>
              {/*
                Fix: heading-order violation on /support and /app.
                These footer column labels were <h3>, which skips a level after
                each page's <h1> (h1 → h3, no h2 in between). Changed to <h2>
                so the document outline is h1 → h2 throughout. Visual styling
                is identical; only the semantic level changes.
              */}
              <h2 className="font-serif text-base font-bold tracking-tight text-gray-900">Renters</h2>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
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
              <h2 className="font-serif text-base font-bold tracking-tight text-gray-900">Landlords</h2>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
                <li><Link href="/for-landlords" className="transition hover:text-brand-600">Why EMLAKIE?</Link></li>
                <li><Link href="/landlord/login" className="transition hover:text-brand-600">List a property</Link></li>
                <li><Link href="/rent-estimate" className="transition hover:text-brand-600">E-rent Value™</Link></li>
                <li><Link href="/landlord" className="transition hover:text-brand-600">Landlord Dashboard</Link></li>
              </ul>
            </div>
            <div>
              <h2 className="font-serif text-base font-bold tracking-tight text-gray-900">Company</h2>
              <ul className="mt-4 space-y-3 text-sm text-gray-600">
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
            EMLAKIE is a direct-rental platform connecting property owners and tenants. Listings marked{" "}
            <strong>Broker Listed</strong> are submitted by licensed real estate professionals on behalf of
            their clients. All other listings are expected to be posted by the property owner or someone acting
            on behalf of the property owner. EMLAKIE LLC does not verify the validity of property information
            or the identity of property owners, and accepts no responsibility for any assumed knowledge by
            website users. No brokerage, agency, or property management services are provided by EMLAKIE LLC
            through this site. No content constitutes legal, financial, or professional advice.
          </p>

          {/* Listing accuracy */}
          <div>
            <p className="font-semibold text-gray-600">Listing Accuracy</p>
            <p className="mt-1">
              Listing information on this site is deemed reliable but EMLAKIE LLC does not guarantee the accuracy of all the information herein.
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

          <div className="flex items-center justify-between gap-4">
            <p>© {new Date().getFullYear()} EMLAKIE LLC. All rights reserved.</p>
            <div className="flex items-center gap-4 shrink-0">
              <a
                href="https://www.instagram.com/emlakie"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="EMLAKIE on Instagram"
                className="text-gray-400 transition-opacity hover:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden="true">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.facebook.com/emlakie"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="EMLAKIE on Facebook"
                className="text-gray-400 transition-opacity hover:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden="true">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.tiktok.com/@emlakie_official"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="EMLAKIE on TikTok"
                className="text-gray-400 transition-opacity hover:opacity-60"
              >
                <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] fill-current" aria-hidden="true">
                  <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
