import test from 'node:test';
import assert from 'node:assert/strict';
import { readBodyBytes, readJsonBody, RequestBodyTooLargeError } from '../lib/http';
import { readFileSync } from 'node:fs';

const productExtractionRoute = readFileSync(new URL('../app/api/product-extraction/route.ts', import.meta.url), 'utf8');

test('declared oversized request bodies throw a typed body-too-large error', async () => {
  const request = new Request('https://importverifier.netlify.app/api/test', {
    method: 'POST',
    headers: { 'content-length': '100' },
    body: 'x',
  });
  await assert.rejects(() => readBodyBytes(request, 10), RequestBodyTooLargeError);
});

test('streamed oversized JSON preserves the typed body-too-large error', async () => {
  const request = new Request('https://importverifier.netlify.app/api/test', {
    method: 'POST',
    body: JSON.stringify({ payload: '1234567890' }),
  });
  await assert.rejects(() => readJsonBody(request, 8), RequestBodyTooLargeError);
});

test('product extraction maps only the typed body-too-large error to HTTP 413', () => {
  assert.match(productExtractionRoute, /error instanceof RequestBodyTooLargeError/);
  assert.match(productExtractionRoute, /oversized \? 413 : 400/);
  assert.doesNotMatch(productExtractionRoute, /error\.message\.includes\('límite'\)/);
});
