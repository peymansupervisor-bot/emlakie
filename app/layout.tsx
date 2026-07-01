import type { Metadata } from 'next';
import { Inter, Plus_Jakarta_Sans, Playfair_Display } from 'next/font/google';
import Navbar from '@/components/Navbar';
import ConditionalFooter from '@/components/ConditionalFooter';
import CookieBanner from '@/components/CookieBanner';
import GoogleAnalytics from '@/components/GoogleAnalytics';
import ErrorReporter from '@/components/ErrorReporter';
import AssistantShell from '@/components/assistant/AssistantShell';
import './globals.css';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });
const jakarta = Plus_Jakarta_Sans({ subsets: ['latin'], variable: '--font-jakarta', weight: ['500', '600', '700', '800'] });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', weight: ['400', '500', '600', '700'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://emlakie.com'),
  title: {
    default: 'EMLAKIE — Rentals Direct from Landlords',
    template: '%s | EMLAKIE',
  },
  description:
    'Search houses, apartments, and condos for rent directly from landlords. No broker fees, no middlemen. List your rental free in under 5 minutes.',
  alternates: {
    canonical: 'https://emlakie.com/', // trailing slash aligns with the canonical expected for the root route
  },
  openGraph: {
    siteName: 'EMLAKIE',
    title: 'EMLAKIE — List Rentals Free & Find Tenants Fast',
    description: 'Post your rental listing free on EMLAKIE. Reach thousands of qualified tenants, no broker fees, no middleman. Browse rentals or list your property today.',
    type: 'website',
    url: 'https://emlakie.com/',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'EMLAKIE — Find Your Next Rental Home',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EMLAKIE — List Rentals Free & Find Tenants Fast',
    description: 'Post your rental listing free on EMLAKIE. Reach thousands of qualified tenants, no broker fees, no middleman.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    // Versioned query param busts browsers' notoriously sticky favicon cache
    // (they often ignore normal Cache-Control headers for these). Bump ?v=
    // whenever the icon artwork changes so returning visitors see it.
    icon: [
      { url: '/favicon-32x32.png?v=2', type: 'image/png', sizes: '32x32' },
      { url: '/favicon.svg?v=2', type: 'image/svg+xml' },
      { url: '/favicon.ico?v=2', sizes: 'any', type: 'image/x-icon' },
    ],
    apple: '/apple-touch-icon.png?v=2',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${jakarta.variable} ${playfair.variable} font-sans`}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Navbar />
        <main id="main-content" className="min-h-[60vh]">{children}</main>
        <ConditionalFooter />
        <CookieBanner />
        <ErrorReporter />
        <AssistantShell />
        <GoogleAnalytics />
      </body>
    </html>
  );
}
