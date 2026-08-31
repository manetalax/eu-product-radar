import test from 'node:test';
import assert from 'node:assert/strict';
import { sniffSupportedImageMime, validateImageUploadType } from '../lib/upload-image-type';

const bytes = (...values: number[]) => Uint8Array.from(values);
const ascii = (value: string) => Uint8Array.from([...value].map(char => char.charCodeAt(0)));

function concat(...parts: Uint8Array[]) {
  const result = new Uint8Array(parts.reduce((sum, part) => sum + part.length, 0));
  let offset = 0;
  for (const part of parts) {
    result.set(part, offset);
    offset += part.length;
  }
  return result;
}

test('sniffs JPEG, PNG and WebP from magic bytes', () => {
  assert.equal(sniffSupportedImageMime(bytes(0xff, 0xd8, 0xff, 0xe0)), 'image/jpeg');
  assert.equal(sniffSupportedImageMime(bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)), 'image/png');
  assert.equal(sniffSupportedImageMime(concat(ascii('RIFF'), bytes(0, 0, 0, 0), ascii('WEBP'))), 'image/webp');
});

test('sniffs HEIC and HEIF ISO BMFF brands', () => {
  assert.equal(sniffSupportedImageMime(concat(bytes(0, 0, 0, 24), ascii('ftyp'), ascii('heic'), bytes(0, 0, 0, 0), ascii('mif1'))), 'image/heic');
  assert.equal(sniffSupportedImageMime(concat(bytes(0, 0, 0, 24), ascii('ftyp'), ascii('mif1'), bytes(0, 0, 0, 0), ascii('msf1'))), 'image/heif');
});

test('accepts a legitimate iOS photo when browser MIME metadata is missing', () => {
  const heic = concat(bytes(0, 0, 0, 24), ascii('ftyp'), ascii('heic'), bytes(0, 0, 0, 0), ascii('mif1'));
  assert.deepEqual(
    validateImageUploadType('IMG_0001.HEIC', 'application/octet-stream', 'application/octet-stream', heic),
    { ok: true, mimeType: 'image/heic' },
  );

  const jpeg = bytes(0xff, 0xd8, 0xff, 0xe1, 0, 0);
  assert.deepEqual(
    validateImageUploadType('camera.jpg', 'application/octet-stream', 'application/octet-stream', jpeg),
    { ok: true, mimeType: 'image/jpeg' },
  );
});

test('rejects extension spoofing and MIME/signature disagreement', () => {
  const png = bytes(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
  assert.deepEqual(
    validateImageUploadType('fake.jpg', 'application/octet-stream', 'application/octet-stream', png),
    { ok: false, reason: 'extension-mismatch' },
  );

  const jpeg = bytes(0xff, 0xd8, 0xff, 0xe0);
  assert.deepEqual(
    validateImageUploadType('photo.jpg', 'image/png', 'image/png', jpeg),
    { ok: false, reason: 'mime-mismatch' },
  );

  assert.deepEqual(
    validateImageUploadType('photo.jpg', 'application/octet-stream', 'application/octet-stream', ascii('%PDF-1.7')),
    { ok: false, reason: 'unrecognized-signature' },
  );
});
