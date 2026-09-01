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
- Live-mode webhook gate, webhook idempotency/current-state subscription sync, refund/dispute lifecycle.
- Lifetime zero-charge protection and revoked-payment/event-ordering replay hardening.
- Landing/FAQ/Schema.org monthly/annual/Lifetime in ES/EN/FR/DE/IT/PT and auth billing-option continuity.
- Retired audit entitlement removal and legacy recurring-plan normalization.
- Universal CSV/XLS/XLSX/document/text/photo ingestion, HEIC/HEIF, prompt-injection/upload boundaries.
- EU deterministic regulatory engine, Evidence, Regulatory Twin and fail-closed Regulatory Impact Radar architecture.
- Official regulatory/evidence URL allowlists and persistence/render/export/AI-context sanitization.
- PWA private-cache hardening, localized start/offline/shortcuts and iOS/mobile upload/export safeguards.
- Premium localized PDF/XLSX with evidence traceability and spreadsheet formula-injection protection.
- Static localized landing, recovery surfaces, SEO, security headers and production release guard.
- Shopify/Amazon/Etsy architecture exists but direct integrations remain inactive pending official credentials.

## DONE — earlier 2026-09-01 execution
- Reconfirmed starting HEAD `084a1106c0d2a00861d63ee14f5316b037e4f22c`: release check **#1665 SUCCESS** and correct `netlify/importverifier/deploy-preview` **SUCCESS** at `https://deploy-preview-4--importverifier.netlify.app`.
- **Account deletion current-state billing safety:** deletion no longer trusts stale local subscription status. It locates the Stripe customer and paginates all current Stripe subscriptions, immediately canceling every cancellable non-terminal subscription before Supabase account deletion. This also prevents a duplicate/historical subscription from surviving because the local projection only stores one row. Already-missing Stripe customer/subscription (`resource_missing`) is safe to continue; all other Stripe failures remain fail-closed.
- **Checkout duplicate-subscription preflight:** before creating new paid value, Checkout paginates the customer's current Stripe subscriptions directly. Terminal subscriptions are ignored; abandoned `incomplete` subscriptions are canceled; any other current recurring subscription routes to Billing Portal. This reduces duplicate billing when a webhook/local projection is delayed.
- **Browser confirmation semantics:** recurring Checkout return now synchronizes the latest Stripe subscription but reports `confirmed: true` only for `active`/`trialing`. Incomplete/past-due/non-entitling state is presented as pending instead of false purchase success.
- **Truthful Lifetime UX:** Checkout return progress copy now says Unlimited “access” rather than “subscription” in ES/EN/FR/DE/IT/PT, so Lifetime is not mislabeled as recurring.
- Added regression coverage for complete account-deletion cancellation, live Stripe Checkout preflight and active/trialing-only browser confirmation.
- Functional/test commits: `2d89957efc160aeb7a961e36e383da567ffb9db7`, `6862ee5e2587b46339f5d844bf3d6e68adfc3877`, `ac1b5f5a20921864df27fc0fdf6990f6a4a3a2b6`, `2806074c843edea359a11c7f9655feb0cb526919`, `7111cd49b4d542b33f6eb77492c5637ee23b107a`, `9b8f253283a60154716c8298090d7a5256e5f221`, `e5cf09e5f73624c68ffda5c21b437ba2a8f4e841`, `6e2c6b0ca2ca65b7f1df8be8dcbf825c4dfa9cc5`, `036f04310a41d8e9f7878ceb6762bd1af14a127d`.
- Durable handoff update: `22bb71b82073995e1f87aa93da1845ccff45e7e3`.

## DONE — latest 2026-09-01 execution
- Starting branch had regressed at `d17c03417acb64cc2b21e5a6efaa5571c5b6ecb3`; exact release check failed in `npm test`.
- Root cause was an accidental destructive rewrite of `tests/analysis.test.ts`: wrong module imports, an invented unsupported `CA` market and lost analysis/export/security regression coverage. Restored the complete valid suite while retaining the legitimate new free billing contract `billingOption: null`. Fix commit: `15ffe39927acc5fd11f08ee66003082513615a19`.
- Corrected paid-quota period semantics: free and Lifetime report `periodStart: lifetime`; monthly/annual recurring Unlimited report `periodStart: subscription`. This avoids presenting Lifetime as a subscription in API/UI/telemetry. Functional commit: `e3c9c0063374bfa3f84582a65383305a06ebf37f`.
- CI then exposed one stale legal-page assertion, not a product regression. The Terms page intentionally canonicalizes fallback copy through `canonicalLegalBrand`; updated the test to lock that behavior instead of expecting the retired direct fallback. Commit: `61b576f2f9dca8cc1308789601bfdea3e3e84fba`.
- Added a dedicated regression test locking recurring-vs-Lifetime quota period semantics. Commit: `2d2b8e9dca6eaed804a16189de0fefd3f4cfd105`.
- Exact-head release check **#1730 SUCCESS** on `2d2b8e9d...`: `npm ci`, full tests, typecheck and production build all passed. The job reports 0 audited npm vulnerabilities.
- Correct `netlify/importverifier/deploy-preview` for exact `2d2b8e9d...` was still **pending/processing** at the last status read; do not infer readiness from an older preview.
- This handoff commit creates a newer docs-only HEAD. Reconfirm exact CI and the correct ImportVerifier Deploy Preview before treating final repository HEAD as fully verified.

## Production facts
- Supabase project `hfuwwjdcyudflamwwnon` was last established ACTIVE_HEALTHY.
- `unlimited_lifetime_entitlement` migration is applied; pre-sale entitlement baseline was 0 rows.
- Stripe live product has all three canonical prices and canonical webhook listens to Checkout/subscriptions/refunds/disputes.
- Radar remains non-live; keep `REGULATORY_RADAR_LIVE=false` until official ingestion persists events.
- Supabase leaked-password protection remains disabled externally.

## NEXT — execute without asking
1. Reconfirm exact final HEAD after this handoff commit, exact GitHub release check and correct `netlify/importverifier/deploy-preview`; repair any regression immediately.
2. Continue only genuinely new billing/security/reliability findings; do not redo Checkout/subscription/Lifetime replay sweeps already locked by tests.
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
