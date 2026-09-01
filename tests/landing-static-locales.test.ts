import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const localized = readFileSync(new URL('../app/[lang]/page.tsx', import.meta.url), 'utf8');
const proxy = readFileSync(new URL('../proxy.ts', import.meta.url), 'utf8');

test('all six landing-language variants are generated as static routes', () => {
  assert.match(localized, /export const dynamic = 'force-static'/);
  assert.match(localized, /export const dynamicParams = false/);
  assert.match(localized, /LANGUAGES\.map\(lang => \(\{ lang \}\)\)/);
  assert.match(localized, /return Home\(\{ searchParams: Promise\.resolve\(\{ lang \}\) \}\)/);
});

test('public root chooses a localized static variant before Supabase session work', () => {
  const rewrite = proxy.indexOf("request.nextUrl.pathname === '/'");
  const supabase = proxy.indexOf('supabaseConfig()');
  assert.ok(rewrite >= 0 && supabase > rewrite);
  assert.match(proxy, /localizedUrl\.pathname = `\/\$\{landingLanguage\(request\)\}`/);
  assert.match(proxy, /NextResponse\.rewrite\(localizedUrl\)/);
  assert.match(proxy, /'\/',[\s\S]*'\/dashboard\/:path\*'/);
});

test('landing locale routing prefers explicit language, then saved preference, then browser language', () => {
  const explicit = proxy.indexOf("searchParams.get('lang')");
  const cookie = proxy.indexOf("cookies.get('iv_lang')");
  const accepted = proxy.indexOf("headers.get('accept-language')");
  assert.ok(explicit >= 0 && cookie > explicit && accepted > cookie);
  assert.match(proxy, /return 'es'/);
});
