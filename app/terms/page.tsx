import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-gray-900">Terms of Service</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: June 10, 2026</p>

      <div className="mt-8 space-y-6 leading-relaxed text-gray-700">
        <p>
          By using emlakie.com or the EMLAKIE app you agree to these terms.
        </p>
        <h2 className="text-xl font-bold text-gray-900">The service</h2>
        <p>
          EMLAKIE is a platform that connects renters and landlords. We are not a
          party to any lease agreement, and we do not own, manage, or inspect the
          properties listed.
        </p>
        <h2 className="text-xl font-bold text-gray-900">Listings</h2>
        <p>
          Landlords are responsible for the accuracy of their listings and for
          complying with all applicable housing laws, including the Fair Housing Act.
          We may remove listings that violate these terms.
        </p>
        <h2 className="text-xl font-bold text-gray-900">Acceptable use</h2>
        <p>
          You agree not to misuse the service, post false information, or attempt to
          circumvent our systems.
        </p>
        <h2 className="text-xl font-bold text-gray-900">Contact</h2>
        <p>
          Questions? Email{' '}
          <a href="mailto:support@emlakie.com" className="font-semibold text-brand-600">
            support@emlakie.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
