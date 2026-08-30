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
    const admin = createAdminClient();
    const { data } = await admin.from('subscriptions').select('stripe_customer_id').eq('user_id', user.id).maybeSingle();
    if (!data?.stripe_customer_id) return json({ error: 'Esta cuenta todavía no tiene una suscripción.' }, 404);
    const session = await stripeClient().billingPortal.sessions.create({ customer: data.stripe_customer_id, return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard` });
    return json({ url: session.url });
  } catch (portalError) {
    return json({ error: portalError instanceof Error ? portalError.message : 'No se ha podido abrir la gestión del plan.' }, 503);
  }
}
