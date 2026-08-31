import { cookies, headers } from 'next/headers';
import { isLanguage, type Language } from './landing-i18n';
import { LANGUAGE_COOKIE } from './request-language';

function languageFromAcceptLanguage(value: string | null): Language | null {
  if (!value) return null;
  for (const part of value.split(',')) {
    const code = part.trim().split(';')[0]?.slice(0, 2).toLowerCase();
    if (isLanguage(code)) return code;
  }
  return null;
}

export async function serverLanguage(): Promise<Language> {
  const cookieStore = await cookies();
  const cookieLanguage = cookieStore.get(LANGUAGE_COOKIE)?.value;
  if (isLanguage(cookieLanguage)) return cookieLanguage;
  const headerStore = await headers();
  return languageFromAcceptLanguage(headerStore.get('accept-language')) ?? 'es';
}

export { languageFromAcceptLanguage };
