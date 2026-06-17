'use client';

import { useState, useRef } from 'react';

interface Props {
  lat?: number;
  lng?: number;
  address?: string;
  city?: string;
  state?: string;
}

export default function StreetView({ lat, lng, address, city, state }: Props) {
  const [error, setError] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  if (!apiKey) return null;

  const location = lat && lng
    ? `${lat},${lng}`
    : [address, city, state].filter(Boolean).join(', ');

  if (!location) return null;

  const src = `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${encodeURIComponent(location)}&heading=0&pitch=0&fov=90`;

  function handleLoad() {
    // Google returns a 200 with an error page when the API key is unauthorized.
    // Detect this by checking if the iframe URL redirected to an error endpoint.
    try {
      const href = iframeRef.current?.contentWindow?.location?.href ?? '';
      if (href.includes('Sorry') || href.includes('error')) { setError(true); return; }
    } catch {
      // cross-origin — iframe loaded normally
    }
    setLoaded(true);
  }

  if (error) return null;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-bold text-gray-900">Street View</h2>
      <div className="relative mt-3 aspect-[16/7] overflow-hidden rounded-2xl bg-gray-100">
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-green-600" />
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={src}
          title="Street View"
          className={`h-full w-full border-0 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'}`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={handleLoad}
          onError={() => setError(true)}
        />
      </div>
    </div>
  );
}
