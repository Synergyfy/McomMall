import withSerwistInit from '@serwist/next';
import type { NextConfig } from 'next';

const withSerwist = withSerwistInit({
  swSrc: 'app/sw.ts',
  swDest: 'public/sw.js',
  disable: process.env.NODE_ENV === 'development',
});

const nextConfig: NextConfig = {
  /* config options here */
  // Next 16 uses Turbopack by default. Serwist injects a webpack config, so we
  // declare an (empty) turbopack config to opt in cleanly for `next dev`.
  // Production builds explicitly use webpack (`next build --webpack`) so the
  // Serwist service worker is still generated.
  turbopack: {},
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 2,
  },
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'antd',
      'recharts',
      'framer-motion',
      'date-fns',
      '@radix-ui/react-icons',
    ],
  },
  allowedDevOrigins: ['*.preview.same-app.com', 'https://3000-firebase-mcommalladmingit-1759853738433.cluster-lu4mup47g5gm4rtyvhzpwbfadi.cloudworkstations.dev'],
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ext.same-assets.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ugc.same-assets.com',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        pathname: '/**',
      },
    ],
  },
};

export default withSerwist(nextConfig);
