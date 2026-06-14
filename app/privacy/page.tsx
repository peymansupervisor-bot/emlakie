import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy | EMLAKIE',
  description: 'Privacy Policy for EMLAKIE — how we collect, use, and protect your personal information.',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Legal</p>
      <h1 className="mt-2 text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Effective June 14, 2026</p>

      <div className="mt-8 space-y-2 leading-relaxed text-gray-700">
        <p>
          Welcome to EMLAKIE. This Privacy Policy explains how EMLAKIE LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) collects, uses,
          and protects your personal information when you use our website, rental listings platform, and mobile
          application (collectively, the &quot;Services&quot;). By using our Services, you agree to the practices described
          in this Privacy Policy.
        </p>
        <p>
          <strong>Contact Us:</strong> If you have questions about this Privacy Policy, please contact us at:<br />
          EMLAKIE LLC · Email:{' '}
          <a href="mailto:support@emlakie.com" className="font-semibold text-brand-600 hover:text-brand-700">
            support@emlakie.com
          </a>
        </p>
      </div>

      {/* Table of contents */}
      <nav className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <p className="text-sm font-bold uppercase tracking-wide text-gray-700">Contents</p>
        <ol className="mt-3 space-y-1 text-sm text-brand-600">
          {[
            'What Personal Information We Collect',
            'How We Use Your Personal Information',
            'How We Share Your Personal Information',
            'Your Choices and Rights',
            'How Long We Keep Your Information',
            'How We Protect Your Information',
            "Children's Privacy",
            'California Residents',
            'Cookies and Similar Technologies',
            'Changes to This Privacy Policy',
          ].map((item, i) => (
            <li key={i}>
              <a href={`#section-${i + 1}`} className="hover:underline">
                {i + 1}. {item}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <div className="mt-10 space-y-10 leading-relaxed text-gray-700">

        {/* 1 */}
        <section id="section-1">
          <h2 className="text-xl font-bold text-gray-900">1. What Personal Information We Collect</h2>
          <h3 className="mt-4 font-semibold text-gray-800">Information you provide to us</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li><strong>Account registration:</strong> When you create a landlord account, we collect your email address and password.</li>
            <li><strong>Listing submissions:</strong> When you list a property, we collect the property address, description, photos, rent amount, and any other details you provide.</li>
            <li><strong>Rental applications:</strong> When you apply for a rental through the app, we collect your name, contact information, and any information you submit as part of your application.</li>
            <li><strong>Contact form:</strong> When you contact us, we collect your name, email address, and message.</li>
            <li><strong>Photos:</strong> When you upload photos, files may contain metadata such as location, date, and device information.</li>
          </ul>
          <h3 className="mt-4 font-semibold text-gray-800">Information collected automatically</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li><strong>Device and browser data:</strong> We may collect your IP address, browser type, operating system, and device identifiers.</li>
            <li><strong>Usage data:</strong> We collect information about how you use our Services, such as pages visited, features used, and time spent on the site.</li>
            <li><strong>Cookies &amp; similar technologies:</strong> We use cookies and similar technologies to operate our Services. See Section 9 below for full details.</li>
          </ul>
          <h3 className="mt-4 font-semibold text-gray-800">Information from third parties</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li><strong>Address data:</strong> We use OpenStreetMap (Nominatim) to provide address autocomplete suggestions when you list a property.</li>
            <li><strong>Authentication:</strong> User authentication is handled through Supabase. Please review Supabase&apos;s privacy policy for details on how authentication data is handled.</li>
            <li><strong>Payments:</strong> Payment processing is handled by Stripe. We do not store your full card details. Stripe&apos;s privacy policy governs their handling of payment data.</li>
          </ul>
        </section>

        {/* 2 */}
        <section id="section-2">
          <h2 className="text-xl font-bold text-gray-900">2. How We Use Your Personal Information</h2>
          <p className="mt-2">We use the information we collect to:</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Create and manage your landlord account</li>
            <li>Publish and display rental listings to prospective tenants</li>
            <li>Enable renters and landlords to connect directly through the app</li>
            <li>Process rental applications and facilitate tenant screening</li>
            <li>Send email confirmations, notifications, and account-related communications</li>
            <li>Respond to support requests and inquiries</li>
            <li>Improve the functionality, design, and performance of our Services</li>
            <li>Detect and prevent fraud, abuse, and violations of our terms</li>
            <li>Comply with legal obligations</li>
          </ul>
          <p className="mt-4">We do not sell your personal information to third parties or use it for behavioral advertising.</p>
        </section>

        {/* 3 */}
        <section id="section-3">
          <h2 className="text-xl font-bold text-gray-900">3. How We Share Your Personal Information</h2>
          <h3 className="mt-4 font-semibold text-gray-800">Rental listings</h3>
          <p className="mt-2">
            Property listings you submit, including the address, description, and photos, are displayed publicly on
            the site to help connect landlords with tenants.
          </p>
          <h3 className="mt-4 font-semibold text-gray-800">Service providers</h3>
          <p className="mt-2">We share personal information with trusted service providers who help us operate the Services, including:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Supabase — database, authentication, and file storage</li>
            <li>Stripe — payment processing</li>
            <li>Vercel — website hosting and deployment</li>
            <li>OpenStreetMap / Nominatim — address lookup</li>
            <li>Resend — transactional email delivery</li>
          </ul>
          <p className="mt-2">These providers are only permitted to use your information to provide services to us.</p>
          <h3 className="mt-4 font-semibold text-gray-800">Legal and safety reasons</h3>
          <p className="mt-2">
            We may share your information with law enforcement or other parties when we believe in good faith that
            disclosure is necessary to comply with applicable law, protect the safety of any person, prevent fraud
            or abuse, or enforce our terms.
          </p>
          <h3 className="mt-4 font-semibold text-gray-800">Business transfers</h3>
          <p className="mt-2">
            If EMLAKIE LLC is involved in a merger, acquisition, or sale of assets, your personal information may
            be transferred as part of that transaction.
          </p>
        </section>

        {/* 4 */}
        <section id="section-4">
          <h2 className="text-xl font-bold text-gray-900">4. Your Choices and Rights</h2>
          <h3 className="mt-4 font-semibold text-gray-800">Account and listings</h3>
          <p className="mt-2">You may update your account information or edit your listings at any time by signing in to your landlord account.</p>
          <h3 className="mt-4 font-semibold text-gray-800">Account deletion</h3>
          <p className="mt-2">
            To request deletion of your account and associated data, contact us at{' '}
            <a href="mailto:support@emlakie.com" className="font-semibold text-brand-600 hover:text-brand-700">support@emlakie.com</a>.
            We will process your request within 30 days.
          </p>
          <h3 className="mt-4 font-semibold text-gray-800">California residents</h3>
          <p className="mt-2">See Section 8 below for additional rights available to California residents under the CCPA.</p>
        </section>

        {/* 5 */}
        <section id="section-5">
          <h2 className="text-xl font-bold text-gray-900">5. How Long We Keep Your Information</h2>
          <p className="mt-2">We retain your personal information for as long as necessary to provide our Services or as required by law. Specifically:</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Account information is retained until you delete your account</li>
            <li>Rental listing information is retained while the listing is active and for a reasonable period afterward for record-keeping</li>
            <li>Application records may be retained for legal and compliance purposes</li>
            <li>Payment records are retained as required by applicable law and our obligations under Stripe&apos;s terms of service</li>
          </ul>
        </section>

        {/* 6 */}
        <section id="section-6">
          <h2 className="text-xl font-bold text-gray-900">6. How We Protect Your Information</h2>
          <p className="mt-2">We implement reasonable technical and organizational measures to protect your personal information, including:</p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li>Encrypted HTTPS connections for all pages</li>
            <li>Secure authentication and password hashing through Supabase</li>
            <li>Row-level security policies so users can only access their own data</li>
            <li>Email addresses never displayed publicly</li>
          </ul>
          <p className="mt-4">
            However, no method of transmission over the internet is completely secure. We encourage you to use a
            strong, unique password and keep it confidential.
          </p>
        </section>

        {/* 7 */}
        <section id="section-7">
          <h2 className="text-xl font-bold text-gray-900">7. Children&apos;s Privacy</h2>
          <p className="mt-2">
            Our Services are not directed to children under the age of 13. We do not knowingly collect personal
            information from children under 13. If you believe we have inadvertently collected such information,
            please contact us at{' '}
            <a href="mailto:support@emlakie.com" className="font-semibold text-brand-600 hover:text-brand-700">support@emlakie.com</a>{' '}
            and we will promptly delete it.
          </p>
        </section>

        {/* 8 */}
        <section id="section-8">
          <h2 className="text-xl font-bold text-gray-900">8. California Residents</h2>
          <p className="mt-2">
            If you are a California resident, you have the following rights under the California Consumer Privacy
            Act (CCPA):
          </p>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li><strong>Right to Know:</strong> You may request information about the categories and specific pieces of personal information we have collected about you, and how it is used and shared.</li>
            <li><strong>Right to Delete:</strong> You may request that we delete your personal information, subject to certain exceptions.</li>
            <li><strong>Right to Correct:</strong> You may request that we correct inaccurate personal information we hold about you.</li>
            <li><strong>Right to Opt Out of Sale:</strong> We do not sell your personal information.</li>
            <li><strong>Right to Non-Discrimination:</strong> We will not discriminate against you for exercising any of your CCPA rights.</li>
          </ul>
          <p className="mt-4">
            To exercise your rights, contact us at{' '}
            <a href="mailto:support@emlakie.com" className="font-semibold text-brand-600 hover:text-brand-700">support@emlakie.com</a>.
            We will respond to verified requests within 45 days.
          </p>
        </section>

        {/* 9 */}
        <section id="section-9">
          <h2 className="text-xl font-bold text-gray-900">9. Cookies and Similar Technologies</h2>
          <h3 className="mt-4 font-semibold text-gray-800">What are cookies?</h3>
          <p className="mt-2">
            Cookies are small text files placed on your device when you visit a website. They help the site
            remember information about your visit, such as your login session. Similar technologies include
            localStorage and session storage.
          </p>
          <h3 className="mt-4 font-semibold text-gray-800">Cookies we use</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li><strong>Essential / functional cookies:</strong> We use session cookies managed by Supabase to keep you logged in. These are strictly necessary for the site to function and cannot be disabled.</li>
            <li><strong>Analytics (cookie-free):</strong> We use Vercel Web Analytics, which is privacy-first and does not use cookies or fingerprinting — it does not track you across sites or sessions.</li>
            <li><strong>No advertising or tracking cookies:</strong> We do not use advertising cookies, cross-site tracking pixels, or third-party behavioral profiling tools.</li>
          </ul>
          <h3 className="mt-4 font-semibold text-gray-800">Your choices</h3>
          <ul className="mt-2 list-disc space-y-2 pl-5">
            <li><strong>Browser settings:</strong> You can configure your browser to block or delete cookies at any time. Note that disabling essential cookies will prevent you from signing in to your account.</li>
            <li><strong>Do Not Track:</strong> We honor browser Do Not Track signals to the extent technically feasible.</li>
          </ul>
          <h3 className="mt-4 font-semibold text-gray-800">Third-party services</h3>
          <p className="mt-2">Our site integrates with the following third-party services that may process data under their own privacy policies:</p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            <li>Supabase — authentication and database</li>
            <li>Vercel — hosting and analytics</li>
            <li>Stripe — payment processing</li>
            <li>Resend — transactional email</li>
          </ul>
        </section>

        {/* 10 */}
        <section id="section-10">
          <h2 className="text-xl font-bold text-gray-900">10. Changes to This Privacy Policy</h2>
          <p className="mt-2">
            We may update this Privacy Policy from time to time. When we make material changes, we will update the
            effective date at the top of this page and, where appropriate, notify you by email or by posting a
            notice on our website. Your continued use of our Services after any changes constitutes your acceptance
            of the updated Privacy Policy.
          </p>
        </section>

        <p className="border-t border-gray-200 pt-6 text-sm text-gray-400">© 2026 EMLAKIE LLC · All rights reserved.</p>
      </div>
    </div>
  );
}
