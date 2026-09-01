import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const review = readFileSync(new URL('../components/ProductReview.tsx', import.meta.url), 'utf8');
const css = readFileSync(new URL('../components/ProductReview.module.css', import.meta.url), 'utf8');

test('product review behaves as a modal and restores page scrolling', () => {
  assert.match(review, /role="dialog"/);
  assert.match(review, /aria-modal="true"/);
  assert.match(review, /aria-describedby="review-description"/);
  assert.match(review, /document\.body\.style\.overflow = 'hidden'/);
  assert.match(review, /document\.body\.style\.overflow = previousOverflow/);
});

test('Escape cancels only while the modal is not busy and focus enters the dialog', () => {
  assert.match(review, /event\.key === 'Escape' && !busy/);
  assert.match(review, /onCancel\(\)/);
  assert.match(review, /querySelector<HTMLElement>\('input, textarea, button'\)\?\.focus\(\)/);
});

test('mobile modal protects safe areas, touch targets and iOS input zoom', () => {
  assert.match(css, /env\(safe-area-inset-top\)/);
  assert.match(css, /min-height:44px/);
  assert.match(css, /font-size:16px/);
  assert.match(css, /100dvh/);
});
