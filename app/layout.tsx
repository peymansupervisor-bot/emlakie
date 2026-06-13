import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
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
  openGraph: {
    siteName: 'EMLAKIE',
    type: 'website',
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
      </body>
    </html>
  );
}
