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
- Afterwards only **ImportVerifier Unlimited · €9.95/month**.
- `starter` is only the internal Stripe/database compatibility ID for Unlimited.
- End users see **ImportVerifier AI**, never provider/model names.
- Production AI cost policy is fail-closed `AI_COST_POLICY=free_only`.
- Paid checkout remains fail-closed until truthful legal-provider variables exist.

## DONE — do not repeat
- Lifetime five-product quota, idempotent analysis creation, isolated histories/RLS and privileged-table hardening.
- Canonical Stripe Unlimited offer, live price/currency/cadence validation, webhook synchronization/idempotency, Checkout/Portal allowlists and customer-safe errors.
- Dashboard/Latest/Review/Evidence/Intelligence/Trial/Unlimited runtime trust boundaries; canonical Supabase origin/key boundaries and OAuth return allowlists.
- Official regulatory/evidence URL allowlists and final persistence/render/export/AI-context sanitization.
- EU deterministic regulatory engine, Product Regulatory Twin, persisted Evidence and Regulatory Impact Radar architecture; Radar fail-closed publication/ingest gate.
- Shopify/Amazon/Etsy connector architecture; direct integrations intentionally inactive until official credentials exist.
- ES/EN/FR/DE/IT/PT customer localization, localized SEO/static landing/auth continuity and canonical ImportVerifier identity.
- Google login identity, account lifecycle code and production fail-closed release configuration.
- Universal spreadsheet/document/text/photo ingestion including HEIC/HEIF, mobile camera, cancellation/multi-file/quota safeguards and prompt-injection boundaries.
- PWA private-cache hardening, locale-keyed start/offline behavior, iOS safe areas/forms/modals, delayed object-URL revocation and idle service-worker registration.
- Premium PDF/XLSX identity, executive hierarchy, VERIFIED review seal, evidence/official-source traceability and repeated issuer/EU footer.
- Landing offer truthfulness: five lifetime free products/no card + Unlimited €9.95/month; no fabricated scarcity/social proof.
- Static/server-first landing and six statically generated locale routes. Do not tune performance without TTFB/LCP/TBT/CLS/resource evidence.
- GitHub Actions Node 24 migration with immutable checkout/setup-node pins; current dependency install reports 0 audited vulnerabilities.
- Launch acceptance fixtures: five-product canonical sample plus distinct sixth-product rejection fixture.
- Premium route/global/not-found/loading recovery with ES/EN/FR/DE/IT/PT recovery copy and no raw exception leakage.
- Production Netlify environment template matches the fail-closed release guard and leaves real secrets/legal values blank.
- Canonical customer export filenames use `importverifier-<market>-<date>-<id>.<format>` and preserve delayed mobile/iPad object-URL revocation.
- Billing plan intent waits for entitlement state, runs once and never reopens Checkout for an already-Unlimited account.
- Active historical `growth`/`pro`/`business` subscriptions normalize to the one current Unlimited entitlement; expired/canceled legacy records fall back to free.

## DONE — 2026-09-01 latest run
- **Stripe production live-mode boundary:** production webhook processing now rejects any validly signed Stripe event unless `event.livemode === true`, before webhook-event persistence or entitlement synchronization. A test-mode signing secret can no longer create production value if it is accidentally wired into production. Regression coverage locks ordering of this gate before persistence.
- **Retired one-time audit entitlement removed from runtime:** the current commercial rule is now enforced end-to-end: five lifetime free products, then only an active subscription can grant paid product access. `/api/analyses` no longer reads `one_time_audits`; the webhook no longer creates audit entitlements; billing/quota types and customer messages no longer expose `audit`; Dashboard payload parsing rejects retired audit quota payloads; and `plans.ts` no longer treats `audit` as a purchase ID. Historical SQL tables/migrations remain only as inert data/migration history and do not grant entitlement.
- **Regression discovered and repaired during the run:** the first cleanup intentionally let CI locate a hidden Dashboard payload dependency on the old `audit` BillingPlanId. Release check #1533 passed tests but failed typecheck. The parser was then corrected to reject `audit`, with explicit regression coverage, without reintroducing the retired entitlement.
- No speculative performance, PDF-layout, Radar-live or marketplace changes were made without the required evidence/credentials.

## Latest exact verification — 2026-09-01
- Current verified functional/test HEAD before this handoff commit: **`4dda8701e999914967234e84c6b5351cb91655b0`** (`test: lock plans to subscription purchase IDs`).
- GitHub `ImportVerifier release check` **#1543 SUCCESS** on exact `4dda8701...`: install, full tests, typecheck and production build all passed.
- Correct Netlify project `importverifier` is processing exact `4dda8701...` at handoff-write time; do not infer READY from an older preview. Reconfirm `https://deploy-preview-4--importverifier.netlify.app` after this docs commit.
- PR #4 remains open, mergeable and not merged.
- This handoff update creates a newer docs-only HEAD. Reconfirm its GitHub CI and the correct ImportVerifier Deploy Preview before treating that docs HEAD as the latest verified repository state.

## Production service facts last established
- Supabase project: `hfuwwjdcyudflamwwnon`.
- Lifetime quota aggregate previously showed zero accounts above five and maximum usage five.
- Stripe live has the one canonical Unlimited EUR 9.95/month price and enabled canonical webhook; no live subscriptions were observed at last service check.
- Historical `one_time_audits` storage may remain in the database for migration/history compatibility but is not a current purchase or entitlement source.
- Production Radar persisted-event count remains 0, therefore `REGULATORY_RADAR_LIVE` must remain false.
- Supabase security advisor still reports leaked-password protection disabled.
- Production SMTP signup/reset delivery with a genuinely fresh non-owner mailbox is not yet accepted.

## NEXT — execute without asking
1. Reconfirm exact HEAD after this handoff commit and its GitHub release check; repair any regression immediately. Continue to track only the correct `importverifier` Netlify project.
2. Continue only genuinely new customer-facing/security/i18n/reliability findings; do not repeat DONE trust-boundary sweeps.
3. Billing acceptance: when production credentials/legal config are available, explicitly verify that only live Stripe subscription events can grant Unlimited and that historical audit records grant no quota.
4. Performance: obtain detailed TTFB/LCP/TBT/CLS/resource-level evidence before changing landing architecture.
5. PDF: inspect typography/overflow only against a real multi-product acceptance output.
6. Production acceptance with a genuinely new account: signup/login → `/importverifier-sample-5-products.csv` → five accepted → `/importverifier-sample-6th-product.csv` rejected → isolated history → premium PDF → Excel → Checkout → live webhook entitlement → Portal/cancel lifecycle.
7. Keep Radar disabled until the same strong ingest secret is configured in runtime/scheduler and real official EUR-Lex ingestion persists events.
8. Keep EU the only active market and marketplace connectors inactive until legitimate credentials exist.

## BLOCKED EXTERNAL
- Netlify production env/branch/deploy promotion: real canonical Supabase keys, live Stripe secret/webhook/canonical price, truthful legal-provider identity/address/tax/jurisdiction/refund values and SiliconFlow/free-only AI values.
- Same strong `REGULATORY_INGEST_SECRET` in runtime/scheduler + first real official EUR-Lex ingestion before Radar can be live.
- Supabase Auth leaked-password protection + appropriate CAPTCHA/signup-abuse controls.
- Production SMTP/signup/reset acceptance with a fresh non-owner mailbox/browser flow.
- Physical iPhone/iPad/Safari/PWA photo/upload/export/save-to-Files/rotation validation.
- Official Shopify/Amazon/Etsy applications, credentials and scopes.

## Definition of finished
Do not call ImportVerifier fully launched until exact current CI and canonical Netlify production are green; production passes the fail-closed configuration gate; a genuinely fresh user proves five-free-lifetime + sixth rejection + isolated history + PDF/XLSX; free-only AI works without premium leakage; legal/billing/webhook/Portal/cancellation pass; Radar claims match real official ingestion; inactive markets/connectors remain honest; Auth abuse controls and SMTP acceptance pass; and desktop/iPhone/iPad/PWA QA passes.
