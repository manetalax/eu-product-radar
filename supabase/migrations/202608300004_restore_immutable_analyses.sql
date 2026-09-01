begin;

-- Analyses are immutable audit snapshots. Re-analysis must create a new row so
-- quota accounting, history and generated reports remain reproducible.
revoke update on table public.analyses from authenticated;
revoke update (products) on table public.analyses from authenticated;
drop policy if exists analyses_update_own on public.analyses;

-- Cover the user_id foreign key used during account deletion and ownership checks.
create index if not exists analysis_evidence_user_idx
  on public.analysis_evidence(user_id);

comment on table public.analyses is
  'Immutable analysis snapshots. Re-analysis inserts a new analysis and consumes quota.';

commit;
