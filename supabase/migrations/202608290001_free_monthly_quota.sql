-- Añade una cuota atómica de 5 productos por mes UTC y por cuenta gratuita.
-- Ejecutar después de 202608270001_private_analyses.sql.
begin;

create table public.monthly_product_usage (
  user_id uuid not null references auth.users(id) on delete cascade,
  period_start date not null,
  product_count integer not null default 0 check (product_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, period_start)
);

alter table public.monthly_product_usage enable row level security;
alter table public.monthly_product_usage force row level security;
revoke all on public.monthly_product_usage from public, anon, authenticated;
grant select on public.monthly_product_usage to authenticated;

create policy monthly_product_usage_select_own
on public.monthly_product_usage for select to authenticated
using ((select auth.uid()) = user_id);

-- Conserva el consumo ya realizado antes de activar la cuota. Si supera cinco,
-- la cuenta no podrá guardar más productos hasta el siguiente mes UTC.
insert into public.monthly_product_usage(user_id, period_start, product_count)
select user_id, date_trunc('month', created_at at time zone 'UTC')::date, sum(product_count)::integer
from public.analyses
group by user_id, date_trunc('month', created_at at time zone 'UTC')::date;

create function public.enforce_free_monthly_product_quota()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  quota_limit constant integer := 5;
  incoming_count integer;
  month_start date;
  accepted_count integer;
begin
  if new.user_id is distinct from auth.uid() then
    raise exception 'quota_identity_mismatch' using errcode = '42501';
  end if;

  incoming_count := jsonb_array_length(new.products);
  if incoming_count > quota_limit then
    raise exception 'free_monthly_product_limit_exceeded' using errcode = 'P0001';
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
    raise exception 'free_monthly_product_limit_exceeded' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

revoke all on function public.enforce_free_monthly_product_quota() from public, anon, authenticated;

create trigger analyses_enforce_free_monthly_product_quota
before insert on public.analyses
for each row execute function public.enforce_free_monthly_product_quota();

comment on table public.monthly_product_usage is 'Consumo mensual UTC del plan gratuito. Solo lectura para la cuenta propietaria.';
comment on function public.enforce_free_monthly_product_quota() is 'Impide superar cinco productos guardados por cuenta y mes UTC, incluso con solicitudes simultáneas.';
commit;
