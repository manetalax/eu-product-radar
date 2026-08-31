import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeRegulatoryEvent, normalizeRegulatoryEvents } from '../lib/regulatory-change-ingestion';

const sample = {
  sourceName: 'Safety Gate',
  sourceUrl: 'https://ec.europa.eu/safety-gate-alerts/screen/webReport',
  title: 'Nueva alerta de seguridad para juguetes',
  summary: '  Riesgo químico detectado.  ',
  publishedAt: '2026-08-31T08:00:00+02:00',
  severity: 'action' as const,
  affectedKeywords: ['Juguete', 'niños', 'JUGUETE'],
  officialReference: 'SR/001/26',
};

test('normaliza eventos UE y genera un fingerprint estable', () => {
  const now = new Date('2026-08-31T10:00:00Z');
  const first = normalizeRegulatoryEvent(sample, now);
  const second = normalizeRegulatoryEvent({ ...sample }, now);
  assert.equal(first.fingerprint, second.fingerprint);
  assert.equal(first.summary, 'Riesgo químico detectado.');
  assert.deepEqual(first.affected_keywords, ['juguete', 'niños']);
  assert.equal(first.severity, 'action');
  assert.equal(first.published_at, '2026-08-31T06:00:00.000Z');
  assert.equal(first.last_seen_at, '2026-08-31T10:00:00.000Z');
});

test('rechaza fuentes no oficiales, HTTP y campos obligatorios vacíos', () => {
  assert.throws(() => normalizeRegulatoryEvent({ ...sample, sourceUrl: 'https://example.com/alerta' }), /dominio oficial UE/);
  assert.throws(() => normalizeRegulatoryEvent({ ...sample, sourceUrl: 'http://ec.europa.eu/alerta' }), /dominio oficial UE/);
  assert.throws(() => normalizeRegulatoryEvent({ ...sample, title: '   ' }), /obligatorios/);
});

test('deduplica eventos idénticos antes de persistirlos', () => {
  const events = normalizeRegulatoryEvents([sample, { ...sample }, { ...sample, title: 'Otro cambio' }]);
  assert.equal(events.length, 2);
});
