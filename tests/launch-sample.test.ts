import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseProducts } from '../lib/import-products';
import { analyze } from '../lib/analysis';

function arrayBuffer(bytes: Buffer): ArrayBuffer {
  return bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
}

test('public launch sample parses as exactly five EU products and produces five analyses', () => {
  const bytes = readFileSync(new URL('../public/importverifier-sample-5-products.csv', import.meta.url));
  const products = parseProducts(arrayBuffer(bytes), 'importverifier-sample-5-products.csv');
  assert.equal(products.length, 5);
  assert.equal(new Set(products.map(product => product.name)).size, 5);
  assert.ok(products.every(product => product.manufacturer.length > 0));
  assert.ok(products.every(product => product.responsible.length > 0));
  assert.equal(analyze(products, 'EU').length, 5);
});

test('public sixth-product acceptance fixture parses as exactly one distinct EU product', () => {
  const firstFiveBytes = readFileSync(new URL('../public/importverifier-sample-5-products.csv', import.meta.url));
  const sixthBytes = readFileSync(new URL('../public/importverifier-sample-6th-product.csv', import.meta.url));
  const firstFive = parseProducts(arrayBuffer(firstFiveBytes), 'importverifier-sample-5-products.csv');
  const sixth = parseProducts(arrayBuffer(sixthBytes), 'importverifier-sample-6th-product.csv');

  assert.equal(sixth.length, 1);
  assert.ok(sixth[0].manufacturer.length > 0);
  assert.ok(sixth[0].responsible.length > 0);
  assert.ok(!new Set(firstFive.map(product => product.name)).has(sixth[0].name));
  assert.equal(analyze(sixth, 'EU').length, 1);
});
