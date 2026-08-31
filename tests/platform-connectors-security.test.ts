import test from 'node:test';
import assert from 'node:assert/strict';
import { detectPlatform } from '../lib/platform-connectors';

test('detectPlatform accepts supported HTTPS marketplace hosts and subdomains', () => {
  assert.equal(detectPlatform('https://example.myshopify.com/products/widget'), 'shopify');
  assert.equal(detectPlatform('https://www.amazon.es/dp/B000000000'), 'amazon');
  assert.equal(detectPlatform('https://www.etsy.com/listing/123/example'), 'etsy');
});

test('detectPlatform rejects credentialed, malformed, whitespace-bearing and lookalike URLs', () => {
  assert.equal(detectPlatform('https://user:secret@amazon.es/dp/B000000000'), null);
  assert.equal(detectPlatform('https://www.amazon.es /dp/B000000000'), null);
  assert.equal(detectPlatform('http://www.amazon.es/dp/B000000000'), null);
  assert.equal(detectPlatform('https://amazon.es.evil.example/dp/B000000000'), null);
  assert.equal(detectPlatform('https://evilamazon.es/dp/B000000000'), null);
  assert.equal(detectPlatform('not-a-url'), null);
  assert.equal(detectPlatform(''), null);
});
