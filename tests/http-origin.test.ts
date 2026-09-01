import assert from 'node:assert/strict';
import test from 'node:test';
import { configuredSiteOrigin, sameOrigin } from '../lib/http';

test('configuredSiteOrigin accepts only a root HTTPS origin in production-style URLs', () => {
  assert.equal(configuredSiteOrigin('https://importverifier.netlify.app'), 'https://importverifier.netlify.app');
  assert.equal(configuredSiteOrigin('https://importverifier.netlify.app/'), 'https://importverifier.netlify.app');
  assert.equal(configuredSiteOrigin('http://localhost:3000'), 'http://localhost:3000');
});

test('configuredSiteOrigin fails closed for ambiguous or unsafe site URL configuration', () => {
  assert.equal(configuredSiteOrigin('http://importverifier.netlify.app'), null);
  assert.equal(configuredSiteOrigin('https://user:pass@importverifier.netlify.app'), null);
  assert.equal(configuredSiteOrigin('https://importverifier.netlify.app/dashboard'), null);
  assert.equal(configuredSiteOrigin('https://importverifier.netlify.app/?preview=1'), null);
  assert.equal(configuredSiteOrigin('https://importverifier.netlify.app/#dashboard'), null);
  assert.equal(configuredSiteOrigin('not-a-url'), null);
});

test('sameOrigin requires an exact canonical Origin header', () => {
  const previous = process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL = 'https://importverifier.netlify.app';
  try {
    assert.equal(sameOrigin(new Request('https://importverifier.netlify.app/api/test', {
      headers: { origin: 'https://importverifier.netlify.app' },
    })), true);
    assert.equal(sameOrigin(new Request('https://importverifier.netlify.app/api/test', {
      headers: { origin: 'https://evil.example' },
    })), false);
    assert.equal(sameOrigin(new Request('https://importverifier.netlify.app/api/test')), false);
  } finally {
    if (previous === undefined) delete process.env.NEXT_PUBLIC_SITE_URL;
    else process.env.NEXT_PUBLIC_SITE_URL = previous;
  }
});
