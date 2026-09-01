import type { NextConfig } from 'next';
import { checkReleaseConfig } from './lib/release-config';

if (process.env.NETLIFY === 'true' && process.env.CONTEXT === 'production') {
  const release = checkReleaseConfig({ ...process.env, NODE_ENV: 'production' });
  for (const warning of release.warnings) console.warn(`ImportVerifier production warning: ${warning}`);
  if (!release.ok) {
    throw new Error(`ImportVerifier production configuration is incomplete:\n${release.errors.map(error => `- ${error}`).join('\n')}`);
  }
}

const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=(), payment=(self)' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
  { key: 'Cross-Origin-Opener-Policy', value: 'same-origin-allow-popups' },
  { key: 'X-Permitted-Cross-Domain-Policies', value: 'none' },
  { key: 'Content-Security-Policy', value: "object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'" },
] as const;

const privateNoStore = { key: 'Cache-Control', value: 'private, no-store' } as const;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: '/auth/:path*',
        headers: [
          ...securityHeaders,
          privateNoStore,
          { key: 'Referrer-Policy', value: 'no-referrer' },
        ],
      },
      { source: '/api/:path*', headers: [...securityHeaders, privateNoStore] },
      { source: '/dashboard/:path*', headers: [...securityHeaders, privateNoStore] },
      { source: '/reset-password', headers: [...securityHeaders, privateNoStore, { key: 'Referrer-Policy', value: 'no-referrer' }] },
      { source: '/:path*', headers: [...securityHeaders] },
    ];
  },
};

export default nextConfig;
