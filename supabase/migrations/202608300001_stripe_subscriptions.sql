-- Suscripciones gestionadas exclusivamente desde Stripe mediante webhook firmado.
begin;

create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  plan_id text not null default 'free' check (plan_id in ('free','starter','growth','pro','business')),
  status text not null default 'none',
  product_limit integer not null default 5 check (product_limit in (5,50,150,500,2000)),
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
alter table public.subscriptions force row level security;
revoke all on public.subscriptions from public, anon, authenticated;
grant select on public.subscriptions to authenticated;
create policy subscriptions_select_own on public.subscriptions for select to authenticated
using ((select auth.uid()) = user_id);

create table public.stripe_webhook_events (
  event_id text primary key,
  event_type text not null,
  processed_at timestamptz not null default now()
);
alter table public.stripe_webhook_events enable row level security;
alter table public.stripe_webhook_events force row level security;
revoke all on public.stripe_webhook_events from public, anon, authenticated;

create or replace function public.enforce_free_monthly_product_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  quota_limit integer := 5;
  incoming_count integer;
  month_start date;
  accepted_count integer;
begin
  if new.user_id is distinct from auth.uid() then
    raise exception 'quota_identity_mismatch' using errcode = '42501';
  end if;

  select s.product_limit into quota_limit
  from public.subscriptions s
  where s.user_id = new.user_id
    and s.status in ('active','trialing')
    and (s.current_period_end is null or s.current_period_end > new.created_at);
  quota_limit := coalesce(quota_limit, 5);

  incoming_count := jsonb_array_length(new.products);
  if incoming_count > quota_limit then
    raise exception 'monthly_product_limit_exceeded' using errcode = 'P0001';
  end if;

  month_start := date_trunc('month', new.created_at at time zone 'UTC')::date;
  insert into public.monthly_product_usage(user_id, period_start, product_count, updated_at)
  values (new.user_id, month_start, incoming_count, now())
  on conflict (user_id, period_start) do update
    set product_count = public.monthly_product_usage.product_count + excluded.product_count,
        updated_at = now()
    where public.monthly_product_usage.product_count + excluded.product_count <= quota_limit
  returning product_count into accepted_count;

  if accepted_count is null then
    raise exception 'monthly_product_limit_exceeded' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_free_monthly_product_quota() from public, anon, authenticated;
comment on table public.subscriptions is 'Estado de acceso sincronizado desde Stripe. Los clientes solo pueden leer su propia fila.';
comment on table public.stripe_webhook_events is 'Control de idempotencia de webhooks Stripe; sin acceso desde el cliente.';
commit;
