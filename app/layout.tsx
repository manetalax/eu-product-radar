import './globals.css';
import './dashboard-polish.css';
import './premium-global.css';
import './account-security.css';
import type { Metadata, Viewport } from 'next';
import { BRAND_DESCRIPTION, BRAND_NAME } from '@/lib/brand';
import PwaRegister from '@/components/PwaRegister';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://importverifier.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `${BRAND_NAME} · EU import compliance intelligence`, template: `%s · ${BRAND_NAME}` },
  description: BRAND_DESCRIPTION,
  applicationName: BRAND_NAME,
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }],
  },
  appleWebApp: { capable: true, statusBarStyle: 'default', title: BRAND_NAME },
  alternates: { canonical: '/' },
  openGraph: {
    title: `${BRAND_NAME} · EU import compliance intelligence`,
    description: BRAND_DESCRIPTION,
    type: 'website',
    locale: 'es_ES',
    siteName: BRAND_NAME,
  },
  twitter: { card: 'summary_large_image', title: `${BRAND_NAME} · EU import compliance intelligence`, description: BRAND_DESCRIPTION },
  robots: process.env.CONTEXT === 'deploy-preview' || process.env.CONTEXT === 'branch-deploy' ? { index: false, follow: false } : { index: true, follow: true },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f6f7fb', colorScheme: 'light' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body><PwaRegister />{children}</body></html>;
}
