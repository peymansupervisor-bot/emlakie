'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

interface Props {
  photos: string[];
  title: string;
}

function PhotoPlaceholder() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gray-100">
      <svg viewBox="0 0 32 32" className="h-12 w-12 fill-current text-gray-300" aria-hidden="true">
        <path d="M3 7a2 2 0 0 1 2-2h22a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zm2 0v11.586l4.293-4.293a1 1 0 0 1 1.414 0L14 17.586l5.293-5.293a1 1 0 0 1 1.414 0L27 18.586V7H5zm22 14.414-6.293-6.293L14 20.414l-4.293-4.293L5 20.707V25h22v-3.586z" />
      </svg>
    </div>
  );
}

export default function Gallery({ photos, title }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [failedIndices, setFailedIndices] = useState<Set<number>>(new Set());
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const thumbsRef = useRef<HTMLDivElement>(null);

  const markFailed = useCallback((i: number) => {
    setFailedIndices(prev => new Set(prev).add(i));
  }, []);

  const prev = useCallback(() => setActiveIndex((i) => (i - 1 + photos.length) % photos.length), [photos.length]);
  const next = useCallback(() => setActiveIndex((i) => (i + 1) % photos.length), [photos.length]);

  // Scroll active thumbnail into view
  useEffect(() => {
    const container = thumbsRef.current;
    if (!container) return;
    const active = container.children[activeIndex] as HTMLElement | undefined;
    active?.scrollIntoView({ block: 'nearest', inline: 'center', behavior: 'smooth' });
  }, [activeIndex]);

  const lightboxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'Escape' && lightboxOpen) setLightboxOpen(false);
      // Focus trap: keep Tab inside the lightbox
      if (e.key === 'Tab' && lightboxOpen && lightboxRef.current) {
        const focusable = Array.from(
          lightboxRef.current.querySelectorAll<HTMLElement>(
            'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
          )
        ).filter((el) => !el.hasAttribute('disabled'));
        if (focusable.length === 0) { e.preventDefault(); return; }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus(); }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus(); }
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [lightboxOpen, prev, next]);

  useEffect(() => {
    document.body.style.overflow = lightboxOpen ? 'hidden' : '';
    if (lightboxOpen) closeButtonRef.current?.focus();
    return () => { document.body.style.overflow = ''; };
  }, [lightboxOpen]);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/7] items-center justify-center rounded-2xl bg-gray-100 text-gray-500">
        <svg viewBox="0 0 32 32" className="h-16 w-16 fill-current opacity-30" aria-hidden="true">
          <path d="M3 7a2 2 0 0 1 2-2h22a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zm2 0v11.586l4.293-4.293a1 1 0 0 1 1.414 0L14 17.586l5.293-5.293a1 1 0 0 1 1.414 0L27 18.586V7H5zm22 14.414-6.293-6.293L14 20.414l-4.293-4.293L5 20.707V25h22v-3.586z" />
        </svg>
      </div>
    );
  }

  return (
    <>
      {/* ── Main carousel ── */}
      <div className="overflow-hidden rounded-xl">
        {/* Main image */}
        <div className="relative aspect-[16/9] w-full bg-gray-100">
          {failedIndices.has(activeIndex) ? (
            <PhotoPlaceholder />
          ) : (
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={photos[activeIndex]}
              alt={`${title} — photo ${activeIndex + 1}`}
              className="absolute inset-0 h-full w-full object-cover"
              onError={() => markFailed(activeIndex)}
            />
          )}

          {/* Prev arrow */}
          {photos.length > 1 && (
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
              aria-label="Previous photo"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}

          {/* Next arrow */}
          {photos.length > 1 && (
            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
              aria-label="Next photo"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          )}

          {/* Bottom overlays */}
          <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between px-3 py-2">
            <button
              onClick={() => setLightboxOpen(true)}
              className="rounded bg-black/50 px-2 py-1 text-xs text-white hover:bg-black/70 transition"
            >
              Click to enlarge
            </button>
            {photos.length > 1 && (
              <span className="rounded bg-black/50 px-2 py-1 text-xs text-white">
                {activeIndex + 1} / {photos.length}
              </span>
            )}
          </div>
        </div>

        {/* Thumbnail strip */}
        {photos.length > 1 && (
          <div
            ref={thumbsRef}
            className="flex gap-1.5 overflow-x-auto bg-gray-50 p-2 scrollbar-hide"
          >
            {photos.map((photo, i) => (
              <button
                key={photo}
                onClick={() => setActiveIndex(i)}
                className={`relative h-16 w-24 shrink-0 overflow-hidden rounded transition ${
                  i === activeIndex
                    ? 'ring-2 ring-green-600 ring-offset-1'
                    : 'opacity-70 hover:opacity-100'
                }`}
                aria-label={`Go to photo ${i + 1}`}
              >
                {failedIndices.has(i) ? (
                  <PhotoPlaceholder />
                ) : (
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={photo} alt={`Thumbnail ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" onError={() => markFailed(i)} />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* View full screen link */}
      {photos.length > 1 && (
        <button
          onClick={() => setLightboxOpen(true)}
          className="mt-1 text-xs text-gray-500 underline hover:text-gray-700 transition"
        >
          View full screen
        </button>
      )}

      {/* ── Lightbox ── */}
      {lightboxOpen && (
        <div
          ref={lightboxRef}
          role="dialog"
          aria-modal="true"
          aria-label={`Photo gallery — ${title}`}
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
              ref={closeButtonRef}
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
              {failedIndices.has(activeIndex) ? (
                <PhotoPlaceholder />
              ) : (
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photos[activeIndex]}
                  alt={`${title} — photo ${activeIndex + 1}`}
                  className="absolute inset-0 h-full w-full object-contain"
                  onError={() => markFailed(activeIndex)}
                />
              )}
            </div>

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
                  {failedIndices.has(i) ? (
                    <PhotoPlaceholder />
                  ) : (
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={photo} alt={`Thumbnail ${i + 1}`} className="absolute inset-0 h-full w-full object-cover" loading="lazy" onError={() => markFailed(i)} />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
