/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['axe-core', 'jsdom', 'sharp', 'heic-convert', 'playwright-core', '@sparticuz/chromium'],
        // Allow large multipart uploads for photo-heavy listings (up to 20 × 10 MB)
        serverActions: {
                bodySizeLimit: '50mb',
        },
        // Pages marked force-dynamic must always show fresh data — the client
        // router cache was serving up-to-30s-stale RSC payloads after edits
        // made outside the app (e.g. direct Supabase edits), undermining that.
        staleTimes: {
                dynamic: 0,
        },
  },
  productionBrowserSourceMaps: false,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'api.emlakie.com' },
      { protocol: 'https', hostname: 'maps.googleapis.com' },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(self), geolocation=(self)' },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
