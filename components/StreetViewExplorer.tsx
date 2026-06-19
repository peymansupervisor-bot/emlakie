'use client';

import { useState } from 'react';

interface Props {
  address: string;
  apiKey: string;
  lat?: number;
  lng?: number;
}

export default function StreetViewExplorer({ address, apiKey, lat, lng }: Props) {
  const [expanded, setExpanded] = useState(false);
  const [imgFailed, setImgFailed] = useState(false);

  // Prefer coordinates — avoids wrong-parcel geocoding ambiguity
  // Strip unit numbers (#N, Apt N, Unit N) from address fallback — Street View embed rejects them
  const streetAddress = address.replace(/\s*(#|apt\.?|unit)\s*[\w-]+/gi, '').trim();
  const location = lat && lng ? `${lat},${lng}` : encodeURIComponent(streetAddress);
  const staticSrc = `https://maps.googleapis.com/maps/api/streetview?size=800x300&location=${location}&fov=90&pitch=0&key=${apiKey}`;
  const embedSrc = `https://www.google.com/maps/embed/v1/streetview?location=${location}&key=${apiKey}&fov=90`;

  const showPlaceholder = imgFailed && !expanded;

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold text-gray-900 mb-3">Explore the Neighborhood</h2>

      <div
        className="relative w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm cursor-pointer group transition-all duration-500"
        style={{ height: expanded ? '420px' : '160px' }}
        role={!expanded ? 'button' : undefined}
        tabIndex={!expanded ? 0 : undefined}
        aria-label={!expanded ? 'Explore Street View' : undefined}
        onClick={() => { if (!expanded) setExpanded(true); }}
        onKeyDown={(e) => { if (!expanded && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setExpanded(true); } }}
      >
        {/* Static preview image */}
        {!imgFailed && !expanded && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={staticSrc}
            alt={`Street view of ${address}`}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        )}

        {/* Fallback placeholder when static image fails */}
        {showPlaceholder && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-gray-800 to-gray-900">
            <svg viewBox="0 0 24 24" className="h-10 w-10 text-white/40 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <p className="text-white/60 text-sm">Click to explore street view</p>
          </div>
        )}

        {/* Gradient overlay on preview */}
        {!expanded && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        )}

        {/* Interactive Street View iframe */}
        {expanded && (
          <iframe
            src={embedSrc}
            title="Street view"
            className="absolute inset-0 w-full h-full border-0"
            allowFullScreen
          />
        )}

        {/* Walk the street CTA */}
        {!expanded && (
          <div className="absolute bottom-4 left-0 right-0 flex items-center justify-center">
            <button className="flex items-center gap-2 rounded-full bg-white px-5 py-2 text-sm font-semibold text-gray-900 shadow-lg hover:bg-gray-50 transition group-hover:scale-105" tabIndex={-1} aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-4 w-4 text-brand-600" fill="none" strokeWidth="2" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <circle cx="12" cy="5" r="1.5" />
                <path d="M9 9.5h6M10.5 9.5l-1.5 5 2 1.5 1 3M13.5 9.5l1.5 5-2 1.5" />
              </svg>
              Walk the street
              <span className="text-gray-400">→</span>
            </button>
          </div>
        )}

        {/* Collapse handle */}
        {expanded && (
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded(false); }}
            className="absolute bottom-3 right-3 z-10 flex items-center gap-1.5 rounded-full bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-sm hover:bg-black/80 transition"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 15l-6-6-6 6" />
            </svg>
            Collapse
          </button>
        )}
      </div>

      <p className="mt-2 text-xs text-gray-400 pl-1">Street-level view · powered by Google Street View</p>
    </div>
  );
}
