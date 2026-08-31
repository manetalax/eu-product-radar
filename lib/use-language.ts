'use client';

import { useCallback, useEffect, useState } from 'react';
import { isLanguage, Language } from './landing-i18n';
import { LANGUAGE_COOKIE } from './request-language';

export const LANGUAGE_STORAGE_KEY = 'import-rules-verifier-language';

export function useLanguage() {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    const urlLanguage = new URLSearchParams(window.location.search).get('lang');
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const browserLanguage = navigator.language.slice(0, 2);
    const preferred = [urlLanguage, storedLanguage, browserLanguage].find(isLanguage);
    if (preferred) setLanguageState(preferred);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.cookie = `${LANGUAGE_COOKIE}=${encodeURIComponent(language)}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
  }, [language]);

  const setLanguage = useCallback((next: Language) => {
    setLanguageState(next);
    const url = new URL(window.location.href);
    url.searchParams.set('lang', next);
    window.history.replaceState(window.history.state, '', url);
  }, []);

  return { language, setLanguage };
}
