import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://importrulesverifier.netlify.app';
  const preview = process.env.CONTEXT === 'deploy-preview' || process.env.CONTEXT === 'branch-deploy';
  return preview
    ? { rules: { userAgent: '*', disallow: '/' } }
    : { rules: { userAgent: '*', allow: '/', disallow: ['/dashboard', '/api/'] }, sitemap: `${siteUrl}/sitemap.xml` };
}
