export const IMPORTVERIFIER_SUPABASE_URL = 'https://hfuwwjdcyudflamwwnon.supabase.co';

export function trustedSupabaseProjectUrl(value: string | undefined, production = process.env.NODE_ENV === 'production'): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.username || parsed.password || parsed.pathname !== '/' || parsed.search || parsed.hash) return null;
    if (production) return parsed.origin === IMPORTVERIFIER_SUPABASE_URL ? IMPORTVERIFIER_SUPABASE_URL : null;
    if (parsed.origin === IMPORTVERIFIER_SUPABASE_URL) return IMPORTVERIFIER_SUPABASE_URL;
    if (parsed.protocol === 'http:' && parsed.hostname === 'localhost') return parsed.origin;
    return null;
  } catch {
    return null;
  }
}

export function supabaseConfig() {
  const url = trustedSupabaseProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) throw new Error('Falta configurar la conexión con Supabase.');
  return { url, key };
}
