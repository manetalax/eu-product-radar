import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../.github/workflows/release-check.yml', import.meta.url), 'utf8');

test('release workflow cancels stale runs and keeps the canonical ImportVerifier origin', () => {
  assert.match(workflow, /concurrency:/);
  assert.match(workflow, /cancel-in-progress: true/);
  assert.match(workflow, /github\.workflow/);
  assert.match(workflow, /github\.ref/);
  assert.match(workflow, /NEXT_PUBLIC_SITE_URL: https:\/\/importverifier\.netlify\.app/);
});

test('release workflow still runs install, tests, typecheck and build', () => {
  for (const command of ['npm ci','npm test','npm run typecheck','npm run build']) assert.ok(workflow.includes(command), command);
});
