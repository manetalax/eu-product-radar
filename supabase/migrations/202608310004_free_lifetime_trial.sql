begin;

create table if not exists public.free_account_usage (
  user_id uuid primary key references auth.users(id) on delete cascade,
  product_count integer not null default 0 check (product_count >= 0),
  updated_at timestamptz not null default now()
);

alter table public.free_account_usage enable row level security;
alter table public.free_account_usage force row level security;
revoke all on public.free_account_usage from public, anon, authenticated;
grant select on public.free_account_usage to authenticated;

drop policy if exists free_account_usage_select_own on public.free_account_usage;
create policy free_account_usage_select_own
on public.free_account_usage for select to authenticated
using ((select auth.uid()) = user_id);

insert into public.free_account_usage(user_id, product_count, updated_at)
select user_id, sum(product_count)::integer, now()
from public.analyses
group by user_id
on conflict (user_id) do update
set product_count = greatest(public.free_account_usage.product_count, excluded.product_count),
    updated_at = now();

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

  select exists (
    select 1
    from public.subscriptions s
    where s.user_id = new.user_id
      and s.plan_id <> 'free'
      and s.status in ('active','trialing')
      and (s.current_period_end is null or s.current_period_end > new.created_at)
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

comment on table public.free_account_usage is 'Consumo total de la prueba gratuita: exactamente cinco productos por cuenta, sin reinicio mensual.';
comment on function public.enforce_free_monthly_product_quota() is 'Permite cinco productos gratuitos totales por cuenta; las suscripciones pagadas activas no usan la cuota gratuita.';

commit;
