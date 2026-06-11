import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="text-3xl font-extrabold text-gray-900">Privacy Policy</h1>
      <p className="mt-2 text-sm text-gray-500">Last updated: June 10, 2026</p>

      <div className="mt-8 space-y-6 leading-relaxed text-gray-700">
        <p>
          RentalDom (&quot;we&quot;, &quot;us&quot;) operates rentaldom.com and the RentalDom
          mobile application. This policy describes what we collect and how we use it.
        </p>
        <h2 className="text-xl font-bold text-gray-900">Information we collect</h2>
        <p>
          When you browse the site we collect standard analytics data (pages visited,
          device type). If you create an account in the app we collect your phone
          number, name, and the information you submit in listings or applications.
        </p>
        <h2 className="text-xl font-bold text-gray-900">How we use it</h2>
        <p>
          We use your information to operate the service: showing listings, connecting
          renters with landlords, and processing applications. We do not sell your
          personal information.
        </p>
        <h2 className="text-xl font-bold text-gray-900">Contact</h2>
        <p>
          Questions about this policy? Email us at{' '}
          <a href="mailto:support@rentaldom.com" className="font-semibold text-brand-600">
            support@rentaldom.com
          </a>
          .
        </p>
      </div>
    </div>
  );
}
