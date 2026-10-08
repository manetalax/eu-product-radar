import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const html = readFileSync(new URL('../github-pages/index.html', import.meta.url), 'utf8');
const app = readFileSync(new URL('../github-pages/app.ts', import.meta.url), 'utf8');
const workflow = readFileSync(new URL('../.github/workflows/github-pages.yml', import.meta.url), 'utf8');
const packageJson = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { scripts: Record<string, string> };

test('GitHub Pages edition reuses local product import and deterministic EU review', () => {
  assert.match(app, /import \{ parseProducts \} from '\.\.\/lib\/import-products'/);
  assert.match(app, /import \{ analyze, MAX_FILE_BYTES \} from '\.\.\/lib\/analysis'/);
  assert.match(app, /analyze\(products, 'EU'\)/);
  assert.match(app, /file\.size > MAX_FILE_BYTES/);
  assert.match(app, /const PAGE_SIZE = 50/);
});

test('GitHub Pages edition states local handling and does not call server APIs or claim certification', () => {
  assert.match(html, /Tus archivos no se suben/);
  assert.match(html, /ni incluye asistente de IA, sincronización, historial o pagos/);
  assert.match(html, /no una certificación de cumplimiento/);
  assert.doesNotMatch(app, /fetch\s*\(|XMLHttpRequest|navigator\.sendBeacon/);
});

test('GitHub Pages bundles a standalone browser entry for static hosting', () => {
  assert.match(packageJson.scripts['build:github-pages'], /esbuild github-pages\/app\.ts/);
  assert.match(html, /src="\.\/assets\/app\.js"/);
  assert.match(html, /href="\.\/assets\/styles\.css"/);
  assert.match(workflow, /branches: \[main\]/);
  assert.match(workflow, /actions\/upload-pages-artifact@7b1f4a764d45c48632c6b24a0339c27f5614fb0b/);
  assert.match(workflow, /actions\/deploy-pages@368f82528645a54fb793d4d04e342629a3f51346/);
  assert.match(workflow, /if: github\.event_name != 'pull_request'/);
});
