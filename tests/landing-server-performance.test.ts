import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const picker = readFileSync(new URL('../components/LandingLanguagePicker.tsx', import.meta.url), 'utf8');

test('landing stays server-rendered with only a small language client island', () => {
  assert.doesNotMatch(page, /^['\"]use client['\"];?/m);
  assert.doesNotMatch(page, /useLanguage/);
  assert.match(page, /export default async function Home/);
  assert.match(page, /LandingLanguagePicker/);
  assert.match(picker, /^'use client';/);
});

test('server landing preserves language links without client scroll handlers', () => {
  assert.match(page, /href="#como-funciona"/);
  assert.match(page, /href="#mercados"/);
  assert.match(page, /href="#planes"/);
  assert.doesNotMatch(page, /scrollIntoView/);
});

test('tiny picker persists language before navigation so server html language follows', () => {
  assert.match(picker, /COOKIE_NAME = 'iv_lang'/);
  assert.match(picker, /STORAGE_KEY = 'import-rules-verifier-language'/);
  assert.match(picker, /document\.cookie/);
  assert.match(picker, /window\.location\.assign/);
});
