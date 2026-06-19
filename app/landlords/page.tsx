import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'List Your Rental Property Free — EMLAKIE for Landlords',
  description: 'Post your rental listing for free on EMLAKIE. Reach thousands of local renters, manage applications, and fill vacancies faster — no broker fees, no commissions.',
  alternates: { canonical: 'https://emlakie.com/landlords' },
  openGraph: {
    title: 'List Your Rental Property Free | EMLAKIE',
    description: 'Reach thousands of local renters. No broker fees, no commissions. Takes under 5 minutes.',
    type: 'website',
    url: 'https://emlakie.com/landlords',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'EMLAKIE for Landlords' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'List Your Rental Property Free | EMLAKIE',
    description: 'Reach thousands of local renters. No broker fees, no commissions. Takes under 5 minutes.',
    images: ['/opengraph-image'],
  },
};

const steps = [
  {
    n: '1',
    title: 'Create your free account',
    body: 'Sign up in 30 seconds — no credit card, no subscription. Your account is yours forever.',
  },
  {
    n: '2',
    title: 'Post your listing',
    body: 'Add photos, set your price, and describe the property. We guide you through every field.',
  },
  {
    n: '3',
    title: 'Renters contact you directly',
    body: 'Interested tenants reach out through the platform. You choose who to approve — no middlemen involved.',
  },
  {
    n: '4',
    title: 'Fill the vacancy',
    body: 'Accept an applicant, mark it rented, and re-list when the next vacancy opens. It stays free every time.',
  },
];

const benefits = [
  {
    icon: '🆓',
    title: 'Always free to list',
    body: 'Post as many properties as you own. No per-listing fees, no monthly plans, no commissions on rent collected.',
  },
  {
    icon: '📊',
    title: 'Know your market',
    body: 'Use our free Rent Estimator before you price. See what comparable units in your city are actually renting for.',
  },
  {
    icon: '📩',
    title: 'Applicants come to you',
    body: 'Renters message you directly through the platform. No playing phone tag with brokers or property managers.',
  },
  {
    icon: '📸',
    title: 'Professional listing page',
    body: 'Your listing gets a full-page layout with photos, map, neighborhood scores, and a Street View — same quality as the big portals.',
  },
  {
    icon: '⚡',
    title: 'Listed in minutes',
    body: 'Our step-by-step form takes under 5 minutes to complete. Add more details later — get visible now.',
  },
  {
    icon: '🔁',
    title: 'Re-list in one click',
    body: 'When a tenant moves out, reactivate your listing instantly. All your photos and details are saved.',
  },
];

const faqs = [
  {
    q: 'Is it really free?',
    a: 'Yes. Listing your property on EMLAKIE is free and always will be. We may offer optional paid boosts in the future, but posting and receiving applications will never cost you anything.',
  },
  {
    q: 'Do I need a real estate license to list?',
    a: 'No. Property owners can list their own units directly. Licensed agents and property managers can also list on behalf of clients — just select "Broker Listed" when posting.',
  },
  {
    q: 'How do renters contact me?',
    a: 'Renters send you a message through the EMLAKIE platform. You get notified by email, and can reply directly or share your contact info if you prefer phone calls.',
  },
  {
    q: 'Can I list multiple properties?',
    a: 'Yes — there is no limit. Many landlords manage their entire portfolio through one EMLAKIE account.',
  },
  {
    q: 'What happens after I rent it out?',
    a: 'Mark the listing as rented. It gets removed from search results and we track your days-on-market. When your next vacancy opens, reactivate it in one click.',
  },
  {
    q: 'Is my contact information public?',
    a: 'No. Your email and phone number are kept private. Renters contact you through the platform and you decide whether to share more details.',
  },
];

export default function LandlordsPage() {
  return (
    <div>

      {/* Hero */}
      <section className="bg-white py-20 text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <p className="text-xs font-bold uppercase tracking-widest text-brand-600">For Landlords &amp; Property Owners</p>
          <h1 className="mt-3 font-serif text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            List your rental.<br />Keep every dollar.
          </h1>
          <p className="mt-5 text-xl text-gray-500">
            Post your property for free on EMLAKIE — no broker fees, no commissions,
            no middlemen. Renters contact you directly.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/landlord/login"
              className="rounded-xl bg-brand-600 px-8 py-4 text-base font-bold text-white transition hover:bg-brand-700 shadow-sm">
              List my property for free →
            </Link>
            <Link href="/rent-estimate"
              className="rounded-xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-700">
              What should I charge for rent?
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-400">Takes under 5 minutes · No credit card · Free forever</p>
        </div>
      </section>

      {/* Social proof strip */}
      <div className="border-y border-gray-100 bg-gray-50 py-6">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex flex-col items-center justify-center gap-6 text-center sm:flex-row sm:gap-12">
            {[
              { stat: '$0', label: 'Cost to list' },
              { stat: '0%', label: 'Commission on rent' },
              { stat: '< 5 min', label: 'To go live' },
              { stat: '∞', label: 'Properties per account' },
            ].map(s => (
              <div key={s.stat}>
                <p className="text-2xl font-extrabold text-brand-600">{s.stat}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits grid */}
      <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <h2 className="text-center font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
          Everything a landlord needs. Nothing you don&apos;t.
        </h2>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map(b => (
            <div key={b.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-card">
              <span className="text-3xl">{b.icon}</span>
              <h3 className="mt-3 font-bold text-gray-900">{b.title}</h3>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">{b.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-20" style={{ backgroundColor: '#faf8f5' }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="text-center font-serif text-2xl font-bold text-gray-900 sm:text-3xl">
            From empty unit to rented — in 4 steps
          </h2>
          <div className="mt-12 space-y-8">
            {steps.map(s => (
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
            <Link href="/landlord/login"
              className="inline-block rounded-xl bg-brand-600 px-8 py-4 font-bold text-white transition hover:bg-brand-700">
              Get started for free →
            </Link>
          </div>
        </div>
      </section>

      {/* Rent Estimator CTA */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="rounded-3xl bg-brand-600 px-8 py-12 text-center sm:py-16">
          <p className="text-sm font-bold uppercase tracking-widest text-green-200">Free Tool</p>
          <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
            Not sure what to charge?
          </h2>
          <p className="mt-3 text-green-100 sm:text-lg">
            Our free Rent Estimator shows you what comparable units in your city are renting for —
            so you can price confidently, fill faster, and leave nothing on the table.
          </p>
          <Link href="/rent-estimate"
            className="mt-6 inline-block rounded-xl bg-white px-8 py-3 font-bold text-brand-700 transition hover:bg-green-50">
            Get my free rent estimate →
          </Link>
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
        <div className="mt-10 text-center">
          <p className="text-sm text-gray-500">Still have questions?{' '}
            <Link href="/contact" className="font-semibold text-brand-600 hover:text-brand-700">Contact us →</Link>
          </p>
        </div>
      </section>

    </div>
  );
}
