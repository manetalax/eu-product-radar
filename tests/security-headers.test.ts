import test from 'node:test';
import assert from 'node:assert/strict';
import nextConfig from '../next.config';

test('las cabeceras globales bloquean framing, sniffing y objetos activos', async () => {
  assert.ok(nextConfig.headers);
  const rules = await nextConfig.headers!();
  const global = rules.find(rule => rule.source === '/:path*');
  assert.ok(global);
  const headers = new Map(global.headers.map(item => [item.key.toLowerCase(), item.value]));
  assert.equal(headers.get('x-content-type-options'), 'nosniff');
  assert.equal(headers.get('x-frame-options'), 'DENY');
  assert.match(headers.get('strict-transport-security') ?? '', /max-age=31536000/);
  assert.match(headers.get('content-security-policy') ?? '', /object-src 'none'/);
  assert.match(headers.get('content-security-policy') ?? '', /frame-ancestors 'none'/);
  assert.equal(headers.get('cross-origin-opener-policy'), 'same-origin-allow-popups');
});

test('API y autenticación no se pueden cachear', async () => {
  assert.ok(nextConfig.headers);
  const rules = await nextConfig.headers!();
  for (const source of ['/api/:path*', '/auth/:path*']) {
    const rule = rules.find(item => item.source === source);
    assert.ok(rule);
    const cache = rule.headers.find(item => item.key.toLowerCase() === 'cache-control');
    assert.equal(cache?.value, 'private, no-store');
  }
});
