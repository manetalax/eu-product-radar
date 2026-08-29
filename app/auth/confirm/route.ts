import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type');
  const origin = process.env.NEXT_PUBLIC_SITE_URL!;
  if (hash && (type === 'email' || type === 'signup' || type === 'recovery')) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: hash, type });
    if (!error) return NextResponse.redirect(new URL(type === 'recovery' ? '/reset-password' : '/dashboard', origin));
  }
  return NextResponse.redirect(new URL('/login?message=link_error', origin));
}
