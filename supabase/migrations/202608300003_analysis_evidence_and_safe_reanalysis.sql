begin;

create table if not exists public.analysis_evidence (
  id uuid primary key default gen_random_uuid(),
  analysis_id uuid not null references public.analyses(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  product_index integer not null check (product_index >= 0 and product_index < 1000),
  evidence_key text not null check (length(btrim(evidence_key)) between 1 and 120),
  status text not null check (status in ('available','pending','not_applicable')),
  note text not null default '' check (length(note) <= 2000),
  updated_at timestamptz not null default now(),
  unique (analysis_id, product_index, evidence_key)
);

alter table public.analysis_evidence enable row level security;
alter table public.analysis_evidence force row level security;
revoke all on public.analysis_evidence from public, anon, authenticated;
grant select, insert, update, delete on public.analysis_evidence to authenticated;

create policy analysis_evidence_select_own on public.analysis_evidence for select to authenticated using ((select auth.uid()) = user_id);
create policy analysis_evidence_insert_own on public.analysis_evidence for insert to authenticated with check ((select auth.uid()) = user_id and exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = (select auth.uid())));
create policy analysis_evidence_update_own on public.analysis_evidence for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id and exists (select 1 from public.analyses a where a.id = analysis_id and a.user_id = (select auth.uid())));
create policy analysis_evidence_delete_own on public.analysis_evidence for delete to authenticated using ((select auth.uid()) = user_id);

revoke update on public.analyses from authenticated;
grant update(products) on public.analyses to authenticated;
create policy analyses_update_own on public.analyses for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create index if not exists analysis_evidence_analysis_idx on public.analysis_evidence(analysis_id, product_index);

commit;
