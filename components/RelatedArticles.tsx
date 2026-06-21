import Link from 'next/link';
import { posts } from '@/lib/blog';

interface Props {
  citySlug: string;
  limit?: number;
}

const CATEGORY_COLORS: Record<string, string> = {
  'Market Trends': 'bg-blue-50 text-blue-700',
  'Neighborhood Guides': 'bg-purple-50 text-purple-700',
  'Renter Tips': 'bg-green-50 text-green-700',
  'Landlord Tips': 'bg-orange-50 text-orange-700',
};

export default function RelatedArticles({ citySlug, limit = 3 }: Props) {
  const cityPosts = posts
    .filter(p => p.citySlug === citySlug)
    .slice(0, limit);

  if (cityPosts.length === 0) return null;

  return (
    <section className="mt-10 rounded-2xl border border-gray-100 bg-gray-50 p-6">
      <h2 className="text-lg font-bold text-gray-900">
        {cityPosts.length === 1 ? 'Related Article' : 'Related Articles'}
      </h2>
      <ul className="mt-4 space-y-3">
        {cityPosts.map(post => (
          <li key={post.slug}>
            <Link
              href={`/blog/${post.slug}`}
              className="group flex items-start gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-brand-300 hover:shadow-md"
            >
              <span
                className={`mt-0.5 inline-block shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'}`}
              >
                {post.category}
              </span>
              <span className="text-sm font-semibold text-gray-800 group-hover:text-brand-700 leading-snug">
                {post.title}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/blog"
        className="mt-4 inline-block text-sm font-semibold text-brand-600 hover:text-brand-700"
      >
        View all rental guides →
      </Link>
    </section>
  );
}
