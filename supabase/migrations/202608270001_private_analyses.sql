-- Primera instalación: ejecutar completo en SQL Editor de Supabase.
-- No borra tablas ni datos. Todos los cambios se aplican en una transacción.
begin;

create function public.valid_radar_products(items jsonb)
returns boolean language plpgsql immutable set search_path = '' as $$
declare item jsonb; field text;
begin
  if jsonb_typeof(items) <> 'array' then return false; end if;
  if jsonb_array_length(items) < 1 or jsonb_array_length(items) > 1000 then return false; end if;
  for item in select value from jsonb_array_elements(items) loop
    if jsonb_typeof(item) <> 'object' then return false; end if;
    for field in select unnest(array['name','manufacturer','responsible','warning']) loop
      if jsonb_typeof(item -> field) is distinct from 'string' or length(item ->> field) > 1000 then return false; end if;
    end loop;
    if length(btrim(item ->> 'name')) = 0 then return false; end if;
  end loop;
  return true;
end;
$$;

create table public.analyses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  filename text not null check (length(btrim(filename)) between 1 and 120),
  products jsonb not null check (public.valid_radar_products(products)) check (octet_length(products::text) <= 2097152),
  product_count integer generated always as (jsonb_array_length(products)) stored,
  rule_version text not null default 'missing-fields-v1' check (rule_version = 'missing-fields-v1'),
  created_at timestamptz not null default now()
);

alter table public.analyses enable row level security;
alter table public.analyses force row level security;
create index analyses_user_created_idx on public.analyses(user_id, created_at desc, id desc);

-- Permisos explícitos: funciona con "Automatically expose new tables" desactivado.
revoke all on public.analyses from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select, insert on public.analyses to authenticated;
revoke all on function public.valid_radar_products(jsonb) from public, anon;
grant execute on function public.valid_radar_products(jsonb) to authenticated;

create policy analyses_select_own on public.analyses for select to authenticated
using ((select auth.uid()) = user_id);
create policy analyses_insert_own on public.analyses for insert to authenticated
with check ((select auth.uid()) = user_id);

comment on table public.analyses is 'Catálogos privados. Comprobación de campos presentes, no evaluación normativa. Sin acceso anónimo ni edición de ejecuciones.';
commit;
