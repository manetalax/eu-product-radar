'use client';

const OPTIONS = [
  ['es','ES'], ['en','EN'], ['fr','FR'], ['de','DE'], ['it','IT'], ['pt','PT'],
] as const;
const STORAGE_KEY = 'import-rules-verifier-language';
const COOKIE_NAME = 'iv_lang';

export default function LandingLanguagePicker({ language, label }: { language: string; label: string }) {
  return <label className="language-picker">
    <span className="sr-only">{label}</span>
    <select value={language} aria-label={label} onChange={event => {
      const next = event.target.value;
      window.localStorage.setItem(STORAGE_KEY, next);
      document.cookie = `${COOKIE_NAME}=${encodeURIComponent(next)}; Path=/; Max-Age=31536000; SameSite=Lax; Secure`;
      const url = new URL(window.location.href);
      url.searchParams.set('lang', next);
      window.location.assign(url.toString());
    }}>
      {OPTIONS.map(([code, shortLabel]) => <option key={code} value={code}>{shortLabel}</option>)}
    </select>
  </label>;
}
