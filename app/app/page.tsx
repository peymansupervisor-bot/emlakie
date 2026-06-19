import type { Metadata } from 'next';
import Image from 'next/image';
import AppBadges from '@/components/AppBadges';

export const metadata: Metadata = {
  title: 'Get the EMLAKIE App',
  description:
    'Search rentals, chat with landlords, and apply in minutes. EMLAKIE is coming soon to the App Store and Google Play.',
  alternates: { canonical: 'https://emlakie.com/app' },
  openGraph: {
    title: 'Get the EMLAKIE App',
    description: 'Search rentals, chat with landlords, and apply in minutes. EMLAKIE is coming soon to the App Store and Google Play.',
    type: 'website',
    url: 'https://emlakie.com/app',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'EMLAKIE' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Get the EMLAKIE App',
    description: 'Search rentals, chat with landlords, and apply in minutes. EMLAKIE is coming soon to the App Store and Google Play.',
    images: ['/opengraph-image'],
  },
};

export default function AppPage() {
  return (
    <section className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center sm:px-6">
      <Image src="/logo.png" alt="Emlakie" width={80} height={80} className="rounded-3xl shadow-card" />
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
