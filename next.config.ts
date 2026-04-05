import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'v2.samehadaku.how' },
      { protocol: 'https', hostname: 'cdn.myanimelist.net' },
      { protocol: 'https', hostname: '**.how' },
      { protocol: 'https', hostname: '**.sankavollerei.com' },
    ],
  },
};

export default nextConfig;
