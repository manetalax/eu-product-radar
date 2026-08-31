import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import { PRIVATE_HEADERS } from '@/lib/http';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });

export async function GET(request: Request) {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: 'Inicia sesión.' }, 401);

  const url = new URL(request.url);
  const limitParam = Number(url.searchParams.get('limit') ?? '20');
  const limit = Number.isFinite(limitParam) ? Math.min(50, Math.max(1, Math.trunc(limitParam))) : 20;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('regulatory_change_events')
    .select('id,source_name,source_url,title,summary,published_at,effective_at,severity,affected_keywords,official_reference,last_seen_at')
    .eq('active', true)
    .order('published_at', { ascending: false, nullsFirst: false })
    .order('last_seen_at', { ascending: false })
    .limit(limit);

  if (error) return json({ error: 'No se puede cargar el Radar regulatorio.' }, 503);
  const events = data ?? [];
  const live = process.env.REGULATORY_RADAR_LIVE === 'true' && events.length > 0;
  return json({ events, live, sourcePolicy: 'official-only' });
}
