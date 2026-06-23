import Link from 'next/link';
import Image from 'next/image';
import { getListings } from '@/lib/api';

export default async function RecentListings() {
  const { listings } = await getListings();
  const now = Date.now();

  // Prefer featured listings; fall back to top-scored ones
  const featured = listings
    .filter((l) => (l as unknown as Record<string, unknown>).featured_until
      ? new Date((l as unknown as Record<string, unknown>).featured_until as string).getTime() > now
      : false
    )
    .slice(0, 2);

  const pool = featured.length >= 2 ? featured : listings;
  const cards = [...pool].sort((a, b) => b.price - a.price).slice(0, 2);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-center text-xs font-semibold uppercase tracking-widest text-gray-500">Sponsored listings</p>
      {cards.map((l) => {
        const href = l.slug ? `/rentals/${l.slug}` : `/rentals/${l.id}`;
        return (
          <Link
            key={l.id}
            href={href}
            className="group relative overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-card transition hover:shadow-card-hover hover:border-brand-300"
          >
            {/* Hero image */}
            <div className="relative h-40 w-full bg-gray-100">
              {l.photos?.[0] ? (
                <Image
                  src={l.photos[0]}
                  alt={`Rental in ${l.city}`}
                  fill
                  sizes="(max-width: 768px) 100vw, 380px"
                  className="object-cover transition group-hover:scale-105 duration-300"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9.75L12 3l9 6.75V21H3V9.75z" />
                  </svg>
                </div>
              )}
              {/* Featured badge */}
              <span className="absolute top-2 left-2 rounded-full bg-brand-600 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
                Featured
              </span>
            </div>

            {/* Details */}
            <div className="p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-base font-bold text-gray-900">
                  ${l.price.toLocaleString()}
                  <span className="text-xs font-medium text-gray-400">/mo</span>
                </p>
                <p className="text-xs text-gray-500 shrink-0">{l.bedrooms}bd · {l.bathrooms}ba</p>
              </div>
              <p className="mt-0.5 truncate text-xs text-gray-500">{l.city}, {l.state}</p>
            </div>
          </Link>
        );
      })}

      <Link href="/rentals" className="text-center text-xs font-semibold text-brand-600 hover:text-brand-700">
        View all listings →
      </Link>
    </div>
  );
}
