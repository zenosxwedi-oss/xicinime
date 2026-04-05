import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: 'https://xicinime-m5pc.vercel.app/sitemap.xml',
    host: 'https://xicinime-m5pc.vercel.app',
  };
}
