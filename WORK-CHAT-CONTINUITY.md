# ImportVerifier — Chat ↔ Work continuity protocol

## Canonical project
- Production target: https://importverifier.netlify.app/
- Repository: `manetalax/eu-product-radar`
- PR: `#4`
- Branch: `feat/import-rules-verifier-branding`
- Never create a replacement project and never merge PR #4 unless the owner explicitly asks.

## Read order
1. This file — latest operational state and source of truth.
2. `WORK-HANDOFF-IMPORTVERIFIER.md` — background/architecture.
3. Latest PR #4 HEAD + exact-HEAD CI.
4. `AGENTS.md` — autonomous execution standard.

## Commercial invariants
- Exactly **5 free products total per account**, no card and no monthly reset.
- After free allowance: only **ImportVerifier Unlimited · €9.95/month**.
- `starter` is only the internal compatibility ID for Unlimited.
- End users see **ImportVerifier AI**, never provider/model names.
- Paid checkout remains fail-closed until truthful legal provider data exists.

## DONE — release-critical foundations
- Lifetime 5-product quota is enforced cumulatively in production by `free_account_usage`/`enforce_free_lifetime_product_quota`; historical monthly usage is inert compatibility state.
- Production quota was probed transactionally on 2026-08-31 against an eligible zero-usage free account: a five-product analysis was accepted, the immediately following sixth product was rejected by the lifetime trigger, the counter remained 5, and the entire probe was rolled back. No production test analysis or quota change was persisted.
- Production database rechecked 2026-08-31: zero accounts exceed the free lifetime limit; observed maximum free usage is exactly 5.
- Public launch acceptance sample `public/importverifier-sample-5-products.csv` contains exactly five distinct EU products; regression coverage parses it and verifies five engine results.
- Stripe live canonical offer verified: `ImportVerifier Unlimited`, EUR 9.95/month, price `price_1UAJy5HJnO8odw1Mn4jMVjFt`; checkout revalidates active price/currency/amount/month interval and only accepts internal `starter`.
- Checkout and customer portal no longer return raw Stripe/Supabase exception messages to customers; regression tests protect provider-error privacy.
- Billing entitlement/webhook/portal/cancellation and account-deletion billing safety are implemented.
- RLS/account isolation, evidence ownership FK, privileged-table deny-all posture and server-only privilege hardening are implemented.
- Evidence persists canonical requirement/status/document/page/note/HTTPS URL; unsafe persisted URLs are stripped before rendering/export.
- Official Radar links are allowlisted HTTPS EU regulatory sources and are revalidated at ingestion/API/render boundaries.
- Production AI policy is fail-closed `free_only`; CSV/XLS/XLSX stay local, supported text/doc/image inputs use free-compatible extraction when configured, unsupported scanned/legacy formats fail honestly rather than leaking premium spend.
- External AI calls now share a 30-second abort timeout; production release validation rejects malformed, non-HTTPS or credential-bearing `SILICONFLOW_BASE_URL` values, and runtime validates the provider base URL before use.
- Product-extraction request-body overflow handling uses typed `RequestBodyTooLargeError`; oversized uploads deterministically map to HTTP 413 and regression tests protect declared and streamed overflow cases.
- EU regulatory engine, Product Regulatory Twin, persisted evidence readiness and Regulatory Impact Radar architecture are implemented.
- Official EUR-Lex RSS ingestion adapter, normalization, deduplication and protected internal refresh/ingest endpoints exist. RSS requests are bounded by size/time and now reject final redirect destinations outside HTTPS `eur-lex.europa.eu`. Production Radar event count last checked: 0, therefore live-monitoring claims remain disabled.
- Shopify/Amazon/Etsy connector architecture exists; capability slugs are localized for customers and OAuth/API remains unavailable until official credentials exist.
- Dashboard/auth/legal/intelligence/report surfaces are localized in ES/EN/FR/DE/IT/PT where customer-active.
- Google auth button includes a visible Google mark; production code pins Google/signup/recovery return flow to `https://importverifier.netlify.app`.
- PWA private-cache hardening, dynamic localized manifest, real own-brand icons, safe areas, 44px touch targets, iOS form sizing and review-modal keyboard/scroll behavior are covered.
- Mobile upload control accepts spreadsheets, documents and photo/camera input; server supports HEIC/HEIF with extension/MIME agreement.
- PDF/XLSX/template downloads use explicit filenames, browser Blob URLs, DOM click and delayed `URL.revokeObjectURL`; regression tests protect this lifecycle for mobile/PWA static QA.
- PDF/Excel reports include premium visual hierarchy, localized regulatory narrative, evidence and source traceability.
- `README.md`, `SETUP.md` and `IMPORT_RULES_VERIFIER.md` no longer instruct developers to use the legacy EU Product Radar production domain, monthly free resets or obsolete Starter/Growth/Pro/Business public plans.
- US/CN/GB/JP remain structurally isolated and `ACTIVE_MARKET_CODES` remains EU-only.

## CI / HEAD last verified 2026-08-31
- Functional/security HEAD before this handoff commit: `a9b66fb0a0c1a1f5146658efca76a9ce44f74ac2`.
- Exact-head `ImportVerifier release check` run **#931 SUCCESS**: install, tests, typecheck and build all passed.
- PR #4 remained **open**, **mergeable=true**, **not merged**.
- Netlify Deploy Preview was SUCCESS on the previously exact-checked branch head; recheck the new handoff HEAD status before calling current HEAD green.

## Production facts last checked 2026-08-31
- Supabase project: `hfuwwjdcyudflamwwnon`.
- Auth logs checked again after code hardening still show recent requests/referers from `https://euproductradar.netlify.app/`. Repository `netlify.toml` already fixes the canonical `NEXT_PUBLIC_SITE_URL`, so Supabase Site URL/redirect allowlist and/or higher-precedence Netlify environment configuration still require external correction and real retest.
- Supabase connector in this session does not expose Auth Site URL/redirect configuration writes; this is genuinely BLOCKED EXTERNAL rather than a code task.
- Supabase security advisor substantive WARN: leaked-password protection disabled. RLS-with-no-policy INFO rows are intentional server-only deny-all tables.
- Active Stripe subscriptions at last check: 0.
- Stripe live webhook exists on the canonical production endpoint; matching `STRIPE_WEBHOOK_SECRET` in Netlify is external configuration.
- Radar persisted events: 0; keep `REGULATORY_RADAR_LIVE=false` until real official ingestion succeeds.

## NEXT — execute without asking
1. Reconfirm exact new HEAD CI and Netlify Deploy Preview; repair any regression immediately.
2. Continue security sweep for remaining customer-visible API/provider error leakage and unsafe external URL/render/fetch boundaries.
3. Add explicit `.heif` to the Dashboard file picker when safely editing that large component; `image/*` already permits HEIF and server support is correct.
4. Continue static mobile/iPhone/iPad/PWA QA around actual upload/export/save-to-Files flows; real-device/browser execution is BLOCKED EXTERNAL.
5. Recheck production auth logs after Supabase/Netlify domain wiring is corrected; canonical Google login must never return to the old domain.
6. Use `/importverifier-sample-5-products.csv` for final new-account acceptance once canonical auth works; then prove history/PDF/XLSX end-to-end from that account.
7. Keep EU as the only active market; US/CN/GB/JP must not activate before legally substantiated market documentation and localization are complete.
8. Do not remove historical plan IDs/monthly schema merely for naming cleanliness.

## BLOCKED EXTERNAL / browser or service-console work
- Supabase Auth: set Site URL to `https://importverifier.netlify.app` and allow canonical callbacks; then retest Google login and confirm Auth logs never return to the old domain.
- Netlify: confirm production deploy tracks the latest PR #4 branch and that any UI-scoped `NEXT_PUBLIC_SITE_URL` override is canonical.
- Netlify: configure live `STRIPE_WEBHOOK_SECRET`, canonical Stripe price env, SiliconFlow/free-only AI vars and truthful legal-provider variables.
- Netlify + GitHub: configure the same strong `REGULATORY_INGEST_SECRET`; ingest real EUR-Lex events before enabling Radar live.
- Supabase Auth dashboard: enable leaked-password protection plus appropriate CAPTCHA/signup-abuse controls.
- Configure and test production SMTP/signup/reset with a non-owner email.
- Real iPhone/iPad/PWA upload/export/save-to-Files QA requires a real browser/device.
- Official Shopify/Amazon/Etsy apps and credentials are required before connectors can become active.

## Definition of finished
Do not call ImportVerifier finished until exact current CI is green; canonical Netlify runs latest code; a genuinely new user can complete login on the canonical domain and consume exactly five free products lifetime; sixth-product rejection is proven; history isolation and PDF/XLSX work end-to-end; production free-only AI works without premium leakage; legal/billing/webhook/portal/cancellation pass; Radar claims match real ingestion; inactive markets/connectors remain honest; and desktop/iPhone/iPad/PWA QA passes.
