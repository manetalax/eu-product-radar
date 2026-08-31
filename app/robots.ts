import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'https://importverifier.netlify.app').replace(/\/$/, '');
  const preview = process.env.CONTEXT === 'deploy-preview' || process.env.CONTEXT === 'branch-deploy';
  return preview
    ? { rules: { userAgent: '*', disallow: '/' } }
    : {
        rules: {
          userAgent: '*',
          allow: '/',
          disallow: ['/dashboard', '/api/', '/auth/', '/login', '/reset-password'],
        },
        sitemap: `${siteUrl}/sitemap.xml`,
      };
}
