import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { configuredSiteOrigin } from '@/lib/http';
import { IMPORTVERIFIER_PRODUCTION_URL } from '@/lib/release-config';

function confirmationOrigin(): string {
  if (process.env.NODE_ENV === 'production') return IMPORTVERIFIER_PRODUCTION_URL;
  return configuredSiteOrigin() ?? IMPORTVERIFIER_PRODUCTION_URL;
}

export async function GET(request: NextRequest) {
  const hash = request.nextUrl.searchParams.get('token_hash');
  const type = request.nextUrl.searchParams.get('type');
  const origin = confirmationOrigin();
  if (hash && (type === 'email' || type === 'signup' || type === 'recovery')) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ token_hash: hash, type });
    if (!error) {
      const destination = type === 'recovery' ? '/reset-password' : '/dashboard?welcome=registered';
      return NextResponse.redirect(new URL(destination, origin));
    }
  }
  return NextResponse.redirect(new URL('/login?message=link_error', origin));
}
