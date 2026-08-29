import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as XLSX from 'xlsx';
import { analyze, validateProducts, MAX_PRODUCTS, MAX_FILE_BYTES } from '../lib/analysis';
import { parseProducts } from '../lib/import-products';
import { MAX_BODY_BYTES, readJsonBody, safeAuthDestination, sameOrigin } from '../lib/http';
import { buildReport, reportBytes } from '../lib/export-report';
import ExcelJS from 'exceljs';
import { productQuota, quotaExceededMessage } from '../lib/quota';

const fixture = readFileSync(new URL('./fixtures/catalogue.csv', import.meta.url));
const bytes = (text: string) => new TextEncoder().encode(text).buffer;
const reportFixture = () => ({ id: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', filename: 'Catálogo de prueba.csv', created_at: '2026-08-28T09:30:39Z', rule_version: 'missing-fields-v1', products: parseProducts(Uint8Array.from(fixture).buffer, 'catalogue.csv') });
test('el informe exportado conserva datos, resumen y formato después de abrir el XLSX', async () => {
  const source = reportFixture();
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await reportBytes(source) as unknown as ExcelJS.Buffer);
  assert.deepEqual(wb.worksheets.map(s => s.name), ['Resumen', 'Productos', 'Datos técnicos', 'Guía documental']);
  const summary = wb.getWorksheet('Resumen')!, products = wb.getWorksheet('Productos')!, technical = wb.getWorksheet('Datos técnicos')!;
  assert.deepEqual([8,9,10,11,13].map(row => summary.getCell(row, 2).result), [5,2,2,1,47]);
  assert.deepEqual([5,6,7,8,9].map(row => products.getCell(row, 2).value), [92,64,36,36,8]);
  source.products.forEach((p, i) => assert.deepEqual([1,2,3,4].map(col => technical.getCell(i + 13, col).value ?? ''), [p.name,p.manufacturer,p.responsible,p.warning]));
  assert.equal(products.getCell('A5').alignment.wrapText, true);
  assert.equal((products.getCell('C5').fill as ExcelJS.FillPattern).fgColor?.argb, 'FFFEE2E2');
  assert.ok(products.getColumn(1).width! >= 40);
  assert.ok(products.getRow(5).height! >= 60);
  assert.equal(products.views[0].state, 'frozen');
  assert.equal(summary.getCell('B5').type, ExcelJS.ValueType.Date);
});
test('el informe mantiene los textos con apariencia de fórmulas como datos y rechaza reglas desconocidas', async () => {
  const source = reportFixture();
  source.products[0].name = '=HYPERLINK("https://example.invalid","texto")';
  source.products[0].warning = '+SUM(1,2)';
  const wb = new ExcelJS.Workbook();
  await wb.xlsx.load(await reportBytes(source) as unknown as ExcelJS.Buffer);
  assert.equal(wb.getWorksheet('Productos')!.getCell('A5').type, ExcelJS.ValueType.String);
  assert.equal(wb.getWorksheet('Datos técnicos')!.getCell('D13').value, source.products[0].warning);
  await assert.rejects(buildReport({ ...source, rule_version: 'future-version' }), /Versión/);
});
test('el CSV entregado al usuario produce cinco resultados esperados', () => {
  const products = parseProducts(Uint8Array.from(fixture).buffer, 'catalogue.csv');
  assert.equal(products.length, 5);
  assert.deepEqual(analyze(products).map(x => x.score), [92,64,36,36,8]);
  assert.match(products[0].name, /Lámpara/);
});
test('acepta CSV separado por punto y coma, encabezados españoles y espacios', () => {
  const rows = parseProducts(bytes('nombre;fabricante;responsable UE;advertencias seguridad\r\nMochila;Marca;;Aviso\r\n'), 'test.csv');
  assert.equal(analyze(rows)[0].score, 36);
  assert.deepEqual(analyze(rows)[0].missing, ['Responsable UE']);
});
test('importa XLS y XLSX sin perder los campos', () => {
  const expected = parseProducts(Uint8Array.from(fixture).buffer, 'test.csv');
  for (const bookType of ['xls','xlsx'] as const) {
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(expected),'Productos');
    const result = parseProducts(XLSX.write(workbook,{type:'array',bookType}), `test.${bookType}`);
    assert.deepEqual(result, expected);
  }
});
test('rechaza vacíos, formatos inválidos, encabezados ausentes o ambiguos', () => {
  assert.throws(()=>parseProducts(bytes(''), 'test.csv'), /vacío/);
  assert.throws(()=>parseProducts(bytes('a'), 'test.txt'), /CSV/);
  assert.throws(()=>parseProducts(bytes('nombre,fabricante\nA,B'), 'test.csv'), /columna/);
  assert.throws(()=>parseProducts(bytes('nombre,name,fabricante,responsable,warning\nA,B,C,D,E'), 'test.csv'), /una sola/);
  assert.throws(()=>parseProducts(bytes('nombre,fabricante,responsable,warning\n,Marca,EU,Aviso'), 'test.csv'), /nombre/);
});
test('los límites rechazan archivos grandes y exceso de productos o campos', () => {
  assert.throws(()=>parseProducts(new ArrayBuffer(MAX_FILE_BYTES+1),'large.csv'), /5 MB/);
  const p={name:'A',manufacturer:'',responsible:'',warning:''};
  assert.throws(()=>validateProducts(Array(MAX_PRODUCTS+1).fill(p)), /límite/);
  assert.throws(()=>validateProducts([{...p,warning:'a'.repeat(1001)}]), /1000/);
  assert.throws(()=>validateProducts([{...p,manufacturer:4}]), /campo/);
  assert.throws(()=>parseProducts(bytes('name,manufacturer,responsible,warning\n'+Array(1001).fill('A,,,').join('\n')), 'large.csv'), /límite/);
});
test('el indicador solo evalúa presencia, no cumplimiento', () => {
  const products=validateProducts([{name:'Ejemplo',manufacturer:'No comprobado',responsible:'No comprobado',warning:'No comprobado'}]);
  assert.equal(analyze(products)[0].score,8);
});
test('la cuota gratuita cuenta cinco productos por mes UTC y nunca queda negativa', () => {
  const quota = productQuota(3, new Date('2026-08-29T23:30:00Z'));
  assert.deepEqual(quota, { limit: 5, used: 3, remaining: 2, periodStart: '2026-08-01' });
  assert.equal(productQuota(8).remaining, 0);
  assert.match(quotaExceededMessage(4, quota), /contiene 4.*te quedan 2/);
});
test('redirecciones de autenticación limitadas a destinos internos concretos', () => {
  for(const path of ['https://evil.example','//evil.example','/\\evil.example',null,'/dashboard?token=x']) assert.equal(safeAuthDestination(path),'/dashboard');
  assert.equal(safeAuthDestination('/reset-password'),'/reset-password');
});
test('las mutaciones requieren el origen configurado y JSON de tamaño acotado', async () => {
  const old=process.env.NEXT_PUBLIC_SITE_URL;
  process.env.NEXT_PUBLIC_SITE_URL='https://euproductradar.netlify.app';
  try {
    assert.equal(sameOrigin(new Request('https://euproductradar.netlify.app/api/analyses',{headers:{origin:'https://evil.example'}})),false);
    assert.equal(sameOrigin(new Request('https://euproductradar.netlify.app/api/analyses',{headers:{origin:process.env.NEXT_PUBLIC_SITE_URL}})),true);
    assert.deepEqual(await readJsonBody(new Request('http://local',{method:'POST',body:'{"products":[]}'})),{products:[]});
    await assert.rejects(readJsonBody(new Request('http://local',{method:'POST',body:'x'})),/válido/);
    await assert.rejects(readJsonBody(new Request('http://local',{method:'POST',body:'a'.repeat(MAX_BODY_BYTES+1)})),/2 MB/);
  } finally { if(old===undefined)delete process.env.NEXT_PUBLIC_SITE_URL;else process.env.NEXT_PUBLIC_SITE_URL=old; }
});
