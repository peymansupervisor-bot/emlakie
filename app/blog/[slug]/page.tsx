import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getPost, getAllSlugs, posts } from '@/lib/blog';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllSlugs().map(slug => ({ slug }));
}

/**
 * Returns the shortest title string that still fits within the 60-char SERP
 * limit when the layout's " | EMLAKIE" template suffix (+9 chars) is appended.
 * If the raw post.title is ≤ 51 chars it is used as-is (template renders it
 * to ≤ 60 total). If it is longer we fall back to an `absolute` title which
 * bypasses the template entirely and is used verbatim — capped at 60 chars.
 */
function buildTitle(rawTitle: string): Metadata['title'] {
  // Template appends " | EMLAKIE" (9 chars). Stay at ≤ 51 to keep total ≤ 60.
  if (rawTitle.length <= 51) return rawTitle;
  // For longer titles, bypass the template entirely with an absolute title.
  // Strip any trailing ellipsis from source data before re-truncating.
  const clean = rawTitle.replace(/…$/, '').trimEnd();
  const fits = clean.length <= 60 ? clean : clean.slice(0, 57) + '…';
  return { absolute: fits };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: 'Not found' };

  const title = buildTitle(post.title);
  const ogTitle = typeof title === 'string' ? title : (title as { absolute: string }).absolute;

  return {
    title,
    description: post.description,
    alternates: { canonical: `https://emlakie.com/blog/${slug}` },
    openGraph: {
      title: ogTitle,
      description: post.description,
      type: 'article',
      url: `https://emlakie.com/blog/${slug}`,
      publishedTime: post.date,
      images: [{ url: '/og-image.png', width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: post.description,
      images: ['/og-image.png'],
    },
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  'Market Trends':       'bg-blue-50 text-blue-700',
  'Neighborhood Guides': 'bg-purple-50 text-purple-700',
  'Renter Tips':         'bg-green-50 text-green-700',
  'Landlord Tips':       'bg-amber-50 text-amber-700',
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const related = posts.filter(p => p.slug !== slug && p.category === post.category).slice(0, 2);

  const articleSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Article',
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        dateModified: post.date,
        author: { '@type': 'Organization', name: 'EMLAKIE Editorial Team', url: 'https://emlakie.com' },
        image: { '@type': 'ImageObject', url: 'https://emlakie.com/og-image.png', width: 1200, height: 630 },
        publisher: { '@type': 'Organization', name: 'EMLAKIE', url: 'https://emlakie.com' },
        url: `https://emlakie.com/blog/${slug}`,
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
          { '@type': 'ListItem', position: 2, name: 'Blog', item: 'https://emlakie.com/blog' },
          { '@type': 'ListItem', position: 3, name: post.title, item: `https://emlakie.com/blog/${slug}` },
        ],
      },
    ],
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <Link href="/blog" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
        ← Back to blog
      </Link>

      <div className="mt-6">
        <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
          {post.category}
        </span>
        <h1 className="mt-4 text-3xl font-extrabold text-gray-900 sm:text-4xl leading-tight">{post.title}</h1>
        <p className="mt-3 text-gray-500 text-sm">
          {formatDate(post.date)}
          {post.lastUpdated && post.lastUpdated !== post.date && (
            <> · Updated {formatDate(post.lastUpdated)}</>
          )}
          {' '}· {post.readTime} min read
        </p>
      </div>

      {/* Article body */}
      <article
        className="prose prose-gray prose-headings:font-extrabold prose-headings:text-gray-900 prose-a:text-brand-600 prose-a:no-underline hover:prose-a:underline prose-li:text-gray-700 prose-strong:text-gray-900 mt-10 max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />

      {/* Sources */}
      {post.sources && post.sources.length > 0 && (
        <div className="mt-10 border-t border-gray-100 pt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-gray-500">Sources</h2>
          <ul className="mt-3 space-y-1">
            {post.sources.map(s => (
              <li key={s.url} className="text-xs text-gray-500">
                <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-brand-600 hover:underline">
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
          {post.lastUpdated && post.lastUpdated !== post.date && (
            <p className="mt-3 text-xs text-gray-400">Last updated: {new Date(post.lastUpdated).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
          )}
        </div>
      )}

      {/* CTA */}
      <div className="mt-12 rounded-2xl bg-brand-600 px-8 py-8 text-center">
        <h2 className="text-xl font-extrabold text-white">Find your next rental home</h2>
        <p className="mt-2 text-sm text-green-100">Browse listings posted directly by landlords — no broker fees.</p>
        <Link href={post.citySlug ? `/rentals/city/${post.citySlug}` : '/rentals'}
          className="mt-5 inline-block rounded-xl bg-white px-6 py-3 text-sm font-bold text-brand-700 transition hover:bg-green-50">
          Browse rentals
        </Link>
      </div>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-lg font-bold text-gray-900">Related articles</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {related.map(p => (
              <Link key={p.slug} href={`/blog/${p.slug}`}
                className="group rounded-xl border border-gray-100 bg-white p-5 shadow-card transition hover:shadow-md">
                <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[p.category] ?? 'bg-gray-100 text-gray-600'}`}>
                  {p.category}
                </span>
                <p className="mt-2 font-semibold text-gray-900 group-hover:text-brand-700 leading-snug text-sm">{p.title}</p>
                <p className="mt-1 text-xs text-gray-500">{formatDate(p.date)}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
