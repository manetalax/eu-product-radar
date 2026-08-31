import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const authForm = readFileSync(new URL('../components/AuthForm.tsx', import.meta.url), 'utf8');
const loginPage = readFileSync(new URL('../app/login/page.tsx', import.meta.url), 'utf8');
const callback = readFileSync(new URL('../app/auth/callback/route.ts', import.meta.url), 'utf8');
const resetPage = readFileSync(new URL('../app/reset-password/page.tsx', import.meta.url), 'utf8');

test('login seeds the requested or detected language before AuthForm hydration', () => {
  assert.match(loginPage, /lang\?: string/);
  assert.match(loginPage, /const language = await serverLanguage\(lang\)/);
  assert.match(loginPage, /<LanguageProvider initialLanguage=\{language\}>/);
});

test('Google, signup and password reset preserve the selected language', () => {
  assert.match(authForm, /new URLSearchParams\(\{ lang: language \}\)/);
  assert.match(authForm, /signInWithOAuth\(callbackUrl\(\)\)/);
  assert.match(authForm, /signUp\(email\.trim\(\), password, callbackUrl\(\)/);
  assert.match(authForm, /resetPasswordForEmail\(email\.trim\(\), callbackUrl\('\/reset-password'\)\)/);
});

test('successful password auth and brand navigation keep locale explicitly', () => {
  assert.equal((authForm.match(/window\.location\.assign\(`\/dashboard\?lang=\$\{language\}`\)/g) ?? []).length, 2);
  assert.match(authForm, /<Brand market="EU" href=\{`\/\$\{language\}`\} \/>/);
  assert.match(authForm, /<Link className="back-link" href=\{`\/\$\{language\}`\}>/);
  assert.doesNotMatch(authForm, /window\.location\.assign\('\/dashboard'\)/);
});

test('production auth callbacks are pinned to the canonical ImportVerifier origin', () => {
  assert.match(authForm, /IMPORTVERIFIER_PRODUCTION_URL/);
  assert.match(authForm, /const localDevelopment = window\.location\.hostname === 'localhost' \|\| window\.location\.hostname === '127\.0\.0\.1'/);
  assert.match(authForm, /const origin = localDevelopment \? currentOrigin : IMPORTVERIFIER_PRODUCTION_URL/);
  assert.doesNotMatch(authForm, /NEXT_PUBLIC_SITE_URL/);
  assert.doesNotMatch(authForm, /euproductradar\.netlify\.app/);
});

test('the OAuth callback only propagates validated language values', () => {
  assert.match(callback, /const requestedLanguage = request\.nextUrl\.searchParams\.get\('lang'\)/);
  assert.match(callback, /const language = isLanguage\(requestedLanguage\) \? requestedLanguage : null/);
  assert.match(callback, /target\.searchParams\.set\('lang', language\)/);
  assert.match(callback, /failure\.searchParams\.set\('lang', language\)/);
});

test('password reset seeds its language and preserves it on an invalid or expired session', () => {
  assert.match(resetPage, /const language = await serverLanguage\(lang\)/);
  assert.match(resetPage, /redirect\(`\/login\?message=link_error&lang=\$\{language\}`\)/);
  assert.match(resetPage, /<LanguageProvider initialLanguage=\{language\}><AuthForm initialMode="reset" \/><\/LanguageProvider>/);
});
