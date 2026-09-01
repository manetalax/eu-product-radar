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
- Monthly and annual are subscription entitlements. Lifetime is a distinct persistent entitlement granted only by a canonical **paid** one-time Stripe Checkout.
- A fully refunded Lifetime payment or an active/lost dispute must not retain access. A won dispute may restore access only while the underlying charge remains collected.
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
- Production release guard requires all three exact live Stripe prices; selected billing option survives email auth and Google OAuth.
- Public landing/FAQ/Schema.org shows monthly/annual/Lifetime in six locales with 3/2/1 responsive pricing and truthful shared Unlimited features.
- Lifetime zero-charge protection: no promotion codes, exact paid Checkout + PaymentIntent required, `no_payment_required` never grants permanent access.

## DONE — 2026-09-01 latest run
- **Lifetime refund/dispute replay hardening:** a previously revoked Lifetime payment cannot be reactivated by the same Checkout session or PaymentIntent through a delayed webhook or browser confirmation. Synchronization returns a safe no-op for the revoked same payment, the browser treats it as unconfirmed, and webhook processing can finish instead of entering an endless retry loop.
- **Chargeback lifecycle added:** `charge.dispute.created` suspends the matching Lifetime entitlement; `charge.dispute.closed` restores only on Stripe `won` and only when the latest Charge is not fully refunded. Other closed outcomes remain revoked. Charge state is re-read from Stripe before entitlement mutation.
- **Production Stripe webhook corrected:** canonical live endpoint `https://importverifier.netlify.app/api/billing/webhook` now listens to Checkout/subscription events plus `charge.refunded`, `charge.dispute.created` and `charge.dispute.closed`. Without this change the refund/dispute code could not have acted in production.
- **Lifetime Supabase migration applied and verified in production:** migration `unlimited_lifetime_entitlement` is recorded; table exists with RLS enabled + forced, one own-row SELECT policy and 0 entitlement rows immediately after migration (expected pre-sale baseline).
- **Browser confirmation tightened:** Lifetime `mode=payment` now requires `payment_status=paid` before sync and returns 409 rather than a generic 503 for unpaid/revoked cases. Subscription confirmation retains valid paid/no-payment-required semantics for recurring Checkout.
- Supabase security advisor after migration did not flag the Lifetime table. Existing warning remains: leaked-password protection is disabled. Internal no-policy tables remain intentionally inaccessible to client roles and should be reviewed only if their privilege model changes.
- No speculative performance/PDF/Radar/marketplace work was done without required evidence or credentials.

## Latest exact verification — 2026-09-01
- Latest verified functional/test HEAD before documentation commits: **`9b036b7adda48524eb6239df2ae66aa5a6a1b8cc`** (`test: lock revoked Lifetime no-op semantics`).
- GitHub `ImportVerifier release check` **#1655 SUCCESS** on exact `9b036b7...`: install, full tests, typecheck and production build passed.
- Netlify `netlify/importverifier/deploy-preview` for exact `9b036b7...` was still **pending** when documentation began; do not infer READY from an older preview.
- Durable handoff update commit: **`ed8d5cb8a8a38f1fc896b2e3e2a2f1cbe11a19fc`**.
- This short handoff commit creates a newer docs-only HEAD. Reconfirm its exact GitHub release check and correct `importverifier` Deploy Preview before treating final repository HEAD as verified.
- PR #4 remains open, mergeable and unmerged. Never merge without explicit owner instruction.

## Production service facts last established
- Supabase project `hfuwwjdcyudflamwwnon` is ACTIVE_HEALTHY.
- Migration `unlimited_lifetime_entitlement` is applied in production as version `20260901070312`; table has forced RLS/own-row policy and had 0 rows at verification.
- Lifetime free quota aggregate previously showed zero accounts above five and maximum usage five.
- Stripe live product `ImportVerifier Unlimited` has the three canonical live prices listed above.
- Canonical live Stripe webhook is enabled and subscribed to Checkout/subscription + refund/dispute lifecycle events needed by current code.
- Historical `one_time_audits` storage may remain but does not grant current entitlement.
- Production Radar remains non-live until real official ingestion persists events; keep `REGULATORY_RADAR_LIVE=false`.
- Supabase leaked-password protection remains disabled and is an Auth console task.
- Production SMTP signup/reset with a genuinely fresh non-owner mailbox is not yet accepted.

## NEXT — execute without asking
1. Reconfirm exact HEAD after this handoff commit, exact GitHub release check and correct `importverifier` Netlify Deploy Preview; repair any regression immediately.
2. Production billing acceptance when external/browser conditions permit: monthly EUR 9.95 → webhook → Unlimited → Portal/cancel; annual EUR 89.95 equivalent lifecycle; Lifetime EUR 149 paid Checkout → persistent Unlimited → controlled full-refund revoke → dispute suspension/won restoration; historical audit rows grant no quota.
3. Inspect only genuinely new billing/security reliability findings. Do not repeat refund/dispute/zero-charge/live-mode sweeps already locked by tests and production configuration.
4. Fresh-account acceptance: signup/login → five-product sample accepted → sixth rejected → isolated history → premium PDF/XLSX → each paid flow as applicable.
5. Performance: obtain detailed TTFB/LCP/TBT/CLS/resource evidence before changing landing architecture.
6. PDF: inspect typography/overflow only against a real multi-product acceptance output.
7. Keep Radar disabled until the same strong ingest secret is configured in runtime/scheduler and real official EUR-Lex ingestion persists events.
8. Keep EU the only active market and marketplace direct connectors inactive until legitimate credentials exist.
9. Review current Supabase Auth protections when console capability is available: leaked-password protection and appropriate signup-abuse/CAPTCHA controls.

## BLOCKED EXTERNAL
- Final Netlify production env/branch/deploy promotion: complete truthful legal-provider variables, canonical runtime secrets and SiliconFlow/free-only AI values.
- Real production monthly/annual/Lifetime Checkout/webhook/Portal/cancel/refund/dispute acceptance requires controlled browser transactions and payment methods.
- Same strong `REGULATORY_INGEST_SECRET` in runtime/scheduler + first real official EUR-Lex ingestion before Radar can be live.
- Supabase Auth leaked-password protection + appropriate CAPTCHA/signup-abuse controls.
- Production SMTP/signup/reset acceptance with a fresh non-owner mailbox/browser flow.
- Physical iPhone/iPad/Safari/PWA photo/upload/export/save-to-Files/rotation validation.
- Official Shopify/Amazon/Etsy applications, credentials and scopes.
- Detailed browser performance evidence and real multi-product PDF visual QA.

## Definition of finished
Do not call ImportVerifier fully launched until exact current CI and canonical Netlify production are green; production passes the fail-closed configuration gate; a genuinely fresh user proves five-free-lifetime + sixth rejection + isolated history + PDF/XLSX; free-only AI works without premium leakage; monthly/annual/Lifetime billing, refund/dispute lifecycle and legal data pass; Radar claims match real official ingestion; inactive markets/connectors remain honest; Auth abuse controls and SMTP acceptance pass; and desktop/iPhone/iPad/PWA QA passes.
