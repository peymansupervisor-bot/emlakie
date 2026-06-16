import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement | EMLAKIE',
  description: 'EMLAKIE is committed to ensuring our website is accessible to people with disabilities.',
  alternates: { canonical: 'https://emlakie.com/accessibility' },
  openGraph: {
    title: 'Accessibility Statement | EMLAKIE',
    description: 'EMLAKIE is committed to ensuring our website is accessible to people with disabilities.',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'EMLAKIE' }],
  },
};

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Commitment</p>
      <h1 className="mt-2 text-3xl font-extrabold text-gray-900">Accessibility Statement</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: June 14, 2026</p>

      <div className="mt-8 space-y-10 leading-relaxed text-gray-700">

        <p>
          EMLAKIE LLC is committed to ensuring that our website is accessible to people with disabilities. We
          continually work to improve the user experience for everyone and apply relevant accessibility standards
          across all pages and features of our platform.
        </p>

        <section>
          <h2 className="text-xl font-bold text-gray-900">Conformance Status</h2>
          <p className="mt-2">
            We aim to conform to the{' '}
            <a
              href="https://www.w3.org/WAI/WCAG21/quickref/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              Web Content Accessibility Guidelines (WCAG) 2.1
            </a>{' '}
            at Level AA. These guidelines explain how to make web content more accessible to people with
            disabilities including visual, auditory, physical, speech, cognitive, and neurological disabilities.
          </p>
          <p className="mt-2">
            Our site is audited using automated testing tools and manual review across all primary pages:
            homepage, rental listings, and the landlord property submission form.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900">Measures We Take</h2>
          <p className="mt-2">EMLAKIE takes the following measures to ensure accessibility:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Skip-to-main-content link available on all pages</li>
            <li>All pages include a descriptive <code className="rounded bg-gray-100 px-1 text-sm">lang=&quot;en&quot;</code> attribute</li>
            <li>All form inputs have explicit labels</li>
            <li>Keyboard navigation supported throughout the site</li>
            <li>All decorative images are marked <code className="rounded bg-gray-100 px-1 text-sm">aria-hidden=&quot;true&quot;</code></li>
            <li>All meaningful images have descriptive alt text</li>
            <li>Interactive controls have accessible names via <code className="rounded bg-gray-100 px-1 text-sm">aria-label</code></li>
            <li>Color contrast meets or exceeds 4.5:1 for body text and 3:1 for large text</li>
            <li>ARIA roles follow the WAI-ARIA 1.2 specification</li>
            <li>Correct heading hierarchy (h1 → h2 → h3) maintained on all pages</li>
            <li>Error messages associated with form fields and announced to screen readers</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900">Known Limitations</h2>
          <p className="mt-2">
            While we strive for full WCAG 2.1 AA conformance, some areas may have limitations. We are actively
            working to resolve these:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>
              <strong>User-uploaded content:</strong> Photos and descriptions submitted by landlords may not always
              meet accessibility standards. We encourage landlords to provide meaningful descriptions for any images
              they upload.
            </li>
            <li>
              <strong>Third-party integrations:</strong> Some third-party services integrated into our platform may
              have limited accessibility support under their own implementations.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900">Technical Specifications</h2>
          <p className="mt-2">
            Accessibility of EMLAKIE relies on the following technologies:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>HTML5 semantic elements</li>
            <li>CSS (Tailwind CSS)</li>
            <li>JavaScript / React (Next.js)</li>
            <li>WAI-ARIA roles, states, and properties</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900">Feedback &amp; Contact</h2>
          <p className="mt-2">
            We welcome your feedback on the accessibility of EMLAKIE. If you encounter any barrier, have
            difficulty accessing any content, or need information in an alternative format, please contact us:
          </p>
          <div className="mt-4 space-y-1">
            <p>EMLAKIE LLC</p>
            <p>
              📧{' '}
              <a href="mailto:support@emlakie.com" className="font-semibold text-brand-600 hover:text-brand-700">
                support@emlakie.com
              </a>
            </p>
          </div>
          <p className="mt-4">
            We aim to respond to accessibility feedback within <strong>2 business days</strong>. We will work with
            you to provide the information or complete the transaction you need in an accessible manner.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-gray-900">Formal Complaints</h2>
          <p className="mt-2">
            If you are not satisfied with our response, you may contact the{' '}
            <a
              href="https://www.ada.gov/contact_doj.html"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-brand-600 hover:text-brand-700"
            >
              U.S. Department of Justice ADA Information Line
            </a>{' '}
            at 1-800-514-0301 (voice) or 1-800-514-0383 (TTY).
          </p>
        </section>

        <p className="border-t border-gray-200 pt-6 text-sm text-gray-400">© 2026 EMLAKIE LLC · All rights reserved.</p>
      </div>
    </div>
  );
}
