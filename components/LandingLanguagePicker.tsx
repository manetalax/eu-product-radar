'use client';

const OPTIONS = [
  ['es','ES'], ['en','EN'], ['fr','FR'], ['de','DE'], ['it','IT'], ['pt','PT'],
] as const;

export default function LandingLanguagePicker({ language, label }: { language: string; label: string }) {
  return <label className="language-picker">
    <span className="sr-only">{label}</span>
    <select value={language} aria-label={label} onChange={event => {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', event.target.value);
      window.location.assign(url.toString());
    }}>
      {OPTIONS.map(([code, shortLabel]) => <option key={code} value={code}>{shortLabel}</option>)}
    </select>
  </label>;
}
