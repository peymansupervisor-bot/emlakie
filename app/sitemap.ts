import type { MetadataRoute } from 'next';
import { getAllZips, getAllCities } from '@/lib/api';
import { posts } from '@/lib/blog';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = 'https://emlakie.com';
  const [zips, cities] = await Promise.all([getAllZips(), getAllCities()]);

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
    { url: `${base}/rentals/pet-friendly`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/rentals/furnished`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/rentals/short-term`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/rentals/section-8`, changeFrequency: 'weekly', priority: 0.8 },
    ...blogPages,
    ...cities.map(c => ({
      url: `${base}/rentals/city/${c.slug}`,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    })),
    ...zipPages,
    { url: `${base}/landlord/login`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/app`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/disclaimer`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/accessibility`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
