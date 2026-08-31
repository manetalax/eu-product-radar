import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from './lib/supabase/config';

const LANDING_LANGUAGES = ['es','en','fr','de','it','pt'] as const;
type LandingLanguage = typeof LANDING_LANGUAGES[number];

function landingLanguage(request: NextRequest): LandingLanguage {
  const explicit = request.nextUrl.searchParams.get('lang')?.slice(0, 2).toLowerCase();
  if (explicit && (LANDING_LANGUAGES as readonly string[]).includes(explicit)) return explicit as LandingLanguage;
  const saved = request.cookies.get('iv_lang')?.value?.slice(0, 2).toLowerCase();
  if (saved && (LANDING_LANGUAGES as readonly string[]).includes(saved)) return saved as LandingLanguage;
  const accepted = request.headers.get('accept-language') ?? '';
  for (const item of accepted.split(',')) {
    const candidate = item.trim().split(';', 1)[0]?.slice(0, 2).toLowerCase();
    if (candidate && (LANDING_LANGUAGES as readonly string[]).includes(candidate)) return candidate as LandingLanguage;
  }
  return 'es';
}

export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === '/') {
    const localizedUrl = request.nextUrl.clone();
    localizedUrl.pathname = `/${landingLanguage(request)}`;
    return NextResponse.rewrite(localizedUrl);
  }

  let response = NextResponse.next({ request });
  const { url, key } = supabaseConfig();
  const supabase = createServerClient(url, key, { cookies: {
    getAll: () => request.cookies.getAll(),
    setAll(items, headers) {
      items.forEach(({ name, value }) => request.cookies.set(name, value));
      response = NextResponse.next({ request });
      items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      Object.entries(headers).forEach(([name, value]) => response.headers.set(name, value));
    },
  } });
  // Las páginas y la API verifican la identidad; el proxy solo refresca cookies.
  await supabase.auth.getClaims();
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  return response;
}

export const config = { matcher: [
  '/',
  '/dashboard/:path*',
  '/api/analyses/:path*',
  '/api/account/:path*',
  '/api/evidence/:path*',
  '/api/product-extraction/:path*',
  '/api/regulatory-agent/:path*',
  '/api/regulatory-changes/:path*',
  '/api/billing/checkout',
  '/api/billing/confirm',
  '/api/billing/portal',
  '/reset-password',
] };
