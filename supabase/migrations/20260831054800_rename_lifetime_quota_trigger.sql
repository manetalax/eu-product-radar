begin;

alter function public.enforce_free_monthly_product_quota()
  rename to enforce_free_lifetime_product_quota;

alter trigger analyses_enforce_free_monthly_product_quota
  on public.analyses
  rename to analyses_enforce_free_lifetime_product_quota;

comment on function public.enforce_free_lifetime_product_quota() is
  'Permite exactamente cinco productos gratuitos totales por cuenta; no existe reinicio mensual.';

commit;
