import test from 'node:test';
import assert from 'node:assert/strict';
import { evidenceForProduct, type PersistedEvidence } from '../lib/evidence';
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
