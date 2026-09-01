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
- Reconfirmed starting documented HEAD `be6d507a0226138b3200c222eaa68556a296986f`: exact GitHub release checks **#1755/#1756 SUCCESS** and correct `netlify/importverifier/deploy-preview` **SUCCESS/READY**.
- Production AI rate-limit and internal-table `service_role` privilege repairs remain applied; browser roles stay closed. Do not repeat this sweep unless a new server path or migration changes the privilege surface.
- Stripe same-event webhook execution serialization/stale recovery remains in place and covered.
- **Billing request boundary tightened:** Checkout and synchronous Checkout confirmation use a 4 KiB JSON body ceiling rather than the generic multi-megabyte API limit.
- **Checkout confirmation authority tightened:** recurring confirmation derives monthly/annual from the current Stripe subscription item price after re-reading Stripe, not mutable Checkout metadata.
- **Billing Portal current-state check tightened:** Portal is created only when Stripe currently has a non-terminal recurring subscription for that customer; Lifetime-only customers no longer receive a misleading subscription-management destination.
- **Stripe customer ownership tightened:** recurring subscription synchronization requires an already persisted `stripe_customer_id` → user ownership row. Mutable subscription metadata cannot attach an unknown Stripe customer to an ImportVerifier account; conflicting metadata is rejected.
- **Post-auth billing-option recovery added:** a fresh authenticated `plan_interest` in Supabase user metadata can recover annual/Lifetime for the immediate dashboard Checkout when the client omits `billingOption`; the intent is strictly validated, expires after 15 minutes, explicit request billing remains authoritative and stale/invalid intent falls back to monthly. Regression: `tests/auth-billing-option-continuity.test.ts`.
- **PWA public-cache credential isolation tightened:** public landing navigations that may enter the shared offline shell are now fetched through `credentials: 'omit'` before caching rather than reusing a possibly cookie-bearing navigation request. Cache generation rotated to `importverifier-shell-v7`, evicting older shell behavior. Regression: `tests/pwa-cache-boundary.test.ts`. Functional commits: `67eb84ff3976ff0678fcd7bf2762dc2a9938ecbc`, `3627545944c3e1ad4837ef4444cbce0fa6ea1edf`.
- Exact release check **#1791** for functional/test HEAD `3627545944c3e1ad4837ef4444cbce0fa6ea1edf` was running at handoff time; `npm ci` had passed and full tests were in progress. Do not infer green until the exact run finishes.
- PR #4 remained open, mergeable and unmerged at verification. This documentation commit creates a newer docs-only HEAD; reconfirm exact CI and `netlify/importverifier/deploy-preview` on the final HEAD before treating it as verified.

## Production facts
- Supabase project `hfuwwjdcyudflamwwnon` is the production project used by current migrations.
- Lifetime entitlement migration is applied; pre-sale entitlement baseline was 0 rows.
- Production migrations `20260901090429` and `20260901090719` restore the minimum required server-only RPC/table privileges while keeping client boundaries closed.
- Stripe live product has all three canonical prices and the canonical webhook listens to Checkout/subscriptions/refunds/disputes.
- Radar remains non-live; keep `REGULATORY_RADAR_LIVE=false` until official ingestion persists events.
- Supabase leaked-password protection remains disabled externally.

## NEXT — execute without asking
1. Reconfirm exact final HEAD after this handoff commit, exact GitHub release check and correct `netlify/importverifier/deploy-preview`; repair any regression immediately.
2. Continue only genuinely new security/billing/reliability findings. In particular, verify new server-side PostgREST/RPC paths retain minimum privileges without broadening browser access; do not repeat completed privilege sweeps unless code/migrations change.
3. Improve authenticated billing UX so Lifetime accounts never present subscription-only management language/actions, while recurring monthly/annual retain Portal management.
4. Production acceptance when browser/payment conditions permit: monthly → webhook → Unlimited → Portal/cancel; annual equivalent; Lifetime paid → persistent Unlimited → controlled refund/dispute lifecycle.
5. Fresh-account acceptance: signup/login → five-product sample accepted → sixth rejected → isolated history → premium PDF/XLSX.
6. Obtain TTFB/LCP/TBT/CLS/resource evidence before performance changes.
7. Inspect PDF typography/overflow only against a real multi-product output.
8. Keep Radar disabled until same strong ingest secret exists in runtime/scheduler and real official EUR-Lex ingestion persists events.
9. Review Supabase leaked-password protection/CAPTCHA when console capability is available.
10. Keep EU the only active market and direct marketplace connectors inactive until legitimate credentials exist.

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
