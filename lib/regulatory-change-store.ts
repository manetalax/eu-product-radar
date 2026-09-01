import { createAdminClient } from '@/lib/supabase/admin';
import { normalizeRegulatoryEvents, type RawRegulatoryEvent } from '@/lib/regulatory-change-ingestion';

export async function persistRegulatoryEvents(inputs: RawRegulatoryEvent[], now = new Date()) {
  const events = normalizeRegulatoryEvents(inputs, now);
  if (!events.length) return { received: 0, stored: 0 };

  const admin = createAdminClient();
  const { error } = await admin
    .from('regulatory_change_events')
    .upsert(events, { onConflict: 'fingerprint', ignoreDuplicates: false });

  if (error) throw new Error('No se han podido persistir los eventos del Radar regulatorio.');
  return { received: inputs.length, stored: events.length };
}
