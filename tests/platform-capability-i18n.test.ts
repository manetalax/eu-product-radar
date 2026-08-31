import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { PLATFORM_CAPABILITY_IDS, platformCapabilityLabel } from '../lib/platform-capability-i18n';

const languages = ['es','en','fr','de','it','pt'] as const;
const suiteSource = readFileSync(new URL('../components/IntelligenceSuite.tsx', import.meta.url), 'utf8');

test('connector capability ids have customer labels in all supported languages', () => {
  for (const language of languages) {
    for (const capability of PLATFORM_CAPABILITY_IDS) {
      const label = platformCapabilityLabel(language, capability);
      assert.ok(label.trim().length > 0, `${language}.${capability} is empty`);
      assert.notEqual(label, capability, `${language}.${capability} leaks its internal id`);
      assert.equal(label.includes('-'), false, `${language}.${capability} still looks like an internal slug`);
    }
  }
});

test('non-English connector labels are not derived from raw English ids', () => {
  for (const language of ['es','fr','de','it','pt'] as const) {
    assert.notEqual(platformCapabilityLabel(language, 'catalog-import'), 'catalog import');
    assert.notEqual(platformCapabilityLabel(language, 'listing-import'), 'listing import');
    assert.notEqual(platformCapabilityLabel(language, 'compliance-alerts'), 'compliance alerts');
  }
});

test('Intelligence Suite renders capability labels through the locale helper', () => {
  assert.match(suiteSource, /platformCapabilityLabel\(language, item\)/);
  assert.doesNotMatch(suiteSource, /item\.replaceAll\('-', ' '\)/);
});
