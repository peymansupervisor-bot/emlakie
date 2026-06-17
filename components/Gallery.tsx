'use client';

import Image from 'next/image';
import { useState, useEffect, useCallback } from 'react';

interface Props {
  photos: string[];
  title: string;
}

export default function Gallery({ photos, title }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  const prev = useCallback(() => setActiveIndex((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setActiveIndex((i) => (i + 1) % photos.length), [photos.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape') setLightboxOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, prev, next]);

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/7] items-center justify-center rounded-2xl bg-gray-100 text-gray-400">
        <svg viewBox="0 0 32 32" className="h-16 w-16 fill-current opacity-30">
          <path d="M3 7a2 2 0 0 1 2-2h22a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zm2 0v11.586l4.293-4.293a1 1 0 0 1 1.414 0L14 17.586l5.293-5.293a1 1 0 0 1 1.414 0L27 18.586V7H5zm22 14.414-6.293-6.293L14 20.414l-4.293-4.293L5 20.707V25h22v-3.586z" />
        </svg>
      </div>
    );
  }

  const openAt = (i: number) => { setActiveIndex(i); setLightboxOpen(true); };

  return (
    <>
      {/* ── Photo grid ── */}
      <div className="grid h-[420px] grid-cols-4 grid-rows-2 gap-1.5 overflow-hidden rounded-2xl sm:h-[480px]">
        {/* Hero — spans 2 cols and 2 rows */}
        <button
          onClick={() => openAt(0)}
          className="relative col-span-2 row-span-2 overflow-hidden focus:outline-none"
          aria-label="Open photo gallery"
        >
          <Image
            src={photos[0]}
            alt={`${title} — photo 1`}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition duration-300 hover:scale-[1.02]"
          />
        </button>

        {/* 4 smaller tiles */}
        {[1, 2, 3, 4].map((i) => (
          <button
            key={i}
            onClick={() => openAt(i)}
            disabled={!photos[i]}
            className="relative overflow-hidden bg-gray-100 focus:outline-none"
            aria-label={photos[i] ? `View photo ${i + 1}` : undefined}
          >
            {photos[i] ? (
              <>
                <Image
                  src={photos[i]}
                  alt={`${title} — photo ${i + 1}`}
                  fill
                  sizes="25vw"
                  className="object-cover transition duration-300 hover:scale-[1.02]"
                />
                {/* "See all" overlay on last tile */}
                {i === 4 && photos.length > 5 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                    <span className="text-lg font-bold text-white">+{photos.length - 5} more</span>
                  </div>
                )}
              </>
            ) : (
              <div className="h-full w-full bg-gray-100" />
            )}
          </button>
        ))}

        </div>

      {/* "See all photos" button below grid */}
      {photos.length > 1 && (
        <button
          onClick={() => openAt(0)}
          className="mt-2 flex items-center gap-1.5 self-end rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50 transition"
        >
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
          </svg>
          See all {photos.length} photos
        </button>
      )}

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-black/95"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Top bar */}
          <div
            className="flex items-center justify-between px-4 py-3"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="text-sm font-semibold text-white/80">
              {activeIndex + 1} / {photos.length}
            </span>
            <button
              onClick={() => setLightboxOpen(false)}
              className="rounded-lg p-2 text-white/70 hover:bg-white/10 hover:text-white transition"
              aria-label="Close gallery"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Main image */}
          <div
            className="relative flex flex-1 items-center justify-center px-16"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative h-full w-full max-h-[75vh]">
              <Image
                src={photos[activeIndex]}
                alt={`${title} — photo ${activeIndex + 1}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            {/* Prev arrow */}
            {photos.length > 1 && (
              <button
                onClick={prev}
                className="absolute left-2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                aria-label="Previous photo"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}

            {/* Next arrow */}
            {photos.length > 1 && (
              <button
                onClick={next}
                className="absolute right-2 flex h-12 w-12 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
                aria-label="Next photo"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

          {/* Thumbnail strip */}
          {photos.length > 1 && (
            <div
              className="flex gap-2 overflow-x-auto px-4 py-3"
              onClick={(e) => e.stopPropagation()}
            >
              {photos.map((photo, i) => (
                <button
                  key={photo}
                  onClick={() => setActiveIndex(i)}
                  className={`relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                    i === activeIndex ? 'border-white' : 'border-transparent opacity-50 hover:opacity-80'
                  }`}
                  aria-label={`Go to photo ${i + 1}`}
                >
                  <Image src={photo} alt={`Thumbnail ${i + 1}`} fill sizes="96px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
