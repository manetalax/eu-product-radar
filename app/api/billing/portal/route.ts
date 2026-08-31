import { NextResponse } from 'next/server';
import { sameOrigin, PRIVATE_HEADERS } from '@/lib/http';
import { stripeClient } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origen de solicitud no permitido.' }, 403);
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) return json({ error: 'Inicia sesión para gestionar tu plan.' }, 401);
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '');
    if (!siteUrl) throw new Error('Falta configurar NEXT_PUBLIC_SITE_URL en producción.');
    const parsedSite = new URL(siteUrl);
    if (parsedSite.protocol !== 'https:' && parsedSite.hostname !== 'localhost') throw new Error('NEXT_PUBLIC_SITE_URL no es una URL segura.');

    const admin = createAdminClient();
    const { data, error: subscriptionError } = await admin.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).maybeSingle();
    if (subscriptionError && subscriptionError.code !== 'PGRST116') throw new Error('No se puede consultar tu suscripción.');
    if (!data?.stripe_customer_id) return json({ error: 'Esta cuenta todavía no tiene una suscripción.' }, 404);

    const session = await stripeClient().billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url: `${siteUrl}/dashboard` });
    return json({ url: session.url });
  } catch (portalError) {
    return json({ error: portalError instanceof Error ? portalError.message : 'No se ha podido abrir la gestión del plan.' }, 503);
  }
}
