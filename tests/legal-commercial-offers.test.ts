import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { commercialTerms, canonicalLegalBrand } from '../lib/legal-commercial-i18n';

const termsPage = readFileSync(new URL('../app/terms/page.tsx', import.meta.url), 'utf8');
const privacyPage = readFileSync(new URL('../app/privacy/page.tsx', import.meta.url), 'utf8');

test('legal commercial copy exposes all three Unlimited payment modalities in every locale', () => {
  for (const copy of Object.values(commercialTerms)) {
    assert.match(copy.offerBody, /9[,.]95/);
    assert.match(copy.offerBody, /89[,.]95/);
    assert.match(copy.offerBody, /149/);
    assert.match(copy.offerBody, /Lifetime/i);
    assert.match(copy.offerBody, /ImportVerifier/);
  }
});

test('Lifetime legal wording does not promise perpetual service operation', () => {
  for (const copy of Object.values(commercialTerms)) {
    assert.match(copy.offerBody, /Lifetime/i);
    assert.ok(copy.offerBody.length > 180);
  }
  assert.match(commercialTerms.es.offerBody, /no constituye una garantía/i);
  assert.match(commercialTerms.en.offerBody, /not a guarantee/i);
});

test('terms replace the retired monthly-only sections with current commercial copy', () => {
  assert.match(termsPage, /if \(index === 2\) return \{ title: commercial\.offerTitle, body: commercial\.offerBody \}/);
  assert.match(termsPage, /if \(index === 3\) return \{ title: commercial\.paymentsTitle, body: commercial\.paymentsBody \}/);
  assert.match(termsPage, /LEGAL_COPY_UPDATED/);
});

test('privacy and terms normalize the retired Import Rules Verifier name at render time', () => {
  assert.equal(canonicalLegalBrand('Import Rules Verifier'), 'ImportVerifier');
  assert.match(termsPage, /canonicalLegalBrand/);
  assert.match(privacyPage, /canonicalLegalBrand/);
});
