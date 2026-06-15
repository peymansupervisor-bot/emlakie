import type { Metadata } from 'next';
import ContactFlow from '@/components/ContactFlow';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get help with EMLAKIE — for renters, landlords, and general inquiries.',
  alternates: { canonical: 'https://emlakie.com/contact' },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Support</p>
      <h1 className="mt-2 text-3xl font-extrabold text-gray-900">How can we help?</h1>
      <p className="mt-2 text-gray-500">We typically respond within one business day.</p>
      <div className="mt-10">
        <ContactFlow />
      </div>
    </div>
  );
}
