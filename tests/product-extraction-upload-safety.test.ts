import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const route = readFileSync(new URL('../app/api/product-extraction/route.ts', import.meta.url), 'utf8');
const imageTypes = readFileSync(new URL('../lib/upload-image-type.ts', import.meta.url), 'utf8');

test('product extraction validates decoded size and image signature before rate-limited AI work', () => {
  const parseIndex = route.indexOf('upload = parseDataUrl(dataUrl, language)');
  const validateIndex = route.indexOf('kind = validateUploadType(filename, mimeType, upload.mimeType, upload.bytes, language)');
  const rateLimitIndex = route.indexOf('const allowed = await consumeApiRateLimit');
  const visionIndex = route.indexOf('generateVisionText(normalizedDataUrl');
  assert.ok(parseIndex > 0);
  assert.ok(validateIndex > parseIndex);
  assert.ok(rateLimitIndex > validateIndex);
  assert.ok(visionIndex > rateLimitIndex);
  assert.match(route, /bytes\.length > MAX_FILE_BYTES/);
  assert.match(route, /validateImageUploadType\(filename, declared, data, bytes\)/);
});

test('image extension, MIME metadata and magic bytes agree while missing mobile MIME is handled safely', () => {
  assert.match(route, /IMAGE_EXTENSIONS/);
  assert.match(route, /IMAGE_MIME/);
  assert.match(route, /heic\|heif/);
  assert.match(route, /sniffSupportedImageMime\(upload\.bytes\)/);
  assert.match(route, /normalizedDataUrl/);

  assert.match(imageTypes, /\.hei\[cf\]\$\/i/);
  assert.match(imageTypes, /\['image\/heic', 'image\/heif'\]/);
  assert.match(imageTypes, /application\/octet-stream/);
  assert.match(imageTypes, /0xff[\s\S]*0xd8[\s\S]*0xff/);
  assert.match(imageTypes, /ftyp/);
  assert.match(imageTypes, /extension-mismatch/);
  assert.match(imageTypes, /mime-mismatch/);

  assert.match(route, /productExtractionText\(language, 'imageMime'\)/);
  assert.doesNotMatch(route, /ALLOWED_EXTENSIONS = .*csv/);
  assert.doesNotMatch(route, /ALLOWED_EXTENSIONS = .*xlsx/);
  assert.match(route, /productExtractionText\(language, 'unsupportedFormat'\)/);
});

test('free-only document fallback remains fail-closed and language aware', () => {
  assert.match(route, /aiCostPolicy\(\) === 'free_only'/);
  assert.match(route, /productExtractionText\(language, 'freeOnlyDocument'\)/);
  assert.match(route, /const language = requestLanguage\(request\)/);
});
