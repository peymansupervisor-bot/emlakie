import Image from 'next/image';
import Link from 'next/link';
import { getListings } from '@/lib/api';

export default async function RecentListings() {
  const { listings } = await getListings();
  const recent = listings.slice(0, 3);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">Just listed</p>
      {recent.map((l) => (
        <Link
          key={l.id}
          href={l.slug ? `/rentals/${l.slug}` : `/rentals/${l.id}`}
          className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 shadow-card transition hover:border-brand-300 hover:shadow-card-hover"
        >
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-gray-100">
            {l.photos?.[0] ? (
              <Image
                src={l.photos[0]}
                alt={`${l.city} rental`}
                fill
                className="object-cover"
                sizes="56px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <svg className="h-6 w-6 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9.75L12 3l9 6.75V21H3V9.75z" />
                </svg>
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-gray-900">${l.price.toLocaleString()}<span className="text-xs font-medium text-gray-400">/mo</span></p>
            <p className="truncate text-xs text-gray-500">{l.city}, {l.state}</p>
            <p className="text-xs text-gray-400">{l.bedrooms}bd · {l.bathrooms}ba</p>
          </div>
          <svg className="h-4 w-4 shrink-0 text-gray-300 transition group-hover:text-brand-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ))}
      <Link href="/rentals" className="text-center text-xs font-semibold text-brand-600 hover:text-brand-700">
        View all listings →
      </Link>
    </div>
  );
}
