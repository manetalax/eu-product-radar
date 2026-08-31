begin;

create table if not exists public.ai_usage_events (
  id bigint generated always as identity primary key,
  task text not null check (task in ('regulatory_agent','product_text','product_vision','product_document')),
  provider text not null check (provider in ('siliconflow','openai')),
  model text not null check (length(btrim(model)) between 1 and 200),
  success boolean not null default true,
  premium boolean not null default false,
  fallback boolean not null default false,
  latency_ms integer not null default 0 check (latency_ms between 0 and 600000),
  created_at timestamptz not null default now()
);

alter table public.ai_usage_events enable row level security;
alter table public.ai_usage_events force row level security;
revoke all on public.ai_usage_events from public, anon, authenticated;

create index if not exists ai_usage_events_created_idx on public.ai_usage_events(created_at desc);
create index if not exists ai_usage_events_task_provider_idx on public.ai_usage_events(task, provider, created_at desc);

comment on table public.ai_usage_events is
  'Server-only operational telemetry for AI routing. Stores no prompts, product data, document content, user identifiers or customer PII.';

commit;
