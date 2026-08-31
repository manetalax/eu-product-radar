import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const dashboard = readFileSync(new URL('../components/Dashboard.tsx', import.meta.url), 'utf8');

test('PDF and XLSX exports keep explicit browser download metadata and a delayed object URL cleanup', () => {
  assert.match(dashboard, /URL\.createObjectURL\(new Blob\(\[bytes\], \{ type: format === 'pdf' \? 'application\/pdf' : 'application\/vnd\.openxmlformats-officedocument\.spreadsheetml\.sheet' \}\)\)/);
  assert.match(dashboard, /link\.download = `import-rules-verifier-\$\{analysisMarket\(current\)\.toLowerCase\(\)\}-\$\{current\.created_at\.slice\(0, 10\)\}-\$\{current\.id\.slice\(0, 8\)\}\.\$\{format\}`/);
  assert.match(dashboard, /document\.body\.appendChild\(link\);\s*link\.click\(\);\s*link\.remove\(\);/s);
  assert.match(dashboard, /window\.setTimeout\(\(\) => URL\.revokeObjectURL\(url\), 60000\)/);
});

test('localized CSV template uses a BOM, explicit filename and delayed object URL cleanup', () => {
  assert.match(dashboard, /const csv = `\\uFEFFname,manufacturer,eu_operator,warning\\n\$\{samples\[language\]\}\\n`/);
  assert.match(dashboard, /new Blob\(\[csv\], \{ type: 'text\/csv;charset=utf-8' \}\)/);
  assert.match(dashboard, /link\.download = `importverifier-eu-template-\$\{language\}\.csv`/);
  assert.match(dashboard, /window\.setTimeout\(\(\) => URL\.revokeObjectURL\(url\), 1000\)/);
});
