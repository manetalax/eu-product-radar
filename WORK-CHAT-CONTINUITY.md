# ImportVerifier — Chat ↔ Work continuity protocol

## Canonical project
- Production: `https://importverifier.netlify.app/`
- Repository: `manetalax/eu-product-radar`
- PR: `#4`
- Branch: `feat/import-rules-verifier-branding`
- Never create a replacement project. Never merge PR #4 without explicit owner instruction.

## Read order
1. This file.
2. `WORK-HANDOFF-IMPORTVERIFIER.md`.
3. Exact PR #4 HEAD + exact-HEAD GitHub CI + `netlify/importverifier/deploy-preview`.
4. `AGENTS.md`.

## Operating rule
Continue autonomously through actionable work. If one item is BLOCKED EXTERNAL, record it and continue elsewhere. Do not repeat DONE sweeps. Batch browser/credential/device acceptance for the end.

## Commercial invariants
- Exactly 5 free products total per account, lifetime/cumulative, no card/reset.
- One feature entitlement: ImportVerifier Unlimited.
- Monthly EUR 9.95, annual EUR 89.95, Lifetime EUR 149 one-time; identical Unlimited features.
- Internal compatibility plan ID remains `starter`.
- Monthly/annual are recurring. Lifetime is persistent and only comes from canonical paid Stripe Checkout.
- Full refund or active/lost dispute removes Lifetime access; won dispute restores only while the underlying charge remains collected.
- Historical `one_time_audits` never grant entitlement.
- Customer-facing AI brand is ImportVerifier AI; production cost policy is fail-closed `AI_COST_POLICY=free_only`.

## Canonical Stripe live prices
- Monthly: `price_1UAJy5HJnO8odw1Mn4jMVjFt`.
- Annual: `price_1UAjP0HJnO8odw1M7RBK8jsR`.
- Lifetime: `price_1UAjP8HJnO8odw1MmSXdkNIh`.

## DONE — do not repeat
- Five-product lifetime free quota, atomic/idempotent creation, isolated histories/RLS.
- Monthly/annual/Lifetime Checkout architecture and three live Stripe prices.
- Lifetime production migration with forced RLS/own-row read policy.
- Live-mode webhook gate, current-state subscription sync, refund/dispute lifecycle and Lifetime replay/order hardening.
- Landing/FAQ/Schema.org monthly/annual/Lifetime in ES/EN/FR/DE/IT/PT and auth billing-option continuity.
- Retired audit entitlement removal and legacy recurring-plan normalization.
- Universal CSV/XLS/XLSX/document/text/photo ingestion, HEIC/HEIF, prompt-injection/upload boundaries.
- EU deterministic regulatory engine, Evidence, Regulatory Twin and fail-closed Regulatory Impact Radar architecture.
- Official regulatory/evidence URL allowlists and persistence/render/export/AI-context sanitization.
- PWA private-cache hardening, localized start/offline/shortcuts and iOS/mobile upload/export safeguards.
- Premium localized PDF/XLSX with evidence traceability and spreadsheet formula-injection protection.
- Static localized landing, recovery surfaces, SEO, security headers and production release guard.
- Shopify/Amazon/Etsy architecture exists but direct integrations remain inactive pending official credentials.
- Account deletion current-state Stripe cancellation, Checkout duplicate-subscription preflight and active/trialing-only recurring Checkout confirmation.
- Free/Lifetime quota period semantics report `lifetime`; recurring Unlimited reports `subscription`.

## DONE — 2026-09-01 current execution
- Reconfirmed starting HEAD `5a68123fb6a1df8798e445662e1f9d6007898f4f`: exact release check **#1732 SUCCESS** and correct `netlify/importverifier/deploy-preview` **SUCCESS/READY**.
- **Production AI rate-limit permission repaired:** `consume_api_rate_limit(uuid,text,integer,integer)` had EXECUTE revoked not only from browser roles but also from `service_role`, while `lib/api-rate-limit.ts` invokes it through the admin client. This made the limiter fail closed even for valid server calls. Production migration `20260901090429_grant_api_rate_limit_service_role` now grants EXECUTE only to `service_role`/database owner and explicitly keeps `public`, `anon` and `authenticated` denied. Repo migration: `supabase/migrations/20260901090429_grant_api_rate_limit_service_role.sql`; regression: `tests/api-rate-limit-privilege.test.ts`.
- **Production internal-table server privileges repaired:** Supabase/PostgREST `service_role` lacked object-level privileges required by billing, AI telemetry and Radar despite RLS/server intent. Production migration `20260901090719_grant_server_internal_table_privileges` grants only the operations actually used: `subscriptions` SELECT/INSERT/UPDATE; `unlimited_lifetime_entitlements` SELECT/INSERT/UPDATE; `ai_usage_events` SELECT/INSERT; `regulatory_change_events` SELECT/INSERT/UPDATE; `stripe_webhook_events` SELECT/INSERT/UPDATE. No DELETE or browser grants were added. A transaction under `SET LOCAL ROLE service_role` successfully read all affected server tables after migration. Regression: `tests/server-internal-table-privileges.test.ts`.
- Supabase security advisor after the repair did not expose these internal objects to clients. Existing external warning remains leaked-password protection disabled; intentional no-client-policy internal tables remain INFO only.
- **Stripe same-event webhook concurrency hardened:** a duplicate delivery arriving while the first handler was still `processing` could previously execute the same handler in parallel. The webhook ledger now serializes execution. A recent in-flight duplicate returns non-2xx (409) so Stripe keeps retry pressure if the first worker crashes. A `processing` row older than five minutes can be recovered only by one retry through an atomic conditional claim on `status=processing` + stale `updated_at`. Completed events remain idempotent duplicates. Regression: `tests/stripe-webhook-concurrency.test.ts`.
- CI caught two stale account-deletion test expectations (`storedSubscriptionId`, literal `4096`/404 semantics). Production logic was already correct; tests were aligned to current `subscriptionId`, `resource_missing`, and `4 * 1024` contract. Fix commit: `186301bdf9d9f902d38b363dc68923e4b790e3ed`.
- Durable architecture handoff updated in commit `43ba81358f451b4f23e242f3935316a97058c925` with the service-role privilege model and webhook serialization/recovery contract.
- **Latest verified functional/test HEAD:** `186301bdf9d9f902d38b363dc68923e4b790e3ed`.
- GitHub `ImportVerifier release check` **#1753 SUCCESS** on exact `186301bd...`: `npm ci`, full tests, typecheck and production build all passed.
- Correct `netlify/importverifier/deploy-preview` on exact `186301bd...` is **SUCCESS/READY** at `https://deploy-preview-4--importverifier.netlify.app`.
- PR #4 remained open and unmerged at verification. This handoff commit creates a newer docs-only HEAD; reconfirm its exact CI and Netlify status before treating the final repository HEAD as fully verified.

## Production facts
- Supabase project `hfuwwjdcyudflamwwnon` is the production project used by current migrations.
- Lifetime entitlement migration is applied; pre-sale entitlement baseline was 0 rows.
- Production migrations `20260901090429` and `20260901090719` restore the minimum required server-only RPC/table privileges while keeping client boundaries closed.
- Stripe live product has all three canonical prices and the canonical webhook listens to Checkout/subscriptions/refunds/disputes.
- Radar remains non-live; keep `REGULATORY_RADAR_LIVE=false` until official ingestion persists events.
- Supabase leaked-password protection remains disabled externally.

## NEXT — execute without asking
1. Reconfirm exact final HEAD after this handoff commit, exact GitHub release check and correct `netlify/importverifier/deploy-preview`; repair any regression immediately.
2. Continue only genuinely new security/billing/reliability findings. In particular, verify new server-side PostgREST/RPC paths retain minimum privileges without broadening browser access; do not repeat the completed privilege sweep unless code/migrations change.
3. Production acceptance when browser/payment conditions permit: monthly → webhook → Unlimited → Portal/cancel; annual equivalent; Lifetime paid → persistent Unlimited → controlled refund/dispute lifecycle.
4. Fresh-account acceptance: signup/login → five-product sample accepted → sixth rejected → isolated history → premium PDF/XLSX.
5. Obtain TTFB/LCP/TBT/CLS/resource evidence before performance changes.
6. Inspect PDF typography/overflow only against a real multi-product output.
7. Keep Radar disabled until same strong ingest secret exists in runtime/scheduler and real official EUR-Lex ingestion persists events.
8. Review Supabase leaked-password protection/CAPTCHA when console capability is available.
9. Keep EU the only active market and direct marketplace connectors inactive until legitimate credentials exist.

## BLOCKED EXTERNAL
- Final production env/promotion with complete legal/provider, runtime and free-only AI secrets.
- Controlled real monthly/annual/Lifetime Checkout/Portal/cancel/refund/dispute transactions.
- Strong shared Radar ingest secret + first official EUR-Lex ingestion.
- Supabase Auth leaked-password/CAPTCHA controls.
- Fresh non-owner SMTP signup/reset acceptance.
- Physical iPhone/iPad/Safari/PWA QA.
- Official Shopify/Amazon/Etsy credentials/scopes.
- Detailed browser performance evidence and real multi-product PDF visual QA.

## Definition of finished
Do not call ImportVerifier fully launched until exact current CI and canonical production are green; release config passes; fresh-account five-free/sixth-rejection/history/PDF/XLSX passes; free-only AI is proven; all three paid lifecycles and reversals pass; legal/provider data is truthful; Radar claims match persisted official ingestion; Auth/SMTP controls pass; and desktop/iPhone/iPad/PWA QA passes.
