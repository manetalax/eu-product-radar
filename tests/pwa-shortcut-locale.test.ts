import test from 'node:test';
import assert from 'node:assert/strict';
import { manifestFor } from '../lib/pwa-manifest';
import type { Language } from '../lib/landing-i18n';

const languages: Language[] = ['es', 'en', 'fr', 'de', 'it', 'pt'];

test('PWA shortcuts preserve the installation language', () => {
  for (const language of languages) {
    const manifest = manifestFor(language);
    assert.equal(manifest.start_url, `/${language}`);
    assert.deepEqual(
      manifest.shortcuts?.map(shortcut => shortcut.url),
      [`/dashboard?lang=${language}`, `/privacy?lang=${language}`],
    );
  }
});
