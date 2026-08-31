import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { configuredSiteOrigin, safeAuthDestination } from '@/lib/http';
import { isLanguage } from '@/lib/landing-i18n';
import { IMPORTVERIFIER_PRODUCTION_URL } from '@/lib/release-config';

function callbackOrigin(): string {
  return configuredSiteOrigin() ?? IMPORTVERIFIER_PRODUCTION_URL;
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const destination = safeAuthDestination(request.nextUrl.searchParams.get('next'));
  const requestedLanguage = request.nextUrl.searchParams.get('lang');
  const language = isLanguage(requestedLanguage) ? requestedLanguage : null;
  const origin = callbackOrigin();

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const target = new URL(destination, origin);
      if (language) target.searchParams.set('lang', language);
      return NextResponse.redirect(target);
    }
  }

  const failure = new URL('/login', origin);
  failure.searchParams.set('message', 'link_error');
  if (language) failure.searchParams.set('lang', language);
  return NextResponse.redirect(failure);
}
