begin;

create table if not exists public.regulatory_change_events (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null unique check (length(fingerprint) between 16 and 128),
  source_name text not null check (length(btrim(source_name)) between 1 and 160),
  source_url text not null check (source_url ~ '^https://'),
  title text not null check (length(btrim(title)) between 1 and 500),
  summary text not null default '' check (length(summary) <= 6000),
  published_at timestamptz,
  effective_at timestamptz,
  severity text not null default 'review' check (severity in ('info','review','action')),
  affected_keywords text[] not null default '{}',
  official_reference text not null default '' check (length(official_reference) <= 240),
  active boolean not null default true,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.regulatory_change_events enable row level security;
alter table public.regulatory_change_events force row level security;
revoke all on public.regulatory_change_events from public, anon, authenticated;

create index if not exists regulatory_change_events_active_published_idx
  on public.regulatory_change_events(active, published_at desc nulls last);
create index if not exists regulatory_change_events_effective_idx
  on public.regulatory_change_events(effective_at desc nulls last);

comment on table public.regulatory_change_events is
  'Server-managed official regulatory change feed used by ImportVerifier Impact Radar. No direct client access; authenticated API reads through the server admin client.';

commit;
