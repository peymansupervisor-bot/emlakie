import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  metadataBase: new URL('https://rentaldom.com'),
  title: {
    default: 'RentalDom — Find Your Next Rental Home',
    template: '%s | RentalDom',
  },
  description:
    'Browse houses, apartments, and condos for rent. RentalDom connects renters directly with landlords — no hassle, no runaround.',
  openGraph: {
    siteName: 'RentalDom',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-[60vh]">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
