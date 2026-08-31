import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const authForm = readFileSync(new URL('../components/AuthForm.tsx', import.meta.url), 'utf8');
const callback = readFileSync(new URL('../app/auth/callback/route.ts', import.meta.url), 'utf8');

test('Google, signup and password reset preserve the selected language', () => {
  assert.match(authForm, /new URLSearchParams\(\{ lang: language \}\)/);
  assert.match(authForm, /signInWithOAuth\(callbackUrl\(\)\)/);
  assert.match(authForm, /signUp\(email\.trim\(\), password, callbackUrl\(\)/);
  assert.match(authForm, /resetPasswordForEmail\(email\.trim\(\), callbackUrl\('\/reset-password'\)\)/);
});

test('the OAuth callback only propagates validated language values', () => {
  assert.match(callback, /isLanguage\(language\)/);
  assert.match(callback, /params\.set\('lang', language\)/);
});
