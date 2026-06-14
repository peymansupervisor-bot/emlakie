import { Suspense } from 'react';
import type { Metadata } from 'next';
import ListingCard from '@/components/ListingCard';
import Filters from '@/components/Filters';
import { getListings } from '@/lib/api';
import { ListingFilters } from '@/lib/types';

export const metadata: Metadata = {
  title: 'Homes & Apartments for Rent',
  description:
    'Search houses, apartments, condos, and townhomes for rent. Filter by price, bedrooms, and property type.',
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
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <h1 className="text-2xl font-extrabold text-gray-900">{heading}</h1>
      <p className="mt-1 text-sm text-gray-600">
        {total} {total === 1 ? 'home' : 'homes'} available
      </p>

      <div className="mt-5">
        <Suspense>
          <Filters />
        </Suspense>
      </div>

      {usingSampleData && (
        <div className="mt-5 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
          You&apos;re viewing sample listings while we onboard new homes. Real
          listings are coming soon — download the app to be first to know.
        </div>
      )}

      {listings.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      ) : (
        <div className="mt-16 text-center">
          <p className="text-lg font-semibold text-gray-900">No homes match those filters</p>
          <p className="mt-2 text-gray-600">
            Try widening your price range or removing a filter.
          </p>
        </div>
      )}
    </div>
  );
}
