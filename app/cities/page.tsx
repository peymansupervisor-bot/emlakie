import type { Metadata } from 'next';
import Link from 'next/link';
import { US_STATES } from '@/lib/states';

export const metadata: Metadata = {
  title: { absolute: 'Apartments for Rent by City — EMLAKIE' },
  description: 'Find apartments, houses, and condos for rent in every US city. Browse rental listings by city or state — listed directly by landlords with no broker fees.',
  alternates: { canonical: 'https://emlakie.com/cities' },
  openGraph: {
    title: 'Apartments for Rent by City | EMLAKIE',
    description: 'Search rentals by city across the entire United States. Every listing comes directly from the landlord — no broker fees, no commissions.',
    type: 'website',
    url: 'https://emlakie.com/cities',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Apartments for Rent by City' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Apartments for Rent by City | EMLAKIE',
    description: 'Search rentals by city across every US state. Direct from landlords — no broker fees.',
    images: ['/og-image.png'],
  },
};

const MAJOR_CITIES = [
  { city: 'New York', state: 'NY', slug: 'new-york' },
  { city: 'Los Angeles', state: 'CA', slug: 'los-angeles' },
  { city: 'Chicago', state: 'IL', slug: 'chicago' },
  { city: 'Houston', state: 'TX', slug: 'houston' },
  { city: 'Phoenix', state: 'AZ', slug: 'phoenix' },
  { city: 'Philadelphia', state: 'PA', slug: 'philadelphia' },
  { city: 'San Antonio', state: 'TX', slug: 'san-antonio' },
  { city: 'San Diego', state: 'CA', slug: 'san-diego' },
  { city: 'Dallas', state: 'TX', slug: 'dallas' },
  { city: 'San Jose', state: 'CA', slug: 'san-jose' },
  { city: 'Austin', state: 'TX', slug: 'austin' },
  { city: 'Jacksonville', state: 'FL', slug: 'jacksonville' },
  { city: 'San Francisco', state: 'CA', slug: 'san-francisco' },
  { city: 'Columbus', state: 'OH', slug: 'columbus' },
  { city: 'Charlotte', state: 'NC', slug: 'charlotte' },
  { city: 'Indianapolis', state: 'IN', slug: 'indianapolis' },
  { city: 'Seattle', state: 'WA', slug: 'seattle' },
  { city: 'Denver', state: 'CO', slug: 'denver' },
  { city: 'Nashville', state: 'TN', slug: 'nashville' },
  { city: 'Oklahoma City', state: 'OK', slug: 'oklahoma-city' },
  { city: 'Washington DC', state: 'DC', slug: 'washington' },
  { city: 'Boston', state: 'MA', slug: 'boston' },
  { city: 'Las Vegas', state: 'NV', slug: 'las-vegas' },
  { city: 'Portland', state: 'OR', slug: 'portland' },
  { city: 'Memphis', state: 'TN', slug: 'memphis' },
  { city: 'Louisville', state: 'KY', slug: 'louisville' },
  { city: 'Baltimore', state: 'MD', slug: 'baltimore' },
  { city: 'Milwaukee', state: 'WI', slug: 'milwaukee' },
  { city: 'Albuquerque', state: 'NM', slug: 'albuquerque' },
  { city: 'Tucson', state: 'AZ', slug: 'tucson' },
  { city: 'Fresno', state: 'CA', slug: 'fresno' },
  { city: 'Sacramento', state: 'CA', slug: 'sacramento' },
  { city: 'Kansas City', state: 'MO', slug: 'kansas-city' },
  { city: 'Atlanta', state: 'GA', slug: 'atlanta' },
  { city: 'Miami', state: 'FL', slug: 'miami' },
  { city: 'Tampa', state: 'FL', slug: 'tampa' },
  { city: 'Raleigh', state: 'NC', slug: 'raleigh' },
  { city: 'Omaha', state: 'NE', slug: 'omaha' },
  { city: 'Minneapolis', state: 'MN', slug: 'minneapolis' },
  { city: 'Colorado Springs', state: 'CO', slug: 'colorado-springs' },
  { city: 'Virginia Beach', state: 'VA', slug: 'virginia-beach' },
  { city: 'Long Beach', state: 'CA', slug: 'long-beach' },
  { city: 'Oakland', state: 'CA', slug: 'oakland' },
  { city: 'Pittsburgh', state: 'PA', slug: 'pittsburgh' },
  { city: 'Cincinnati', state: 'OH', slug: 'cincinnati' },
  { city: 'Bakersfield', state: 'CA', slug: 'bakersfield' },
  { city: 'Orlando', state: 'FL', slug: 'orlando' },
  { city: 'St. Louis', state: 'MO', slug: 'st-louis' },
  { city: 'Cleveland', state: 'OH', slug: 'cleveland' },
  { city: 'Riverside', state: 'CA', slug: 'riverside' },
];

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
    { '@type': 'ListItem', position: 2, name: 'Rentals by City', item: 'https://emlakie.com/cities' },
  ],
};

const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: 'Apartments for Rent by City',
  description: 'Browse rental listings across major US cities',
  numberOfItems: MAJOR_CITIES.length,
  itemListElement: MAJOR_CITIES.map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: `Rentals in ${c.city}, ${c.state}`,
    url: `https://emlakie.com/rentals/city/${c.slug}`,
  })),
};

// Cities grouped by state for the A-Z section
const CITIES_BY_STATE: Record<string, { city: string; slug: string }[]> = {
  Alabama: [{ city: 'Birmingham', slug: 'birmingham' }, { city: 'Montgomery', slug: 'montgomery' }, { city: 'Huntsville', slug: 'huntsville' }],
  Alaska: [{ city: 'Anchorage', slug: 'anchorage' }],
  Arizona: [{ city: 'Phoenix', slug: 'phoenix' }, { city: 'Tucson', slug: 'tucson' }, { city: 'Mesa', slug: 'mesa' }, { city: 'Scottsdale', slug: 'scottsdale' }, { city: 'Tempe', slug: 'tempe' }],
  Arkansas: [{ city: 'Little Rock', slug: 'little-rock' }, { city: 'Fayetteville', slug: 'fayetteville' }],
  California: [{ city: 'Los Angeles', slug: 'los-angeles' }, { city: 'San Diego', slug: 'san-diego' }, { city: 'San Jose', slug: 'san-jose' }, { city: 'San Francisco', slug: 'san-francisco' }, { city: 'Fresno', slug: 'fresno' }, { city: 'Sacramento', slug: 'sacramento' }, { city: 'Long Beach', slug: 'long-beach' }, { city: 'Oakland', slug: 'oakland' }, { city: 'Bakersfield', slug: 'bakersfield' }, { city: 'Riverside', slug: 'riverside' }],
  Colorado: [{ city: 'Denver', slug: 'denver' }, { city: 'Colorado Springs', slug: 'colorado-springs' }, { city: 'Aurora', slug: 'aurora' }, { city: 'Fort Collins', slug: 'fort-collins' }],
  Connecticut: [{ city: 'Bridgeport', slug: 'bridgeport' }, { city: 'New Haven', slug: 'new-haven' }, { city: 'Hartford', slug: 'hartford' }],
  Delaware: [{ city: 'Wilmington', slug: 'wilmington' }],
  'District of Columbia': [{ city: 'Washington DC', slug: 'washington' }],
  Florida: [{ city: 'Jacksonville', slug: 'jacksonville' }, { city: 'Miami', slug: 'miami' }, { city: 'Tampa', slug: 'tampa' }, { city: 'Orlando', slug: 'orlando' }, { city: 'St. Petersburg', slug: 'st-petersburg' }, { city: 'Hialeah', slug: 'hialeah' }, { city: 'Fort Lauderdale', slug: 'fort-lauderdale' }, { city: 'Tallahassee', slug: 'tallahassee' }],
  Georgia: [{ city: 'Atlanta', slug: 'atlanta' }, { city: 'Augusta', slug: 'augusta' }, { city: 'Savannah', slug: 'savannah' }],
  Hawaii: [{ city: 'Honolulu', slug: 'honolulu' }],
  Idaho: [{ city: 'Boise', slug: 'boise' }],
  Illinois: [{ city: 'Chicago', slug: 'chicago' }, { city: 'Aurora', slug: 'aurora-il' }, { city: 'Rockford', slug: 'rockford' }],
  Indiana: [{ city: 'Indianapolis', slug: 'indianapolis' }, { city: 'Fort Wayne', slug: 'fort-wayne' }, { city: 'Evansville', slug: 'evansville' }],
  Iowa: [{ city: 'Des Moines', slug: 'des-moines' }, { city: 'Cedar Rapids', slug: 'cedar-rapids' }],
  Kansas: [{ city: 'Wichita', slug: 'wichita' }, { city: 'Overland Park', slug: 'overland-park' }],
  Kentucky: [{ city: 'Louisville', slug: 'louisville' }, { city: 'Lexington', slug: 'lexington' }],
  Louisiana: [{ city: 'New Orleans', slug: 'new-orleans' }, { city: 'Baton Rouge', slug: 'baton-rouge' }],
  Maine: [{ city: 'Portland', slug: 'portland-me' }],
  Maryland: [{ city: 'Baltimore', slug: 'baltimore' }, { city: 'Frederick', slug: 'frederick' }],
  Massachusetts: [{ city: 'Boston', slug: 'boston' }, { city: 'Worcester', slug: 'worcester' }, { city: 'Cambridge', slug: 'cambridge' }],
  Michigan: [{ city: 'Detroit', slug: 'detroit' }, { city: 'Grand Rapids', slug: 'grand-rapids' }, { city: 'Warren', slug: 'warren' }],
  Minnesota: [{ city: 'Minneapolis', slug: 'minneapolis' }, { city: 'Saint Paul', slug: 'saint-paul' }],
  Mississippi: [{ city: 'Jackson', slug: 'jackson-ms' }],
  Missouri: [{ city: 'Kansas City', slug: 'kansas-city' }, { city: 'St. Louis', slug: 'st-louis' }, { city: 'Springfield', slug: 'springfield-mo' }],
  Montana: [{ city: 'Billings', slug: 'billings' }, { city: 'Missoula', slug: 'missoula' }],
  Nebraska: [{ city: 'Omaha', slug: 'omaha' }, { city: 'Lincoln', slug: 'lincoln-ne' }],
  Nevada: [{ city: 'Las Vegas', slug: 'las-vegas' }, { city: 'Henderson', slug: 'henderson' }, { city: 'Reno', slug: 'reno' }],
  'New Hampshire': [{ city: 'Manchester', slug: 'manchester-nh' }, { city: 'Nashua', slug: 'nashua' }],
  'New Jersey': [{ city: 'Newark', slug: 'newark' }, { city: 'Jersey City', slug: 'jersey-city' }, { city: 'Paterson', slug: 'paterson' }],
  'New Mexico': [{ city: 'Albuquerque', slug: 'albuquerque' }, { city: 'Las Cruces', slug: 'las-cruces' }],
  'New York': [{ city: 'New York City', slug: 'new-york' }, { city: 'Buffalo', slug: 'buffalo' }, { city: 'Rochester', slug: 'rochester' }, { city: 'Syracuse', slug: 'syracuse' }],
  'North Carolina': [{ city: 'Charlotte', slug: 'charlotte' }, { city: 'Raleigh', slug: 'raleigh' }, { city: 'Greensboro', slug: 'greensboro' }, { city: 'Durham', slug: 'durham' }],
  'North Dakota': [{ city: 'Fargo', slug: 'fargo' }],
  Ohio: [{ city: 'Columbus', slug: 'columbus' }, { city: 'Cleveland', slug: 'cleveland' }, { city: 'Cincinnati', slug: 'cincinnati' }, { city: 'Toledo', slug: 'toledo' }],
  Oklahoma: [{ city: 'Oklahoma City', slug: 'oklahoma-city' }, { city: 'Tulsa', slug: 'tulsa' }],
  Oregon: [{ city: 'Portland', slug: 'portland' }, { city: 'Eugene', slug: 'eugene' }, { city: 'Salem', slug: 'salem-or' }],
  Pennsylvania: [{ city: 'Philadelphia', slug: 'philadelphia' }, { city: 'Pittsburgh', slug: 'pittsburgh' }, { city: 'Allentown', slug: 'allentown' }],
  'Rhode Island': [{ city: 'Providence', slug: 'providence' }],
  'South Carolina': [{ city: 'Columbia', slug: 'columbia-sc' }, { city: 'Charleston', slug: 'charleston' }],
  'South Dakota': [{ city: 'Sioux Falls', slug: 'sioux-falls' }],
  Tennessee: [{ city: 'Nashville', slug: 'nashville' }, { city: 'Memphis', slug: 'memphis' }, { city: 'Knoxville', slug: 'knoxville' }, { city: 'Chattanooga', slug: 'chattanooga' }],
  Texas: [{ city: 'Houston', slug: 'houston' }, { city: 'San Antonio', slug: 'san-antonio' }, { city: 'Dallas', slug: 'dallas' }, { city: 'Austin', slug: 'austin' }, { city: 'Fort Worth', slug: 'fort-worth' }, { city: 'El Paso', slug: 'el-paso' }, { city: 'Arlington', slug: 'arlington-tx' }, { city: 'Corpus Christi', slug: 'corpus-christi' }],
  Utah: [{ city: 'Salt Lake City', slug: 'salt-lake-city' }, { city: 'Provo', slug: 'provo' }, { city: 'West Valley City', slug: 'west-valley-city' }],
  Vermont: [{ city: 'Burlington', slug: 'burlington-vt' }],
  Virginia: [{ city: 'Virginia Beach', slug: 'virginia-beach' }, { city: 'Norfolk', slug: 'norfolk' }, { city: 'Chesapeake', slug: 'chesapeake' }, { city: 'Richmond', slug: 'richmond' }],
  Washington: [{ city: 'Seattle', slug: 'seattle' }, { city: 'Spokane', slug: 'spokane' }, { city: 'Tacoma', slug: 'tacoma' }, { city: 'Bellevue', slug: 'bellevue' }, { city: 'Federal Way', slug: 'federal-way' }, { city: 'Redmond', slug: 'redmond' }, { city: 'Kirkland', slug: 'kirkland' }, { city: 'Renton', slug: 'renton' }, { city: 'Kent', slug: 'kent' }, { city: 'Auburn', slug: 'auburn' }],
  'West Virginia': [{ city: 'Charleston', slug: 'charleston-wv' }, { city: 'Huntington', slug: 'huntington-wv' }],
  Wisconsin: [{ city: 'Milwaukee', slug: 'milwaukee' }, { city: 'Madison', slug: 'madison' }, { city: 'Green Bay', slug: 'green-bay' }],
  Wyoming: [{ city: 'Cheyenne', slug: 'cheyenne' }, { city: 'Casper', slug: 'casper' }],
};

export default function CitiesPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-gray-900" aria-current="page">Rentals by City</span>
      </nav>

      {/* Hero */}
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
          Apartments &amp; Houses for Rent — Browse by City
        </h1>
        <p className="mt-3 max-w-3xl text-lg text-gray-600">
          Find your next rental in any US city. Every listing on EMLAKIE comes directly from the landlord —
          no broker fees, no commissions, no middlemen. Browse over 50 major cities or explore all 50 states below.
        </p>
      </div>

      {/* Major Cities Grid */}
      <section className="mb-14">
        <h2 className="mb-5 text-xl font-bold text-gray-900">Top Cities for Rentals</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {MAJOR_CITIES.map((c) => (
            <Link
              key={c.slug}
              href={`/rentals/city/${c.slug}`}
              className="flex flex-col rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
            >
              <span className="font-semibold text-gray-900">{c.city}</span>
              <span className="text-xs text-gray-500">{c.state}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* States Strip */}
      <section className="mb-14 rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <h2 className="mb-4 text-xl font-bold text-gray-900">Browse Rentals by State</h2>
        <div className="grid grid-cols-2 gap-x-6 gap-y-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {US_STATES.map((s) => (
            <Link
              key={s.slug}
              href={`/rentals/state/${s.slug}`}
              className="text-sm text-gray-700 hover:text-brand-600"
            >
              {s.name}
            </Link>
          ))}
        </div>
      </section>

      {/* Cities by State A-Z */}
      <section className="mb-14">
        <h2 className="mb-6 text-xl font-bold text-gray-900">All Cities by State</h2>
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {Object.entries(CITIES_BY_STATE).sort(([a], [b]) => a.localeCompare(b)).map(([state, cities]) => (
            <div key={state}>
              <h3 className="mb-2 text-xs font-bold uppercase tracking-widest text-gray-400">{state}</h3>
              <ul className="space-y-1">
                {cities.map((c) => (
                  <li key={c.slug}>
                    <Link
                      href={`/rentals/city/${c.slug}`}
                      className="text-sm text-gray-700 hover:text-brand-600"
                    >
                      {c.city}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="rounded-2xl border border-brand-100 bg-brand-50 px-8 py-10 text-center">
        <h2 className="text-2xl font-extrabold text-gray-900">Don&apos;t see your city?</h2>
        <p className="mt-2 text-gray-600">
          Search across all active listings or filter by ZIP code to find rentals anywhere in the US.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href="/rentals"
            className="rounded-xl bg-brand-700 px-8 py-3 font-bold text-white transition hover:bg-brand-800"
          >
            Search all rentals
          </Link>
          <Link
            href="/landlords"
            className="rounded-xl border border-gray-200 bg-white px-8 py-3 font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-600"
          >
            List my property free
          </Link>
        </div>
      </section>
    </div>
  );
}
