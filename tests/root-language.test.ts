import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { languageFromAcceptLanguage } from '../lib/server-language';

const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const localizedLayout = readFileSync(new URL('../app/[lang]/layout.tsx', import.meta.url), 'utf8');
const languageHook = readFileSync(new URL('../lib/use-language.ts', import.meta.url), 'utf8');
const picker = readFileSync(new URL('../components/LandingLanguagePicker.tsx', import.meta.url), 'utf8');

test('root layout stays static and initializes one shared client provider', () => {
  assert.doesNotMatch(layout, /serverLanguage/);
  assert.doesNotMatch(layout, /cookies\(/);
  assert.doesNotMatch(layout, /headers\(/);
  assert.match(layout, /<html lang="en" suppressHydrationWarning>/);
  assert.match(layout, /<LanguageProvider initialLanguage="en">/);
});

test('supported path or query locale sets document language synchronously before body content', () => {
  assert.match(layout, /const EARLY_LANGUAGE_SCRIPT =/);
  assert.ok(layout.includes("const ok=/^(es|en|fr|de|it|pt)$/"));
  assert.ok(layout.includes("location.pathname.split('/').filter(Boolean)[0]"));
  assert.ok(layout.includes("new URLSearchParams(location.search).get('lang')"));
  assert.ok(layout.includes("document.documentElement.lang=lang"));
  assert.match(layout, /<head><script dangerouslySetInnerHTML=\{\{ __html: EARLY_LANGUAGE_SCRIPT \}\} \/><\/head>/);
  assert.ok(layout.indexOf('<head><script') < layout.indexOf('<body>'));
});

test('language provider prioritizes static locale path before query and saved preferences', () => {
  assert.match(languageHook, /languageFromPathname\(window\.location\.pathname\)/);
  assert.match(languageHook, /\[pathLanguage, urlLanguage, storedLanguage, initialLanguage, browserLanguage\]\.find\(isSupportedLanguage\)/);
  assert.match(languageHook, /document\.documentElement\.lang = language/);
  assert.match(languageHook, /LANGUAGE_COOKIE/);
  assert.match(languageHook, /LanguageContext\.Provider/);
});

test('landing picker navigates between static locale paths instead of stale query-only content', () => {
  assert.match(picker, /url\.pathname = `\/\$\{next\}`/);
  assert.match(picker, /url\.searchParams\.delete\('lang'\)/);
  assert.match(picker, /window\.location\.assign/);
});

test('client language provider stays decoupled from the large landing copy bundle', () => {
  assert.match(languageHook, /SUPPORTED_LANGUAGES/);
  assert.doesNotMatch(languageHook, /from '.\/landing-i18n'/);
});

test('localized static landing owns localized SEO metadata on the canonical origin', () => {
  assert.match(localizedLayout, /export async function generateMetadata/);
  assert.match(localizedLayout, /landingCopy\[rawLanguage\]\.hero/);
  assert.match(localizedLayout, /locale: OPEN_GRAPH_LOCALE\[rawLanguage\]/);
  assert.match(localizedLayout, /canonical: `\/\$\{rawLanguage\}`/);
  assert.match(localizedLayout, /languages: LANGUAGE_ALTERNATES/);
  assert.match(layout, /metadataBase: new URL\(BRAND_SITE_URL\)/);
  assert.doesNotMatch(layout, /NEXT_PUBLIC_SITE_URL/);
});

test('Accept-Language resolves supported languages conservatively', () => {
  assert.equal(languageFromAcceptLanguage('de-DE,de;q=0.9,en;q=0.8'), 'de');
  assert.equal(languageFromAcceptLanguage('ja-JP,en-US;q=0.8'), 'en');
  assert.equal(languageFromAcceptLanguage('ja-JP,zh-CN;q=0.8'), null);
});
