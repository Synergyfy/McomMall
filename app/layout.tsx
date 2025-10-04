import type { Metadata } from 'next';
import { Open_Sans } from 'next/font/google';
import 'leaflet/dist/leaflet.css';
import './globals.css';
import ClientProviders from '@/components/client-provider';
import { Toaster } from 'sonner';
import Header from '@/components/Header';
import Auth from '@/components/auth';
import AuthInitializer from '@/components/AuthInitializer';
import ServiceWorkerRegistrar from '@/components/ServiceWorkerRegistrar';

const opensans = Open_Sans({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

import type { Viewport } from 'next';

const APP_NAME = 'McomMall';
const APP_DEFAULT_TITLE = 'McomMall';
const APP_TITLE_TEMPLATE = '%s - McomMall';
const APP_DESCRIPTION = 'McomMall - Your one-stop shop for everything.';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  manifest: '/manifest.json',
};

export const viewport: Viewport = {
  themeColor: '#FFFFFF',
};

import Script from 'next/script';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${opensans.variable} antialiased overflow-hidden`}>
        <ClientProviders>
          <AuthInitializer>
            <ServiceWorkerRegistrar />
            <Header />
            <Auth redirect={null} />
            {children}
          </AuthInitializer>
        </ClientProviders>
        <Toaster />
        <Script src="https://unpkg.com/jspdf@latest/dist/jspdf.umd.min.js" />
        <Script src="https://unpkg.com/jspdf-autotable@latest/dist/jspdf.plugin.autotable.js" />
      </body>
    </html>
  );
}
