import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: { absolute: 'About EMLAKIE — Our Mission to Make Renting Simple' },
  description: 'EMLAKIE is a rental marketplace that connects renters directly with landlords — no broker fees, no middlemen. Learn about our mission, how we work, and why landlords and renters choose EMLAKIE.',
  alternates: { canonical: 'https://emlakie.com/about' },
  openGraph: {
    title: 'About EMLAKIE — Our Mission to Make Renting Simple',
    description: 'EMLAKIE connects renters directly with landlords — no broker fees, no middlemen. Learn about our mission.',
    type: 'website',
    url: 'https://emlakie.com/about',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'About EMLAKIE' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'About EMLAKIE — Our Mission to Make Renting Simple',
    description: 'EMLAKIE connects renters directly with landlords — no broker fees, no middlemen.',
    images: ['/og-image.png'],
  },
};

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'EMLAKIE',
  url: 'https://emlakie.com',
  logo: 'https://emlakie.com/logo.png',
  description: 'EMLAKIE is a rental marketplace that connects renters directly with landlords — no broker fees, no middlemen.',
  foundingDate: '2024',
  contactPoint: {
    '@type': 'ContactPoint',
    email: 'support@emlakie.com',
    contactType: 'customer service',
  },
  sameAs: [],
};

const stats = [
  { label: 'Active Listings', value: 'Thousands' },
  { label: 'Cities Covered', value: '500+' },
  { label: 'Broker Fee', value: '$0' },
  { label: 'Listing Fee', value: 'Free' },
];

const values = [
  {
    icon: '🤝',
    title: 'Direct Connections',
    body: 'We cut out the middleman entirely. Every listing on EMLAKIE is posted directly by the landlord. Renters contact landlords directly — no third-party broker between them.',
  },
  {
    icon: '💸',
    title: 'No Fees for Anyone',
    body: 'Landlords list for free. Renters pay no broker fees. Connecting people with housing shouldn\'t cost hundreds or thousands of dollars in commissions.',
  },
  {
    icon: '🔍',
    title: 'Transparency',
    body: 'Every listing shows real prices, real photos, and real contact information. No bait-and-switch. No "price on request." What you see is what you get.',
  },
  {
    icon: '⚡',
    title: 'Speed',
    body: 'Landlords get qualified applicants within hours of posting. Renters can apply directly from a listing page. The whole process — from listing to application — takes minutes, not days.',
  },
];

const teamPrinciples = [
  'We believe housing is a basic need — the process of finding it should be simple and fair.',
  'We will never charge renters broker fees, ever.',
  'We think landlords deserve a direct line to qualified tenants without paying commission.',
  'We build tools that serve both sides of the market equally well.',
  'We publish honest information about rental markets so renters can search with confidence.',
];

export default function AboutPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />

      {/* Hero */}
      <section className="bg-white py-16 px-4 sm:px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <span className="inline-block rounded-full bg-brand-50 px-4 py-1.5 text-sm font-semibold text-brand-700 mb-4">
            About EMLAKIE
          </span>
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl leading-tight">
            Renting should be simple.
            <br />
            <span className="text-brand-600">We&apos;re making it that way.</span>
          </h1>
          <p className="mt-6 text-lg text-gray-600 leading-relaxed">
            EMLAKIE is a rental marketplace that connects renters directly with landlords — no
            broker fees, no middlemen, no commissions. We believe finding a home shouldn&apos;t cost
            an extra month&apos;s rent just to talk to the person who owns it.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-gray-100 bg-gray-50 py-10">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <dl className="grid grid-cols-2 gap-8 sm:grid-cols-4 text-center">
            {stats.map(s => (
              <div key={s.label}>
                <dt className="text-sm font-medium text-gray-500">{s.label}</dt>
                <dd className="mt-1 text-3xl font-extrabold text-brand-600">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* Mission */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-extrabold text-gray-900">Our Mission</h2>
        <p className="mt-4 text-gray-600 leading-relaxed text-lg">
          The traditional rental process puts a broker between every landlord and every renter — and
          that broker collects a fee equal to a full month&apos;s rent just for making an introduction.
          For renters in expensive markets, that fee often amounts to $2,000–$5,000 paid upfront
          before they can move in.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed text-lg">
          EMLAKIE was built to make that unnecessary. Landlords post listings directly on our
          platform for free. Renters browse, apply, and communicate with landlords directly through
          the app or website. The result: faster matches, lower costs, and a more honest rental
          market for everyone.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed text-lg">
          We also publish rental market data, city guides, and educational content to help renters
          search with real information — not marketing copy. Our blog covers average rents by city,
          tenant rights by state, and practical guides for every stage of the rental process.
        </p>
      </section>

      {/* Values */}
      <section className="bg-gray-50 border-y border-gray-100 py-16 px-4 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-2xl font-extrabold text-gray-900 text-center">What We Stand For</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {values.map(v => (
              <div key={v.title} className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
                <span className="text-3xl">{v.icon}</span>
                <h3 className="mt-3 text-lg font-bold text-gray-900">{v.title}</h3>
                <p className="mt-2 text-sm text-gray-600 leading-relaxed">{v.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-extrabold text-gray-900">Our Principles</h2>
        <ul className="mt-6 space-y-4">
          {teamPrinciples.map((p, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 text-xs font-bold">
                {i + 1}
              </span>
              <span className="text-gray-700 leading-relaxed">{p}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* How we make money */}
      <section className="bg-brand-50 border-y border-brand-100 py-12 px-4 sm:px-6">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-2xl font-extrabold text-gray-900">How EMLAKIE Makes Money</h2>
          <p className="mt-4 text-gray-700 leading-relaxed">
            EMLAKIE is free for both landlords and renters. We sustain the platform through
            optional premium tools for landlords — including featured listing placement, enhanced
            applicant screening reports, and property management features. These are entirely
            optional. A landlord can post, manage leads, and find a great tenant on EMLAKIE
            without ever spending a dollar.
          </p>
          <p className="mt-3 text-gray-700 leading-relaxed">
            We will never charge renters a fee. That&apos;s not a policy that can change — it&apos;s
            the reason EMLAKIE exists.
          </p>
        </div>
      </section>

      {/* Content commitment */}
      <section className="mx-auto max-w-3xl px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-extrabold text-gray-900">Our Content Standards</h2>
        <p className="mt-4 text-gray-600 leading-relaxed">
          EMLAKIE&apos;s rental market guides, city pages, and renter education articles are written
          by our team with the goal of giving renters accurate, actionable information — not to
          drive clicks or maximize ad revenue. Rental price data is drawn from active listings on
          our platform and publicly available market sources. State-specific legal information is
          reviewed for accuracy but should not be treated as legal advice; consult a licensed
          attorney for legal questions about your specific situation.
        </p>
        <p className="mt-4 text-gray-600 leading-relaxed">
          If you spot an error in our content or believe a listing violates our policies, please{' '}
          <Link href="/contact" className="text-brand-600 hover:underline font-medium">
            contact us
          </Link>
          . We respond to all content concerns within 48 hours.
        </p>
      </section>

      {/* CTA */}
      <section className="border-t border-gray-100 bg-white py-16 px-4 sm:px-6 text-center">
        <div className="mx-auto max-w-xl">
          <h2 className="text-2xl font-extrabold text-gray-900">Ready to get started?</h2>
          <p className="mt-3 text-gray-600">
            Browse thousands of rentals listed directly by landlords — or list your property for
            free and start receiving applications today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-4">
            <Link
              href="/rentals"
              className="rounded-xl bg-brand-600 px-8 py-3 text-sm font-bold text-white hover:bg-brand-700 transition"
            >
              Search Rentals
            </Link>
            <Link
              href="/landlords"
              className="rounded-xl border border-gray-300 px-8 py-3 text-sm font-bold text-gray-700 hover:border-brand-400 hover:text-brand-700 transition"
            >
              List My Property Free
            </Link>
          </div>
          <p className="mt-6 text-sm text-gray-500">
            Questions?{' '}
            <Link href="/contact" className="text-brand-600 hover:underline">
              Contact us
            </Link>{' '}
            or visit our{' '}
            <Link href="/support" className="text-brand-600 hover:underline">
              support center
            </Link>
            .
          </p>
        </div>
      </section>
    </>
  );
}
