import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { PRIVATE_HEADERS, readJsonBody } from '@/lib/http';
import { persistRegulatoryEvents } from '@/lib/regulatory-change-store';
import type { RawRegulatoryEvent } from '@/lib/regulatory-change-ingestion';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });

function configuredSecret(): string | null {
  const secret = process.env.REGULATORY_INGEST_SECRET?.trim() ?? '';
  return secret.length >= 32 ? secret : null;
}

function authorized(request: Request, secret: string): boolean {
  const header = request.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return false;
  const supplied = header.slice(7);
  const expectedBuffer = Buffer.from(secret);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}

export async function POST(request: Request) {
  const secret = configuredSecret();
  if (!secret) return json({ error: 'Ingesta regulatoria no configurada.' }, 503);
  if (!authorized(request, secret)) return json({ error: 'No autorizado.' }, 401);

  try {
    const body = await readJsonBody(request) as { events?: RawRegulatoryEvent[] } | null;
    if (!body || !Array.isArray(body.events) || body.events.length === 0 || body.events.length > 500) {
      return json({ error: 'Se requiere un lote de entre 1 y 500 eventos.' }, 400);
    }
    const result = await persistRegulatoryEvents(body.events);
    return json(result, 200);
  } catch (error) {
    console.error('regulatory_ingest_failed', error);
    return json({ error: 'No se ha podido ejecutar la ingesta regulatoria.' }, 400);
  }
}
