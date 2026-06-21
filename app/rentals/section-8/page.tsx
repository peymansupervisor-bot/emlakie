import type { Metadata } from 'next';
import Link from 'next/link';
import { getListings } from '@/lib/api';
import ListingCard from '@/components/ListingCard';

export const metadata: Metadata = {
  title: 'Section 8 Rentals — Housing Choice Voucher Accepted',
  description: 'Find landlords who accept Section 8 Housing Choice Vouchers. Browse rental homes that welcome HCV tenants — no broker fees.',
  alternates: { canonical: 'https://emlakie.com/rentals/section-8' },
  openGraph: {
    title: 'Section 8 Rentals — Housing Choice Voucher Accepted',
    description: 'Find landlords who accept Section 8 Housing Choice Vouchers. Browse rental homes that welcome HCV tenants — no broker fees.',
    type: 'website',
    url: 'https://emlakie.com/rentals/section-8',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'EMLAKIE Section 8 Rentals' }],
  },
  twitter: { card: 'summary_large_image', title: 'Section 8 Rentals — Housing Choice Voucher Accepted', description: 'Find landlords who accept Section 8 Housing Choice Vouchers. Browse rental homes that welcome HCV tenants — no broker fees.', images: ['/opengraph-image'] },
};

const schema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebPage',
      name: 'Section 8 Rentals',
      description: 'Find rental homes from landlords who accept Section 8 Housing Choice Vouchers across the United States.',
      url: 'https://emlakie.com/rentals/section-8',
    },
    {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
        { '@type': 'ListItem', position: 2, name: 'Rentals', item: 'https://emlakie.com/rentals' },
        { '@type': 'ListItem', position: 3, name: 'Section 8 Rentals', item: 'https://emlakie.com/rentals/section-8' },
      ],
    },
  ],
};

export default async function Section8Page() {
  const { listings } = await getListings();
  const section8 = listings.filter(l =>
    l.amenities?.some(a => /section.8|voucher|hcv|hud/i.test(a)) ||
    /section.8|voucher accepted|housing voucher|hcv/i.test(l.description ?? '') ||
    /section.8|voucher/i.test(l.title ?? '')
  ).slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/rentals" className="hover:text-brand-600">Rentals</Link>
        <span aria-hidden="true">/</span>
        <span className="font-medium text-gray-900" aria-current="page">Section 8 Rentals</span>
      </nav>

      <div className="text-center">
        <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Rentals</p>
        <h1 className="mt-2 text-3xl font-extrabold text-gray-900 sm:text-4xl">Section 8 / Housing Voucher Rentals</h1>
        <p className="mt-3 mx-auto max-w-2xl text-gray-500">
          Find landlords who accept Housing Choice Vouchers (Section 8). Browse listings posted directly by landlords — no broker fees, no middlemen.
        </p>
      </div>

      {/* Info cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { icon: '📋', title: 'What is Section 8?', body: 'The Housing Choice Voucher (HCV) program is a federal rental assistance program that helps low-income families afford safe housing in the private market.' },
          { icon: '💰', title: 'How it works', body: 'You pay a portion of rent based on income; the government pays the rest directly to the landlord. The voucher moves with you.' },
          { icon: '🤝', title: 'Participating landlords', body: 'Landlords who accept vouchers must pass a HUD inspection and agree to program rent limits. Many private landlords participate.' },
        ].map(item => (
          <div key={item.title} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-card">
            <span className="text-3xl">{item.icon}</span>
            <h2 className="mt-3 font-bold text-gray-900">{item.title}</h2>
            <p className="mt-1 text-sm text-gray-500">{item.body}</p>
          </div>
        ))}
      </div>

      {/* Tips for voucher holders */}
      <div className="mt-10 rounded-2xl bg-brand-50 border border-brand-100 px-6 py-6">
        <h2 className="font-bold text-brand-800">Tips for Housing Voucher holders</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          <li>• Contact your local Public Housing Authority (PHA) to obtain or renew your voucher before searching.</li>
          <li>• Vouchers have an expiration date — start your search early to avoid losing your voucher.</li>
          <li>• When you find a willing landlord, request a Request for Tenancy Approval (RFTA) form from your PHA.</li>
          <li>• The unit must pass a Housing Quality Standards (HQS) inspection before you can move in.</li>
          <li>• In many states it is illegal for landlords to refuse tenants solely because they hold a voucher — know your rights.</li>
          <li>• Always disclose your voucher to the landlord upfront to avoid wasted time on both sides.</li>
        </ul>
      </div>

      {/* Know your rights */}
      <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 px-6 py-5">
        <h2 className="font-bold text-amber-800">Know your rights</h2>
        <p className="mt-2 text-sm text-amber-900">
          In California, Illinois, New York, Washington, and many other states, it is illegal for landlords to discriminate
          against tenants based on source of income, which includes housing vouchers. If you believe you have been
          discriminated against, contact your local fair housing agency or HUD at{' '}
          <a href="https://www.hud.gov/topics/housing_choice_voucher_program_section_8" target="_blank" rel="noopener noreferrer" className="underline font-semibold">hud.gov</a>.
        </p>
      </div>

      {/* How the HCV process works */}
      <div className="mt-6 space-y-4 text-sm text-gray-600 leading-relaxed">
        <h2 className="text-xl font-extrabold text-gray-900">How the Housing Choice Voucher process works</h2>
        <p>
          The Section 8 Housing Choice Voucher program is administered locally by Public Housing Authorities (PHAs)
          across the country. Landlords who participate agree to have their units inspected and to charge rent within
          HUD-approved payment standards. In return, they receive a guaranteed portion of rent directly from the
          government each month — reducing vacancy risk and providing a reliable income stream.
        </p>
        <p>
          <strong>For renters:</strong> Once you have a voucher, you typically have 60–120 days (extendable in
          many jurisdictions) to find a participating landlord. The unit must pass a Housing Quality Standards
          (HQS) inspection and rent must fall within your local payment standard. Your share of the rent is
          based on approximately 30% of your adjusted gross income — the government pays the remainder directly
          to the landlord.
        </p>
        <p>
          <strong>Finding landlords who accept vouchers:</strong> Many landlords on EMLAKIE who accept Housing
          Choice Vouchers note it in the description or amenities rather than the listing title. Send landlords
          a direct message — private landlords are typically more flexible than large property management companies,
          and in many states (California, Illinois, New York, Washington, and others) it is illegal to refuse a
          tenant solely because they pay with a housing voucher.
        </p>
      </div>

      {/* Listings */}
      {section8.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-gray-900">Rentals accepting housing vouchers</h2>
          <div className="mt-5 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {section8.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        </section>
      )}

      <div className="mt-10 text-center">
        <Link href="/rentals" className="inline-block rounded-xl bg-brand-600 px-8 py-3 font-semibold text-white transition hover:bg-brand-700">
          Browse all rentals
        </Link>
        <p className="mt-3 text-xs text-gray-500">Message landlords directly to confirm voucher acceptance before applying.</p>
      </div>
    </div>
  );
}
