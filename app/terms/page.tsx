import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service | EMLAKIE',
  description: 'Read EMLAKIE\'s Terms of Service. These terms govern your use of our rental platform, listing services, tenant applications, and mobile app as a renter or landlord.',
  alternates: { canonical: 'https://emlakie.com/terms' },
  robots: { index: true, follow: false },
  openGraph: {
    title: 'Terms of Service | EMLAKIE',
    description: 'Terms governing your use of the EMLAKIE rental platform as a renter or landlord.',
    type: 'website',
    url: 'https://emlakie.com/terms',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Terms of Service | EMLAKIE',
    description: 'Terms governing your use of the EMLAKIE rental platform as a renter or landlord.',
    images: ['/og-image.png'],
  },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Legal</p>
      <h1 className="mt-2 text-3xl font-extrabold text-gray-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">Effective June 14, 2026</p>

      <div className="mt-6 leading-relaxed text-gray-700">
        <p>
          Please read these Terms of Service (&quot;Terms&quot;) carefully before using EMLAKIE.com or the EMLAKIE mobile
          application (together, the &quot;Services&quot;) operated by EMLAKIE LLC (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;). By accessing or
          using the Services, you confirm that you are at least 18 years old, have read and understood these Terms,
          and agree to be legally bound by them. If you do not agree, do not use the Services.
        </p>
      </div>

      {/* Table of contents */}
      <nav className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <p className="text-sm font-bold uppercase tracking-wide text-gray-700">Contents</p>
        <ol className="mt-3 space-y-1 text-sm text-brand-600">
          {[
            'Acceptance of Terms',
            'Description of Services',
            'Eligibility',
            'User Accounts',
            'Acceptable Use Policy',
            'User-Generated Content',
            'Identity Verification',
            'No Guarantee of Results',
            'Intellectual Property',
            'Copyright / DMCA Policy',
            'Third-Party Services',
            'Disclaimers',
            'Limitation of Liability',
            'Indemnification',
            'Arbitration and Class Action Waiver',
            'Governing Law',
            'Termination',
            'Changes to These Terms',
            'Contact Information',
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

        <section id="section-1">
          <h2 className="text-xl font-bold text-gray-900">1. Acceptance of Terms</h2>
          <p className="mt-2">
            By creating an account, posting a listing, or otherwise using the Services in any way, you enter into a
            legally binding agreement with EMLAKIE LLC. You must be at least 18 years old and legally capable of
            entering into contracts under applicable law. If you are using the Services on behalf of a business or
            other legal entity, you represent that you have the authority to bind that entity to these Terms.
          </p>
        </section>

        <section id="section-2">
          <h2 className="text-xl font-bold text-gray-900">2. Description of Services</h2>
          <p className="mt-2">
            EMLAKIE is an independent online platform that allows landlords to post rental property listings and
            prospective tenants to browse and inquire about those listings. EMLAKIE acts as a passive conduit of
            information only. We are not a party to any rental transaction, lease agreement, or contract between
            users, and we do not broker, negotiate, manage, or otherwise participate in any such transaction.
          </p>
          <p className="mt-2">
            EMLAKIE does not own, manage, or inspect any properties listed on the platform, and we make no
            representations regarding the accuracy, safety, or legality of any listing.
          </p>
        </section>

        <section id="section-3">
          <h2 className="text-xl font-bold text-gray-900">3. Eligibility</h2>
          <p className="mt-2">
            You must be at least 18 years old to use the Services. The Services are not directed to children under
            13. We comply with the Children&apos;s Online Privacy Protection Act (COPPA). If we discover that a user
            under 13 has created an account, we will promptly delete that account and any associated information.
          </p>
          <p className="mt-2">
            By using the Services, you represent and warrant that you meet all eligibility requirements, that you
            will only provide accurate information, and that your use complies with all applicable laws.
          </p>
        </section>

        <section id="section-4">
          <h2 className="text-xl font-bold text-gray-900">4. User Accounts</h2>
          <p className="mt-2">
            To access certain features, you must create an account. You agree to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Provide accurate, current, and complete information during registration and keep it up to date</li>
            <li>Maintain the confidentiality of your password and account credentials</li>
            <li>Accept responsibility for all activity that occurs under your account</li>
            <li>Notify us immediately at{' '}
              <a href="mailto:support@emlakie.com" className="font-semibold text-brand-600 hover:text-brand-700">support@emlakie.com</a>{' '}
              if you suspect unauthorized access to your account
            </li>
          </ul>
          <p className="mt-3">
            We reserve the right to suspend or terminate accounts that contain inaccurate information or that
            violate these Terms.
          </p>
        </section>

        <section id="section-5">
          <h2 className="text-xl font-bold text-gray-900">5. Acceptable Use Policy</h2>
          <p className="mt-2">You agree not to use the Services to:</p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Post false, misleading, or fraudulent listings or information</li>
            <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
            <li>List a property you do not own or are not authorized to rent</li>
            <li>Discriminate against any person in violation of the Fair Housing Act or any applicable law</li>
            <li>Harass, threaten, or intimidate any user</li>
            <li>Harvest, scrape, or collect data about other users without their consent</li>
            <li>Upload or transmit any malware, viruses, or malicious code</li>
            <li>Attempt to gain unauthorized access to any part of the Services or our systems</li>
            <li>Use the Services for any unlawful purpose or in violation of any applicable law</li>
            <li>Circumvent, disable, or interfere with any security or access-control feature of the Services</li>
          </ul>
          <p className="mt-3">
            Violation of this policy may result in immediate account suspension or termination and may be reported
            to law enforcement.
          </p>
        </section>

        <section id="section-6">
          <h2 className="text-xl font-bold text-gray-900">6. User-Generated Content</h2>
          <p className="mt-2">
            When you submit content to the Services — including property listings, photos, descriptions, and
            messages — you represent that you have all rights necessary to submit that content and that it does not
            violate any third-party rights.
          </p>
          <p className="mt-2">
            By submitting content, you grant EMLAKIE LLC a non-exclusive, royalty-free, worldwide, perpetual
            license to use, display, reproduce, distribute, and promote that content in connection with operating
            and marketing the Services.
          </p>
          <p className="mt-2">
            You remain responsible for all content you submit. EMLAKIE does not endorse any user-submitted content
            and is not liable for it. We reserve the right to remove any content at our sole discretion, without
            notice, for any reason.
          </p>
        </section>

        <section id="section-7">
          <h2 className="text-xl font-bold text-gray-900">7. Identity Verification</h2>
          <p className="mt-2">
            Landlords who list properties on EMLAKIE are required to complete identity verification through Stripe
            Identity before their listing is published. This process requires submission of a government-issued
            photo ID and a real-time selfie.
          </p>
          <p className="mt-2">
            <strong>Important:</strong> Identity verification does not constitute a warranty or guarantee by EMLAKIE
            of any landlord&apos;s identity, property ownership, legal standing, or the safety of any transaction. You
            are still responsible for conducting your own due diligence before entering into any rental agreement or
            transferring any funds.
          </p>
        </section>

        <section id="section-8">
          <h2 className="text-xl font-bold text-gray-900">8. No Guarantee of Results</h2>
          <p className="mt-2">
            EMLAKIE does not guarantee any specific outcome from using the Services, including:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>That a listing will attract qualified tenants or result in a rental</li>
            <li>That a property is available, accurately described, or as represented by the landlord</li>
            <li>That any user will follow through on communications, applications, or agreements</li>
          </ul>
          <p className="mt-3">
            While we take reasonable steps to detect and prevent fraud, we cannot guarantee 100% protection
            against fraud or misrepresentation by third parties. Use of the Services is at your own risk.
          </p>
        </section>

        <section id="section-9">
          <h2 className="text-xl font-bold text-gray-900">9. Intellectual Property</h2>
          <p className="mt-2">
            All original content on the Services — including text, graphics, logos, software, and design — is the
            property of EMLAKIE LLC and is protected by applicable intellectual property laws. You may not
            reproduce, distribute, modify, create derivative works of, or publicly display any of our proprietary
            content without our express written permission.
          </p>
          <p className="mt-2">
            The EMLAKIE name, logo, and related marks are trademarks of EMLAKIE LLC. Nothing in these Terms grants
            you any right to use our trademarks.
          </p>
        </section>

        <section id="section-10">
          <h2 className="text-xl font-bold text-gray-900">10. Copyright / DMCA Policy</h2>
          <p className="mt-2">
            All original content on this platform — including text, graphics, city guides, blog articles, and software — is the
            property of EMLAKIE LLC and is protected under the U.S. Copyright Act. EMLAKIE&apos;s copyright is registered with
            the DMCA (Registration No. <strong>DMCA-1074529</strong>).
          </p>
          <p className="mt-2">
            If you believe that content appearing on the Services infringes your copyright, please submit a written notice to
            our designated DMCA agent at{' '}
            <a href="mailto:legal@emlakie.com" className="font-semibold text-brand-600 hover:text-brand-700">legal@emlakie.com</a>{' '}
            that includes: (1) identification of the copyrighted work claimed to be infringed; (2) identification of the
            infringing material and its location on our platform; (3) your contact information; (4) a statement of good-faith
            belief that the use is not authorized; and (5) a statement under penalty of perjury that the information in the
            notice is accurate and that you are the copyright owner or authorized to act on the owner&apos;s behalf.
          </p>
          <p className="mt-2">
            We will respond to valid DMCA notices and remove infringing content in accordance with the Digital Millennium
            Copyright Act, 17 U.S.C. § 512. Repeat infringers may have their accounts terminated.
          </p>
        </section>

        <section id="section-12">
          <h2 className="text-xl font-bold text-gray-900">11. Third-Party Services</h2>
          <p className="mt-2">
            The Services integrate with third-party providers including Stripe Identity (identity verification),
            Supabase (authentication and database), Vercel (hosting), and OpenStreetMap/Nominatim (address lookup).
            These services are subject to their own terms and privacy policies, and EMLAKIE is not responsible for
            the conduct, content, or practices of any third-party service.
          </p>
          <p className="mt-2">
            The Services may also contain links to third-party websites. We do not endorse and are not responsible
            for the content or practices of any linked third-party site.
          </p>
        </section>

        <section id="section-12">
          <h2 className="text-xl font-bold text-gray-900">12. Disclaimers</h2>
          <p className="mt-2">
            THE SERVICES ARE PROVIDED &quot;AS IS&quot; AND &quot;AS AVAILABLE&quot; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR
            IMPLIED, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
            NON-INFRINGEMENT, OR UNINTERRUPTED AVAILABILITY. EMLAKIE DOES NOT WARRANT THAT THE SERVICES WILL BE
            ERROR-FREE, SECURE, OR FREE OF VIRUSES OR OTHER HARMFUL COMPONENTS.
          </p>
          <p className="mt-2">
            We do not warrant the accuracy, completeness, or reliability of any listing, user content, or other
            information available through the Services.
          </p>
        </section>

        <section id="section-13">
          <h2 className="text-xl font-bold text-gray-900">13. Limitation of Liability</h2>
          <p className="mt-2">
            TO THE FULLEST EXTENT PERMITTED BY APPLICABLE LAW, EMLAKIE LLC, ITS OWNER(S), OFFICERS, EMPLOYEES,
            AGENTS, AND AFFILIATES SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL,
            PUNITIVE, OR EXEMPLARY DAMAGES ARISING OUT OF OR RELATED TO YOUR USE OF, OR INABILITY TO USE, THE
            SERVICES — INCLUDING BUT NOT LIMITED TO LOSS OF PROFITS, DATA, GOODWILL, OR OTHER INTANGIBLE LOSSES.
          </p>
          <p className="mt-2">
            IN NO EVENT SHALL OUR TOTAL LIABILITY TO YOU FOR ALL CLAIMS ARISING OUT OF OR RELATED TO THESE TERMS
            OR THE SERVICES EXCEED ONE HUNDRED DOLLARS ($100.00), REGARDLESS OF THE LEGAL THEORY ASSERTED.
          </p>
          <p className="mt-2">
            Some jurisdictions do not allow limitations on implied warranties or exclusion of certain damages, so
            some of the above limitations may not apply to you.
          </p>
        </section>

        <section id="section-14">
          <h2 className="text-xl font-bold text-gray-900">14. Indemnification</h2>
          <p className="mt-2">
            You agree to defend, indemnify, and hold harmless EMLAKIE LLC, its owner(s), officers, employees,
            agents, affiliates, successors, and assigns from and against any and all claims, damages, losses,
            liabilities, costs, and expenses — including reasonable attorneys&apos; fees — arising out of or related to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Your use of or access to the Services</li>
            <li>Any content you submit, post, or transmit through the Services</li>
            <li>Your violation of these Terms or any applicable law</li>
            <li>Your interactions with any other user of the Services, whether online or in person</li>
            <li>Any dispute between you and another user</li>
          </ul>
        </section>

        <section id="section-15">
          <h2 className="text-xl font-bold text-gray-900">15. Arbitration and Class Action Waiver</h2>
          <p className="mt-2">
            <strong>Please read this section carefully. It affects your legal rights.</strong>
          </p>
          <p className="mt-2">
            Except for claims that qualify for small claims court, you and EMLAKIE LLC agree that any dispute,
            claim, or controversy arising out of or relating to these Terms or the Services shall be resolved by
            binding arbitration administered by the American Arbitration Association (AAA) under its Consumer
            Arbitration Rules, rather than in court.
          </p>
          <p className="mt-2">
            <strong>Class Action Waiver:</strong> You and EMLAKIE LLC each agree to bring claims only in your
            individual capacity, and not as a plaintiff or class member in any purported class, collective, or
            representative proceeding. The arbitrator may not consolidate more than one person&apos;s claims.
          </p>
          <p className="mt-2">
            <strong>Opt-Out:</strong> You may opt out of this arbitration agreement within 30 days of first
            accepting these Terms by sending written notice to{' '}
            <a href="mailto:support@emlakie.com" className="font-semibold text-brand-600 hover:text-brand-700">
              support@emlakie.com
            </a>{' '}
            with the subject line &quot;Arbitration Opt-Out.&quot; If you opt out, all disputes will be resolved in court
            as set forth in Section 16.
          </p>
        </section>

        <section id="section-16">
          <h2 className="text-xl font-bold text-gray-900">16. Governing Law</h2>
          <p className="mt-2">
            These Terms shall be governed by and construed in accordance with the laws of the State of California,
            without regard to its conflict-of-law provisions. For any disputes not subject to arbitration, you
            consent to the exclusive jurisdiction of the state and federal courts located in California.
          </p>
        </section>

        <section id="section-17">
          <h2 className="text-xl font-bold text-gray-900">17. Termination</h2>
          <p className="mt-2">
            We reserve the right to suspend or terminate your access to the Services at any time, with or without
            notice, for any reason, including if we believe you have violated these Terms. Upon termination, all
            rights granted to you under these Terms will immediately cease.
          </p>
          <p className="mt-2">
            Sections that by their nature should survive termination — including Sections 6, 9, 11, 12, 13, 14,
            and 15 — shall survive.
          </p>
        </section>

        <section id="section-18">
          <h2 className="text-xl font-bold text-gray-900">18. Changes to These Terms</h2>
          <p className="mt-2">
            We may update these Terms at any time. When we do, we will post the revised Terms with an updated
            effective date. Your continued use of the Services after any changes constitutes your acceptance of the
            new Terms. If you do not agree to the updated Terms, you must stop using the Services.
          </p>
        </section>

        <section id="section-19">
          <h2 className="text-xl font-bold text-gray-900">19. Contact Information</h2>
          <p className="mt-2">If you have questions about these Terms, please contact us:</p>
          <div className="mt-4 space-y-1">
            <p>EMLAKIE LLC</p>
            <p>
              📧{' '}
              <a href="mailto:support@emlakie.com" className="font-semibold text-brand-600 hover:text-brand-700">
                support@emlakie.com
              </a>
            </p>
          </div>

          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-4 text-sm">
            <p className="font-semibold text-gray-800">Fair Housing Notice</p>
            <p className="mt-1 text-gray-600">
              EMLAKIE is committed to the principles of the Fair Housing Act and Equal Opportunity. All landlords
              using the Services are required to comply with all applicable fair housing laws.
            </p>
          </div>
        </section>

        <p className="border-t border-gray-200 pt-6 text-sm text-gray-500">© 2026 EMLAKIE LLC · All rights reserved.</p>
      </div>
    </div>
  );
}
