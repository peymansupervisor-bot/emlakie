'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function BfcacheRefresh() {
  const router = useRouter();

  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) router.refresh();
    }
    window.addEventListener('pageshow', handlePageShow);
    return () => window.removeEventListener('pageshow', handlePageShow);
  }, [router]);

  return null;
}
