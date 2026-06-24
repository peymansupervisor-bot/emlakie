import type { Metadata } from 'next';
import ContactFlow from '@/components/ContactFlow';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Contact EMLAKIE for help with your account, listing questions, or partnership inquiries. We\'re here for renters and landlords alike — reach us anytime.',
  alternates: { canonical: 'https://emlakie.com/contact' },
  openGraph: {
    title: 'Contact Us | EMLAKIE',
    description: 'Contact EMLAKIE for help with your account, listing questions, or partnership inquiries.',
    type: 'website',
    url: 'https://emlakie.com/contact',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | EMLAKIE',
    description: 'Contact EMLAKIE for help with your account, listing questions, or partnership inquiries.',
    images: ['/og-image.png'],
  },
};

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Contact Us | EMLAKIE',
  url: 'https://emlakie.com/contact',
  description:
    'Contact EMLAKIE for help with your account, listing questions, or partnership inquiries. We\'re here for renters and landlords alike.',
  breadcrumb: {
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://emlakie.com' },
      { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://emlakie.com/contact' },
    ],
  },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Support</p>
      <h1 className="mt-2 text-3xl font-extrabold text-gray-900">How can we help?</h1>
      <p className="mt-2 text-gray-500">We typically respond within one business day.</p>
      <div className="mt-10">
        <ContactFlow />
      </div>
    </div>
  );
}
