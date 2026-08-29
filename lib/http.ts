export const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0' };
export const MAX_BODY_BYTES = 2 * 1024 * 1024;

export function sameOrigin(request: Request) {
  const expected = process.env.NEXT_PUBLIC_SITE_URL;
  if (!expected) return false;
  return request.headers.get('origin') === new URL(expected).origin;
}

export async function readJsonBody(request: Request): Promise<unknown> {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('No se han recibido productos.');
  let size = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > MAX_BODY_BYTES) { await reader.cancel(); throw new Error('El contenido supera el límite de 2 MB.'); }
    chunks.push(value);
  }
  const joined = new Uint8Array(size);
  let offset = 0;
  chunks.forEach(chunk => { joined.set(chunk, offset); offset += chunk.length; });
  try { return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(joined)); }
  catch { throw new Error('El contenido enviado no es válido.'); }
}

export function safeAuthDestination(value: string | null) {
  return value === '/reset-password' ? '/reset-password' : '/dashboard';
}
