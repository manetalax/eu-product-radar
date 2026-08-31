import { inflateRawSync, inflateSync } from 'node:zlib';

const MAX_EXTRACTED_TEXT = 500_000;
const MAX_ZIP_ENTRY_BYTES = 8 * 1024 * 1024;
const MAX_ZIP_ENTRIES = 4096;
const MAX_PDF_STREAMS = 256;
const MAX_PDF_DECODED_BYTES = 16 * 1024 * 1024;
const MAX_PDF_PIECES = 20_000;

function normalizeText(value: string): string {
  return value
    .replace(/\u0000/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n[ \t]+/g, '\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, MAX_EXTRACTED_TEXT);
}

export function rtfToPlainText(input: string): string {
  return normalizeText(input
    .replace(/\\par[d]?\b/g, '\n')
    .replace(/\\tab\b/g, '\t')
    .replace(/\\'[0-9a-fA-F]{2}/g, match => String.fromCharCode(parseInt(match.slice(2), 16)))
    .replace(/\\u(-?\d+)\??/g, (_match, value: string) => {
      const point = Number(value);
      return Number.isFinite(point) ? String.fromCharCode(point < 0 ? point + 65536 : point) : '';
    })
    .replace(/\\[a-zA-Z]+-?\d* ?/g, '')
    .replace(/\\[{}\\]/g, match => match.slice(1))
    .replace(/[{}]/g, '')
    .replace(/\r/g, ''));
}

function decodeXmlEntities(value: string): string {
  return value
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, hex: string) => String.fromCodePoint(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_match, decimal: string) => String.fromCodePoint(Number(decimal)))
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');
}

function xmlToPlainText(xml: string): string {
  return normalizeText(decodeXmlEntities(xml
    .replace(/<w:tab\b[^>]*\/>/gi, '\t')
    .replace(/<w:br\b[^>]*\/>/gi, '\n')
    .replace(/<\/w:p>/gi, '\n')
    .replace(/<text:tab\b[^>]*\/>/gi, '\t')
    .replace(/<text:line-break\b[^>]*\/>/gi, '\n')
    .replace(/<\/text:p>/gi, '\n')
    .replace(/<[^>]+>/g, '')));
}

function findEocd(buffer: Buffer): number {
  const signature = 0x06054b50;
  const min = Math.max(0, buffer.length - 65_557);
  for (let offset = buffer.length - 22; offset >= min; offset--) {
    if (buffer.readUInt32LE(offset) === signature) return offset;
  }
  return -1;
}

function readZipEntry(buffer: Buffer, wantedName: string): Buffer | null {
  const eocd = findEocd(buffer);
  if (eocd < 0) return null;
  const totalEntries = buffer.readUInt16LE(eocd + 10);
  if (totalEntries > MAX_ZIP_ENTRIES) throw new Error('El documento contiene demasiadas entradas internas.');
  let offset = buffer.readUInt32LE(eocd + 16);

  for (let entry = 0; entry < totalEntries && offset + 46 <= buffer.length; entry++) {
    if (buffer.readUInt32LE(offset) !== 0x02014b50) break;
    const method = buffer.readUInt16LE(offset + 10);
    const compressedSize = buffer.readUInt32LE(offset + 20);
    const uncompressedSize = buffer.readUInt32LE(offset + 24);
    const nameLength = buffer.readUInt16LE(offset + 28);
    const extraLength = buffer.readUInt16LE(offset + 30);
    const commentLength = buffer.readUInt16LE(offset + 32);
    const localHeaderOffset = buffer.readUInt32LE(offset + 42);
    const name = buffer.subarray(offset + 46, offset + 46 + nameLength).toString('utf8');

    if (name === wantedName) {
      if (uncompressedSize > MAX_ZIP_ENTRY_BYTES || compressedSize > MAX_ZIP_ENTRY_BYTES) throw new Error('El documento interno es demasiado grande.');
      if (localHeaderOffset + 30 > buffer.length || buffer.readUInt32LE(localHeaderOffset) !== 0x04034b50) return null;
      const localNameLength = buffer.readUInt16LE(localHeaderOffset + 26);
      const localExtraLength = buffer.readUInt16LE(localHeaderOffset + 28);
      const dataStart = localHeaderOffset + 30 + localNameLength + localExtraLength;
      const compressed = buffer.subarray(dataStart, dataStart + compressedSize);
      if (method === 0) return Buffer.from(compressed);
      if (method === 8) return inflateRawSync(compressed, { maxOutputLength: MAX_ZIP_ENTRY_BYTES });
      throw new Error('El documento usa una compresión ZIP no compatible.');
    }

    offset += 46 + nameLength + extraLength + commentLength;
  }
  return null;
}

function decodePdfLiteral(value: string): string {
  let output = '';
  for (let i = 0; i < value.length; i++) {
    const char = value[i];
    if (char !== '\\') { output += char; continue; }
    const next = value[++i];
    if (next === undefined) break;
    if (next === 'n') output += '\n';
    else if (next === 'r') output += '\r';
    else if (next === 't') output += '\t';
    else if (next === 'b') output += '\b';
    else if (next === 'f') output += '\f';
    else if (next === '\n' || next === '\r') { if (next === '\r' && value[i + 1] === '\n') i++; }
    else if (/[0-7]/.test(next)) {
      let octal = next;
      for (let count = 0; count < 2 && /[0-7]/.test(value[i + 1] ?? ''); count++) octal += value[++i];
      output += String.fromCharCode(parseInt(octal, 8));
    } else output += next;
  }
  return output;
}

function decodePdfHex(value: string): string {
  const clean = value.replace(/\s+/g, '');
  let output = '';
  for (let i = 0; i + 1 < clean.length; i += 2) output += String.fromCharCode(parseInt(clean.slice(i, i + 2), 16));
  return output;
}

function extractPdfOperators(source: string): string[] {
  const pieces: string[] = [];
  for (const match of source.matchAll(/\(((?:\\.|[^\\)])*)\)\s*Tj/g)) pieces.push(decodePdfLiteral(match[1]));
  for (const match of source.matchAll(/<([0-9a-fA-F\s]+)>\s*Tj/g)) pieces.push(decodePdfHex(match[1]));
  for (const match of source.matchAll(/\[((?:.|\n|\r)*?)\]\s*TJ/g)) {
    for (const item of match[1].matchAll(/\(((?:\\.|[^\\)])*)\)|<([0-9a-fA-F\s]+)>/g)) {
      pieces.push(item[1] !== undefined ? decodePdfLiteral(item[1]) : decodePdfHex(item[2]));
    }
  }
  return pieces;
}

export function extractPdfText(buffer: Buffer): string {
  const raw = buffer.toString('latin1');
  const pieces = extractPdfOperators(raw).slice(0, MAX_PDF_PIECES);
  const streamPattern = /stream\r?\n/g;
  let streamCount = 0;
  let decodedBytes = 0;

  for (const match of raw.matchAll(streamPattern)) {
    if (streamCount >= MAX_PDF_STREAMS || decodedBytes >= MAX_PDF_DECODED_BYTES || pieces.length >= MAX_PDF_PIECES) break;
    streamCount++;
    const start = (match.index ?? 0) + match[0].length;
    const end = raw.indexOf('endstream', start);
    if (end < 0) continue;
    const dictionary = raw.slice(Math.max(0, (match.index ?? 0) - 800), match.index ?? 0);
    const bytes = buffer.subarray(start, end);
    const remainingBytes = MAX_PDF_DECODED_BYTES - decodedBytes;
    if (remainingBytes <= 0) break;

    try {
      let decoded: Buffer;
      if (/\/FlateDecode\b/.test(dictionary)) {
        decoded = inflateSync(bytes, { maxOutputLength: Math.min(MAX_ZIP_ENTRY_BYTES, remainingBytes) });
      } else {
        if (bytes.length > remainingBytes) break;
        decoded = bytes;
      }
      decodedBytes += decoded.length;
      const availablePieces = MAX_PDF_PIECES - pieces.length;
      pieces.push(...extractPdfOperators(decoded.toString('latin1')).slice(0, availablePieces));
    } catch {
      // Ignore an individual unsupported/corrupt/oversized stream and continue scanning.
    }
  }
  const text = normalizeText(pieces.join('\n'));
  const meaningful = (text.match(/[\p{L}\p{N}]/gu) ?? []).length;
  return meaningful >= 20 ? text : '';
}

export function extractLocalDocumentText(filename: string, buffer: Buffer): string {
  const lower = filename.toLocaleLowerCase('en-US');
  if (lower.endsWith('.txt') || lower.endsWith('.md') || lower.endsWith('.json')) return normalizeText(buffer.toString('utf8'));
  if (lower.endsWith('.rtf')) return rtfToPlainText(buffer.toString('utf8'));
  if (lower.endsWith('.pdf')) return extractPdfText(buffer);
  if (lower.endsWith('.docx')) {
    const xml = readZipEntry(buffer, 'word/document.xml');
    return xml ? xmlToPlainText(xml.toString('utf8')) : '';
  }
  if (lower.endsWith('.odt')) {
    const xml = readZipEntry(buffer, 'content.xml');
    return xml ? xmlToPlainText(xml.toString('utf8')) : '';
  }
  return '';
}
