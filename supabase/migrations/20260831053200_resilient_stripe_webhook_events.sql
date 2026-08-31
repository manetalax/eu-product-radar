begin;

alter table public.stripe_webhook_events
  add column if not exists status text not null default 'processing'
    check (status in ('processing', 'processed')),
  add column if not exists updated_at timestamptz not null default now();

alter table public.stripe_webhook_events
  alter column processed_at drop not null,
  alter column processed_at drop default;

-- Rows persisted by the previous implementation only survived after successful handling.
update public.stripe_webhook_events
set status = 'processed',
    processed_at = coalesce(processed_at, now()),
    updated_at = now()
where status = 'processing';

comment on column public.stripe_webhook_events.status is
  'processing = event may be retried safely; processed = handler completed successfully.';

commit;
