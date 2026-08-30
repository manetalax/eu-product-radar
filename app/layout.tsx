import './globals.css';
import './dashboard-polish.css';
import './premium-global.css';
import './account-security.css';
import type { Metadata, Viewport } from 'next';
import { BRAND_DESCRIPTION, BRAND_NAME } from '@/lib/brand';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://euproductradar.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: `EU ${BRAND_NAME} · Inteligencia regulatoria europea`, template: `%s · EU ${BRAND_NAME}` },
  description: BRAND_DESCRIPTION,
  applicationName: BRAND_NAME,
  manifest: '/manifest.webmanifest',
  appleWebApp: { capable: true, statusBarStyle: 'default', title: BRAND_NAME },
  alternates: { canonical: '/' },
  openGraph: {
    title: `EU ${BRAND_NAME} · Inteligencia regulatoria europea`,
    description: BRAND_DESCRIPTION,
    type: 'website',
    locale: 'es_ES',
    siteName: BRAND_NAME,
  },
  twitter: { card: 'summary_large_image', title: `EU ${BRAND_NAME} · Inteligencia regulatoria europea`, description: BRAND_DESCRIPTION },
  robots: process.env.CONTEXT === 'deploy-preview' || process.env.CONTEXT === 'branch-deploy' ? { index: false, follow: false } : { index: true, follow: true },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f6f7fb', colorScheme: 'light' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="es"><body>{children}</body></html>;
}
