-- Pago único para una auditoría profesional de un catálogo de hasta 30 productos.
begin;

create table public.one_time_audits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stripe_checkout_session_id text not null unique,
  stripe_payment_intent_id text unique,
  status text not null default 'paid' check (status in ('paid','refunded','void')),
  product_limit integer not null default 30 check (product_limit = 30),
  purchased_at timestamptz not null default now(),
  consumed_at timestamptz,
  analysis_id uuid unique references public.analyses(id) on delete set null deferrable initially deferred,
  created_at timestamptz not null default now(),
  check ((consumed_at is null and analysis_id is null) or (consumed_at is not null and analysis_id is not null))
);

create index one_time_audits_available_idx
on public.one_time_audits (user_id, purchased_at)
where status = 'paid' and consumed_at is null;

alter table public.one_time_audits enable row level security;
alter table public.one_time_audits force row level security;
revoke all on public.one_time_audits from public, anon, authenticated;
grant select on public.one_time_audits to authenticated;
create policy one_time_audits_select_own on public.one_time_audits
for select to authenticated
using ((select auth.uid()) = user_id);

create or replace function public.enforce_free_monthly_product_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  quota_limit integer;
  incoming_count integer;
  month_start date;
  accepted_count integer;
  available_audit_id uuid;
  audit_limit integer;
begin
  if new.user_id is distinct from auth.uid() then
    raise exception 'quota_identity_mismatch' using errcode = '42501';
  end if;

  incoming_count := jsonb_array_length(new.products);

  select s.product_limit into quota_limit
  from public.subscriptions s
  where s.user_id = new.user_id
    and s.status in ('active','trialing')
    and (s.current_period_end is null or s.current_period_end > new.created_at);

  if quota_limit is null then
    select a.id, a.product_limit into available_audit_id, audit_limit
    from public.one_time_audits a
    where a.user_id = new.user_id
      and a.status = 'paid'
      and a.consumed_at is null
    order by a.purchased_at, a.id
    for update skip locked
    limit 1;

    if available_audit_id is not null then
      if incoming_count > audit_limit then
        raise exception 'one_time_audit_product_limit_exceeded' using errcode = 'P0001';
      end if;
      update public.one_time_audits
      set consumed_at = new.created_at, analysis_id = new.id
      where id = available_audit_id and consumed_at is null;
      if not found then
        raise exception 'one_time_audit_already_consumed' using errcode = 'P0001';
      end if;
      return new;
    end if;
    quota_limit := 5;
  end if;

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
comment on table public.one_time_audits is 'Compras de auditoría profesional de pago único. Solo Stripe puede crear acceso; el cliente solo lee sus propias compras.';
commit;