begin;

create unique index if not exists analyses_id_user_id_unique_idx
  on public.analyses(id, user_id);

alter table public.analysis_evidence
  drop constraint if exists analysis_evidence_analysis_owner_fk;

alter table public.analysis_evidence
  add constraint analysis_evidence_analysis_owner_fk
  foreign key (analysis_id, user_id)
  references public.analyses(id, user_id)
  on delete cascade;

comment on constraint analysis_evidence_analysis_owner_fk on public.analysis_evidence is
  'Defense in depth: evidence can only belong to the same user as its parent analysis.';

commit;
