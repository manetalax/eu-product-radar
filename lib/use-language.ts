'use client';

import { createContext, type ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { isLanguage, type Language } from './landing-i18n';
import { LANGUAGE_COOKIE } from './request-language';

export const LANGUAGE_STORAGE_KEY = 'import-rules-verifier-language';

type LanguageContextValue = {
  language: Language;
  setLanguage: (next: Language) => void;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ initialLanguage, children }: { initialLanguage: Language; children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(initialLanguage);

  useEffect(() => {
    const urlLanguage = new URLSearchParams(window.location.search).get('lang');
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    const browserLanguage = navigator.language.slice(0, 2);
    const preferred = [urlLanguage, storedLanguage, initialLanguage, browserLanguage].find(isLanguage);
    if (preferred && preferred !== language) setLanguageState(preferred);
  }, [initialLanguage, language]);

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

  const value = useMemo(() => ({ language, setLanguage }), [language, setLanguage]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageContextValue {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
}
