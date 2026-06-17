import { Suspense } from 'react';
import type { Metadata } from 'next';
import Filters from '@/components/Filters';
import RentalsClient from '@/components/RentalsClient';
import { getListings } from '@/lib/api';
import { ListingFilters } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Homes & Apartments for Rent',
  description:
    'Search houses, apartments, condos, and townhomes for rent directly from landlords. Filter by price, bedrooms, and property type.',
  alternates: { canonical: 'https://emlakie.com/rentals' },
  openGraph: {
    title: 'Homes & Apartments for Rent | EMLAKIE',
    description: 'Search rentals directly from landlords — no middlemen, no fees.',
    type: 'website',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'EMLAKIE Rentals' }],
  },
  twitter: { card: 'summary_large_image', images: ['/logo.png'] },
};

export default async function RentalsPage({
  searchParams,
}: {
  searchParams: ListingFilters;
}) {
  const { listings, total, usingSampleData } = await getListings(searchParams);

  const isZipSearch = searchParams.city && /^\d{5}$/.test(searchParams.city.trim());
  const heading = searchParams.city
    ? `Rentals in ${isZipSearch ? 'ZIP ' : ''}${searchParams.city}`
    : 'All rentals';

  return (
    <div className="flex flex-col">
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
          total={total}
          usingSampleData={usingSampleData}
          heading={heading}
          filters={searchParams as Record<string, string>}
          searchLabel={heading}
        />
      </Suspense>
    </div>
  );
}
