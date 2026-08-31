import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const authForm = readFileSync(new URL('../components/AuthForm.tsx', import.meta.url), 'utf8');
const callback = readFileSync(new URL('../app/auth/callback/route.ts', import.meta.url), 'utf8');
const resetPage = readFileSync(new URL('../app/reset-password/page.tsx', import.meta.url), 'utf8');

test('Google, signup and password reset preserve the selected language', () => {
  assert.match(authForm, /new URLSearchParams\(\{ lang: language \}\)/);
  assert.match(authForm, /signInWithOAuth\(callbackUrl\(\)\)/);
  assert.match(authForm, /signUp\(email\.trim\(\), password, callbackUrl\(\)/);
  assert.match(authForm, /resetPasswordForEmail\(email\.trim\(\), callbackUrl\('\/reset-password'\)\)/);
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

test('an invalid or expired reset session keeps a validated language on the login error redirect', () => {
  assert.match(resetPage, /const language = isLanguage\(lang\) \? lang : undefined/);
  assert.match(resetPage, /message=link_error\$\{language \? `&lang=\$\{language\}` : ''\}/);
});
