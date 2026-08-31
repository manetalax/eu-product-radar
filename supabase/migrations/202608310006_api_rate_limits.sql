begin;

create table if not exists public.api_rate_limits (
  user_id uuid not null references auth.users(id) on delete cascade,
  route text not null check (length(route) between 1 and 80),
  window_start timestamptz not null,
  request_count integer not null default 0 check (request_count >= 0),
  updated_at timestamptz not null default now(),
  primary key (user_id, route)
);

alter table public.api_rate_limits enable row level security;
alter table public.api_rate_limits force row level security;
revoke all on public.api_rate_limits from public, anon, authenticated;

create or replace function public.consume_api_rate_limit(
  p_user_id uuid,
  p_route text,
  p_limit integer,
  p_window_seconds integer
)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  now_utc timestamptz := clock_timestamp();
  accepted_count integer;
begin
  if p_user_id is null or p_route is null or length(p_route) < 1 then
    return false;
  end if;
  if p_limit < 1 or p_limit > 10000 or p_window_seconds < 1 or p_window_seconds > 86400 then
    return false;
  end if;

  insert into public.api_rate_limits(user_id, route, window_start, request_count, updated_at)
  values (p_user_id, p_route, now_utc, 1, now_utc)
  on conflict (user_id, route) do update
    set window_start = case
          when public.api_rate_limits.window_start <= now_utc - make_interval(secs => p_window_seconds)
          then now_utc else public.api_rate_limits.window_start end,
        request_count = case
          when public.api_rate_limits.window_start <= now_utc - make_interval(secs => p_window_seconds)
          then 1 else public.api_rate_limits.request_count + 1 end,
        updated_at = now_utc
    where public.api_rate_limits.window_start <= now_utc - make_interval(secs => p_window_seconds)
       or public.api_rate_limits.request_count < p_limit
  returning request_count into accepted_count;

  return accepted_count is not null and accepted_count <= p_limit;
end;
$$;

revoke all on function public.consume_api_rate_limit(uuid, text, integer, integer) from public, anon, authenticated;

create index if not exists api_rate_limits_updated_idx on public.api_rate_limits(updated_at);
comment on table public.api_rate_limits is 'Server-only technical anti-abuse counters. Not a commercial product quota.';
comment on function public.consume_api_rate_limit(uuid, text, integer, integer) is 'Atomically consumes a per-account fixed-window technical rate limit.';

commit;
