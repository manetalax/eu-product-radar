import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(new URL('../.github/workflows/release-check.yml', import.meta.url), 'utf8');
const nextConfig = readFileSync(new URL('../next.config.ts', import.meta.url), 'utf8');

test('release workflow cancels stale runs and uses a neutral non-Netlify CI origin', () => {
  assert.match(workflow, /concurrency:/);
  assert.match(workflow, /cancel-in-progress: true/);
  assert.match(workflow, /github\.workflow/);
  assert.match(workflow, /github\.ref/);
  assert.match(workflow, /NEXT_PUBLIC_SITE_URL: https:\/\/ci\.importverifier\.example/);
  assert.doesNotMatch(workflow, /netlify/i);
  assert.doesNotMatch(workflow, /release-prep-final3/);
});

test('release workflow pins Node 22-compatible GitHub Actions to immutable release commits', () => {
  assert.match(workflow, /actions\/checkout@3d3c42e5aac5ba805825da76410c181273ba90b1 # v7\.0\.1/);
  assert.match(workflow, /actions\/setup-node@820762786026740c76f36085b0efc47a31fe5020 # v7\.0\.0/);
  assert.doesNotMatch(workflow, /actions\/(?:checkout|setup-node)@v4/);
});

test('release workflow still runs install, tests, typecheck and build', () => {
  for (const command of ['npm ci','npm test','npm run typecheck','npm run build']) assert.ok(workflow.includes(command), command);
});

test('production release validation is platform-neutral and explicitly enabled for Sites', () => {
  assert.match(nextConfig, /process\.env\.IMPORTVERIFIER_VALIDATE_RELEASE === 'true'/);
  assert.match(nextConfig, /checkReleaseConfig\(\{ \.\.\.process\.env, NODE_ENV: 'production' \}\)/);
  assert.match(nextConfig, /if \(!release\.ok\)/);
  assert.match(nextConfig, /throw new Error\(`ImportVerifier production configuration is incomplete/);
  assert.doesNotMatch(nextConfig, /NETLIFY/);
  assert.doesNotMatch(nextConfig, /CONTEXT/);
});
