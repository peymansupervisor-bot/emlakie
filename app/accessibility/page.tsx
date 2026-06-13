import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement',
  description: 'EMLAKIE is committed to making our website accessible to all users, including people with disabilities.',
};

export default function AccessibilityPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-gray-900">Accessibility Statement</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: June 13, 2026</p>

      <div className="mt-8 space-y-6 leading-relaxed text-gray-700">

        <p>
          EMLAKIE is committed to ensuring digital accessibility for people with disabilities.
          We continually improve the user experience for everyone and apply relevant accessibility
          standards.
        </p>

        <h2 className="text-xl font-bold text-gray-900">Our commitment</h2>
        <p>
          We aim to conform to the <strong>Web Content Accessibility Guidelines (WCAG) 2.1,
          Level AA</strong>. These guidelines explain how to make web content more accessible
          to people with disabilities, including visual, auditory, physical, speech, cognitive,
          and neurological disabilities.
        </p>

        <h2 className="text-xl font-bold text-gray-900">What we do</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li>Conduct automated WCAG 2.1 AA accessibility audits on every update to our website</li>
          <li>Maintain permanent audit logs as part of our compliance record</li>
          <li>Ensure all listing content is reviewed for fair housing compliance</li>
          <li>Provide keyboard-navigable interfaces throughout the site</li>
          <li>Use sufficient color contrast across all pages</li>
          <li>Include descriptive alt text for images</li>
          <li>Support screen readers and assistive technologies</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900">Known limitations</h2>
        <p>
          While we strive for full WCAG 2.1 AA compliance, some third-party content or
          features may not yet meet all standards. We are actively working to identify
          and resolve these issues.
        </p>

        <h2 className="text-xl font-bold text-gray-900">Feedback & contact</h2>
        <p>
          We welcome your feedback on the accessibility of EMLAKIE. If you experience
          any barriers or have suggestions for improvement, please contact us:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Email: <a href="mailto:accessibility@emlakie.com" className="text-green-600 underline hover:text-green-700">accessibility@emlakie.com</a></li>
          <li>We aim to respond to accessibility feedback within <strong>2 business days</strong>.</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900">Formal complaints</h2>
        <p>
          If you are not satisfied with our response, you may contact the
          relevant enforcement authority. In the United States, accessibility
          complaints may be filed with the <strong>U.S. Department of Justice</strong> under
          Title III of the Americans with Disabilities Act (ADA).
        </p>

        <h2 className="text-xl font-bold text-gray-900">Technical specifications</h2>
        <p>
          EMLAKIE relies on the following technologies for conformance with WCAG 2.1:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>HTML5</li>
          <li>CSS</li>
          <li>JavaScript (React / Next.js)</li>
          <li>WAI-ARIA where applicable</li>
        </ul>

        <h2 className="text-xl font-bold text-gray-900">Assessment approach</h2>
        <p>
          EMLAKIE assesses accessibility through:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Automated testing using pa11y on every deployment</li>
          <li>Manual review of key user flows</li>
          <li>User feedback</li>
        </ul>

        <p className="text-sm text-gray-500 pt-4 border-t border-gray-200">
          This statement was created on June 13, 2026 and is reviewed with every site update.
        </p>
      </div>
    </div>
  );
}
