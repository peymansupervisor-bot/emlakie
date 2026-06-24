import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Free Rent Estimate for Landlords',
  description: "Get a free rent estimate for your property. See what similar homes rent for in your area — powered by real listings data. Perfect for landlords pricing a rental.",
  alternates: { canonical: 'https://emlakie.com/rent-estimate' },
  openGraph: {
    title: 'Free Rent Estimate for Landlords | EMLAKIE',
    description: 'Find out what your rental property is worth. Compare against real local listings — free, instant, no signup.',
    type: 'website',
    url: 'https://emlakie.com/rent-estimate',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'EMLAKIE Rent Estimate Tool' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Rent Estimate for Landlords | EMLAKIE',
    description: 'Find out what your rental property is worth. Compare against real local listings — free, instant, no signup.',
    images: ['/og-image.png'],
  },
};

export default function RentEstimateLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
