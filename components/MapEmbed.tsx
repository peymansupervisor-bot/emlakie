'use client';

import { useState } from 'react';

interface Props {
  src: string;
  title?: string;
}

export default function MapEmbed({ src, title = 'Property location' }: Props) {
  const [active, setActive] = useState(false);

  return (
    <div className="relative h-64 w-full overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
      <iframe
        src={src}
        title={title}
        className={`h-full w-full border-0 ${active ? '' : 'pointer-events-none'}`}
        loading="lazy"
      />
      {!active && (
        <button
          type="button"
          className="absolute inset-0 flex cursor-pointer items-end justify-center pb-4 w-full"
          onClick={() => setActive(true)}
          aria-label="Activate interactive map"
        >
          <span className="rounded-full bg-black/60 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm" aria-hidden="true">
            Click to interact with map
          </span>
        </button>
      )}
    </div>
  );
}
