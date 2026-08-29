import { createServerClient } from '@supabase/ssr';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseConfig } from './lib/supabase/config';

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  const { url, key } = supabaseConfig();
  const supabase = createServerClient(url, key, { cookies: {
    getAll: () => request.cookies.getAll(),
    setAll(items) {
      items.forEach(({ name, value }) => request.cookies.set(name, value));
      response = NextResponse.next({ request });
      items.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
    },
  } });
  // The page/API also verifies identity; middleware only refreshes session cookies.
  await supabase.auth.getClaims();
  response.headers.set('Cache-Control', 'private, no-store, max-age=0');
  return response;
}
export const config = { matcher: ['/dashboard/:path*', '/api/analyses/:path*', '/reset-password'] };
