import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CookieBanner from '@/components/CookieBanner';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://emlakie.com'),
  title: {
    default: 'EMLAKIE — Find Your Next Rental Home',
    template: '%s | EMLAKIE',
  },
  description:
    'Browse houses, apartments, and condos for rent. EMLAKIE connects renters directly with landlords — no hassle, no runaround.',
  alternates: {
    canonical: 'https://emlakie.com',
  },
  openGraph: {
    siteName: 'EMLAKIE',
    type: 'website',
    images: [
      {
        url: '/logo.png',
        width: 512,
        height: 512,
        alt: 'EMLAKIE — Find Your Next Rental Home',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/logo.png'],
  },
  icons: {
    shortcut: '/favicon.ico',
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', type: 'image/x-icon' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Navbar />
        <main id="main-content" className="min-h-[60vh]">{children}</main>
        <Footer />
        <CookieBanner />
      </body>
    </html>
  );
}
