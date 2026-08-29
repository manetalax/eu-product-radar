-- Convierte Europa en un módulo explícito y deja el esquema preparado para
-- añadir mercados ISO sin duplicar cuentas, catálogos o tablas.
begin;

alter table public.analyses
  add column market_code text not null default 'EU';

alter table public.analyses
  add constraint analyses_market_code_format_check
  check (market_code ~ '^[A-Z]{2}$') not valid;

alter table public.analyses
  validate constraint analyses_market_code_format_check;

alter table public.analyses
  drop constraint if exists analyses_rule_version_check;

alter table public.analyses
  alter column rule_version set default 'market-readiness-v2';

alter table public.analyses
  add constraint analyses_rule_version_check
  check (rule_version in ('missing-fields-v1', 'market-readiness-v2')) not valid;

alter table public.analyses
  validate constraint analyses_rule_version_check;

create index analyses_user_market_created_idx
  on public.analyses(user_id, market_code, created_at desc, id desc);

comment on column public.analyses.market_code is 'Código de mercado de dos letras. EU es el módulo operativo inicial; el esquema admite nuevos mercados sin migrar datos históricos.';
comment on column public.analyses.rule_version is 'Versión inmutable de las reglas utilizadas. Se conservan ejecuciones legacy para reproducibilidad.';

commit;
