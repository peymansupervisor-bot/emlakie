import type { Metadata } from 'next';
import AppBadges from '@/components/AppBadges';

export const metadata: Metadata = {
  title: 'Get the EMLAKIE App',
  description:
    'Search rentals, chat with landlords, and apply in minutes. EMLAKIE is coming soon to the App Store and Google Play.',
};

export default function AppPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-brand-600 shadow-card">
        <svg viewBox="0 0 32 32" className="h-12 w-12 fill-white">
          <path d="M16 3 3 14h4v13h8v-8h2v8h8V14h4L16 3z" />
        </svg>
      </div>
      <h1 className="mt-8 text-4xl font-extrabold text-gray-900">
        The EMLAKIE app is almost here
      </h1>
      <p className="mt-4 max-w-xl text-lg text-gray-600">
        We&apos;re putting the finishing touches on the EMLAKIE app for iPhone and
        Android. Search on the go, message landlords instantly, and apply for your
        next home in under two minutes.
      </p>
      <div className="mt-10">
        <AppBadges />
      </div>
      <p className="mt-6 text-sm text-gray-500">
        Store links go live the moment the app is approved — check back soon.
      </p>
    </section>
  );
}
