'use client';

import { useState, useEffect, useRef } from 'react';

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
  const [active, setActive] = useState(false);
  const [heading, setHeading] = useState<number | null>(null);
  const [headingReady, setHeadingReady] = useState(!lat || !lng);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!lat || !lng) return;
    fetch(`/api/streetview-heading?lat=${lat}&lng=${lng}`)
      .then(r => r.json())
      .then(d => setHeading(d.heading ?? null))
      .catch(() => {})
      .finally(() => setHeadingReady(true));
  }, [lat, lng]);

  if (!apiKey) return null;

  const location = lat && lng ? `${lat},${lng}` : [address, city, state].filter(Boolean).join(', ');
  if (!location) return null;

  const headingParam = headingReady && heading !== null ? `&heading=${heading}` : '';
  const src = `https://www.google.com/maps/embed/v1/streetview?key=${apiKey}&location=${encodeURIComponent(location)}${headingParam}&pitch=0&fov=90`;

  function handleLoad() {
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
          className={`h-full w-full border-0 transition-opacity duration-500 ${loaded ? 'opacity-100' : 'opacity-0'} ${active ? '' : 'pointer-events-none'}`}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          onLoad={handleLoad}
          onError={() => setError(true)}
        />
        {!active && loaded && (
          <div
            className="absolute inset-0 flex cursor-pointer items-end justify-center pb-4"
            onClick={() => setActive(true)}
          >
            <span className="rounded-full bg-black/60 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              Click to interact with Street View
            </span>
          </div>
        )}
      </div>
      <p className="mt-2 text-xs text-gray-400">
        Street View imagery is captured by Google from the roadway and may show the building directly across the street rather than the listed property. Use it to explore the neighborhood and street environment.
      </p>
    </div>
  );
}
