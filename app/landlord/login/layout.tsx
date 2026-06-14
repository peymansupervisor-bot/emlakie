import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'List Your Rental Property | EMLAKIE',
  description: 'Sign in or create a free landlord account to post your rental listing, get matched applicants, and message tenants directly — no commissions.',
  openGraph: {
    title: 'List Your Rental Property for Free | EMLAKIE',
    description: 'Post your rental listing, get AI-matched applicants, and chat with tenants directly. No listing fees, no commissions.',
    type: 'website',
  },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
