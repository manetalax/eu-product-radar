import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

test('Intelligence Suite parses API JSON defensively and does not surface server error strings', async () => {
  const source = await readFile(new URL('../components/IntelligenceSuite.tsx', import.meta.url), 'utf8');
  assert.match(source, /async function jsonObject\(response: Response\)/);
  assert.match(source, /typeof parsed === 'object' && !Array\.isArray\(parsed\)/);
  assert.match(source, /if \(!historyResponse\.ok\)/);
  assert.match(source, /if \(!detailResponse\.ok\)/);
  assert.match(source, /typeof body\.answer !== 'string'/);
  assert.doesNotMatch(source, /body\.error \|\| t\.aiError/);
  assert.ok(source.includes("catch {\n      setError(t.aiError);"));
});
