import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { safeAuthDestination } from '@/lib/http';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const destination = safeAuthDestination(request.nextUrl.searchParams.get('next'));
  const origin = process.env.NEXT_PUBLIC_SITE_URL!;
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) return NextResponse.redirect(new URL(destination, origin));
  }
  return NextResponse.redirect(new URL('/login?message=link_error', origin));
}
