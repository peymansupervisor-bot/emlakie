import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Rent Estimator — What Should I Charge for Rent?',
  description: 'Find out what your rental property is worth. Get a free rent estimate based on real active listings in your city — instant, no sign-up required.',
  alternates: { canonical: 'https://emlakie.com/rent-estimate' },
  openGraph: {
    title: 'Free Rent Estimator — What Should I Charge for Rent? | EMLAKIE',
    description: 'Get a free rent estimate based on real active listings in your city. Instant — no account needed.',
    type: 'website',
    url: 'https://emlakie.com/rent-estimate',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'EMLAKIE Free Rent Estimator' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Rent Estimator — What Should I Charge for Rent? | EMLAKIE',
    description: 'Get a free rent estimate based on real active listings in your city. Instant — no account needed.',
    images: ['/opengraph-image'],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
