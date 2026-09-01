import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { extractLocalDocumentText, extractPdfText, rtfToPlainText } from '../lib/local-document-text';

const parserSource = readFileSync(new URL('../lib/local-document-text.ts', import.meta.url), 'utf8');

function storedZip(name: string, content: string): Buffer {
  const nameBytes = Buffer.from(name);
  const data = Buffer.from(content);

  const local = Buffer.alloc(30);
  local.writeUInt32LE(0x04034b50, 0);
  local.writeUInt16LE(20, 4);
  local.writeUInt16LE(0, 6);
  local.writeUInt16LE(0, 8);
  local.writeUInt32LE(0, 14);
  local.writeUInt32LE(data.length, 18);
  local.writeUInt32LE(data.length, 22);
  local.writeUInt16LE(nameBytes.length, 26);
  local.writeUInt16LE(0, 28);

  const centralOffset = local.length + nameBytes.length + data.length;
  const central = Buffer.alloc(46);
  central.writeUInt32LE(0x02014b50, 0);
  central.writeUInt16LE(20, 4);
  central.writeUInt16LE(20, 6);
  central.writeUInt16LE(0, 8);
  central.writeUInt16LE(0, 10);
  central.writeUInt32LE(0, 16);
  central.writeUInt32LE(data.length, 20);
  central.writeUInt32LE(data.length, 24);
  central.writeUInt16LE(nameBytes.length, 28);
  central.writeUInt16LE(0, 30);
  central.writeUInt16LE(0, 32);
  central.writeUInt16LE(0, 34);
  central.writeUInt16LE(0, 36);
  central.writeUInt32LE(0, 38);
  central.writeUInt32LE(0, 42);

  const centralSize = central.length + nameBytes.length;
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(1, 8);
  eocd.writeUInt16LE(1, 10);
  eocd.writeUInt32LE(centralSize, 12);
  eocd.writeUInt32LE(centralOffset, 16);
  eocd.writeUInt16LE(0, 20);

  return Buffer.concat([local, nameBytes, data, central, nameBytes, eocd]);
}

function zipWithDeclaredEntryCount(count: number): Buffer {
  const eocd = Buffer.alloc(22);
  eocd.writeUInt32LE(0x06054b50, 0);
  eocd.writeUInt16LE(0, 4);
  eocd.writeUInt16LE(0, 6);
  eocd.writeUInt16LE(count, 8);
  eocd.writeUInt16LE(count, 10);
  eocd.writeUInt32LE(0, 12);
  eocd.writeUInt32LE(0, 16);
  eocd.writeUInt16LE(0, 20);
  return eocd;
}

function centralDirectoryOffset(zip: Buffer): number {
  const eocd = zip.length - 22;
  return zip.readUInt32LE(eocd + 16);
}

test('extrae texto útil de un PDF con capa de texto', () => {
  const pdf = Buffer.from('%PDF-1.4\n1 0 obj << /Length 120 >>\nstream\nBT /F1 12 Tf (Producto Lampara LED Fabricante Marca Norte Advertencia No cubrir) Tj ET\nendstream\nendobj\n%%EOF', 'latin1');
  const text = extractPdfText(pdf);
  assert.match(text, /Producto Lampara LED/);
  assert.match(text, /Marca Norte/);
});

test('PDF limita streams, bytes descomprimidos y fragmentos de texto de forma acumulada', () => {
  assert.match(parserSource, /const MAX_PDF_STREAMS = 256/);
  assert.match(parserSource, /const MAX_PDF_DECODED_BYTES = 16 \* 1024 \* 1024/);
  assert.match(parserSource, /const MAX_PDF_PIECES = 20_000/);
  assert.match(parserSource, /streamCount >= MAX_PDF_STREAMS/);
  assert.match(parserSource, /decodedBytes >= MAX_PDF_DECODED_BYTES/);
  assert.match(parserSource, /pieces\.length >= MAX_PDF_PIECES/);
  assert.match(parserSource, /maxOutputLength: Math\.min\(MAX_ZIP_ENTRY_BYTES, remainingBytes\)/);
});

test('extrae texto de DOCX y ODT sin dependencias externas', () => {
  const docx = storedZip('word/document.xml', '<w:document><w:body><w:p><w:r><w:t>Producto Auriculares Marca Sonora</w:t></w:r></w:p><w:p><w:r><w:t>Bluetooth 5.3</w:t></w:r></w:p></w:body></w:document>');
  const odt = storedZip('content.xml', '<office:document-content><text:p>Producto Mochila Marca Norte</text:p><text:p>Uso escolar</text:p></office:document-content>');
  assert.match(extractLocalDocumentText('catalogo.docx', docx), /Auriculares Marca Sonora/);
  assert.match(extractLocalDocumentText('catalogo.odt', odt), /Mochila Marca Norte/);
});

test('DOCX y ODT rechazan archivos con demasiadas entradas ZIP antes de recorrerlas', () => {
  assert.match(parserSource, /const MAX_ZIP_ENTRIES = 4096/);
  const malicious = zipWithDeclaredEntryCount(4097);
  assert.throws(() => extractLocalDocumentText('catalogo.docx', malicious), /demasiadas entradas internas/);
  assert.throws(() => extractLocalDocumentText('catalogo.odt', malicious), /demasiadas entradas internas/);
});

test('rechaza offsets locales fuera del archivo y directorios centrales truncados', () => {
  const badLocalOffset = storedZip('word/document.xml', '<w:document><w:body><w:p>Producto Seguro</w:p></w:body></w:document>');
  const centralOffset = centralDirectoryOffset(badLocalOffset);
  badLocalOffset.writeUInt32LE(badLocalOffset.length + 100, centralOffset + 42);
  assert.throws(() => extractLocalDocumentText('catalogo.docx', badLocalOffset), /cabecera local válida/);

  const badCentral = storedZip('content.xml', '<office:document-content><text:p>Producto Seguro</text:p></office:document-content>');
  const odtCentralOffset = centralDirectoryOffset(badCentral);
  badCentral.writeUInt16LE(0xffff, odtCentralOffset + 32);
  assert.throws(() => extractLocalDocumentText('catalogo.odt', badCentral), /truncado o dañado/);
});

test('convierte RTF a texto antes de enviarlo al modelo gratuito', () => {
  const text = rtfToPlainText('{\\rtf1\\ansi Producto \\b Cafetera\\b0\\par Fabricante Marca Norte\\par 230V}');
  assert.match(text, /Producto Cafetera/);
  assert.match(text, /230V/);
});
