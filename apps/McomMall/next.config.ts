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
  transpilePackages: ['react-map-gl', 'maplibre-gl', '@mcommall/payments'],
  onDemandEntries: {
    maxInactiveAge: 15 * 1000,
    pagesBufferLength: 2,
  },
  experimental: {
    agentUpgrade: 'security',
    optimizePackageImports: [
      'lucide-react',
      '@heroicons/react',
      'antd',
      'recharts',
      'framer-motion',
      'date-fns',
      'lodash',
      '@radix-ui/react-icons',
    ],
  },
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
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'mcom-mall-api.vercel.app',
        pathname: '/**',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/terms',
        destination: '/terms-and-conditions',
        permanent: true,
      },
      {
        source: '/privacy',
        destination: '/privacy-policy',
        permanent: true,
      },
      {
        source: '/dashboard/membership-audits/membership',
        destination: '/dashboard/subscription',
        permanent: false,
      },
      {
        source: '/dashboard/membership-audits/:path*',
        destination: '/dashboard',
        permanent: false,
      },
      {
        source: '/dashboard/my-listings/:path*',
        destination: '/dashboard/my-business',
        permanent: false,
      },
      {
        source: '/dashboard/my-listings',
        destination: '/dashboard/my-business',
        permanent: false,
      },
      {
        source: '/dashboard/reviews',
        destination: '/dashboard/my-business',
        permanent: false,
      },
    ];
  },
};

export default withSerwist(nextConfig);
