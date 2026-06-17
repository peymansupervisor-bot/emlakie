'use client';

import { useState } from 'react';

interface Props {
  lat?: number;
  lng?: number;
  address?: string;
  city?: string;
  state?: string;
}

export default function StreetView({ lat, lng, address, city, state }: Props) {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) return null;

  const location = lat && lng
    ? `${lat},${lng}`
    : [address, city, state].filter(Boolean).join(', ');

  if (!location) return null;

  const src = `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${encodeURIComponent(location)}&heading=0&pitch=0&fov=90`;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-gray-900">Street View</h2>
      <div className="relative mt-3 aspect-[16/7] overflow-hidden rounded-2xl bg-gray-100">
        {!loaded && !error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
          </div>
        )}
        {error ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-gray-400">
            <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <p className="text-sm">Street View not available for this location</p>
          </div>
        ) : (
          <iframe
            src={src}
            title="Street View"
            className={`h-full w-full border-0 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        )}
      </div>
    </div>
  );
}
