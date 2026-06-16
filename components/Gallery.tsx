'use client';

import Image from 'next/image';
import { useState } from 'react';

export default function Gallery({ photos, title }: { photos: string[]; title: string }) {
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[16/9] items-center justify-center rounded-2xl bg-gray-100 text-gray-400" aria-label="No photos available">
        <svg viewBox="0 0 32 32" className="h-16 w-16 fill-current opacity-40" aria-hidden="true">
          <path d="M16 3 3 14h4v13h8v-8h2v8h8V14h4L16 3z" />
        </svg>
      </div>
    );
  }

  return (
    <div>
      <div className="relative aspect-[16/9] overflow-hidden rounded-2xl bg-gray-100">
        <Image
          src={photos[active]}
          alt={`${title} — photo ${active + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
      </div>

      {photos.length > 1 && (
        <div className="mt-3 flex gap-3 overflow-x-auto pb-1">
          {photos.map((photo, i) => (
            <button
              key={photo}
              onClick={() => setActive(i)}
              aria-label={`Show photo ${i + 1} of ${photos.length}`}
              aria-pressed={i === active}
              className={`relative h-24 w-32 shrink-0 overflow-hidden rounded-lg border-2 transition ${
                i === active ? 'border-brand-600' : 'border-transparent opacity-70 hover:opacity-100'
              }`}
            >
              <Image src={photo} alt={`Photo ${i + 1} of ${photos.length}`} fill sizes="112px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
