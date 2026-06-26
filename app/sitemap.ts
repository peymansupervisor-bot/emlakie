import type { MetadataRoute } from 'next';
import { getAllZips, getAllCities, getListingsForSitemap } from '@/lib/api';
import { posts } from '@/lib/blog';
import { US_STATES, stateByAbbr, PRELAUNCH_STATE_SLUGS } from '@/lib/states';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://emlakie.com';
  const [zips, cities, listings] = await Promise.all([getAllZips(), getAllCities(), getListingsForSitemap()]);

  const listingPages: MetadataRoute.Sitemap = listings
    .filter(l => l.slug || l.id)
    .map(l => ({
      url: `${base}/rentals/${l.slug ?? l.id}`,
      // Real per-listing freshness so Google trusts lastmod and recrawls
      // updated listings sooner (falls back to now if the field is missing).
      lastModified: l.refreshed_at ? new Date(l.refreshed_at) : new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

  const zipPages: MetadataRoute.Sitemap = zips.map(({ zip }) => ({
    url: `${base}/homes/${zip}`,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map(p => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly' as const,
    priority: 0.85,
  }));

  // Only include state pages Google should actually index: states with active
  // listings, plus pre-launch states. Empty state pages are noindex (see the
  // state route), so listing them here would just send crawlers to dead ends.
  const indexableStateSlugs = new Set<string>(PRELAUNCH_STATE_SLUGS);
  for (const c of cities) {
    const st = stateByAbbr.get((c.state ?? '').toUpperCase());
    if (st) indexableStateSlugs.add(st.slug);
  }
  const statePages: MetadataRoute.Sitemap = US_STATES
    .filter(s => indexableStateSlugs.has(s.slug))
    .map(s => ({
      url: `${base}/rentals/state/${s.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.88,
    }));

  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/rentals`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/rent-check`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/rent-estimate`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/rentals/apartments`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/rentals/houses`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/rentals/condos`, changeFrequency: 'daily', priority: 0.88 },
    { url: `${base}/rentals/townhomes`, changeFrequency: 'daily', priority: 0.88 },
    { url: `${base}/rentals/studios`, changeFrequency: 'daily', priority: 0.88 },
    { url: `${base}/rentals/pet-friendly`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/rentals/furnished`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/rentals/short-term`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/rentals/section-8`, changeFrequency: 'weekly', priority: 0.8 },
    ...listingPages,
    ...blogPages,
    ...statePages,
    ...cities.map(c => ({
      url: `${base}/rentals/city/${c.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.9,
    })),
    ...zipPages,
    { url: `${base}/cities`, changeFrequency: 'monthly', priority: 0.85 },
    { url: `${base}/about`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/how-it-works`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${base}/landlords`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/contact`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/support`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/app`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/disclaimer`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/accessibility`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
