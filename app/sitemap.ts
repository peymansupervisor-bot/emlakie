import type { MetadataRoute } from 'next';
import { getAllZips } from '@/lib/api';
import { posts } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://emlakie.com';
  const zips = await getAllZips();

  const zipPages: MetadataRoute.Sitemap = zips.map(({ zip }) => ({
    url: `${base}/homes/${zip}`,
    changeFrequency: 'daily',
    priority: 0.8,
  }));

  const blogPages: MetadataRoute.Sitemap = posts.map(p => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/rentals`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    ...blogPages,
    ...zipPages,
    { url: `${base}/landlord/login`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/app`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/disclaimer`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/accessibility`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
