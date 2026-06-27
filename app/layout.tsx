import type { Metadata } from 'next';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import WhatsAppFloat from '@/components/WhatsAppFloat';
import Script from 'next/script';

const SITE_URL = 'https://xicinime.my.id';

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
      <head>
        <meta name="0a25db88f7050a28ffed89372d3771d7d0b5676c" content="0a25db88f7050a28ffed89372d3771d7d0b5676c" />
      </head>
      <body>
        <Navbar />
        <main className="min-h-screen">{children}</main>
        <Footer />
        <WhatsAppFloat />
        {/* HilltopAds */}
        <Script
          id="hilltopads-main"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `(function(ehcko){
var d = document,
    s = d.createElement('script'),
    l = d.scripts[d.scripts.length - 1];
s.settings = ehcko || {};
s.src = "//shameful-farm.com/bZXlVjs.d/GUlX0uYHWucr/keWmD9-uUZwUmlWkbP/T_cTxpNLzcMP3yOmTZclt/N/z/E/3/MNzTgdw/MZQX";
s.async = true;
s.referrerPolicy = 'no-referrer-when-downgrade';
l.parentNode.insertBefore(s, l);
})({})`,
          }}
        />
      </body>
    </html>
  );
}
