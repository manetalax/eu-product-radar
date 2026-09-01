import { readFileSync } from 'node:fs';
import { strict as assert } from 'node:assert';

const source = readFileSync('components/CheckoutReturnSync.tsx', 'utf8');

assert.match(source, /aria-live="polite" aria-atomic="true"/);
assert.match(source, /busy && <p role="status" className="muted">/);
assert.match(source, /error && <p role="alert" className="message error">/);
