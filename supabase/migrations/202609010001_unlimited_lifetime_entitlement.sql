begin;

create table if not exists public.unlimited_lifetime_entitlements (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text not null,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text unique,
  status text not null default 'active' check (status in ('active','revoked')),
  granted_at timestamptz not null default now(),
  revoked_at timestamptz,
  updated_at timestamptz not null default now()
);

alter table public.unlimited_lifetime_entitlements enable row level security;
alter table public.unlimited_lifetime_entitlements force row level security;
revoke all on public.unlimited_lifetime_entitlements from public, anon, authenticated;
grant select on public.unlimited_lifetime_entitlements to authenticated;

drop policy if exists unlimited_lifetime_entitlements_select_own on public.unlimited_lifetime_entitlements;
create policy unlimited_lifetime_entitlements_select_own
on public.unlimited_lifetime_entitlements for select to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.enforce_free_monthly_product_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  incoming_count integer;
  accepted_count integer;
  has_paid_access boolean := false;
begin
  if new.user_id is distinct from auth.uid() then
    raise exception 'quota_identity_mismatch' using errcode = '42501';
  end if;

  incoming_count := jsonb_array_length(new.products);

  select (
    exists (
      select 1
      from public.subscriptions s
      where s.user_id = new.user_id
        and s.plan_id <> 'free'
        and s.status in ('active','trialing')
        and (s.current_period_end is null or s.current_period_end > new.created_at)
    )
    or exists (
      select 1
      from public.unlimited_lifetime_entitlements e
      where e.user_id = new.user_id
        and e.status = 'active'
    )
  ) into has_paid_access;

  if has_paid_access then
    return new;
  end if;

  if incoming_count > 5 then
    raise exception 'free_account_product_limit_exceeded' using errcode = 'P0001';
  end if;

  insert into public.free_account_usage(user_id, product_count, updated_at)
  values (new.user_id, incoming_count, now())
  on conflict (user_id) do update
    set product_count = public.free_account_usage.product_count + excluded.product_count,
        updated_at = now()
    where public.free_account_usage.product_count + excluded.product_count <= 5
  returning product_count into accepted_count;

  if accepted_count is null then
    raise exception 'free_account_product_limit_exceeded' using errcode = 'P0001';
  end if;

  return new;
end;
$$;

revoke all on function public.enforce_free_monthly_product_quota() from public, anon, authenticated;

comment on table public.unlimited_lifetime_entitlements is 'Entitlement permanente de ImportVerifier Unlimited concedido exclusivamente tras un pago Stripe Lifetime validado; una devolución completa puede revocarlo.';
comment on function public.enforce_free_monthly_product_quota() is 'Permite cinco productos gratuitos totales por cuenta; las suscripciones pagadas activas y Unlimited Lifetime activo no consumen la cuota gratuita.';

commit;
