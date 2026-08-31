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
- Analysis creation is idempotent for mobile/network retries. If two concurrent requests race with the same `requestId`, a `23505` duplicate is recovered by re-reading that same analysis under the authenticated `user_id` and returning success instead of a false 503; the failed duplicate statement cannot consume quota twice.
- Public launch acceptance sample `public/importverifier-sample-5-products.csv` contains exactly five distinct EU products; regression coverage parses it and verifies five engine results.
- Stripe live canonical offer verified: `ImportVerifier Unlimited`, EUR 9.95/month, price `price_1UAJy5HJnO8odw1Mn4jMVjFt`; checkout revalidates active price/currency/amount/month interval and only accepts internal `starter`.
- Checkout and customer portal no longer return raw Stripe/Supabase exception messages to customers; regression tests protect provider-error privacy.
- Stripe Checkout and Billing Portal navigation now fail closed at the server boundary: only HTTPS `checkout.stripe.com` is accepted for checkout and only HTTPS `billing.stripe.com` for portal, with credentials, non-default ports, lookalike hosts and cross-surface URLs rejected before they can reach client navigation.
- Stripe subscription synchronization fails closed for unknown prices, metadata/price mismatches, unexpected multi-item subscriptions and customer/user identity mismatches; persisted `stripe_customer_id` is authoritative when present. Subscription webhook events re-fetch current Stripe state before persistence to avoid out-of-order regressions.
- Billing entitlement/webhook/portal/cancellation and account-deletion billing safety are implemented.
- Checkout return confirmation is bounded and defensive: 20-second client timeout, defensive JSON parsing and localized safe failure messaging rather than browser/parser details.
- RLS/account isolation, evidence ownership FK, privileged-table deny-all posture and server-only privilege hardening are implemented.
- Evidence persists canonical requirement/status/document/page/note/HTTPS URL; unsafe persisted URLs are stripped before rendering/export.
- Evidence URL hardening now also happens at the server API boundary and before evidence enters ImportVerifier AI context, so legacy unsafe persisted URLs cannot be returned or propagated to new consumers.
- Official Radar links are allowlisted HTTPS EU regulatory sources and are revalidated at ingestion/API/render boundaries. Explicit non-default HTTPS ports are rejected, reducing the official-source fetch surface without affecting canonical EU endpoints.
- EU regulatory assessment links are revalidated again at the final React render boundary using the official-source allowlist; unsafe or legacy URLs are omitted rather than rendered as external anchors.
- Radar source URLs are revalidated again immediately before persisted Radar events enter ImportVerifier AI context, so legacy or altered rows cannot propagate an unsafe source URL into model context.
- Production AI policy is fail-closed `free_only`; CSV/XLS/XLSX stay local, supported text/doc/image inputs use free-compatible extraction when configured, unsupported scanned/legacy formats fail honestly rather than leaking premium spend.
- External AI calls are bounded by 30-second abort timeouts, including the direct premium document fallback path that is unreachable under production `free_only`; production release validation rejects malformed, non-HTTPS or credential-bearing `SILICONFLOW_BASE_URL` values, and runtime validates the provider base URL before use.
- Product-extraction request-body overflow handling uses typed `RequestBodyTooLargeError`; oversized uploads deterministically map to HTTP 413 and regression tests protect declared and streamed overflow cases. The 8 MB API body ceiling safely accommodates base64 expansion of the advertised 5 MB file limit.
- Request-size semantics are consistent across Product Extraction, Evidence, ImportVerifier AI and internal Radar ingestion: oversized JSON bodies preserve HTTP 413 instead of collapsing into generic 400 responses. Internal Radar ingestion also rejects non-`application/json` content with HTTP 415. Regression coverage protects these boundaries.
- Canonical site-origin validation is fail-closed: runtime accepts only a root HTTPS origin (or localhost HTTP for local development), rejects credentials/path/query/hash, and same-origin APIs require an exact canonical Origin header.
- Supabase session refresh middleware covers all authenticated client APIs used by analyses, Evidence, Product Extraction, Regulatory Agent, Regulatory Changes, account and billing while intentionally excluding Stripe webhook/internal endpoints.
- EU regulatory engine, Product Regulatory Twin, persisted evidence readiness and Regulatory Impact Radar architecture are implemented.
- Official EUR-Lex RSS ingestion adapter, normalization, deduplication and protected internal refresh/ingest endpoints exist. RSS requests are bounded by size/time and reject final redirect destinations outside HTTPS `eur-lex.europa.eu`. Production Radar event count last checked: 0, therefore live-monitoring claims remain disabled.
- Shopify/Amazon/Etsy connector architecture exists; capability slugs are localized for customers and OAuth/API remains unavailable until official credentials exist.
- Dashboard/auth/legal/intelligence/report surfaces are localized in ES/EN/FR/DE/IT/PT where customer-active.
- Google auth button includes a visible Google mark; production code pins Google/signup/recovery return flow to `https://importverifier.netlify.app`.
- PWA private-cache hardening, dynamic localized manifest, real own-brand icons, safe areas, 44px touch targets, iOS form sizing and review-modal keyboard/scroll behavior are covered.
- PWA cache boundary is restricted to static style/script/image/font requests and refuses responses marked private/no-store/no-cache; arbitrary same-origin GET/fetch responses are not opportunistically cached.
- Mobile upload control accepts spreadsheets, documents and photo/camera input; server supports HEIC/HEIF with extension/MIME agreement and the Dashboard picker now declares `.heic`, `.heif` and `image/*` explicitly.
- Mobile Dashboard cards now constrain flex children and wrap long unbroken filenames in selected-analysis, history and content headings, preventing up-to-120-character accepted filenames from overflowing narrow iPhone/iPad layouts; regression coverage protects the CSS boundary.
- PDF/XLSX/template downloads use explicit filenames, browser Blob URLs, DOM click and a 60-second delayed `URL.revokeObjectURL`; the CSV template window is aligned with PDF/XLSX for Safari/iPadOS save-to-Files robustness. Regression coverage protects the lifecycle.
- Dashboard API response parsing is defensive: malformed/non-object upstream JSON can no longer surface browser/parser exception details to customers and falls back to localized application errors.
- PDF/Excel reports include premium visual hierarchy, localized regulatory narrative, evidence and source traceability. ExcelJS formulas are created only from application-owned formula objects; user strings are written as string cell values.
- `README.md`, `SETUP.md` and `IMPORT_RULES_VERIFIER.md` no longer instruct developers to use the legacy EU Product Radar production domain, monthly free resets or obsolete Starter/Growth/Pro/Business public plans.
- US/CN/GB/JP remain structurally isolated and `ACTIVE_MARKET_CODES` remains EU-only.

## CI / HEAD last verified 2026-08-31
- Functional/security/mobile head `a59f9f448585900c617cf396ad538456db7b449e` includes the Stripe external-navigation allowlist, final-render EU regulatory URL sanitization and long-filename mobile wrapping regressions.
- Exact-head `ImportVerifier release check` **#1044 SUCCESS** for `a59f9f448585900c617cf396ad538456db7b449e`: install, all tests, typecheck and build passed.
- PR #4 remained **open** and **not merged**.
- Netlify Deploy Preview for the new HEAD still requires recheck; GitHub commit-status endpoint did not expose a Netlify status for the latest commit, so do not call this HEAD production-verified without a Netlify-side confirmation.

## Production facts last checked 2026-08-31
- Supabase project: `hfuwwjdcyudflamwwnon`.
- Free usage read-only check: maximum observed lifetime usage is 5, zero accounts exceed 5, and two accounts are currently exactly at the free limit.
- `subscriptions` currently has no persisted subscription rows; no unexpected active paid entitlement was observed.
- Auth logs checked again after code hardening still show recent requests/referers from `https://euproductradar.netlify.app/`; no newer canonical-domain auth event was visible. Repository `netlify.toml` already fixes the canonical `NEXT_PUBLIC_SITE_URL`, so Supabase Site URL/redirect allowlist and/or higher-precedence Netlify environment configuration still require external correction and real retest.
- Supabase connector in this session does not expose Auth Site URL/redirect configuration writes; this is genuinely BLOCKED EXTERNAL rather than a code task.
- Supabase security advisor substantive WARN: leaked-password protection disabled. RLS-with-no-policy INFO rows are intentional server-only deny-all tables.
- Stripe live webhook exists on the canonical production endpoint; matching `STRIPE_WEBHOOK_SECRET` in Netlify is external configuration.
- Radar persisted events: 0; keep `REGULATORY_RADAR_LIVE=false` until real official ingestion succeeds.

## NEXT — execute without asking
1. Reconfirm exact new handoff HEAD CI and Netlify Deploy Preview; repair any regression immediately.
2. Continue security sweep of remaining external links, especially the market guidance/documentation source layer, and keep future-market official domains explicit rather than broad; customer-facing URLs must remain HTTPS and provenance-bound.
3. Continue static mobile/iPhone/iPad/PWA QA around drag/drop multiple-file behavior, camera/photo selection, report downloads and save-to-Files; real-device/browser execution remains BLOCKED EXTERNAL.
4. Recheck production auth logs after Supabase/Netlify domain wiring is corrected; canonical Google login must never return to the old domain.
5. Use `/importverifier-sample-5-products.csv` for final new-account acceptance once canonical auth works; then prove history/PDF/XLSX end-to-end from that account.
6. Keep EU as the only active market; US/CN/GB/JP must not activate before legally substantiated market documentation and localization are complete.
7. Do not remove historical plan IDs/monthly schema merely for naming cleanliness.

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
