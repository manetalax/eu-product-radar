begin;

-- Server-side Supabase clients authenticate as service_role through PostgREST.
-- Internal tables stay inaccessible to browser roles, but the server must retain
-- the minimum CRUD privileges actually used by billing, AI telemetry and Radar.
grant select, insert, update on table public.subscriptions to service_role;
grant select, insert, update on table public.unlimited_lifetime_entitlements to service_role;
grant select, insert on table public.ai_usage_events to service_role;
grant select, insert, update on table public.regulatory_change_events to service_role;
grant select, insert, update on table public.stripe_webhook_events to service_role;

commit;
