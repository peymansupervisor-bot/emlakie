import type { MetadataRoute } from 'next';
import { getAllZips } from '@/lib/api';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://emlakie.com';
  const zips = await getAllZips();

  const zipPages: MetadataRoute.Sitemap = zips.map(({ zip }) => ({
    url: `${base}/homes/${zip}`,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/rentals`, changeFrequency: 'hourly', priority: 0.9 },
    ...zipPages,
    { url: `${base}/landlord/login`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/app`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/disclaimer`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/accessibility`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
