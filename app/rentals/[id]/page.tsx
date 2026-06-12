import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Gallery from '@/components/Gallery';
import { getListing } from '@/lib/api';
import { formatBaths, formatBeds, formatPrice, formatPropertyType, formatSqft } from '@/lib/format';

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const listing = await getListing(params.id);
  if (!listing) return { title: 'Listing not found' };
  return {
    title: `${listing.title} — ${formatPrice(listing.price)}`,
    description: listing.description?.slice(0, 160),
  };
}

export default async function ListingPage({ params }: Props) {
  const listing = await getListing(params.id);
  if (!listing) notFound();

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <Link href="/rentals" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
        ← Back to search
      </Link>

      <div className="mt-4">
        <Gallery photos={listing.photos ?? []} title={listing.title} />
      </div>

      <div className="mt-8 flex flex-col gap-10 lg:flex-row">
        {/* Main column */}
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-extrabold text-gray-900">{formatPrice(listing.price)}</h1>
            {listing.isSample && (
              <span className="rounded-md bg-gray-900/80 px-2 py-1 text-xs font-semibold text-white">
                Sample listing
              </span>
            )}
          </div>

          <p className="mt-2 text-lg font-semibold text-gray-800">
            {formatBeds(listing.bedrooms)} · {formatBaths(listing.bathrooms)} ·{' '}
            {formatSqft(listing.sqft)} · {formatPropertyType(listing.property_type)}
          </p>
          <p className="mt-1 text-gray-600">
            {listing.address}, {listing.city}
            {listing.state ? `, ${listing.state}` : ''} {listing.zip ?? ''}
          </p>

          <h2 className="mt-8 text-xl font-bold text-gray-900">{listing.title}</h2>
          {listing.description && (
            <p className="mt-3 whitespace-pre-line leading-relaxed text-gray-700">
              {listing.description}
            </p>
          )}

          {listing.amenities?.length > 0 && (
            <>
              <h2 className="mt-8 text-xl font-bold text-gray-900">Amenities</h2>
              <ul className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                {listing.amenities.map((amenity) => (
                  <li key={amenity} className="flex items-center gap-2 text-gray-700">
                    <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 stroke-brand-600" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m5 13 4 4L19 7" />
                    </svg>
                    {amenity}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* Contact card */}
        <aside className="lg:w-80">
          <div className="sticky top-24 rounded-2xl border border-gray-200 p-6 shadow-card">
            <h2 className="text-lg font-bold text-gray-900">Interested in this home?</h2>
            <p className="mt-2 text-sm text-gray-600">
              Message the landlord and apply directly in the EMLAKIE app — it takes
              less than two minutes.
            </p>
            <Link
              href="/app"
              className="mt-5 block rounded-xl bg-brand-600 py-3 text-center font-semibold text-white transition hover:bg-brand-700"
            >
              Apply in the App
            </Link>
            <p className="mt-3 text-center text-xs text-gray-500">
              Free for renters. No account needed to browse.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
