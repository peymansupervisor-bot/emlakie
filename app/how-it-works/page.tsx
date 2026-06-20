import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How EMLAKIE Works — Find & List Rentals Without a Broker',
  description: 'EMLAKIE connects renters directly with landlords — no broker, no middleman, no fees. Learn how to search for a rental, apply online, and list your property for free in under 5 minutes.',
  alternates: { canonical: 'https://emlakie.com/how-it-works' },
  openGraph: {
    title: 'How EMLAKIE Works — Find & List Rentals Without a Broker',
    description: 'EMLAKIE connects renters and landlords directly. No broker fees, no commissions. Here\'s how it works.',
    type: 'website',
    url: 'https://emlakie.com/how-it-works',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'How EMLAKIE Works' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'How EMLAKIE Works — Find & List Rentals Without a Broker',
    description: 'EMLAKIE connects renters and landlords directly. No broker fees, no commissions.',
    images: ['/opengraph-image'],
  },
};

const renterSteps = [
  {
    n: '1',
    title: 'Search by city, ZIP, or keyword',
    body: 'Browse thousands of listings by city, ZIP code, price, bedrooms, or property type. Use filters to narrow down exactly what you need — pet-friendly, furnished, short-term, and more.',
  },
  {
    n: '2',
    title: 'Contact the landlord directly',
    body: 'Send a message to the landlord through EMLAKIE. No broker, no middleman — the landlord receives your message instantly and responds directly to you.',
  },
  {
    n: '3',
    title: 'Submit your application',
    body: 'Apply online with your income, employment details, and preferred move-in date. EMLAKIE generates an AI-powered match summary so landlords can compare applicants fairly and quickly.',
  },
  {
    n: '4',
    title: 'Get approved and move in',
    body: 'Once the landlord approves you, sign your lease and pick up the keys. No broker fee, no commission, no hidden charges — ever.',
  },
];

const landlordSteps = [
  {
    n: '1',
    title: 'Create your free account',
    body: 'Sign up in 30 seconds. No credit card, no subscription. Your account — and your listings — are yours forever at no cost.',
  },
  {
    n: '2',
    title: 'Post your listing',
    body: 'Add photos, set your rent, describe the property, and specify lease terms. Our step-by-step form guides you through every field. Most landlords go live in under 5 minutes.',
  },
  {
    n: '3',
    title: 'Receive and review applications',
    body: 'Renters contact you directly through the platform. Each application includes their income, move-in date, and an AI match score so you can compare candidates at a glance.',
  },
  {
    n: '4',
    title: 'Fill the vacancy — and re-list for free',
    body: 'Select your tenant, mark the listing as rented, and the property is removed from search. When the next vacancy opens, reactivate in one click. All details and photos are saved.',
  },
];

const faqs = [
  {
    q: 'Is EMLAKIE really free?',
    a: 'For both renters and landlords — yes, completely. Renters pay no application fees. Landlords pay no listing fees, no subscription, and no commission on rent collected. We may offer optional paid features in the future, but the core platform will always be free.',
  },
  {
    q: 'How is EMLAKIE different from Zillow or Apartments.com?',
    a: 'On EMLAKIE, landlords list their own properties directly. There are no broker-listed properties where you pay a fee just to apply. Renters and landlords communicate directly, which means faster decisions, no middleman delays, and no broker commissions.',
  },
  {
    q: 'Do I need to download an app?',
    a: 'No. EMLAKIE works fully in your web browser on any device. The iOS and Android apps are available for a better mobile experience, but everything can be done on the website.',
  },
  {
    q: 'How does the AI match score work?',
    a: 'When a renter submits an application, EMLAKIE\'s AI model (powered by Anthropic) analyzes their stated income, move-in timeline, and message to generate a compatibility score and summary for the landlord. No sensitive financial documents are required — only the information the renter chooses to share.',
  },
  {
    q: 'What happens if a landlord never responds?',
    a: 'If a landlord does not respond within a reasonable time, you can message again or move on to other listings. We encourage landlords to keep their listings current — active listings are more likely to be managed by responsive landlords.',
  },
  {
    q: 'Can landlords list commercial properties?',
    a: 'EMLAKIE is currently focused on residential rentals — apartments, houses, condos, townhomes, rooms, and ADUs. Commercial listings are not supported at this time.',
  },
];

const schemas = [
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to Find a Rental on EMLAKIE',
    description: 'Find and rent a home directly from landlords with no broker fees.',
    step: renterSteps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.body,
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to List a Rental on EMLAKIE',
    description: 'Post your rental property for free and find quality tenants directly.',
    step: landlordSteps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.title,
      text: s.body,
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  },
  {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
      { '@type': 'ListItem', position: 2, name: 'How It Works', item: 'https://emlakie.com/how-it-works' },
    ],
  },
];

export default function HowItWorksPage() {
  return (
    <div>
      {schemas.map((s, i) => (
        <script key={i} type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} />
      ))}

      {/* Hero */}
      <section className="bg-white py-20 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">No Broker. No Fees. No Middleman.</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            How EMLAKIE works
          </h1>
          <p className="mt-5 text-xl text-gray-500">
            EMLAKIE is a direct rental marketplace. Renters find homes and contact landlords directly.
            Landlords post listings for free and fill vacancies faster — without paying anyone a commission.
          </p>
        </div>
      </section>

      {/* Stats strip */}
      <div className="border-y border-gray-100 bg-gray-50 py-6">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-col items-center justify-center gap-6 text-center sm:flex-row sm:gap-12">
            {[
              { stat: '$0', label: 'Cost to renters' },
              { stat: '$0', label: 'Cost to landlords' },
              { stat: '0%', label: 'Commission on rent' },
              { stat: 'Direct', label: 'Landlord contact' },
            ].map(s => (
              <div key={s.stat + s.label}>
                <p className="text-2xl font-extrabold text-brand-600">{s.stat}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* For Renters */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <div className="text-center">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">For Renters</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
            Find your next home in 4 steps
          </h2>
          <p className="mt-3 mx-auto max-w-2xl text-gray-500">
            No broker fees. No application fees. No subscriptions. Just homes.
          </p>
        </div>
        <div className="mt-14 space-y-10 max-w-2xl mx-auto">
          {renterSteps.map(s => (
            <div key={s.n} className="flex gap-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white">
                {s.n}
              </div>
              <div className="pt-1">
                <p className="font-bold text-gray-900">{s.title}</p>
                <p className="mt-1 text-sm text-gray-600 leading-relaxed">{s.body}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link href="/rentals"
            className="inline-block rounded-xl bg-brand-600 px-8 py-4 font-bold text-white transition hover:bg-brand-700">
            Browse available rentals →
          </Link>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-100" />

      {/* For Landlords */}
      <section className="py-20" style={{ backgroundColor: '#faf8f5' }}>
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">For Landlords</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
              From empty unit to rented — free, every time
            </h2>
            <p className="mt-3 mx-auto max-w-2xl text-gray-500">
              No listing fees, no commissions, no subscription. Post as many properties as you own.
            </p>
          </div>
          <div className="mt-14 space-y-10 max-w-2xl mx-auto">
            {landlordSteps.map(s => (
              <div key={s.n} className="flex gap-5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white">
                  {s.n}
                </div>
                <div className="pt-1">
                  <p className="font-bold text-gray-900">{s.title}</p>
                  <p className="mt-1 text-sm text-gray-600 leading-relaxed">{s.body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href="/landlords"
              className="inline-block rounded-xl bg-brand-600 px-8 py-4 font-bold text-white transition hover:bg-brand-700">
              List my property for free →
            </Link>
          </div>
        </div>
      </section>

      {/* How it compares */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6">
        <h2 className="text-center font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
          How EMLAKIE compares
        </h2>
        <div className="mt-10 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
                <th className="px-5 py-4 text-left font-semibold">Feature</th>
                <th className="px-5 py-4 text-center font-semibold text-brand-700">EMLAKIE</th>
                <th className="px-5 py-4 text-center font-semibold">Broker / Agent</th>
                <th className="px-5 py-4 text-center font-semibold">Big Portals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {[
                ['Free to list', '✓', '✗', 'Varies'],
                ['No broker fee for renters', '✓', '✗', 'Varies'],
                ['Direct landlord contact', '✓', '✗', 'Sometimes'],
                ['AI match scoring', '✓', '✗', '✗'],
                ['Rent estimator tool', '✓', 'Paid', '✗'],
                ['No subscription required', '✓', '—', 'Varies'],
              ].map(([feature, emlakie, broker, portals]) => (
                <tr key={feature} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4 font-medium text-gray-900">{feature}</td>
                  <td className="px-5 py-4 text-center font-bold text-brand-600">{emlakie}</td>
                  <td className="px-5 py-4 text-center text-gray-500">{broker}</td>
                  <td className="px-5 py-4 text-center text-gray-500">{portals}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-3xl px-4 pb-20 sm:px-6">
        <h2 className="text-center font-serif text-2xl font-bold text-gray-900">Common questions</h2>
        <div className="mt-10 divide-y divide-gray-100">
          {faqs.map(f => (
            <div key={f.q} className="py-6">
              <p className="font-bold text-gray-900">{f.q}</p>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{f.a}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link href="/rentals"
            className="rounded-xl bg-brand-600 px-8 py-4 font-bold text-white transition hover:bg-brand-700">
            Browse rentals
          </Link>
          <Link href="/landlords"
            className="rounded-xl border border-gray-200 px-8 py-4 font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-700">
            List my property
          </Link>
        </div>
      </section>
    </div>
  );
}
