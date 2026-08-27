import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as XLSX from 'xlsx';
import { analyze, validateProducts, MAX_PRODUCTS, MAX_FILE_BYTES } from '../lib/analysis';
import { parseProducts } from '../lib/import-products';
import { MAX_BODY_BYTES, readJsonBody, safeAuthDestination, sameOrigin } from '../lib/http';

const fixture = readFileSync(new URL('./fixtures/catalogue.csv', import.meta.url));
const bytes = (text: string) => new TextEncoder().encode(text).buffer;
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
