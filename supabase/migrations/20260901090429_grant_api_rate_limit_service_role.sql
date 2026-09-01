begin;

-- The rate-limit RPC is intentionally server-only. The API routes call it through
-- createAdminClient(), which authenticates as service_role. Keep browser roles
-- unable to invoke this SECURITY DEFINER function while restoring the explicit
-- server privilege required after revoking PUBLIC execution.
grant execute on function public.consume_api_rate_limit(uuid, text, integer, integer) to service_role;
revoke execute on function public.consume_api_rate_limit(uuid, text, integer, integer) from public, anon, authenticated;

commit;
