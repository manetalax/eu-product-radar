import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import { PRIVATE_HEADERS } from '@/lib/http';
import { fetchEurLexEvents } from '@/lib/eurlex-rss';
import { persistRegulatoryEvents } from '@/lib/regulatory-change-store';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';
export const maxDuration = 60;
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

  try {
    const events = await fetchEurLexEvents();
    const result = await persistRegulatoryEvents(events);
    return json({ source: 'EUR-Lex RSS', fetched: events.length, stored: result.stored, refreshedAt: new Date().toISOString() });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'No se ha podido actualizar el Radar.' }, 502);
  }
}
