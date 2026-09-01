import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

function source(path: string) {
  return readFileSync(new URL(`../${path}`, import.meta.url), 'utf8');
}

test('customer recovery boundaries exist for route, root and not-found failures', () => {
  assert.match(source('app/error.tsx'), /RecoveryPage mode="error"/);
  assert.match(source('app/global-error.tsx'), /RecoveryPage mode="global"/);
  assert.match(source('app/global-error.tsx'), /<html lang="en">/);
  assert.match(source('app/not-found.tsx'), /RecoveryPage mode="not-found"/);
});

test('recovery surface is localized, self-contained and does not expose raw exceptions', () => {
  const recovery = source('components/RecoveryPage.tsx');
  for (const language of ['es', 'en', 'fr', 'de', 'it', 'pt']) {
    assert.match(recovery, new RegExp(`\\b${language}: \\{`));
  }
  assert.match(recovery, /minHeight: '100vh'/);
  assert.match(recovery, /document\.documentElement\.lang = detected/);
  assert.match(recovery, /window\.location\.reload\(\)/);
  assert.doesNotMatch(recovery, /error\.(message|stack|cause)/);
  assert.doesNotMatch(recovery, /digest\}/);
});

test('app loading state gives accessible feedback without language-specific copy', () => {
  const loading = source('app/loading.tsx');
  assert.match(loading, /role="status"/);
  assert.match(loading, /aria-label="ImportVerifier"/);
  assert.match(loading, /aria-hidden="true"/);
  assert.doesNotMatch(loading, />\s*(Loading|Cargando|Chargement|Laden|Caricamento|Carregando)\s*</);
});
