-- Migra el plan interno starter a la oferta pública Unlimited de ImportVerifier.
-- Mantiene los IDs legacy growth/pro/business para poder leer suscripciones históricas.
begin;

alter table public.subscriptions
  drop constraint if exists subscriptions_product_limit_check;

alter table public.subscriptions
  add constraint subscriptions_product_limit_check
  check (product_limit between 5 and 1000000);

-- Starter es el ID interno estable de Unlimited. Las filas activas existentes deben
-- recibir el mismo fair-use ceiling que la aplicación/webhook actual.
update public.subscriptions
set product_limit = 1000000,
    updated_at = now()
where plan_id = 'starter'
  and status in ('active', 'trialing');

comment on column public.subscriptions.product_limit is
  'Guardrail técnico. starter representa Unlimited y usa 1000000 como techo antiabuso, no como cuota comercial anunciada.';

commit;
