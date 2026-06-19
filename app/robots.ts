import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/landlord',
          '/landlord/login',
          '/landlord/profile',
          '/landlord/properties/',
          '/landlord/leads',
          '/landlord/messages',
          '/landlord/alerts',
          '/landlord/payments',
          '/landlord/reset-password',
        ],
      },
    ],
    sitemap: 'https://emlakie.com/sitemap.xml',
  };
}
