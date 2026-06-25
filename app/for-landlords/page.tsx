import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: { absolute: 'For Landlords — List Your Rental Free | EMLAKIE' },
  description: 'List your rental property free on EMLAKIE. No listing fees, no commissions, no middlemen. AI descriptions, direct messaging, and a guided 4-step wizard get you live in minutes.',
  alternates: { canonical: 'https://emlakie.com/for-landlords' },
  openGraph: {
    title: 'For Landlords — List Your Rental Free | EMLAKIE',
    description: 'No fees. No commissions. Reach renters directly. Takes under 5 minutes.',
    type: 'website',
    url: 'https://emlakie.com/for-landlords',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE for Landlords' }],
  },
};

const benefits = [
  {
    title: 'Always free to list',
    body: 'Post as many properties as you own. No per-listing fees, no monthly plans, no commissions on rent collected — ever.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    ),
  },
  {
    title: 'AI listing descriptions',
    body: 'Our AI writes a compelling, Fair Housing-compliant description in seconds. Just fill in the basics and let it work.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    ),
  },
  {
    title: 'Direct renter messaging',
    body: 'Renters message you through the platform. No middlemen, no broker phone tag, no delayed responses.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 0 1 .865-.501 48.172 48.172 0 0 0 3.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z" />
    ),
  },
  {
    title: 'Mobile-first dashboard',
    body: 'Manage listings, respond to leads, and update pricing from your phone. Everything works on any device.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 0 0 6 3.75v16.5a2.25 2.25 0 0 0 2.25 2.25h7.5A2.25 2.25 0 0 0 18 20.25V3.75a2.25 2.25 0 0 0-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 8.25h3" />
    ),
  },
  {
    title: 'Live in under 5 minutes',
    body: 'Our guided 4-step wizard walks you through every field. Add photos, set your price, and publish — done.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="m3.75 13.5 10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75Z" />
    ),
  },
  {
    title: 'Re-list in one click',
    body: 'Tenant moved out? Reactivate your listing instantly. Photos and details are saved forever.',
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
    ),
  },
];

const steps = [
  {
    n: '1',
    title: 'Create your free account',
    body: 'Sign up in 30 seconds — no credit card, no subscription. Your account is yours forever.',
  },
  {
    n: '2',
    title: 'Post your listing',
    body: 'Add photos, set your price, and describe the property. Our wizard guides you through every step.',
  },
  {
    n: '3',
    title: 'Renters contact you directly',
    body: 'Interested tenants reach out through the platform. You choose who to approve — no middlemen.',
  },
  {
    n: '4',
    title: 'Fill the vacancy',
    body: "Accept an applicant, mark it rented, and re-list when the next vacancy opens. It stays free every time.",
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
    a: 'Renters send you a message through the EMLAKIE platform. You get notified by email and can reply directly or share your contact info if you prefer phone calls.',
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
  {
    q: 'How does the AI listing description work?',
    a: "After you fill in property details, click \"Write with AI\" and our system generates a compelling, Fair Housing-compliant description in seconds. You can edit it freely before publishing.",
  },
  {
    q: 'Can I screen tenants through EMLAKIE?',
    a: 'Yes. EMLAKIE integrates with TransUnion SmartMove for background and credit checks. You can request a screening report directly from an applicant.',
  },
];

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faqs.map(f => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
};

export default function ForLandlordsPage() {
  return (
    <div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="bg-white py-20 sm:py-28">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-brand-700">
            For Landlords &amp; Property Owners
          </div>
          <h1 className="mt-5 font-serif text-4xl font-bold text-gray-900 sm:text-5xl lg:text-6xl">
            List Your Rental Free.<br />
            <span className="text-brand-600">Keep Every Dollar.</span>
          </h1>
          <p className="mt-5 text-xl text-gray-500">
            Post your property for free on EMLAKIE — no broker fees, no commissions, no middlemen.
            Renters contact you directly.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/landlord/login"
              className="w-full rounded-xl bg-brand-600 px-8 py-4 text-base font-bold text-white shadow-sm transition hover:bg-brand-700 sm:w-auto"
            >
              List My Property Free →
            </Link>
            <Link
              href="/rent-estimate"
              className="w-full rounded-xl border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition hover:border-brand-300 hover:text-brand-700 sm:w-auto"
            >
              Get Free E-rent Value™
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-400">Takes under 5 minutes · No credit card · Free forever</p>
        </div>
      </section>

      {/* ── Stats strip ──────────────────────────────────────────────────────── */}
      <div className="border-y border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="grid grid-cols-2 gap-px bg-gray-200 sm:grid-cols-4">
            {[
              { stat: '$0', label: 'Cost to list' },
              { stat: '0%', label: 'Commission on rent' },
              { stat: '< 5 min', label: 'To go live' },
              { stat: '∞', label: 'Properties per account' },
            ].map((s) => (
              <div key={s.stat} className="flex flex-col items-center bg-white px-6 py-8 text-center">
                <p className="text-3xl font-extrabold text-brand-600">{s.stat}</p>
                <p className="mt-1 text-xs text-gray-500">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Benefits ─────────────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Platform features</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
              Everything a landlord needs. Nothing you don&apos;t.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {benefits.map((b) => (
              <div key={b.title} className="group flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-7 transition hover:border-brand-200 hover:bg-white hover:shadow-card">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 transition group-hover:bg-brand-600">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-5 w-5 stroke-brand-600 transition group-hover:stroke-white"
                    fill="none"
                    strokeWidth="1.5"
                  >
                    {b.icon}
                  </svg>
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{b.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{b.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────────── */}
      <section className="py-20" style={{ backgroundColor: '#faf8f5' }}>
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Simple process</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-gray-900 sm:text-4xl">
              From empty unit to rented — in 4 steps
            </h2>
          </div>

          <div className="mt-14 space-y-8">
            {steps.map((s, i) => (
              <div key={s.n} className="flex gap-5">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-600 text-sm font-extrabold text-white shadow-lg shadow-brand-600/25">
                  {s.n}
                </div>
                <div className="pt-2">
                  <p className="font-bold text-gray-900">{s.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-600">{s.body}</p>
                  {i < steps.length - 1 && (
                    <div className="mt-6 ml-[-3.25rem] pl-[3.25rem] border-l-2 border-dashed border-brand-200 h-4" aria-hidden="true" />
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center">
            <Link
              href="/landlord/login"
              className="inline-block rounded-xl bg-brand-600 px-8 py-4 font-bold text-white shadow-sm transition hover:bg-brand-700"
            >
              Get started for free →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Landlord stories</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-gray-900">Landlords love EMLAKIE</h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {[
              {
                quote: "I listed my house on a Saturday morning and had three serious inquiries by that afternoon. No broker, no fees.",
                name: 'Michael T.', location: 'Bakersfield, CA', initials: 'MT',
              },
              {
                quote: "The AI description tool saved me an hour of writing. It captured everything about my place better than I could have.",
                name: 'Sarah K.', location: 'Fresno, CA', initials: 'SK',
              },
              {
                quote: "As a landlord with four units, EMLAKIE is my go-to. Free, fast, and the renters actually follow through.",
                name: 'James R.', location: 'Los Angeles, CA', initials: 'JR',
              },
            ].map((t) => (
              <figure key={t.name} className="flex flex-col justify-between rounded-2xl border border-gray-100 bg-gray-50 p-7">
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

      {/* ── Rent Estimator CTA ───────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6">
          <div className="overflow-hidden rounded-3xl bg-brand-600 px-8 py-12 text-center sm:py-16">
            <p className="text-xs font-bold uppercase tracking-widest text-green-200">Free Tool</p>
            <h2 className="mt-2 font-serif text-2xl font-bold text-white sm:text-3xl">
              Not sure what to charge?
            </h2>
            <p className="mt-3 text-green-100 sm:text-lg">
              Our free E-rent Value™ shows you what comparable units in your city are renting for — so you can
              price confidently, fill faster, and leave nothing on the table.
            </p>
            <Link
              href="/rent-estimate"
              className="mt-8 inline-block rounded-xl bg-white px-8 py-3.5 font-bold text-brand-700 transition hover:bg-green-50"
            >
              Get your free E-rent Value™ →
            </Link>
          </div>
        </div>
      </section>

      {/* ── FAQ ─────────────────────────────────────────────────────────────── */}
      <section className="bg-white py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-brand-600">Questions</p>
            <h2 className="mt-2 font-serif text-3xl font-bold text-gray-900">Common questions</h2>
          </div>

          <div className="mt-12 divide-y divide-gray-100">
            {faqs.map((f) => (
              <div key={f.q} className="py-6">
                <p className="font-bold text-gray-900">{f.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">{f.a}</p>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-gray-500">
            Still have questions?{' '}
            <Link href="/contact" className="font-semibold text-brand-600 hover:text-brand-700">
              Contact us →
            </Link>
          </p>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────────── */}
      <section className="bg-gray-950 py-24">
        <div className="mx-auto max-w-2xl px-4 text-center sm:px-6">
          <h2 className="font-serif text-3xl font-bold text-white sm:text-4xl">
            Ready to list your property?
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Join landlords across the country who use EMLAKIE to fill vacancies faster — for free.
          </p>
          <div className="mt-8">
            <Link
              href="/landlord/login"
              className="inline-block rounded-xl bg-brand-600 px-10 py-4 text-base font-bold text-white shadow-lg shadow-brand-600/25 transition hover:bg-brand-500"
            >
              Create Your Free Account →
            </Link>
          </div>
          <p className="mt-4 text-xs text-gray-600">No credit card · No commitment · Free forever</p>
        </div>
      </section>
    </div>
  );
}
