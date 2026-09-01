import test from 'node:test';
import assert from 'node:assert/strict';
import { rankRegulatoryImpacts, regulatoryReadiness, type RegulatoryEvidenceLink } from '../lib/regulatory-twin';

const evidence = (status: RegulatoryEvidenceLink['status']): RegulatoryEvidenceLink => ({
  requirementId: `req-${status}`,
  title: status,
  status,
});

test('el Twin calcula readiness a partir del estado real de evidencia', () => {
  assert.equal(regulatoryReadiness([]), 0);
  assert.equal(regulatoryReadiness([evidence('missing')]), 0);
  assert.equal(regulatoryReadiness([evidence('supplied')]), 50);
  assert.equal(regulatoryReadiness([evidence('needs_review')]), 25);
  assert.equal(regulatoryReadiness([evidence('verified_source')]), 100);
  assert.equal(regulatoryReadiness([
    evidence('missing'), evidence('supplied'), evidence('needs_review'), evidence('verified_source'),
  ]), 44);
});

test('el Impact Radar prioriza acción sobre revisión e información', () => {
  const ranked = rankRegulatoryImpacts([
    { productId: '1', productName: 'A', severity: 'info', reason: 'Contexto', affectedRule: 'R1' },
    { productId: '2', productName: 'B', severity: 'action', reason: 'Acción', affectedRule: 'R2' },
    { productId: '3', productName: 'C', severity: 'review', reason: 'Revisión', affectedRule: 'R3' },
  ]);
  assert.deepEqual(ranked.map(item => item.severity), ['action', 'review', 'info']);
});
