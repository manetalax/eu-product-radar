import { isLanguage, type Language } from './landing-i18n';

export const LANGUAGE_COOKIE = 'iv_lang';

export function requestLanguage(request: Request): Language {
  const explicit = request.headers.get('x-importverifier-language');
  if (isLanguage(explicit)) return explicit;

  const cookie = request.headers.get('cookie') ?? '';
  const match = cookie.match(new RegExp(`(?:^|;\\s*)${LANGUAGE_COOKIE}=([^;]+)`));
  const cookieLanguage = match ? decodeURIComponent(match[1]) : null;
  if (isLanguage(cookieLanguage)) return cookieLanguage;

  for (const item of (request.headers.get('accept-language') ?? '').split(',')) {
    const candidate = item.trim().split(';')[0]?.slice(0, 2).toLowerCase();
    if (isLanguage(candidate)) return candidate;
  }
  return 'es';
}
