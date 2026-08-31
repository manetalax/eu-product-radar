import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://importverifier.netlify.app').replace(/\/$/, '');
  const lastModified = new Date();
  return [
    { url: siteUrl, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}/privacy`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${siteUrl}/terms`, lastModified, changeFrequency: 'monthly', priority: 0.3 },
  ];
}
