import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Rent Check — Is Your Rent Fair?',
  description: "Find out if you're overpaying rent. Enter your address and current rent to instantly compare against real local listings. Free rent check tool from EMLAKIE.",
  alternates: { canonical: 'https://emlakie.com/rent-check' },
  openGraph: {
    title: 'Free Rent Check — Is Your Rent Fair? | EMLAKIE',
    description: 'Compare your rent against real local listings instantly. Free tool — no signup required.',
    type: 'website',
    url: 'https://emlakie.com/rent-check',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE Rent Check Tool' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Rent Check — Is Your Rent Fair? | EMLAKIE',
    description: 'Compare your rent against real local listings instantly. Free tool — no signup required.',
    images: ['/og-image.png'],
  },
};

export default function RentCheckLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
