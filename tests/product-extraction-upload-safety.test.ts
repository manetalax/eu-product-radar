import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../app/api/product-extraction/route.ts', import.meta.url), 'utf8');

test('product extraction validates decoded size and MIME before rate-limited AI work', () => {
  const parseIndex = route.indexOf('upload = parseDataUrl(dataUrl)');
  const validateIndex = route.indexOf('kind = validateUploadType(filename, mimeType, upload.mimeType)');
  const rateLimitIndex = route.indexOf('const allowed = await consumeApiRateLimit');
  const visionIndex = route.indexOf('generateVisionText(dataUrl');
  assert.ok(parseIndex > 0);
  assert.ok(validateIndex > parseIndex);
  assert.ok(rateLimitIndex > validateIndex);
  assert.ok(visionIndex > rateLimitIndex);
  assert.match(route, /bytes\.length > MAX_FILE_BYTES/);
});

test('image extension and MIME must agree and spreadsheet formats stay local', () => {
  assert.match(route, /IMAGE_EXTENSIONS/);
  assert.match(route, /IMAGE_MIME/);
  assert.match(route, /tipo MIME compatible con su extensión/);
  assert.doesNotMatch(route, /ALLOWED_EXTENSIONS = .*csv/);
  assert.doesNotMatch(route, /ALLOWED_EXTENSIONS = .*xlsx/);
  assert.match(route, /CSV y Excel se procesan localmente/);
});
