import type { Metadata } from 'next';
import { BRAND_NAME } from '@/lib/brand';
import { isLanguage, landingCopy, type Language } from '@/lib/landing-i18n';

const OPEN_GRAPH_LOCALE: Record<Language, string> = {
  es: 'es_ES', en: 'en_GB', fr: 'fr_FR', de: 'de_DE', it: 'it_IT', pt: 'pt_PT',
};

const LANGUAGE_ALTERNATES: Record<Language, string> = {
  es: '/es', en: '/en', fr: '/fr', de: '/de', it: '/it', pt: '/pt',
};

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang: rawLanguage } = await params;
  if (!isLanguage(rawLanguage)) return {};

  const hero = landingCopy[rawLanguage].hero;
  const title = `${BRAND_NAME} · ${hero.title}`;
  const description = hero.lead;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `/${rawLanguage}`,
      languages: LANGUAGE_ALTERNATES,
    },
    openGraph: {
      title,
      description,
      type: 'website',
      locale: OPEN_GRAPH_LOCALE[rawLanguage],
      siteName: BRAND_NAME,
    },
    twitter: { card: 'summary_large_image', title, description },
  };
}

export default function LocalizedLandingLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
