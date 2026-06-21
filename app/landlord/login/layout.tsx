import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'List Your Rental Property | EMLAKIE',
  description: 'Sign in or create a free landlord account to post your rental listing, get matched applicants, and message tenants directly — no commissions.',
  alternates: { canonical: 'https://emlakie.com/landlord/login' },
  openGraph: {
    title: 'List Your Rental Property for Free | EMLAKIE',
    description: 'Post your rental listing, get AI-matched applicants, and chat with tenants directly. No listing fees, no commissions.',
    type: 'website',
    url: 'https://emlakie.com/landlord/login',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'List Your Rental Property for Free | EMLAKIE' }],
  },
  robots: { index: false },
  twitter: {
    card: 'summary_large_image',
    title: 'List Your Rental Property for Free | EMLAKIE',
    description: 'Post your rental listing, get AI-matched applicants, and chat with tenants directly. No listing fees, no commissions.',
    images: ['/og-image.png'],
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
