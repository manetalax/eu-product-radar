import './globals.css';
import './premium-global.css';
import './landing-conversion.css';
import type { Metadata, Viewport } from 'next';
import { BRAND_NAME, BRAND_SITE_URL } from '@/lib/brand';
import PwaRegister from '@/components/PwaRegister';
import { LanguageProvider } from '@/lib/use-language';

const EARLY_LANGUAGE_SCRIPT = "(()=>{const m=location.pathname.match(/^\\/(es|en|fr|de|it|pt)(?:\\/|$)/);if(m)document.documentElement.lang=m[1]})()";
const defaultTitle = `${BRAND_NAME} · EU product compliance intelligence`;
const defaultDescription = 'Analyse EU product requirements, evidence and regulatory actions with ImportVerifier.';

export const metadata: Metadata = {
  metadataBase: new URL(BRAND_SITE_URL),
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
  return <html lang="en" suppressHydrationWarning>
    <head><script dangerouslySetInnerHTML={{ __html: EARLY_LANGUAGE_SCRIPT }} /></head>
    <body><LanguageProvider initialLanguage="en"><PwaRegister />{children}</LanguageProvider></body>
  </html>;
}
