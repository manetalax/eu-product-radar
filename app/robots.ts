import type { MetadataRoute } from 'next';
import { BRAND_SITE_URL } from '@/lib/brand';

export default function robots(): MetadataRoute.Robots {
  const preview = process.env.CONTEXT === 'deploy-preview' || process.env.CONTEXT === 'branch-deploy';
  return preview
    ? { rules: { userAgent: '*', disallow: '/' } }
    : {
        rules: {
          userAgent: '*',
          allow: '/',
          disallow: ['/dashboard', '/api/', '/auth/', '/login', '/reset-password'],
        },
        sitemap: `${BRAND_SITE_URL}/sitemap.xml`,
      };
}
