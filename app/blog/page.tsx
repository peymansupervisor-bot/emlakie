import type { Metadata } from 'next';
import Link from 'next/link';
import { posts } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Rental Market Insights & Guides',
  description: 'Average rent data, neighborhood guides, and tips for renters and landlords across the United States. Stay informed on the rental market.',
  alternates: { canonical: 'https://emlakie.com/blog' },
  openGraph: {
    title: 'Rental Market Insights & Guides | EMLAKIE',
    description: 'Average rent data, neighborhood guides, and tips for renters and landlords across the United States.',
    type: 'website',
    url: 'https://emlakie.com/blog',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'EMLAKIE Blog' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Rental Market Insights & Guides | EMLAKIE',
    description: 'Average rent data, neighborhood guides, and tips for renters and landlords across the United States.',
    images: ['/opengraph-image'],
  },
};

const CATEGORY_COLORS: Record<string, string> = {
  'Market Trends':       'bg-blue-50 text-blue-700',
  'Neighborhood Guides': 'bg-purple-50 text-purple-700',
  'Renter Tips':         'bg-green-50 text-green-700',
  'Landlord Tips':       'bg-amber-50 text-amber-700',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const collectionSchema = {
  '@context': 'https://schema.org',
  '@type': 'CollectionPage',
  name: 'Rental Market Insights & Guides',
  description: 'Average rent data, neighborhood guides, and tips for renters and landlords across the United States.',
  url: 'https://emlakie.com/blog',
  publisher: { '@type': 'Organization', name: 'EMLAKIE', url: 'https://emlakie.com' },
};

export default function BlogPage() {
  const [featured, ...rest] = posts;
  const marketPosts = rest.filter(p => p.category === 'Market Trends');
  const otherPosts  = rest.filter(p => p.category !== 'Market Trends');

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }} />
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">EMLAKIE Blog</p>
      <h1 className="mt-2 text-3xl font-extrabold text-gray-900">Rental Market Insights</h1>
      <p className="mt-2 text-gray-500">Average rents, neighborhood guides, and tips for renters and landlords nationwide.</p>

      {/* Featured post */}
      <Link href={`/blog/${featured.slug}`} className="group mt-10 block overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-card transition hover:shadow-md">
        <div className="bg-gradient-to-br from-brand-600 to-brand-700 px-8 py-12">
          <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_COLORS[featured.category] ?? 'bg-white/20 text-white'}`}>
            {featured.category}
          </span>
          <h2 className="mt-4 text-2xl font-extrabold text-white group-hover:underline sm:text-3xl">{featured.title}</h2>
          <p className="mt-3 text-base text-green-100">{featured.description}</p>
          <p className="mt-4 text-xs text-green-200">{formatDate(featured.date)} · {featured.readTime} min read</p>
        </div>
      </Link>

      {/* Market Trends — city rent articles */}
      <section className="mt-12">
        <h2 className="text-lg font-extrabold text-gray-900">Average Rent by City</h2>
        <p className="mt-1 text-sm text-gray-500">2026 rental market data across major US cities.</p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {marketPosts.map(post => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-card transition hover:shadow-md">
              <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[post.category]}`}>
                {post.category}
              </span>
              <h3 className="mt-3 flex-1 text-sm font-bold text-gray-900 group-hover:text-brand-700 leading-snug">
                {post.title}
              </h3>
              <p className="mt-1 text-xs text-gray-500">{formatDate(post.date)} · {post.readTime} min read</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Other posts */}
      {otherPosts.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-extrabold text-gray-900">Guides & Tips</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {otherPosts.map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="group flex flex-col rounded-2xl border border-gray-100 bg-white p-5 shadow-card transition hover:shadow-md">
                <span className={`self-start rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                  {post.category}
                </span>
                <h3 className="mt-3 flex-1 text-sm font-bold text-gray-900 group-hover:text-brand-700 leading-snug">
                  {post.title}
                </h3>
                <p className="mt-2 text-xs text-gray-500 line-clamp-2">{post.description}</p>
                <p className="mt-3 text-xs text-gray-500">{formatDate(post.date)} · {post.readTime} min read</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
