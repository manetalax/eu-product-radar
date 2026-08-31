import test from 'node:test';
import assert from 'node:assert/strict';
import { evidenceForProduct, evidenceFromUnknown, evidenceListFromUnknown, isValidEvidenceUrl, type PersistedEvidence } from '../lib/evidence';
import { regulatoryReadiness } from '../lib/regulatory-twin';

test('separa evidencia por producto sin mezclar cuentas del análisis', () => {
  const rows: PersistedEvidence[] = [
    { product_index: 0, evidence_key: 'DoC', status: 'available', note: 'Proveedor', source_document: 'doc.pdf', source_page: '2', source_url: 'https://example.com/doc' },
    { product_index: 1, evidence_key: 'Etiquetado', status: 'pending', note: '', source_document: '', source_page: '', source_url: '' },
  ];
  const first = evidenceForProduct(rows, 0);
  assert.equal(first.length, 1);
  assert.equal(first[0].source_document, 'doc.pdf');
  assert.equal(first[0].source_page, '2');
});

test('readiness pondera evidencia verificada por encima de evidencia solo aportada', () => {
  const readiness = regulatoryReadiness([
    { requirementId: 'a', title: 'A', status: 'verified_source' },
    { requirementId: 'b', title: 'B', status: 'supplied' },
    { requirementId: 'c', title: 'C', status: 'needs_review' },
    { requirementId: 'd', title: 'D', status: 'missing' },
  ]);
  assert.equal(readiness, 44);
});

test('evidence URLs require well-formed HTTPS without embedded credentials', () => {
  assert.equal(isValidEvidenceUrl('https://ec.europa.eu/safety-gate/alerts'), true);
  assert.equal(isValidEvidenceUrl('https://example.com/path?document=1#page=2'), true);
  assert.equal(isValidEvidenceUrl('http://example.com/evidence'), false);
  assert.equal(isValidEvidenceUrl('https://'), false);
  assert.equal(isValidEvidenceUrl('https://user:secret@example.com/evidence'), false);
  assert.equal(isValidEvidenceUrl('javascript:alert(1)'), false);
  assert.equal(isValidEvidenceUrl('https://example.com/space here'), false);
});

test('evidence payload parser rejects malformed 2xx rows and sanitizes unsafe links', () => {
  const row = {
    id: '11111111-1111-4111-8111-111111111111',
    analysis_id: '22222222-2222-4222-8222-222222222222',
    product_index: 0,
    evidence_key: 'Declaration of conformity',
    status: 'available',
    note: 'Supplier document',
    source_document: 'doc.pdf',
    source_page: '2',
    source_url: 'https://example.com/doc',
    updated_at: '2026-08-31T12:00:00.000Z',
  };
  assert.deepEqual(evidenceFromUnknown(row), row);
  assert.deepEqual(evidenceListFromUnknown([row]), [row]);
  assert.equal(evidenceFromUnknown({ ...row, product_index: -1 }), null);
  assert.equal(evidenceFromUnknown({ ...row, status: 'verified-by-attacker' }), null);
  assert.equal(evidenceFromUnknown({ ...row, source_document: 'x'.repeat(241) }), null);
  assert.equal(evidenceListFromUnknown([{ ...row, evidence_key: '' }]), null);
  assert.equal(evidenceFromUnknown({ ...row, source_url: 'javascript:alert(1)' })?.source_url, '');
});
