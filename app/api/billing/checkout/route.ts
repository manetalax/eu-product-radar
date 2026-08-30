import { NextResponse } from 'next/server';
import { billingStatus, stripePriceId } from '@/lib/billing';
import { sameOrigin, PRIVATE_HEADERS, readJsonBody } from '@/lib/http';
import { isPlanId } from '@/lib/plans';
import { stripeClient } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origen de solicitud no permitido.' }, 403);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: 'Inicia sesión para contratar un plan.' }, 401);

  let planId;
  try {
    const body = await readJsonBody(request) as Record<string, unknown> | null;
    if (!body || !isPlanId(body.planId)) throw new Error('Selecciona un plan válido.');
    planId = body.planId;
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Solicitud no válida.' }, 400); }

  try {
    const stripe = stripeClient();
    const admin = createAdminClient();
    const { data: record, error } = await admin.from('subscriptions').select('stripe_customer_id,plan_id,status,current_period_end,cancel_at_period_end').eq('user_id', user.id).maybeSingle();
    if (error) throw new Error('No se puede consultar tu suscripción.');
    if (billingStatus(record).planId !== 'free' && record?.stripe_customer_id) {
      const portal = await stripe.billingPortal.sessions.create({ customer: record.stripe_customer_id, return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard` });
      return json({ url: portal.url });
    }

    let customerId = record?.stripe_customer_id as string | null | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { supabase_user_id: user.id } }, { idempotencyKey: `customer-${user.id}` });
      customerId = customer.id;
      const { error: saveError } = await admin.from('subscriptions').upsert({ user_id: user.id, stripe_customer_id: customerId, plan_id: 'free', status: 'none', product_limit: 5, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (saveError) throw new Error('No se ha podido preparar la suscripción.');
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) throw new Error('Falta configurar NEXT_PUBLIC_SITE_URL en Netlify.');
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: stripePriceId(planId), quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${siteUrl}/dashboard?checkout=success`,
      cancel_url: `${siteUrl}/dashboard?checkout=cancelled`,
      metadata: { user_id: user.id, plan_id: planId },
      subscription_data: { metadata: { user_id: user.id, plan_id: planId } },
    }, { idempotencyKey: `checkout-${user.id}-${planId}-${new Date().toISOString().slice(0, 13)}` });
    if (!session.url) throw new Error('Stripe no ha devuelto una página de pago.');
    return json({ url: session.url });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'No se ha podido abrir el pago.' }, 503);
  }
}
