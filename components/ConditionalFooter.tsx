'use client';

import { usePathname } from 'next/navigation';
import Footer from './Footer';

// The /rentals search results page renders its own Footer inside the
// scrollable listings column (split/map view keeps the map pinned while
// only the listings panel scrolls, Redfin/Zillow-style) — skip the global
// one there to avoid a duplicate.
export default function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname === '/rentals') return null;
  return <Footer />;
}
