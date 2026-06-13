import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://emlakie.com';
  return [
    { url: base, changeFrequency: 'daily', priority: 1 },
    { url: `${base}/rentals`, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${base}/landlords`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/app`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/privacy`, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${base}/terms`, changeFrequency: 'yearly', priority: 0.2 },
  ];
}
