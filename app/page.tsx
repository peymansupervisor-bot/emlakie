import Link from 'next/link';
import type { Metadata } from 'next';

import ListingCard from '@/components/ListingCard';
import SearchBar from '@/components/SearchBar';
import BlogTeaser from '@/components/BlogTeaser';
import AppBadges from '@/components/AppBadges';
import { getListings, getStats } from '@/lib/api';

export const revalidate = 60;

export const metadata: Metadata = {
  title: { absolute: 'EMLAKIE — List Your Rental Free. Keep 100% of the Rent.' },
  description: 'List your rental property free on EMLAKIE. No listing fees, no middlemen. Reach renters directly in minutes. Browse houses, apartments, and condos for rent.',
  alternates: { canonical: 'https://emlakie.com/' },
  openGraph: {
    title: 'EMLAKIE — List Your Rental Free. Keep 100% of the Rent.',
    description: 'No listing fees. No middlemen. Reach renters directly in minutes.',
    type: 'website',
    url: 'https://emlakie.com/',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE — Find Your Next Rental Home' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EMLAKIE — List Your Rental Free. Keep 100% of the Rent.',
    description: 'No listing fees. No middlemen. Reach renters directly in minutes.',
    images: ['/og-image.png'],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'EMLAKIE',
  url: 'https://emlakie.com/',
  description: 'Browse houses, apartments, and condos for rent. EMLAKIE connects renters directly with landlords.',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://emlakie.com/rentals?city={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'EMLAKIE',
  url: 'https://emlakie.com/',
  logo: 'https://emlakie.com/logo.png',
  contactPoint: { '@type': 'ContactPoint', email: 'support@emlakie.com', contactType: 'customer service' },
};

const landlordFeatures = [
  {
    title: 'Always free to list',
    body: 'Post as many properties as you own. No per-listing fees, no monthly plans, no commissions on rent collected.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    ),
  },
  {
    title: 'AI listing descriptions',
    body: 'Let our AI write a compelling, Fair Housing-compliant description in seconds. Just add your details.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    ),
  },
  {
    title: 'Direct renter messaging',
    body: 'Renters contact you through the platform. No broker phone tag, no missed opportunities.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
    ),
  },
  {
    title: 'Mobile-first experience',
    body: 'Manage your listings from anywhere. Add photos, update pricing, and respond to leads on your phone.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3" />
    ),
  },
  {
    title: 'Live in minutes',
    body: 'Our guided 4-step wizard gets your listing in front of renters in under 5 minutes. No guesswork.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    ),
  },
  {
    title: 'Re-list in one click',
    body: 'When a tenant moves out, reactivate your listing instantly. Photos and details stay saved forever.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    ),
  },
];

const testimonials = [
  {
    quote: "I listed my house on a Saturday morning and had three serious inquiries by that afternoon. No broker, no fees. I'll never go back.",
    name: 'Michael T.',
    location: 'Bakersfield, CA',
    initials: 'MT',
  },
  {
    quote: "The AI description tool saved me an hour of writing. It captured everything about my place better than I could have.",
    name: 'Sarah K.',
    location: 'Fresno, CA',
    initials: 'SK',
  },
  {
    quote: "As a landlord with four units, EMLAKIE is my go-to. Free, fast, and the renters actually follow through.",
    name: 'James R.',
    location: 'Los Angeles, CA',
    initials: 'JR',
  },
];

function fmt(n: number, floor: number): string {
  const display = Math.max(n, floor);
  if (display >= 1000) return `${(display / 1000).toFixed(1).replace(/\.0$/, '')}k+`;
  return `${display}+`;
}

export default async function HomePage() {
  const [{ listings }, stats] = await Promise.all([getListings(), getStats()]);
  const featured = listings.slice(0, 6);

  const statsItems = [
    { value: fmt(stats.listings, 500), label: 'Active Listings' },
    { value: fmt(stats.cities, 80), label: 'Cities' },
    { value: fmt(stats.landlords, 200), label: 'Landlords' },
    { value: '100k+', label: 'Properties Viewed' },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }} />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative overflow-hidden bg-gray-950 py-24 sm:py-32"
        style={{
          backgroundImage: 'radial-gradient(ellipse at 60% 0%, rgba(22,163,74,0.25) 0%, transparent 60%), radial-gradient(ellipse at 10% 80%, rgba(22,163,74,0.12) 0%, transparent 50%)',
        }}
      >
        {/* Subtle grid texture */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />

        <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-green-400">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400" />
            Free for landlords. Always.
          </div>

          <h1 className="mt-6 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
            List Your Rental Free.<br />
            <span className="text-green-400">Keep 100% of the Rent.</span>
          </h1>

          <p className="mt-5 text-lg text-gray-300 sm:text-xl">
            No listing fees. No middlemen. Reach renters directly in minutes.
          </p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/landlord/login"
              className="w-full rounded-xl bg-brand-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/30 transition hover:bg-brand-500 sm:w-auto"
            >
              List Property Free
            </Link>
            <Link
              href="/rentals"
              className="w-full rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10 sm:w-auto"
            >
              Browse Rentals
            </Link>
          </div>

          <p className="mt-4 text-xs text-gray-500">
            No credit card · No broker fees · Takes under 5 minutes
          </p>

          {/* Renter search bar */}
          <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Search rentals</p>
            <SearchBar large />
          </div>
        </div>
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
          <div className="grid grid-cols-2 gap-px bg-gray-100 sm:grid-cols-4">
            {statsItems.map((s) => (
              <div key={s.label} className="flex flex-col items-center bg-white px-6 py-8 text-center">
                <span className="text-3xl font-extrabold text-gray-900 sm:text-4xl">{s.value}</span>
                <span className="mt-1 text-sm text-gray-500">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why Emlakie ──────────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Why EMLAKIE</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
              Renting, without the runaround
            </h2>
            <p className="mt-3 text-gray-500 sm:text-lg">
              We built EMLAKIE because landlords and renters deserve a direct connection — without brokers, fees, or friction.
            </p>
          </div>

          <div className="mt-14 grid gap-8 sm:grid-cols-3">
            {[
              {
                title: 'Zero middlemen',
                body: 'Landlords and renters communicate directly. No agent layers, no commission splits, no delayed responses.',
                icon: (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
                ),
              },
              {
                title: 'Verified listings',
                body: 'Every listing is posted by a verified property owner or licensed broker. No bait-and-switch, no scams.',
                icon: (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75m-3-7.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" />
                  </>
                ),
              },
              {
                title: 'Apply in minutes',
                body: 'One application. Landlords respond directly with a clear answer. No ghosting, no weeks of waiting.',
                icon: (
                  <>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                  </>
                ),
              },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-start rounded-2xl border border-gray-100 bg-gray-50 p-8 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600">
                  <svg viewBox="0 0 24 24" className="h-6 w-6 stroke-white" fill="none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    {item.icon}
                  </svg>
                </div>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Listings ─────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Fresh on the market</p>
              <h2 className="mt-1 font-serif text-3xl font-bold text-gray-900">Homes for Rent</h2>
              <p className="mt-1 text-gray-500">Updated daily from landlords across the country</p>
            </div>
            <Link href="/rentals" className="hidden text-sm font-semibold text-brand-600 hover:text-brand-700 sm:block">
              Browse all →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((listing, i) => (
              <ListingCard key={listing.id} listing={listing} priority={i < 3} />
            ))}
          </div>

          <div className="mt-8 text-center sm:hidden">
            <Link href="/rentals" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
              Browse all rentals →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Why Landlords Choose EMLAKIE ─────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">For Landlords</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything you need to fill your vacancy
            </h2>
            <p className="mt-3 text-gray-500 sm:text-lg">
              Built for landlords from the ground up — not adapted from a broker platform.
            </p>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {landlordFeatures.map((f) => (
              <div key={f.title} className="group flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-card transition hover:border-brand-200 hover:shadow-card-hover">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 transition group-hover:bg-brand-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 stroke-brand-600 transition group-hover:stroke-white"
                    fill="none"
                    strokeWidth="1.5"
                  >
                    {f.icon}
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{f.body}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/for-landlords"
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
            >
              Learn more about listing on EMLAKIE
              <svg viewBox="0 0 20 20" className="h-4 w-4 fill-current" aria-hidden="true">
                <path fillRule="evenodd" d="M3 10a.75.75 0 0 1 .75-.75h10.638L10.23 5.29a.75.75 0 1 1 1.04-1.08l5.5 5.25a.75.75 0 0 1 0 1.08l-5.5 5.25a.75.75 0 1 1-1.04-1.08l4.158-3.96H3.75A.75.75 0 0 1 3 10Z" clipRule="evenodd" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Trust signals ─────────────────────────────────────────────────────── */}
      <section className="border-y border-gray-100 bg-gray-50 py-14">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <p className="mb-8 text-center text-xs font-bold uppercase tracking-widest text-gray-400">Why renters & landlords trust EMLAKIE</p>
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-6">
            {[
              { label: 'Verified Listings', icon: '✓' },
              { label: 'Secure Platform', icon: '🔒' },
              { label: 'Direct Communication', icon: '💬' },
              { label: 'AI Descriptions', icon: '✨' },
              { label: 'No Listing Fees', icon: '$0' },
              { label: 'Professional Support', icon: '🎧' },
            ].map((t) => (
              <div key={t.label} className="flex flex-col items-center gap-2 text-center">
                <span className="text-2xl leading-none">{t.icon}</span>
                <span className="text-xs font-semibold text-gray-600">{t.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Landlord stories</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-gray-900">Landlords love EMLAKIE</h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {testimonials.map((t) => (
              <figure key={t.name} className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-gray-50 p-7 shadow-sm">
                <blockquote>
                  <svg className="mb-4 h-6 w-6 fill-brand-200" viewBox="0 0 32 32" aria-hidden="true">
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <p className="text-sm leading-relaxed text-gray-700">{t.quote}</p>
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-xs font-bold text-white">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-500">{t.location}</p>
                  </div>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ── Blog teaser ───────────────────────────────────────────────────────── */}
      <BlogTeaser />

      {/* ── Landlord CTA ─────────────────────────────────────────────────────── */}
      <section className="bg-gray-950 py-24">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-green-400">
            Free forever
          </div>
          <h2 className="mt-6 font-serif text-3xl font-bold text-white sm:text-4xl lg:text-5xl">
            Ready to fill your vacancy?
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Create your free account and publish your first listing in under 5 minutes.
            No credit card. No broker fees. No catches.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/landlord/login"
              className="w-full rounded-xl bg-brand-600 px-8 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500 sm:w-auto"
            >
              List My Property Free
            </Link>
            <Link
              href="/for-landlords"
              className="w-full rounded-xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white transition hover:bg-white/10 sm:w-auto"
            >
              Learn More
            </Link>
          </div>
        </div>
      </section>

      {/* ── App promo ────────────────────────────────────────────────────────── */}
      <section className="bg-brand-600 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-8 text-center lg:flex-row lg:text-left">
            <div className="max-w-xl">
              <h2 className="font-serif text-2xl font-bold text-white sm:text-3xl">
                Take EMLAKIE with you
              </h2>
              <p className="mt-3 text-green-100 sm:text-lg">
                Search on the go, chat with landlords, and get instant alerts when new homes hit the market.
              </p>
              <div className="mt-6 flex justify-center lg:justify-start">
                <AppBadges />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center text-white">
              {[
                { v: '$0', l: 'to list' },
                { v: '0%', l: 'commission' },
                { v: '< 5min', l: 'to go live' },
              ].map((s) => (
                <div key={s.l} className="rounded-xl bg-white/10 px-4 py-6">
                  <p className="text-2xl font-extrabold">{s.v}</p>
                  <p className="mt-1 text-xs text-green-200">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
