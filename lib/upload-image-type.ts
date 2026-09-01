export type SupportedImageMime = 'image/png' | 'image/jpeg' | 'image/webp' | 'image/heic' | 'image/heif';

const OCTET_STREAM = 'application/octet-stream';
const IMAGE_MIME = /^image\/(png|jpeg|webp|heic|heif)$/i;

function ascii(bytes: Uint8Array, start: number, length: number) {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

export function sniffSupportedImageMime(bytes: Uint8Array): SupportedImageMime | null {
  if (bytes.length >= 8
    && bytes[0] === 0x89
    && bytes[1] === 0x50
    && bytes[2] === 0x4e
    && bytes[3] === 0x47
    && bytes[4] === 0x0d
    && bytes[5] === 0x0a
    && bytes[6] === 0x1a
    && bytes[7] === 0x0a) return 'image/png';

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg';

  if (bytes.length >= 12 && ascii(bytes, 0, 4) === 'RIFF' && ascii(bytes, 8, 4) === 'WEBP') return 'image/webp';

  if (bytes.length >= 12 && ascii(bytes, 4, 4) === 'ftyp') {
    const heicBrands = new Set(['heic', 'heix', 'hevc', 'hevx', 'heim', 'heis']);
    const heifBrands = new Set(['mif1', 'msf1']);
    const scanEnd = Math.min(bytes.length, 64);
    for (let offset = 8; offset + 4 <= scanEnd; offset += 4) {
      const brand = ascii(bytes, offset, 4);
      if (heicBrands.has(brand)) return 'image/heic';
      if (heifBrands.has(brand)) return 'image/heif';
    }
  }

  return null;
}

function expectedImageMimes(filename: string): SupportedImageMime[] | null {
  if (/\.png$/i.test(filename)) return ['image/png'];
  if (/\.jpe?g$/i.test(filename)) return ['image/jpeg'];
  if (/\.webp$/i.test(filename)) return ['image/webp'];
  if (/\.hei[cf]$/i.test(filename)) return ['image/heic', 'image/heif'];
  return null;
}

export function validateImageUploadType(
  filename: string,
  declaredMime: string,
  dataMime: string,
  bytes: Uint8Array,
): { ok: true; mimeType: SupportedImageMime } | { ok: false; reason: 'not-image-extension' | 'unrecognized-signature' | 'extension-mismatch' | 'mime-mismatch' } {
  const expected = expectedImageMimes(filename);
  if (!expected) return { ok: false, reason: 'not-image-extension' };

  const sniffed = sniffSupportedImageMime(bytes);
  if (!sniffed) return { ok: false, reason: 'unrecognized-signature' };
  if (!expected.includes(sniffed)) return { ok: false, reason: 'extension-mismatch' };

  for (const rawMime of [declaredMime, dataMime]) {
    const mime = rawMime.trim().toLowerCase();
    if (!mime || mime === OCTET_STREAM) continue;
    if (!IMAGE_MIME.test(mime)) return { ok: false, reason: 'mime-mismatch' };
    if (!expected.includes(mime as SupportedImageMime)) return { ok: false, reason: 'mime-mismatch' };
    if (mime !== sniffed && !expected.includes(mime as SupportedImageMime)) return { ok: false, reason: 'mime-mismatch' };
  }

  return { ok: true, mimeType: sniffed };
}
