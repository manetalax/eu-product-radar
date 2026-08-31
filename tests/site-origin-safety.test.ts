import test from 'node:test';
import assert from 'node:assert/strict';
import { configuredSiteOrigin } from '../lib/http';
import { readFileSync } from 'node:fs';

const checkout = readFileSync(new URL('../app/api/billing/checkout/route.ts', import.meta.url), 'utf8');
const portal = readFileSync(new URL('../app/api/billing/portal/route.ts', import.meta.url), 'utf8');

test('configured site origin accepts HTTPS and HTTP localhost but rejects unsafe protocols or credentials', () => {
  assert.equal(configuredSiteOrigin('https://importverifier.netlify.app/anything'), 'https://importverifier.netlify.app');
  assert.equal(configuredSiteOrigin('http://localhost:3000/path'), 'http://localhost:3000');
  assert.equal(configuredSiteOrigin('https://localhost:3000/path'), 'https://localhost:3000');
  assert.equal(configuredSiteOrigin('http://example.com'), null);
  assert.equal(configuredSiteOrigin('ftp://localhost:3000/path'), null);
  assert.equal(configuredSiteOrigin('file://localhost/tmp'), null);
  assert.equal(configuredSiteOrigin('https://user:secret@example.com'), null);
  assert.equal(configuredSiteOrigin('not-a-url'), null);
  assert.equal(configuredSiteOrigin(undefined), null);
});

test('Stripe checkout and portal both build redirects from configuredSiteOrigin', () => {
  assert.match(checkout, /const siteOrigin = configuredSiteOrigin\(\)/);
  assert.match(checkout, /success_url: `\$\{siteOrigin\}\/dashboard\?checkout=success&session_id=\{CHECKOUT_SESSION_ID\}`/);
  assert.match(checkout, /cancel_url: `\$\{siteOrigin\}\/dashboard\?checkout=cancelled`/);
  assert.match(portal, /const siteOrigin = configuredSiteOrigin\(\)/);
  assert.match(portal, /return_url: `\$\{siteOrigin\}\/dashboard`/);
});
