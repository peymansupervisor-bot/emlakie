import Link from 'next/link';
import { posts } from '@/lib/blog';

export default function BlogTeaser() {
  const recent = [...posts]
    .sort((a, b) => (a.date < b.date ? 1 : -1))
    .slice(0, 3);

  return (
    <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="font-serif text-2xl font-bold text-gray-900">From the blog</h2>
          <p className="mt-1 text-gray-600">Rental market insights, pricing tips, and landlord guides</p>
        </div>
        <Link href="/blog" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          All articles →
        </Link>
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        {recent.map(post => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="group rounded-xl border border-gray-100 bg-white p-5 shadow-card transition hover:border-brand-200 hover:shadow-card-hover"
          >
            <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-bold text-brand-600">
              {post.category}
            </span>
            <h3 className="mt-3 line-clamp-2 text-sm font-bold leading-snug text-gray-900 group-hover:text-brand-700">
              {post.title}
            </h3>
            <p className="mt-2 line-clamp-2 text-xs text-gray-500">{post.description}</p>
            <p className="mt-3 text-xs text-gray-400">
              {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {' · '}{post.readTime} min read
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
