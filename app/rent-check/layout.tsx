import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Is My Rent Fair? Free Rent Check Tool',
  description: 'Find out if you\'re overpaying for rent. Compare your monthly rent against real landlord listings in your city — free, instant, no sign-up required.',
  alternates: { canonical: 'https://emlakie.com/rent-check' },
  openGraph: {
    title: 'Is My Rent Fair? Free Rent Check Tool | EMLAKIE',
    description: 'Compare your rent against real landlord listings in your city. Free and instant — no account needed.',
    type: 'website',
    url: 'https://emlakie.com/rent-check',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'EMLAKIE Rent Check' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Is My Rent Fair? Free Rent Check Tool | EMLAKIE',
    description: 'Compare your rent against real landlord listings in your city. Free and instant — no account needed.',
    images: ['/opengraph-image'],
  },
};

export default function RentCheckLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
