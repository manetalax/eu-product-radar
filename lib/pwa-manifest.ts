import type { MetadataRoute } from 'next';
import { landingCopy, type Language } from './landing-i18n';

const shortcutCopy: Record<Language, { open: string; privacy: string }> = {
  es: { open: 'Abrir ImportVerifier', privacy: 'Privacidad' },
  en: { open: 'Open ImportVerifier', privacy: 'Privacy' },
  fr: { open: 'Ouvrir ImportVerifier', privacy: 'Confidentialité' },
  de: { open: 'ImportVerifier öffnen', privacy: 'Datenschutz' },
  it: { open: 'Apri ImportVerifier', privacy: 'Privacy' },
  pt: { open: 'Abrir ImportVerifier', privacy: 'Privacidade' },
};

export function manifestFor(language: Language): MetadataRoute.Manifest {
  const shortcuts = shortcutCopy[language];
  return {
    id: '/',
    name: 'Import Rules Verifier',
    short_name: 'ImportVerifier',
    description: landingCopy[language].hero.lead,
    lang: language,
    dir: 'ltr',
    start_url: `/?lang=${language}`,
    scope: '/',
    display: 'standalone',
    display_override: ['standalone', 'minimal-ui'],
    orientation: 'any',
    background_color: '#f6f7fb',
    theme_color: '#4f46e5',
    categories: ['business', 'productivity', 'utilities'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      { src: '/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
    ],
    shortcuts: [
      { name: shortcuts.open, short_name: 'ImportVerifier', url: '/dashboard' },
      { name: shortcuts.privacy, short_name: shortcuts.privacy, url: '/privacy' },
    ],
  };
}
