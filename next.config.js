/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['axe-core', 'jsdom', 'sharp', 'heic-convert', 'playwright-core', '@sparticuz/chromium'],
        // Allow large multipart uploads for photo-heavy listings (up to 20 × 10 MB)
        serverActions: {
                bodySizeLimit: '50mb',
        },
        // Pages marked force-dynamic must always show fresh data. Setting only
        // `dynamic: 0` left a gap: Next's client router cache buckets a route
        // as "static" (default 300s staleness) instead of "dynamic" whenever
        // it has no loading.tsx boundary — regardless of force-dynamic — which
        // is exactly the case for routes with no dynamic URL segment, like the
        // moderator landlords list page. That let it serve up-to-5-minutes
        // stale data on ordinary in-app navigation even though the [id] detail
        // page (which does get bucketed as "dynamic") always refetched.
        // Zeroing both buckets closes the gap regardless of which one a given
        // route falls into.
        staleTimes: {
                dynamic: 0,
                static: 0,
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
