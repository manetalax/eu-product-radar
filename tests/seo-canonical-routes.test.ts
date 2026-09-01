import test from 'node:test';
import assert from 'node:assert/strict';
import sitemap from '../app/sitemap';
import robots from '../app/robots';
import { BRAND_SITE_URL } from '../lib/brand';
import { LANGUAGES } from '../lib/landing-i18n';

test('sitemap publishes every static localized landing on the canonical ImportVerifier origin', () => {
  const entries = sitemap();
  for (const language of LANGUAGES) {
    const entry = entries.find(item => item.url === `${BRAND_SITE_URL}/${language}`);
    assert.ok(entry, language);
    assert.equal(entry.priority, 1);
    assert.deepEqual(entry.alternates?.languages, Object.fromEntries(LANGUAGES.map(code => [code, `${BRAND_SITE_URL}/${code}`])));
  }
  assert.equal(entries.some(item => !item.url.startsWith(BRAND_SITE_URL)), false);
});

test('production robots points only to the canonical sitemap and keeps private routes excluded', () => {
  const oldContext = process.env.CONTEXT;
  delete process.env.CONTEXT;
  try {
    const value = robots();
    assert.equal(value.sitemap, `${BRAND_SITE_URL}/sitemap.xml`);
    assert.deepEqual(value.rules, {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard', '/api/', '/auth/', '/login', '/reset-password'],
    });
  } finally {
    if (oldContext === undefined) delete process.env.CONTEXT;
    else process.env.CONTEXT = oldContext;
  }
});

test('preview robots remains non-indexable', () => {
  const oldContext = process.env.CONTEXT;
  process.env.CONTEXT = 'deploy-preview';
  try {
    assert.deepEqual(robots(), { rules: { userAgent: '*', disallow: '/' } });
  } finally {
    if (oldContext === undefined) delete process.env.CONTEXT;
    else process.env.CONTEXT = oldContext;
  }
});
