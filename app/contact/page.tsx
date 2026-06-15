import type { Metadata } from 'next';
import ContactForm from '@/components/ContactForm';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with the EMLAKIE team. We\'re here to help renters and landlords.',
  alternates: { canonical: 'https://emlakie.com/contact' },
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Support</p>
      <h1 className="mt-2 text-3xl font-extrabold text-gray-900">Contact Us</h1>
      <p className="mt-2 text-gray-600">Have a question or need help? We typically respond within one business day.</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-5">
        {/* Contact info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <h2 className="font-bold text-gray-900">Get in touch</h2>
            <ul className="mt-4 space-y-4 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-brand-600" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-gray-900">Email</p>
                  <a href="mailto:support@emlakie.com" className="text-brand-600 hover:underline">support@emlakie.com</a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50">
                  <svg viewBox="0 0 24 24" className="h-4 w-4 stroke-brand-600" fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.62 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.91a16 16 0 0 0 6.08 6.08l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                  </svg>
                </span>
                <div>
                  <p className="font-semibold text-gray-900">Response time</p>
                  <p className="text-gray-600">Within 1 business day</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-6">
            <h2 className="font-bold text-gray-900">Common questions</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-600">
              <li>• How do I list my property?</li>
              <li>• How do I apply for a rental?</li>
              <li>• How do I report a suspicious listing?</li>
              <li>• How do I delete my account?</li>
            </ul>
          </div>
        </div>

        {/* Form */}
        <div className="lg:col-span-3">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
