function isLocalHostname(hostname: string): boolean {
  return hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '[::1]';
}

/**
 * Client-side defense in depth for the OAuth URL returned by Supabase.
 * The browser may navigate only to the configured Supabase project's
 * `/auth/v1/authorize` endpoint. Query parameters are intentionally retained
 * because Supabase uses them to carry provider and redirect state.
 */
export function trustedSupabaseOAuthNavigationUrl(value: unknown, configuredBaseUrl: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  if (typeof configuredBaseUrl !== 'string' || !configuredBaseUrl.trim()) return null;

  try {
    const base = new URL(configuredBaseUrl);
    const target = new URL(value);
    const localDevelopment = isLocalHostname(base.hostname);

    if (base.username || base.password || target.username || target.password) return null;
    if (base.protocol !== 'https:' && !(localDevelopment && base.protocol === 'http:')) return null;
    if (target.protocol !== base.protocol) return null;
    if (target.origin !== base.origin) return null;
    if (target.pathname !== '/auth/v1/authorize') return null;

    return target.toString();
  } catch {
    return null;
  }
}
