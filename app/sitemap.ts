import type { MetadataRoute } from 'next';
import { BRAND_SITE_URL } from '@/lib/brand';
import { LANGUAGES } from '@/lib/landing-i18n';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  const languageAlternates = Object.fromEntries(LANGUAGES.map(language => [language, `${BRAND_SITE_URL}/${language}`]));

  return [
    ...LANGUAGES.map(language => ({
      url: `${BRAND_SITE_URL}/${language}`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 1,
      alternates: { languages: languageAlternates },
    })),
    { url: BRAND_SITE_URL, lastModified, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BRAND_SITE_URL}/privacy`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${BRAND_SITE_URL}/terms`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
  ];
}
