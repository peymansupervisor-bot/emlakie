import Link from 'next/link';
import { TrendingCity } from '@/lib/api';
import { US_STATES } from '@/lib/states';

interface Props {
  trendingCities?: TrendingCity[];
}

const PROPERTY_TYPE_LINKS = [
  { href: '/rentals/apartments', label: 'Apartments for Rent' },
  { href: '/rentals/houses', label: 'Houses for Rent' },
  { href: '/rentals/condos', label: 'Condos for Rent' },
  { href: '/rentals/townhomes', label: 'Townhomes for Rent' },
  { href: '/rentals/studios', label: 'Studios for Rent' },
  { href: '/rentals?bedrooms=1', label: '1-Bedroom Rentals' },
  { href: '/rentals?bedrooms=2', label: '2-Bedroom Rentals' },
  { href: '/rentals?bedrooms=3', label: '3-Bedroom Rentals' },
];

const SPECIAL_SEARCH_LINKS = [
  { href: '/rentals/pet-friendly', label: 'Pet-Friendly Rentals' },
  { href: '/rentals/furnished', label: 'Furnished Rentals' },
  { href: '/rentals/short-term', label: 'Short-Term Rentals' },
  { href: '/rentals/section-8', label: 'Section 8 Rentals' },
  { href: '/rentals?ownerDirect=1', label: 'By Owner Rentals' },
  { href: '/rent-estimate', label: 'Free Rent Estimate' },
  { href: '/blog', label: 'Rental Market Guides' },
  { href: '/landlord/login', label: 'List My Property Free' },
];

// Top states by renter population for the grid
const TOP_STATES_GRID = [
  { name: 'California', slug: 'california', abbr: 'CA' },
  { name: 'Texas', slug: 'texas', abbr: 'TX' },
  { name: 'Florida', slug: 'florida', abbr: 'FL' },
  { name: 'New York', slug: 'new-york', abbr: 'NY' },
  { name: 'Illinois', slug: 'illinois', abbr: 'IL' },
  { name: 'Pennsylvania', slug: 'pennsylvania', abbr: 'PA' },
  { name: 'Ohio', slug: 'ohio', abbr: 'OH' },
  { name: 'Georgia', slug: 'georgia', abbr: 'GA' },
  { name: 'North Carolina', slug: 'north-carolina', abbr: 'NC' },
  { name: 'Michigan', slug: 'michigan', abbr: 'MI' },
  { name: 'New Jersey', slug: 'new-jersey', abbr: 'NJ' },
  { name: 'Virginia', slug: 'virginia', abbr: 'VA' },
  { name: 'Washington', slug: 'washington', abbr: 'WA' },
  { name: 'Arizona', slug: 'arizona', abbr: 'AZ' },
  { name: 'Massachusetts', slug: 'massachusetts', abbr: 'MA' },
  { name: 'Tennessee', slug: 'tennessee', abbr: 'TN' },
];

export default function SeoLinkGrid({ trendingCities = [] }: Props) {
  const allStates = US_STATES.map((s) => ({ name: s.name, slug: s.slug, abbr: s.abbr }));

  return (
    <section className="mt-16 border-t border-gray-100 pt-10">
      <h2 className="sr-only">Browse More Rentals</h2>
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">

        {/* Browse by State */}
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
            Browse by State
          </h3>
          <ul className="space-y-1.5">
            {TOP_STATES_GRID.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/rentals/state/${s.slug}`}
                  className="text-sm text-gray-600 hover:text-brand-600"
                >
                  Rentals in {s.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/rentals" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
                All 50 states →
              </Link>
            </li>
          </ul>
        </div>

        {/* Popular Cities */}
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
            Popular Cities
          </h3>
          <ul className="space-y-1.5">
            {trendingCities.slice(0, 8).map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/rentals/city/${c.slug}`}
                  className="text-sm text-gray-600 hover:text-brand-600"
                >
                  Rentals in {c.city}{c.state ? `, ${c.state}` : ''}
                </Link>
              </li>
            ))}
            {trendingCities.length === 0 && [
              { city: 'New York', state: 'NY', slug: 'new-york' },
              { city: 'Los Angeles', state: 'CA', slug: 'los-angeles' },
              { city: 'Chicago', state: 'IL', slug: 'chicago' },
              { city: 'Houston', state: 'TX', slug: 'houston' },
              { city: 'Phoenix', state: 'AZ', slug: 'phoenix' },
              { city: 'Philadelphia', state: 'PA', slug: 'philadelphia' },
              { city: 'San Antonio', state: 'TX', slug: 'san-antonio' },
              { city: 'San Diego', state: 'CA', slug: 'san-diego' },
            ].map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/rentals/city/${c.slug}`}
                  className="text-sm text-gray-600 hover:text-brand-600"
                >
                  Rentals in {c.city}, {c.state}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Property Types */}
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
            Property Types
          </h3>
          <ul className="space-y-1.5">
            {PROPERTY_TYPE_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-gray-600 hover:text-brand-600">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* More Searches */}
        <div>
          <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
            More Searches
          </h3>
          <ul className="space-y-1.5">
            {SPECIAL_SEARCH_LINKS.map((link) => (
              <li key={link.href}>
                <Link href={link.href} className="text-sm text-gray-600 hover:text-brand-600">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* All states A-Z row */}
      <div className="mt-8 border-t border-gray-100 pt-6">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
          Rentals by State — All 50 States
        </h3>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {allStates.map((s) => (
            <Link
              key={s.slug}
              href={`/rentals/state/${s.slug}`}
              className="text-sm text-gray-500 hover:text-brand-600"
            >
              {s.abbr}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
