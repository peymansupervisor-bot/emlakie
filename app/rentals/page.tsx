import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import Filters from '@/components/Filters';
import RentalsClient from '@/components/RentalsClient';
import SeoLinkGrid from '@/components/SeoLinkGrid';
import { getListings, getAllMappableListings, getTrendingCities } from '@/lib/api';
import { ListingFilters } from '@/lib/types';
import { isAddressQuery } from '@/lib/address-utils';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Homes & Apartments for Rent',
  description:
    'Search houses, apartments, condos, and townhomes for rent directly from landlords. Filter by price, bedrooms, and property type.',
  alternates: { canonical: 'https://emlakie.com/rentals' },
  openGraph: {
    title: 'Homes & Apartments for Rent | EMLAKIE',
    description: 'Search rentals directly from landlords — no middlemen, no fees.',
    type: 'website',
    url: 'https://emlakie.com/rentals',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE Rentals' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Homes & Apartments for Rent | EMLAKIE',
    description: 'Search rentals directly from landlords — no middlemen, no fees.',
    images: ['/og-image.png'],
  },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Homes & Apartments for Rent | EMLAKIE',
  description:
    'Search houses, apartments, condos, and townhomes for rent directly from landlords. Filter by price, bedrooms, and property type.',
  url: 'https://emlakie.com/rentals',
  isPartOf: { '@type': 'WebSite', name: 'EMLAKIE', url: 'https://emlakie.com' },
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
      { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://emlakie.com/rentals' },
    ],
  },
};

export default async function RentalsPage({
  searchParams,
}: {
  searchParams: ListingFilters;
}) {

  const [{ listings, total, usingSampleData }, allMapListings, trendingCities] = await Promise.all([
    getListings(searchParams),
    getAllMappableListings(),
    getTrendingCities(8),
  ]);

  const searchTerm = searchParams.q || searchParams.city;
  const isZipSearch = searchTerm && /^\d{5}$/.test(searchTerm.trim());
  const propertyTypeHeadings: Record<string, string> = {
    apartment: 'Apartments for Rent',
    house: 'Houses for Rent',
    condo: 'Condos for Rent',
    townhouse: 'Townhomes for Rent',
    studio: 'Studios for Rent',
  };
  const heading = searchTerm
    ? `Rentals in ${isZipSearch ? 'ZIP ' : ''}${searchTerm}`
    : (searchParams.propertyType && propertyTypeHeadings[searchParams.propertyType as string])
    ?? 'Homes & Apartments for Rent';

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Filters bar — relative + z-index so dropdown overlays the overflow-hidden RentalsClient below */}
      <div className="relative z-20 border-b border-gray-100 bg-white px-4 py-3 sm:px-6">
        <Suspense>
          <Filters />
        </Suspense>
      </div>

      {/* Map + list view */}
      <Suspense>
        <RentalsClient
          listings={listings}
          allMapListings={allMapListings}
          total={total}
          page={Math.max(1, Number(searchParams.page ?? 1))}
          usingSampleData={usingSampleData}
          heading={heading}
          filters={searchParams as Record<string, string>}
          searchLabel={heading}
        />
      </Suspense>

      {/* SEO link grid — only shown when no active search filters */}
      {!searchParams.q && !searchParams.city && !searchParams.zip && (
        <div className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
          <SeoLinkGrid trendingCities={trendingCities} />
        </div>
      )}
    </div>
  );
}
