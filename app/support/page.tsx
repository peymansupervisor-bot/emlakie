import type { Metadata } from 'next';
import SupportChat from '@/components/SupportChat';

export const metadata: Metadata = {
  title: 'Support | EMLAKIE',
  description: 'Get instant help with your EMLAKIE account. Our AI support agent can diagnose listing issues, billing questions, and account problems — available 24/7.',
  alternates: { canonical: 'https://emlakie.com/support' },
  openGraph: {
    title: 'Support | EMLAKIE',
    description: 'Get instant help with your EMLAKIE account. Our AI support agent is available 24/7 for listing, billing, and account issues.',
    type: 'website',
    url: 'https://emlakie.com/support',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Support | EMLAKIE',
    description: 'Get instant help with your EMLAKIE account. Our AI support agent is available 24/7 for listing, billing, and account issues.',
    images: ['/og-image.png'],
  },
};

const webPageSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Support | EMLAKIE',
  url: 'https://emlakie.com/support',
  description: 'Get instant help with your EMLAKIE account. Our AI support agent can diagnose listing issues, billing questions, and account problems — available 24/7.',
  isPartOf: { '@type': 'WebSite', name: 'EMLAKIE', url: 'https://emlakie.com/' },
};

export default function SupportPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webPageSchema) }}
      />

      <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-extrabold text-gray-900">How can we help?</h1>
          <p className="mt-3 text-gray-500">
            Describe your issue and our support agent will look into it and fix it right away.
          </p>
        </div>
        <SupportChat />
      </div>
    </>
  );
}
