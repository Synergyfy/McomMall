import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'MCOM Mall',
    short_name: 'MCOM',
    description: 'MCOM Mall - Your one-stop shop for everything.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#000000',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      // This "maskable" icon is a best-practice for Android
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    // Add this screenshots array to fix the other warnings
    screenshots: [
      {
        src: '/screenshot-desktop.png', // Create this screenshot and add to /public
        type: 'image/png',
        sizes: '1565x808',
        form_factor: 'wide',
        label: 'MCOM Mall Desktop View',
      },
      {
        src: '/screenshot-mobile.png', // Create this screenshot and add to /public
        type: 'image/png',
        sizes: '405x721',
        form_factor: 'narrow',
        label: 'MCOM Mall Mobile View',
      },
    ],
  };
}
