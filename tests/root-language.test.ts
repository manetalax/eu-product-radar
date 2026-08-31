import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { languageFromAcceptLanguage } from '../lib/server-language';

const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8');
const languageHook = readFileSync(new URL('../lib/use-language.ts', import.meta.url), 'utf8');

test('root layout resolves language on the server and initializes one shared client provider', () => {
  assert.match(layout, /const language = await serverLanguage\(\)/);
  assert.match(layout, /<html lang=\{language\}>/);
  assert.match(layout, /<LanguageProvider initialLanguage=\{language\}>/);
  assert.doesNotMatch(layout, /<html lang="es">/);
});

test('language provider preserves explicit URL and saved preferences over browser fallback', () => {
  assert.match(languageHook, /\[urlLanguage, storedLanguage, initialLanguage, browserLanguage\]\.find\(isLanguage\)/);
  assert.match(languageHook, /document\.documentElement\.lang = language/);
  assert.match(languageHook, /LANGUAGE_COOKIE/);
  assert.match(languageHook, /LanguageContext\.Provider/);
});

test('root metadata follows the server language and uses a safe HTTPS metadata base', () => {
  assert.match(layout, /export async function generateMetadata/);
  assert.match(layout, /const hero = landingCopy\[language\]\.hero/);
  assert.match(layout, /locale: OPEN_GRAPH_LOCALE\[language\]/);
  assert.match(layout, /parsed\.protocol === 'https:'/);
  assert.match(layout, /IMPORTVERIFIER_PRODUCTION_URL/);
});

test('Accept-Language resolves supported languages conservatively', () => {
  assert.equal(languageFromAcceptLanguage('de-DE,de;q=0.9,en;q=0.8'), 'de');
  assert.equal(languageFromAcceptLanguage('ja-JP,en-US;q=0.8'), 'en');
  assert.equal(languageFromAcceptLanguage('ja-JP,zh-CN;q=0.8'), null);
});
