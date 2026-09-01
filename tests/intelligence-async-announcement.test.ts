import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const suite = readFileSync(new URL('../components/IntelligenceSuite.tsx', import.meta.url), 'utf8');

test('intelligence loading and failure states are exposed without a false empty state', () => {
  assert.match(suite, /aria-label=\{t\.aria\} aria-busy=\{loading\}/);
  assert.match(suite, /role="status" aria-live="polite" aria-atomic="true">\{loading \? t\.loading : ''\}/);
  assert.match(suite, /\{loadError && <div className=\{styles\.error\} role="alert">\{loadError\}<\/div>\}/);
  assert.match(suite, /loading \? [^:]+ : loadError \? null : !analysis/);
  assert.match(suite, /setLoadError\(t\.loadError\)/);
});

test('ImportVerifier AI keeps request context stable and announces progress, answers and errors', () => {
  assert.match(suite, /<article className=\{\x60\$\{styles\.card\} \$\{styles\.wide\}\x60\} aria-busy=\{aiBusy\}>/);
  assert.match(suite, /className=\{styles\.productSelect\} value=\{selected\} disabled=\{aiBusy\}/);
  assert.match(suite, /className=\{styles\.aiInput\} value=\{question\} disabled=\{aiBusy\}/);
  assert.match(suite, /role="status" aria-live="polite" aria-atomic="true">\{aiBusy \? t\.asking : answer\}/);
  assert.match(suite, /\{aiError && <div className=\{styles\.error\} role="alert">\{aiError\}<\/div>\}/);
  assert.match(suite, /setAiError\(t\.aiError\)/);
});
