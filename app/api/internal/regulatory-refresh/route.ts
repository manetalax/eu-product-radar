import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { PRIVATE_HEADERS, readJsonBody, RequestBodyTooLargeError } from '@/lib/http';
import { fetchEurLexEvents } from '@/lib/eurlex-rss';
import { persistRegulatoryEvents } from '@/lib/regulatory-change-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;
const MAX_REFRESH_BODY_BYTES = 1024;
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });

function configuredSecret(): string | null {
  const secret = process.env.REGULATORY_INGEST_SECRET?.trim() ?? '';
  return secret.length >= 32 ? secret : null;
}

function authorized(request: Request, secret: string): boolean {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return false;
  const supplied = Buffer.from(header.slice(7));
  const expected = Buffer.from(secret);
  return supplied.length === expected.length && timingSafeEqual(supplied, expected);
}

export async function POST(request: Request) {
  const secret = configuredSecret();
  if (!secret) return json({ error: 'Radar automático no configurado.' }, 503);
  if (!authorized(request, secret)) return json({ error: 'No autorizado.' }, 401);
  if (!request.headers.get('content-type')?.toLowerCase().startsWith('application/json')) {
    return json({ error: 'Tipo de contenido no admitido.' }, 415);
  }

  try {
    const body = await readJsonBody(request, MAX_REFRESH_BODY_BYTES);
    if (!body || typeof body !== 'object' || Array.isArray(body) || Object.keys(body as Record<string, unknown>).length !== 0) {
      return json({ error: 'Solicitud no válida.' }, 400);
    }

    const events = await fetchEurLexEvents();
    const result = await persistRegulatoryEvents(events);
    return json({ source: 'EUR-Lex RSS', fetched: events.length, stored: result.stored, refreshedAt: new Date().toISOString() });
  } catch (error) {
    if (error instanceof RequestBodyTooLargeError) return json({ error: 'Solicitud demasiado grande.' }, 413);
    if (error instanceof Error && (error.message.includes('no es válido') || error.message.includes('UTF-8'))) {
      return json({ error: 'Solicitud no válida.' }, 400);
    }
    console.error('regulatory_refresh_failed', error);
    return json({ error: 'No se ha podido actualizar el Radar.' }, 502);
  }
}
