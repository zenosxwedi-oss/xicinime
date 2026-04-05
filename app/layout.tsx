import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import AdDisplay from '@/components/AdDisplay';
import WhatsAppFloat from '@/components/WhatsAppFloat';

const SITE_URL = 'https://xicinime-m5pc.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'xicinime — Nonton Anime Sub Indo',
    template: '%s | xicinime',
  },
  description: 'Nonton anime sub indo terbaru, terlengkap, dan tercepat update. Streaming anime gratis berkualitas tinggi.',
  keywords: [
    'anime', 'nonton anime', 'sub indo', 'anime sub indonesia',
    'anime terbaru', 'streaming anime', 'nonton anime gratis',
    'anime ongoing', 'anime completed', 'anime movies',
    'xicinime', 'samehadaku',
  ],
  authors: [{ name: 'xicinime' }],
  creator: 'xicinime',
  publisher: 'xicinime',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'id_ID',
    url: SITE_URL,
    siteName: 'xicinime',
    title: 'xicinime — Nonton Anime Sub Indo',
    description: 'Nonton anime sub indo terbaru, terlengkap, dan tercepat update. Streaming anime gratis berkualitas tinggi.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'xicinime — Nonton Anime Sub Indo',
    description: 'Nonton anime sub indo terbaru, terlengkap, dan tercepat update.',
  },
  alternates: {
    canonical: SITE_URL,
  },
  verification: {
    google: 'oxvZDq0x5pYq5Ad5aLcRLw4Q-a0Dx5J3dg2rNr9vngE',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>
        <Navbar />
        <AdDisplay position="top" />
        <main className="min-h-screen">{children}</main>
        <AdDisplay position="bottom" />
        <Footer />
        <WhatsAppFloat />
        <Script
          src="https://pl29055089.profitablecpmratenetwork.com/2e/de/ac/2edeac352603c4d21dc2ee2bac6c381b.js"
          strategy="lazyOnload"
        />
      </body>
    </html>
  );
}
