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
        <div
          className="absolute inset-0 flex cursor-pointer items-end justify-center pb-4"
          onClick={() => setActive(true)}
        >
          <span className="rounded-full bg-black/60 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
            Click to interact with map
          </span>
        </div>
      )}
    </div>
  );
}
