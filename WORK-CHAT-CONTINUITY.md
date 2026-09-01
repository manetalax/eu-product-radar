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
3. Latest PR #4 HEAD + exact-HEAD GitHub CI + Netlify status.
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
- Canonical Stripe Unlimited offer, price/currency/cadence validation, live-key enforcement, webhook synchronization/idempotency, Checkout/Portal URL allowlists and customer-safe errors.
- Dashboard/Latest/Review/Evidence/Intelligence/Trial/Unlimited runtime payload trust boundaries.
- Canonical Supabase origin/key trust boundaries and OAuth return allowlists.
- Official regulatory/evidence URL allowlists and final persistence/render/export/AI-context sanitization.
- EU deterministic regulatory engine, Product Regulatory Twin, persisted Evidence and Regulatory Impact Radar architecture.
- Radar fail-closed publication gate; canonical scheduler target; strong secret/body/content-type/error handling; Radar remains non-live while production has zero persisted events.
- Shopify/Amazon/Etsy connector architecture; direct integrations intentionally inactive until official credentials exist.
- ES/EN/FR/DE/IT/PT active customer localization; canonical ImportVerifier identity; localized SEO/static landing/auth continuity.
- Google login visible identity; account lifecycle code; production release configuration fail-closed gate.
- Universal spreadsheet/document/text/photo ingestion including HEIC/HEIF signatures; dedicated mobile camera path; cancellation/multi-file/quota safeguards.
- PWA private-cache hardening, language-keyed offline/start routes, iOS safe areas/form/modal behavior and delayed download object-URL revocation.
- Premium PDF/XLSX identity, executive hierarchy, truthful ImportVerifier VERIFIED review seal, evidence/official-source traceability and repeated issuer/EU footer.
- Landing offer truthfulness: five lifetime free products/no card + one Unlimited plan at €9.95/month; no fabricated scarcity/social proof.
- Static/server-first landing, six statically generated locale routes and idle PWA registration. Do not make further speculative performance changes without TTFB/LCP/TBT/CLS/resource evidence.

## DONE — 2026-09-01 current run
- **Product-extraction prompt-injection boundary:** uploaded text, documents and images are explicitly treated as untrusted data, never model instructions. Embedded prompts/system-role text are ignored and only product facts explicitly supported by the material may be extracted. The same hardened prompt is used for local-text structuring, vision and direct document-provider paths. Regression coverage locks all three paths.
- **GitHub Actions Node 24 migration / supply-chain hardening:** release workflow no longer uses Node-20-targeting `actions/checkout@v4` or `actions/setup-node@v4`. It pins the official current releases to immutable commits: checkout v7.0.1 `3d3c42e5aac5ba805825da76410c181273ba90b1` and setup-node v7.0.0 `820762786026740c76f36085b0efc47a31fe5020`. Regression coverage prevents reverting to v4/mutable old actions.
- Billing was re-inspected during this run; no genuinely new regression justified churn. Checkout remains limited to Unlimited and validates live price semantics before entitlement.
- Performance/PDF were not changed: detailed Web Vitals and real multi-product PDF acceptance evidence are still required before further tuning.

## Latest exact functional verification — 2026-09-01
- Functional HEAD: **`69d4d840b7ac8165e14f78e9c442eebe2ac612af`** (`test: pin Node 24 compatible release actions`).
- GitHub `ImportVerifier release check` **#1459 SUCCESS** on exact `69d4d840...`: install, full tests, typecheck and production build all passed.
- The immediately preceding extraction-security HEAD `96ee900a14c225109586910ad0edc238a823dcf8` passed release check **#1455 SUCCESS** with **327/327 tests**, typecheck and build.
- Netlify `netlify/importverifier/deploy-preview` for `69d4d840...` was still **PENDING** at handoff-write time on the correct `importverifier` project. Reconfirm it after this docs-only commit; do not infer READY from an older preview.
- PR #4 remains open and not merged. GitHub may transiently report mergeability false while recalculating after rapid commits; never merge regardless.
- This handoff update creates a newer docs-only HEAD. Reconfirm exact-HEAD GitHub CI and the correct ImportVerifier Deploy Preview before treating that docs head as the latest verified release candidate.

## Production service facts last established
- Supabase project: `hfuwwjdcyudflamwwnon`.
- Lifetime quota aggregate previously showed zero accounts above five and maximum usage five.
- Stripe live has the one canonical Unlimited EUR 9.95/month price and enabled canonical webhook; no live subscriptions were observed at last service check.
- Production Radar persisted-event count remains 0, therefore `REGULATORY_RADAR_LIVE` must remain false.
- Supabase security advisor still reports leaked-password protection disabled.
- Production SMTP signup/reset delivery with a genuinely fresh non-owner mailbox is not yet accepted.

## NEXT — execute without asking
1. Reconfirm exact HEAD after this docs commit, GitHub release check and the **correct `importverifier` Deploy Preview**; repair any regression immediately.
2. Continue only genuinely new customer-facing/security/i18n/reliability findings. Do not repeat the DONE trust-boundary sweeps above.
3. Performance: obtain detailed TTFB/LCP/TBT/CLS/resource-level evidence before changing landing architecture.
4. PDF: inspect typography/overflow only against a real multi-product acceptance output.
5. Production acceptance with a genuinely new account: canonical signup/login → `/importverifier-sample-5-products.csv` → five accepted → sixth rejected → isolated history → premium PDF → Excel → Checkout → webhook entitlement → Portal/cancel lifecycle.
6. Keep Radar disabled until the same strong ingest secret is configured in runtime/scheduler and real official EUR-Lex ingestion persists events.
7. Keep EU the only active market and marketplace connectors inactive until legitimate credentials exist.

## BLOCKED EXTERNAL
- Netlify production env/branch/deploy promotion: configure real canonical Supabase keys, live Stripe secret/webhook/canonical price, truthful legal-provider identity/address/tax/jurisdiction/refund values and SiliconFlow/free-only AI values so the fail-closed production build gate can pass.
- Configure the same strong `REGULATORY_INGEST_SECRET` for production/scheduler, run first real official EUR-Lex ingestion, then and only then enable Radar live.
- Supabase Auth console: leaked-password protection + appropriate CAPTCHA/signup-abuse controls.
- Production SMTP/signup/reset acceptance with a fresh non-owner mailbox/browser flow.
- Physical iPhone/iPad/Safari/PWA photo/upload/export/save-to-Files/rotation validation.
- Official Shopify/Amazon/Etsy applications, credentials and scopes.

## Definition of finished
Do not call ImportVerifier fully launched until exact current CI and canonical Netlify production are green; production passes the fail-closed configuration gate; a genuinely fresh user proves five-free-lifetime + sixth rejection + isolated history + PDF/XLSX; free-only AI works without premium leakage; legal/billing/webhook/Portal/cancellation pass; Radar claims match real official ingestion; inactive markets/connectors remain honest; Auth abuse controls and SMTP acceptance pass; and desktop/iPhone/iPad/PWA QA passes.
