import './globals.css';
import './premium-global.css';
import './landing-conversion.css';
import type { Metadata, Viewport } from 'next';
import { BRAND_NAME } from '@/lib/brand';
import PwaRegister from '@/components/PwaRegister';
import { IMPORTVERIFIER_PRODUCTION_URL } from '@/lib/release-config';
import { LanguageProvider } from '@/lib/use-language';

function metadataBase(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    const parsed = configured ? new URL(configured) : new URL(IMPORTVERIFIER_PRODUCTION_URL);
    return parsed.protocol === 'https:' ? parsed : new URL(IMPORTVERIFIER_PRODUCTION_URL);
  } catch {
    return new URL(IMPORTVERIFIER_PRODUCTION_URL);
  }
}

const defaultTitle = `${BRAND_NAME} · EU product compliance intelligence`;
const defaultDescription = 'Analyse EU product requirements, evidence and regulatory actions with ImportVerifier.';

export const metadata: Metadata = {
  metadataBase: metadataBase(),
  title: { default: defaultTitle, template: `%s · ${BRAND_NAME}` },
  description: defaultDescription,
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
    title: defaultTitle,
    description: defaultDescription,
    type: 'website',
    siteName: BRAND_NAME,
  },
  twitter: { card: 'summary_large_image', title: defaultTitle, description: defaultDescription },
  robots: process.env.CONTEXT === 'deploy-preview' || process.env.CONTEXT === 'branch-deploy'
    ? { index: false, follow: false }
    : { index: true, follow: true },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f6f7fb', colorScheme: 'light' };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en" suppressHydrationWarning><body><LanguageProvider initialLanguage="en"><PwaRegister />{children}</LanguageProvider></body></html>;
}
