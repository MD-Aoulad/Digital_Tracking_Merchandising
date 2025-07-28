import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { Analytics } from '@vercel/analytics/react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Digital Tracking Merchandising Platform',
  description: 'Enterprise-grade workforce management and merchandising platform for retail businesses',
  keywords: 'merchandising, workforce management, retail, field force, attendance tracking',
  authors: [{ name: 'Digital Tracking Merchandising' }],
  robots: 'index, follow',
  metadataBase: new URL('http://localhost:3013'),
  openGraph: {
    title: 'Digital Tracking Merchandising Platform',
    description: 'Enterprise-grade workforce management and merchandising platform',
    type: 'website',
    locale: 'en_US',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div id="root">
          <Header />
          {children}
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  );
} 