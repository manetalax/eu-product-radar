import './globals.css';
import './dashboard-polish.css';
import './premium-global.css';
import './account-security.css';
import type { Metadata, Viewport } from 'next';
import { BRAND_NAME } from '@/lib/brand';
import PwaRegister from '@/components/PwaRegister';
import { landingCopy, type Language } from '@/lib/landing-i18n';
import { IMPORTVERIFIER_PRODUCTION_URL } from '@/lib/release-config';
import { serverLanguage } from '@/lib/server-language';
import { LanguageProvider } from '@/lib/use-language';

const OPEN_GRAPH_LOCALE: Record<Language, string> = {
  es: 'es_ES', en: 'en_GB', fr: 'fr_FR', de: 'de_DE', it: 'it_IT', pt: 'pt_PT',
};

function metadataBase(): URL {
  const configured = process.env.NEXT_PUBLIC_SITE_URL;
  try {
    const parsed = configured ? new URL(configured) : new URL(IMPORTVERIFIER_PRODUCTION_URL);
    return parsed.protocol === 'https:' ? parsed : new URL(IMPORTVERIFIER_PRODUCTION_URL);
  } catch {
    return new URL(IMPORTVERIFIER_PRODUCTION_URL);
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const language = await serverLanguage();
  const hero = landingCopy[language].hero;
  const title = `${BRAND_NAME} · ${hero.title}`;
  const description = hero.lead;
  return {
    metadataBase: metadataBase(),
    title: { default: title, template: `%s · ${BRAND_NAME}` },
    description,
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
      title,
      description,
      type: 'website',
      locale: OPEN_GRAPH_LOCALE[language],
      siteName: BRAND_NAME,
    },
    twitter: { card: 'summary_large_image', title, description },
    robots: process.env.CONTEXT === 'deploy-preview' || process.env.CONTEXT === 'branch-deploy' ? { index: false, follow: false } : { index: true, follow: true },
  };
}

export const viewport: Viewport = { width: 'device-width', initialScale: 1, viewportFit: 'cover', themeColor: '#f6f7fb', colorScheme: 'light' };

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const language = await serverLanguage();
  return <html lang={language}><body><LanguageProvider initialLanguage={language}><PwaRegister />{children}</LanguageProvider></body></html>;
}
