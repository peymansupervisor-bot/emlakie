'use client';

import { useState } from 'react';
import Image from 'next/image';

interface Props {
  type: 'youtube' | 'matterport' | 'other';
  videoId?: string;   // YouTube only
  src?: string;       // Matterport / other
  title: string;
}

export default function VideoEmbed({ type, videoId, src, title }: Props) {
  const [active, setActive] = useState(false);

  if (type === 'youtube' && videoId) {
    const thumb = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    return (
      <div className="relative w-full overflow-hidden rounded-2xl bg-black" style={{ paddingBottom: '56.25%' }}>
        {active ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1`}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="absolute inset-0 w-full h-full group"
            aria-label={`Play ${title}`}
          >
            <Image
              src={thumb}
              alt={title}
              fill
              className="object-cover opacity-80 group-hover:opacity-100 transition"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            {/* Play button */}
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-black/70 backdrop-blur-sm transition group-hover:bg-brand-600">
                <svg viewBox="0 0 24 24" className="h-7 w-7 translate-x-0.5 fill-white" aria-hidden="true">
                  <path d="M8 5v14l11-7L8 5z" />
                </svg>
              </span>
            </span>
          </button>
        )}
      </div>
    );
  }

  // Matterport / other iframeable tour
  if ((type === 'matterport' || type === 'other') && src) {
    return (
      <div className="relative w-full overflow-hidden rounded-2xl" style={{ paddingBottom: '56.25%' }}>
        {active ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={src}
            title={title}
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setActive(true)}
            className="absolute inset-0 flex w-full flex-col items-center justify-center gap-3 bg-gray-900 group"
            aria-label={`Load ${title}`}
          >
            <svg viewBox="0 0 24 24" className="h-12 w-12 text-gray-400" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5l-9-5.25L3 7.5m18 0l-9 5.25m9-5.25v9l-9 5.25M3 7.5l9 5.25M3 7.5v9l9 5.25m0-9v9" />
            </svg>
            <span className="rounded-full bg-white/10 px-5 py-2 text-sm font-semibold text-white backdrop-blur-sm transition group-hover:bg-brand-600">
              Click to load 3D tour
            </span>
          </button>
        )}
      </div>
    );
  }

  return null;
}
