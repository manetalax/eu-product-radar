# ImportVerifier — Chat ↔ Work continuity protocol

## Canonical project
- Production target: https://importverifier.netlify.app/
- Repository: `manetalax/eu-product-radar`
- PR: `#4`
- Branch: `feat/import-rules-verifier-branding`
- Never create a replacement project and never merge PR #4 unless the owner explicitly asks.

## Read order
1. This file — current operational source of truth.
2. `WORK-HANDOFF-IMPORTVERIFIER.md` — durable architecture and acceptance model.
3. Latest PR #4 HEAD + exact-HEAD GitHub CI + correct `importverifier` Netlify status.
4. `AGENTS.md` — autonomous execution standard.

## Owner operating instruction
Continue autonomously through every actionable task. Never stop because one task is BLOCKED EXTERNAL; record it and continue elsewhere. Do not repeat DONE sweeps. Batch browser/credential/device work for the end. Do not merge without explicit owner instruction.

## Commercial invariants
- Exactly **5 free products total per account**, lifetime/cumulative, no card and no monthly reset.
- Afterwards one feature entitlement only: **ImportVerifier Unlimited**.
- Unlimited purchase modalities are **EUR 9.95/month**, **EUR 89.95/year**, or **EUR 149 Lifetime one-time**. These are billing choices, not different feature tiers.
- `starter` is only the internal Stripe/database compatibility ID for Unlimited.
- Monthly and annual are subscription entitlements. Lifetime is a distinct persistent entitlement granted only by the canonical one-time Stripe Checkout and revoked after a full refund.
- Historical `one_time_audits` never grant product entitlement.
- End users see **ImportVerifier AI**, never provider/model names.
- Production AI cost policy is fail-closed `AI_COST_POLICY=free_only`.
- Paid checkout remains fail-closed until truthful legal-provider variables exist.

## Canonical Stripe live prices
- Monthly: `price_1UAJy5HJnO8odw1Mn4jMVjFt` — EUR 9.95/month.
- Annual: `price_1UAjP0HJnO8odw1M7RBK8jsR` — EUR 89.95/year.
- Lifetime: `price_1UAjP8HJnO8odw1MmSXdkNIh` — EUR 149 one-time.

## DONE — do not repeat
- Lifetime five-product quota, idempotent analysis creation, isolated histories/RLS and privileged-table hardening.
- Stripe Checkout/Portal destination allowlists, signed webhook idempotency/current-state synchronization, live-mode production gate and customer-safe errors.
- Historical one-time audit runtime entitlement removal; audit storage is inert migration/history only.
- Active historical `growth`/`pro`/`business` subscriptions normalize to Unlimited; canceled/expired legacy records fall back to free.
- Dashboard/Latest/Review/Evidence/Intelligence/Trial/Unlimited runtime trust boundaries; canonical Supabase origin/key boundaries and OAuth return allowlists.
- Official regulatory/evidence URL allowlists and final persistence/render/export/AI-context sanitization.
- EU deterministic regulatory engine, Product Regulatory Twin, persisted Evidence and Regulatory Impact Radar architecture; Radar fail-closed publication/ingest gate.
- Shopify/Amazon/Etsy connector architecture; direct integrations intentionally inactive until official credentials exist.
- ES/EN/FR/DE/IT/PT customer localization, localized SEO/static landing/auth continuity and canonical ImportVerifier identity.
- Google login identity, account lifecycle code and production fail-closed release configuration.
- Universal spreadsheet/document/text/photo ingestion including HEIC/HEIF, mobile camera, cancellation/multi-file/quota safeguards and prompt-injection boundaries.
- PWA private-cache hardening, locale-keyed start/offline/shortcut behavior, iOS safe areas/forms/modals, delayed object-URL revocation and idle service-worker registration.
- Premium PDF/XLSX identity, executive hierarchy, VERIFIED review seal, evidence/official-source traceability, formula-injection protection and repeated issuer/EU footer.
- Static/server-first landing and six statically generated locale routes. Do not tune performance without TTFB/LCP/TBT/CLS/resource evidence.
- GitHub Actions immutable Node24-compatible pins; latest install observed 0 audited vulnerabilities.
- Launch fixtures: canonical five-product sample plus distinct sixth-product rejection fixture.
- Premium error/global-error/not-found/loading recovery in six languages with no raw exception leakage.
- Canonical customer export filenames `importverifier-<market>-<date>-<id>.<format>` with mobile/iPad-safe delayed object URL revocation.

## DONE — 2026-09-01 current run
- **Three-option Unlimited architecture:** concurrent work on the branch already introduced monthly/annual/Lifetime Checkout and Lifetime persistence. This run reviewed rather than overwrote it, aligned `AGENTS.md` and rewrote the durable handoff around the real architecture.
- **Production Stripe release guard repaired:** `lib/release-config.ts` now requires and validates all three exact canonical live prices (`STRIPE_PRICE_STARTER`, `STRIPE_PRICE_ANNUAL`, `STRIPE_PRICE_LIFETIME`) instead of validating monthly only. Regression coverage verifies missing or stale values fail closed.
- **Auth billing-option continuity repaired:** `/login` now validates `billing=monthly|annual|lifetime` and `AuthForm` preserves the selected option through email login, signup/confirmation and Google OAuth. Previously annual/Lifetime could silently degrade to monthly after authentication. New regression coverage locks this behavior.
- **CI regressions diagnosed rather than bypassed:** two stale static tests were repaired after the Checkout/auth refactors. `site-origin-safety` now follows the shared canonical success/cancel URLs used by both recurring and Lifetime Checkout. `auth-language-flow` now tolerates the multiline signup call while preserving locale checks.
- **CI target compatibility repaired:** release check #1617 passed all 338 tests but typecheck rejected a test-only regex `s` flag under the repository TS target; the assertion was rewritten without changing production behavior.
- No speculative performance, PDF-layout, Radar-live or marketplace changes were made without the required evidence/credentials.

## Latest exact verification — 2026-09-01
- Functional/test HEAD immediately before this handoff commit: **`4090aee5dbea3d8afbbc6eff8833f44773b9bd2c`** (`test: keep signup assertion target-compatible`).
- GitHub `ImportVerifier release check` **#1619** on exact `4090aee5...`: `npm ci` SUCCESS, 338/338 tests SUCCESS, typecheck SUCCESS; production build was still running when this handoff was written. Reconfirm final conclusion before treating it as verified green.
- Prior #1617 proved the same functional tree through 338/338 tests and failed only because the test-only regex flag was incompatible with the TypeScript target; that defect is fixed in `4090aee5...`.
- This handoff commit creates a newer docs-only HEAD. Reconfirm exact-HEAD CI and the `netlify/importverifier/deploy-preview` status after this commit.
- PR #4 remains open, mergeable and not merged.

## Production service facts last established
- Supabase project: `hfuwwjdcyudflamwwnon`.
- Lifetime free quota aggregate previously showed zero accounts above five and maximum usage five.
- Stripe live product `ImportVerifier Unlimited` has the three canonical live prices listed above.
- New persistent Lifetime entitlement migration exists in repository; production application/acceptance still needs explicit confirmation.
- Historical `one_time_audits` storage may remain but does not grant current entitlement.
- Production Radar persisted-event baseline remains unestablished/zero; keep `REGULATORY_RADAR_LIVE=false` until real official ingestion succeeds.
- Supabase leaked-password protection remains an external console task.
- Production SMTP signup/reset with a genuinely fresh non-owner mailbox is not yet accepted.

## NEXT — execute without asking
1. Reconfirm the exact HEAD created by this handoff and its release check + correct `importverifier` Netlify Deploy Preview; repair any regression immediately.
2. **Landing/pricing truthfulness:** the public landing still visually presents monthly-only copy even though the product now supports monthly/annual/Lifetime. Update the static six-language landing/FAQ/structured data to present one Unlimited feature plan with three billing choices, and make each CTA carry `billing=monthly|annual|lifetime` through login. Preserve server/static-first architecture.
3. Add/retain focused Lifetime trust-boundary coverage where necessary: authorized canonical Lifetime Checkout grants persistent Unlimited, unrelated one-time payments do not, and full refund revokes. Do not resurrect retired audit entitlement.
4. Production billing acceptance once external config is ready: monthly EUR 9.95 → webhook → Unlimited → Portal/cancel; annual EUR 89.95 equivalent flow; Lifetime EUR 149 → persistent Unlimited → controlled full-refund revoke; historical audit rows grant no quota.
5. Confirm/apply the Lifetime entitlement migration in production Supabase before enabling Lifetime Checkout in production.
6. Performance: obtain detailed TTFB/LCP/TBT/CLS/resource evidence before changing landing architecture.
7. PDF: inspect typography/overflow only against a real multi-product acceptance output.
8. Fresh-account acceptance: signup/login → five-product sample accepted → sixth rejected → isolated history → PDF/XLSX → each paid flow as applicable.
9. Keep Radar disabled until the same strong ingest secret is configured in runtime/scheduler and real official EUR-Lex ingestion persists events.
10. Keep EU the only active market and marketplace direct connectors inactive until legitimate credentials exist.

## BLOCKED EXTERNAL
- Netlify production env/branch/deploy promotion: real canonical Supabase keys, live Stripe secret/webhook/all three canonical prices, truthful legal-provider identity/address/tax/jurisdiction/refund variables and SiliconFlow/free-only AI values.
- Confirm/apply `202609010001_unlimited_lifetime_entitlement.sql` in production Supabase and perform real Lifetime/refund acceptance.
- Same strong `REGULATORY_INGEST_SECRET` in runtime/scheduler + first real official EUR-Lex ingestion before Radar can be live.
- Supabase Auth leaked-password protection + appropriate CAPTCHA/signup-abuse controls.
- Production SMTP/signup/reset acceptance with a fresh non-owner mailbox/browser flow.
- Physical iPhone/iPad/Safari/PWA photo/upload/export/save-to-Files/rotation validation.
- Official Shopify/Amazon/Etsy applications, credentials and scopes.
- Real production monthly/annual/Lifetime Checkout/webhook/Portal/cancel/refund acceptance.
- Detailed browser performance evidence and real multi-product PDF visual QA.

## Definition of finished
Do not call ImportVerifier fully launched until exact current CI and canonical Netlify production are green; production passes the fail-closed configuration gate; a genuinely fresh user proves five-free-lifetime + sixth rejection + isolated history + PDF/XLSX; free-only AI works without premium leakage; monthly/annual/Lifetime billing lifecycles and legal data pass; Radar claims match real official ingestion; inactive markets/connectors remain honest; Auth abuse controls and SMTP acceptance pass; and desktop/iPhone/iPad/PWA QA passes.
