export const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store, max-age=0' };
export const MAX_BODY_BYTES = 2 * 1024 * 1024;

export function configuredSiteOrigin(value: string | undefined = process.env.NEXT_PUBLIC_SITE_URL): string | null {
  if (!value) return null;
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost') return null;
    if (parsed.username || parsed.password) return null;
    return parsed.origin;
  } catch {
    return null;
  }
}

export function sameOrigin(request: Request) {
  const expectedOrigin = configuredSiteOrigin();
  return Boolean(expectedOrigin) && request.headers.get('origin') === expectedOrigin;
}

export async function readBodyBytes(request: Request, maxBytes = MAX_BODY_BYTES): Promise<Uint8Array> {
  if (!Number.isInteger(maxBytes) || maxBytes < 1 || maxBytes > 10 * 1024 * 1024) throw new Error('Límite de contenido no válido.');
  const contentLength = Number(request.headers.get('content-length') ?? 0);
  if (Number.isFinite(contentLength) && contentLength > maxBytes) throw new Error('El contenido supera el límite permitido.');
  const reader = request.body?.getReader();
  if (!reader) throw new Error('No se ha recibido contenido.');
  let size = 0;
  const chunks: Uint8Array[] = [];
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > maxBytes) { await reader.cancel(); throw new Error('El contenido supera el límite permitido.'); }
    chunks.push(value);
  }
  const joined = new Uint8Array(size);
  let offset = 0;
  chunks.forEach(chunk => { joined.set(chunk, offset); offset += chunk.length; });
  return joined;
}

export async function readTextBody(request: Request, maxBytes = MAX_BODY_BYTES): Promise<string> {
  try { return new TextDecoder('utf-8', { fatal: true }).decode(await readBodyBytes(request, maxBytes)); }
  catch (error) {
    if (error instanceof Error && error.message.includes('límite')) throw error;
    throw new Error('El contenido enviado no es texto UTF-8 válido.');
  }
}

export async function readJsonBody(request: Request, maxBytes = MAX_BODY_BYTES): Promise<unknown> {
  try { return JSON.parse(await readTextBody(request, maxBytes)); }
  catch (error) {
    if (error instanceof Error && (error.message.includes('límite') || error.message.includes('UTF-8'))) throw error;
    throw new Error('El contenido enviado no es válido.');
  }
}

export function safeAuthDestination(value: string | null) {
  return value === '/reset-password' ? '/reset-password' : '/dashboard';
}
