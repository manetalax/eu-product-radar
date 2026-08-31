import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const gate = readFileSync(new URL('../components/AnalysisReviewGate.tsx', import.meta.url), 'utf8');
const review = readFileSync(new URL('../components/ProductReview.tsx', import.meta.url), 'utf8');

test('cancelling pre-analysis review aborts locally instead of returning a fake HTTP error', () => {
  assert.match(gate, /new DOMException\('', 'AbortError'\)/);
  assert.match(gate, /request\.reject\(cancelledReview\(\)\)/);
  assert.doesNotMatch(gate, /status:\s*409/);
});

test('only confirmation sends the intercepted analysis through native fetch', () => {
  const confirm = gate.slice(gate.indexOf('const confirm = async'));
  assert.match(confirm, /originalFetch\.current\(request\.input/);
  const cancel = gate.slice(gate.indexOf('const cancel ='), gate.indexOf('const confirm = async'));
  assert.doesNotMatch(cancel, /originalFetch\.current/);
});

test('review gate validates parsed products and bounded filenames before rendering user-controlled data', () => {
  assert.match(gate, /productsFromUnknown\(body\.products\)/);
  assert.match(gate, /body\.filename\.length > 120/);
  assert.doesNotMatch(gate, /body\.products as Product\[\]/);
});

test('review UI states explicitly that quota is consumed only after confirmation', () => {
  assert.match(review, /La cuota todavía no se ha consumido/);
  assert.match(review, /Your quota has not been consumed yet/);
  assert.match(review, /disabled=\{busy \|\| !valid\}/);
});
