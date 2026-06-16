import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Legal Disclaimer | EMLAKIE',
  description: 'Legal disclaimer for EMLAKIE — please read before using our platform.',
  alternates: { canonical: 'https://emlakie.com/disclaimer' },
  openGraph: {
    title: 'Legal Disclaimer | EMLAKIE',
    description: 'Legal disclaimer for EMLAKIE — please read before using our platform.',
    images: [{ url: '/logo.png', width: 512, height: 512, alt: 'EMLAKIE' }],
  },
};

export default function DisclaimerPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-600">Legal</p>
      <h1 className="mt-2 text-3xl font-extrabold text-gray-900">Legal Disclaimer</h1>
      <p className="mt-2 text-sm text-gray-500">Effective June 14, 2026</p>

      <div className="mt-6 leading-relaxed text-gray-700">
        <p>
          Please read this Legal Disclaimer carefully before using EMLAKIE.com (the &quot;Website&quot;) or the EMLAKIE
          mobile application (together, the &quot;Services&quot;). By accessing or using the Services, you acknowledge that
          you have read, understood, and agree to be bound by this Disclaimer. If you do not agree, you must
          discontinue use of the Services immediately.
        </p>
      </div>

      {/* Table of contents */}
      <nav className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6">
        <p className="text-sm font-bold uppercase tracking-wide text-gray-700">Contents</p>
        <ol className="mt-3 space-y-1 text-sm text-brand-600">
          {[
            'Nature and Purpose of the Services',
            'No Agency Relationship Created',
            'No Professional Advice of Any Kind',
            'No Warranty on Third-Party Content',
            'User Responsibility and Due Diligence',
            'Fair Housing Compliance',
            'Limitation of Liability',
            'Indemnification and Hold Harmless',
            'Third-Party Links and Content',
            'Section 230 — Communications Decency Act',
            'DMCA — Copyright Notice and Takedown Policy',
            'Governing Law and Dispute Resolution',
            'Changes to This Disclaimer',
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
          <h2 className="text-xl font-bold text-gray-900">1. Nature and Purpose of the Services</h2>
          <p className="mt-2">
            EMLAKIE is an independent, online informational advertising and connection platform designed to help
            landlords and prospective tenants discover each other. The Services provide a venue for users to post
            and browse rental listings.
          </p>
          <p className="mt-2">
            The Services do not participate in, negotiate, arrange, broker, manage, or consummate any rental
            transaction, lease agreement, sale, purchase, or any other contract between users. EMLAKIE is a passive
            conduit of information only.
          </p>
        </section>

        <section id="section-2">
          <h2 className="text-xl font-bold text-gray-900">2. No Agency Relationship Created</h2>
          <p className="mt-2">
            EMLAKIE is an informational platform only. The Services do not act as a real estate agent or broker
            with respect to any transaction facilitated between users.
          </p>
          <p className="mt-2">
            Your use of the Services does not create, establish, or imply any agency, fiduciary, broker-client, or
            representative relationship between you and EMLAKIE LLC. Merely accessing, browsing, submitting a
            listing, or contacting a landlord or tenant through the platform does not constitute acceptance of
            representation by any real estate broker or agent, and no such relationship shall be implied or
            inferred from any such action.
          </p>
          <p className="mt-2">
            Users who wish to engage a licensed real estate professional to represent them in a transaction are
            advised to retain one independently and enter into a written agency agreement that complies with
            applicable law.
          </p>
        </section>

        <section id="section-3">
          <h2 className="text-xl font-bold text-gray-900">3. No Professional Advice of Any Kind</h2>
          <p className="mt-2">
            Nothing on the Services constitutes legal, financial, tax, accounting, real estate, investment, or any
            other form of professional advice. No information published here should be relied upon as a substitute
            for consultation with a qualified professional.
          </p>
          <p className="mt-2">
            All content on the Services — including listing descriptions, neighborhood information, and any
            communications from EMLAKIE or its operators — is provided for general informational purposes only.
            Before making any decision regarding renting, leasing, or signing any contract, you should independently
            consult with:
          </p>
          <ul className="mt-3 list-disc space-y-1 pl-6">
            <li>A licensed attorney for legal advice specific to your situation</li>
            <li>A licensed real estate broker or agent for real estate guidance</li>
            <li>A certified public accountant (CPA) for tax and accounting matters</li>
            <li>A licensed financial advisor for investment and financial planning decisions</li>
          </ul>
          <p className="mt-3">
            Reliance on any information provided on the Services without seeking qualified professional advice is
            done entirely at your own risk. EMLAKIE LLC expressly disclaims all liability for any action taken or
            not taken based on the content of the Services.
          </p>
        </section>

        <section id="section-4">
          <h2 className="text-xl font-bold text-gray-900">4. No Warranty on Third-Party Content</h2>
          <p className="mt-2">
            All rental listings, property descriptions, photographs, pricing information, and other content
            displayed on the Services are submitted by unaffiliated, independent third-party users. EMLAKIE does
            not independently verify, screen, endorse, warrant, or guarantee:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>The accuracy, completeness, or truthfulness of any listing or user-submitted content</li>
            <li>The identity, background, creditworthiness, or legal standing of any landlord, tenant, or other user</li>
            <li>The legal ownership of any property listed</li>
            <li>The habitability, safety, or condition of any property</li>
            <li>The compliance of any listing with applicable federal, state, or local laws</li>
          </ul>
          <p className="mt-3">
            EMLAKIE expressly disclaims all warranties, express or implied, including but not limited to implied
            warranties of merchantability, fitness for a particular purpose, and non-infringement, to the fullest
            extent permitted by law.
          </p>
        </section>

        <section id="section-5">
          <h2 className="text-xl font-bold text-gray-900">5. User Responsibility and Due Diligence</h2>
          <p className="mt-2">
            All users — whether landlords, tenants, or other visitors — are solely and exclusively responsible for
            conducting their own thorough independent investigation and due diligence before taking any action,
            including:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Verifying the identity and good standing of any other party</li>
            <li>Inspecting any property in person prior to signing any agreement or paying any funds</li>
            <li>Confirming ownership of a property through the relevant county assessor or recorder</li>
            <li>Verifying that a listing complies with all applicable local, state, and federal laws</li>
            <li>Consulting with qualified legal, financial, or real estate professionals as appropriate</li>
            <li>Reviewing and negotiating the terms of any lease or rental agreement independently</li>
          </ul>
          <p className="mt-3">
            <strong>Fraud Risk Notice:</strong> While we do our best to reduce fraud through monitoring and
            verification measures, we cannot guarantee 100% protection against fraud or misrepresentation. By
            using the Services, you acknowledge and accept that you do so at your own risk. EMLAKIE LLC shall not
            be liable for any losses, damages, or harm resulting from fraudulent activity by any third party.
          </p>
        </section>

        <section id="section-6">
          <h2 className="text-xl font-bold text-gray-900">6. Fair Housing Compliance</h2>
          <p className="mt-2">
            All landlords and property owners posting listings on the Services are independently required to comply
            with all applicable fair housing laws, including:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Federal Fair Housing Act (42 U.S.C. § 3601 et seq.)</li>
            <li>California Fair Employment and Housing Act (Gov. Code § 12955 et seq.) — prohibiting discrimination based on race, color, national origin, religion, sex, familial status, disability, sexual orientation, source of income, marital status, ancestry, and other protected classes</li>
            <li>All applicable state and local anti-discrimination ordinances</li>
          </ul>
          <p className="mt-3">
            EMLAKIE does not endorse, condone, or permit discriminatory listings or conduct. Any listing found to
            violate fair housing laws may be removed at EMLAKIE&apos;s sole discretion. EMLAKIE is not liable for
            discriminatory acts committed independently by third-party users.
          </p>
        </section>

        <section id="section-7">
          <h2 className="text-xl font-bold text-gray-900">7. Limitation of Liability</h2>
          <p className="mt-2">
            To the fullest extent permitted by applicable law, EMLAKIE LLC, its owner(s), operators, officers,
            agents, successors, and assigns shall not be liable for any direct, indirect, incidental, special,
            consequential, punitive, or exemplary damages of any kind, including but not limited to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Physical injury, property damage, or personal harm arising from interactions between users</li>
            <li>Financial loss, fraud, or theft resulting from reliance on user-submitted content</li>
            <li>Loss of data, revenue, profits, or business opportunity</li>
            <li>Any damages resulting from unauthorized access to or use of the Services</li>
          </ul>
          <p className="mt-3">
            This limitation applies regardless of the legal theory asserted — whether in contract, tort (including
            negligence), strict liability, or otherwise — even if EMLAKIE has been advised of the possibility of
            such damages.
          </p>
        </section>

        <section id="section-8">
          <h2 className="text-xl font-bold text-gray-900">8. Indemnification and Hold Harmless</h2>
          <p className="mt-2">
            By using the Services, you agree to defend, indemnify, and hold harmless EMLAKIE LLC, its owner(s),
            officers, employees, agents, affiliates, successors, and assigns from and against any and all claims,
            actions, demands, damages, losses, liabilities, costs, and expenses — including reasonable attorneys&apos;
            fees — arising out of or related to:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Your use of or access to the Services</li>
            <li>Any content you submit, post, or transmit through the Services</li>
            <li>Your violation of this Disclaimer or any applicable law</li>
            <li>Your interactions with any other user of the Services, whether online or in person</li>
            <li>Any claim that your content or conduct caused damage to a third party</li>
          </ul>
        </section>

        <section id="section-9">
          <h2 className="text-xl font-bold text-gray-900">9. Third-Party Links and Content</h2>
          <p className="mt-2">
            The Services may contain links to third-party websites, services, or resources. These links are
            provided for convenience only. EMLAKIE has no control over and assumes no responsibility for the
            content, privacy practices, or conduct of any third-party sites. Accessing any third-party link is done
            entirely at your own risk.
          </p>
        </section>

        <section id="section-10">
          <h2 className="text-xl font-bold text-gray-900">10. Section 230 — Communications Decency Act</h2>
          <p className="mt-2">
            EMLAKIE is an interactive computer service as defined under Section 230 of the Communications Decency
            Act (47 U.S.C. § 230). EMLAKIE is not the publisher or speaker of any information provided by
            third-party users, including landlords or tenants. Accordingly, EMLAKIE shall not be treated as the
            publisher or speaker of any user-submitted content and is immune from liability for such content to the
            fullest extent provided by law.
          </p>
        </section>

        <section id="section-11">
          <h2 className="text-xl font-bold text-gray-900">11. DMCA — Copyright Notice and Takedown Policy</h2>
          <p className="mt-2">
            EMLAKIE respects intellectual property rights and complies with the Digital Millennium Copyright Act
            (17 U.S.C. § 512). If you believe that any content on the Services infringes your copyright, please
            send a written notice to our designated DMCA agent containing the following:
          </p>
          <ul className="mt-3 list-disc space-y-2 pl-6">
            <li>Your name, address, telephone number, and email address</li>
            <li>A description of the copyrighted work you claim has been infringed</li>
            <li>The URL or specific location of the infringing content on our Services</li>
            <li>A statement that you have a good-faith belief that the use is not authorized by the copyright owner, its agent, or the law</li>
            <li>A statement, made under penalty of perjury, that the information in your notice is accurate and that you are the copyright owner or authorized to act on the owner&apos;s behalf</li>
            <li>Your physical or electronic signature</li>
          </ul>
          <p className="mt-3">
            DMCA notices should be sent to:{' '}
            <a href="mailto:support@emlakie.com" className="font-semibold text-brand-600 hover:text-brand-700">
              support@emlakie.com
            </a>{' '}
            with the subject line: <strong>DMCA Takedown Notice</strong>.
          </p>
          <p className="mt-2">
            Upon receipt of a valid DMCA notice, we will promptly investigate and, if appropriate, remove or
            disable access to the allegedly infringing content. Repeat infringers may have their access to the
            Services terminated.
          </p>
        </section>

        <section id="section-12">
          <h2 className="text-xl font-bold text-gray-900">12. Governing Law and Dispute Resolution</h2>
          <p className="mt-2">
            This Disclaimer and any dispute arising out of or related to your use of the Services shall be governed
            by and construed in accordance with the laws of the State of California, without regard to its
            conflict-of-law provisions.
          </p>
          <p className="mt-2">
            Before filing any claim, users agree to make a good-faith effort to resolve the dispute directly by
            contacting EMLAKIE at{' '}
            <a href="mailto:support@emlakie.com" className="font-semibold text-brand-600 hover:text-brand-700">
              support@emlakie.com
            </a>.
          </p>
        </section>

        <section id="section-13">
          <h2 className="text-xl font-bold text-gray-900">13. Changes to This Disclaimer</h2>
          <p className="mt-2">
            EMLAKIE reserves the right to modify this Disclaimer at any time. Changes will be effective upon
            posting to the Services with an updated effective date. Your continued use of the Services after any
            changes constitutes your acceptance of the revised Disclaimer. Users are encouraged to review this page
            periodically.
          </p>
        </section>

        <section id="section-14">
          <h2 className="text-xl font-bold text-gray-900">14. Contact Information</h2>
          <p className="mt-2">
            If you have questions about this Disclaimer or wish to report potentially fraudulent or illegal
            content, please contact us:
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
        </section>

        <p className="border-t border-gray-200 pt-6 text-sm text-gray-400">© 2026 EMLAKIE LLC · All rights reserved.</p>
      </div>
    </div>
  );
}
