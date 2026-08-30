import { NextResponse } from 'next/server';
import { billingStatus, stripePriceId } from '@/lib/billing';
import { sameOrigin, PRIVATE_HEADERS, readJsonBody } from '@/lib/http';
import { isPurchaseId, ONE_TIME_AUDIT, PurchaseId } from '@/lib/plans';
import { stripeClient } from '@/lib/stripe/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
const json = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: PRIVATE_HEADERS });

function auditPriceId(): string {
  const value = process.env.STRIPE_PRICE_AUDIT;
  if (!value || !/^price_[A-Za-z0-9]+$/.test(value)) throw new Error('Falta configurar STRIPE_PRICE_AUDIT en Netlify.');
  return value;
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return json({ error: 'Origen de solicitud no permitido.' }, 403);
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return json({ error: 'Inicia sesión para contratar un plan.' }, 401);

  let purchaseId: PurchaseId;
  try {
    const body = await readJsonBody(request) as Record<string, unknown> | null;
    const candidate = body?.purchaseId ?? body?.planId;
    if (!isPurchaseId(candidate)) throw new Error('Selecciona una opción válida.');
    purchaseId = candidate;
  } catch (error) { return json({ error: error instanceof Error ? error.message : 'Solicitud no válida.' }, 400); }

  try {
    const stripe = stripeClient();
    const admin = createAdminClient();
    const { data: record, error } = await admin.from('subscriptions').select('stripe_customer_id,plan_id,status,current_period_end,cancel_at_period_end').eq('user_id', user.id).maybeSingle();
    if (error && error.code !== 'PGRST116') throw new Error('No se puede consultar tu suscripción.');

    let customerId = record?.stripe_customer_id as string | null | undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({ email: user.email, metadata: { supabase_user_id: user.id } }, { idempotencyKey: `customer-${user.id}` });
      customerId = customer.id;
      const { error: saveError } = await admin.from('subscriptions').upsert({ user_id: user.id, stripe_customer_id: customerId, plan_id: 'free', status: 'none', product_limit: 5, updated_at: new Date().toISOString() }, { onConflict: 'user_id' });
      if (saveError) throw new Error('No se ha podido preparar el pago.');
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
    if (!siteUrl) throw new Error('Falta configurar NEXT_PUBLIC_SITE_URL en Netlify.');

    if (purchaseId === 'audit') {
      const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer: customerId,
        client_reference_id: user.id,
        line_items: [{ price: auditPriceId(), quantity: 1 }],
        allow_promotion_codes: true,
        success_url: `${siteUrl}/dashboard?checkout=audit-success`,
        cancel_url: `${siteUrl}/dashboard?checkout=cancelled`,
        metadata: { user_id: user.id, purchase_type: 'audit', product_limit: String(ONE_TIME_AUDIT.productLimit) },
      }, { idempotencyKey: `audit-checkout-${user.id}-${new Date().toISOString().slice(0, 13)}` });
      if (!session.url) throw new Error('Stripe no ha devuelto una página de pago.');
      return json({ url: session.url });
    }

    if (billingStatus(record).planId !== 'free' && customerId) {
      const portal = await stripe.billingPortal.sessions.create({ customer: customerId, return_url: `${siteUrl}/dashboard` });
      return json({ url: portal.url });
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      client_reference_id: user.id,
      line_items: [{ price: stripePriceId(purchaseId), quantity: 1 }],
      allow_promotion_codes: true,
      success_url: `${siteUrl}/dashboard?checkout=success`,
      cancel_url: `${siteUrl}/dashboard?checkout=cancelled`,
      metadata: { user_id: user.id, plan_id: purchaseId },
      subscription_data: { metadata: { user_id: user.id, plan_id: purchaseId } },
    }, { idempotencyKey: `checkout-${user.id}-${purchaseId}-${new Date().toISOString().slice(0, 13)}` });
    if (!session.url) throw new Error('Stripe no ha devuelto una página de pago.');
    return json({ url: session.url });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : 'No se ha podido abrir el pago.' }, 503);
  }
}
