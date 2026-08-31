import test from 'node:test';
import assert from 'node:assert/strict';
import { buildReport } from '../lib/export-report';
import { RULE_VERSION, type Analysis } from '../lib/analysis';

const analysis: Analysis = {
  id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',
  filename: 'catalogue.csv',
  created_at: '2026-08-31T00:00:00Z',
  rule_version: RULE_VERSION,
  market_code: 'EU',
  products: [
    { name: 'LED lamp', manufacturer: '', responsible: '', warning: '' },
    { name: 'Backpack', manufacturer: 'North Brand', responsible: 'EU Importer', warning: 'Keep away from fire' },
  ],
};

test('el Excel en inglés traduce superficies visibles sin romper fórmulas internas', async () => {
  const wb = await buildReport(analysis, 'en');
  const summary = wb.getWorksheet('Resumen')!;
  const products = wb.getWorksheet('Productos')!;
  const evidence = wb.getWorksheet('Evidencia')!;
  const guide = wb.getWorksheet('Guía documental')!;
  const regulatory = wb.getWorksheet('Evaluación regulatoria')!;

  assert.match(String(summary.getCell('A2').value), /CATALOGUE REPORT/i);
  assert.equal(summary.getCell('A4').value, 'File');
  assert.equal(products.getCell('A4').value, 'PRODUCT');
  assert.equal(products.getCell('C4').value, 'Priority');
  assert.equal(products.getCell('C5').value, 'High');
  assert.equal((summary.getCell('B9').value as { formula?: string }).formula, `COUNTIF('Productos'!C5:C6,"High")`);
  assert.match(String(evidence.getCell('A1').value), /SAVED EVIDENCE/i);
  assert.match(String(guide.getCell('A1').value), /DOCUMENTARY GUIDE/i);
  assert.match(String(guide.getCell('B5').value), /manufacturer/i);
  assert.match(String(regulatory.getCell('A1').value), /EU REGULATORY ASSESSMENT/i);
  assert.match(String(regulatory.getCell('E4').value), /Reason\/applicability/i);
});

test('el Excel por defecto conserva español para servidor y compatibilidad histórica', async () => {
  const wb = await buildReport(analysis);
  assert.equal(wb.getWorksheet('Resumen')!.getCell('A4').value, 'Archivo');
  assert.equal(wb.getWorksheet('Productos')!.getCell('C5').value, 'Alta');
});
