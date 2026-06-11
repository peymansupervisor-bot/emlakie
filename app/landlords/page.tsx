import type { Metadata } from 'next';
import Link from 'next/link';
import AppBadges from '@/components/AppBadges';

export const metadata: Metadata = {
  title: 'List Your Rental Property',
  description:
    'Post your rental in minutes, screen applicants with AI-powered matching, and chat with tenants directly. Free for landlords.',
};

const steps = [
  {
    title: 'Post your property',
    body: 'Add photos, set your rent, and publish in under five minutes — right from your phone.',
  },
  {
    title: 'Get matched applicants',
    body: 'Our AI scores every application against your listing so the best-fit tenants rise to the top.',
  },
  {
    title: 'Chat and decide',
    body: 'Message applicants directly, schedule showings, and approve your tenant — all in one place.',
  },
];

export default function LandlordsPage() {
  return (
    <>
      <section className="bg-gradient-to-b from-brand-50 to-white">
        <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6">
          <h1 className="mx-auto max-w-2xl text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Fill your rental <span className="text-brand-600">faster</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-600">
            Post your property for free, get AI-matched applicants, and talk to
            tenants directly. No listing fees, no commissions.
          </p>
          <div className="mt-8 flex justify-center">
            <AppBadges />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <h2 className="text-center text-2xl font-extrabold text-gray-900">How it works</h2>
        <div className="mt-10 grid gap-8 sm:grid-cols-3">
          {steps.map((step, i) => (
            <div key={step.title} className="rounded-2xl border border-gray-200 p-6 shadow-card">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-lg font-bold text-white">
                {i + 1}
              </div>
              <h3 className="mt-4 text-lg font-bold text-gray-900">{step.title}</h3>
              <p className="mt-2 text-gray-600">{step.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 text-center">
          <p className="text-gray-600">
            Have questions first?{' '}
            <Link href="/rentals" className="font-semibold text-brand-600 hover:text-brand-700">
              See how your listing will look to renters →
            </Link>
          </p>
        </div>
      </section>
    </>
  );
}
