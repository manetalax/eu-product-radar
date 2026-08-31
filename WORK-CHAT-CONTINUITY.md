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
- Lifetime 5-product quota is enforced cumulatively in production by `free_account_usage`/`enforce_free_lifetime_product_quota`; a transactional production probe accepted five products, rejected the sixth and rolled back cleanly. Zero observed free accounts exceed five.
- Analysis creation is idempotent for mobile/network retries; duplicate `requestId` races recover the existing authenticated analysis without double-consuming quota.
- Public acceptance sample `public/importverifier-sample-5-products.csv` contains exactly five distinct EU products and is regression-tested.
- Stripe live canonical offer is `ImportVerifier Unlimited` at EUR 9.95/month (`price_1UAJy5HJnO8odw1Mn4jMVjFt`). Checkout revalidates price/currency/amount/month interval and only accepts internal `starter`.
- Checkout/portal URLs are server-allowlisted to canonical Stripe HTTPS hosts; provider/Supabase exception details do not leak to customers. Subscription synchronization, webhook ordering, entitlement, cancellation and account-deletion billing safety fail closed.
- RLS/account isolation, evidence ownership, privileged-table deny-all posture and server-only privilege hardening are implemented.
- Evidence URLs are sanitized at persistence/API/render/export/AI-context boundaries.
- Official Radar URLs are HTTPS allowlisted and revalidated at ingestion/API/render/AI-context boundaries; non-default ports are rejected.
- EU assessment URLs are revalidated at the final React render boundary.
- **Market guidance source policy hardened 2026-08-31:** EU/US/CN/GB/JP guidance now has explicit per-market official-host allowlists with HTTPS-only, no credentials, no non-default ports and no implicit future-market subdomains. Regression coverage verifies every current `SOURCES` constant and rejects lookalike/unsafe destinations. Future markets remain inactive.
- Production AI policy is fail-closed `free_only`; CSV/XLS/XLSX stay local, supported text/doc/image inputs use free-compatible extraction when configured, and unsupported scanned/legacy formats fail honestly instead of leaking premium spend.
- External AI calls are bounded by 30-second abort timeouts; production release validation/runtime reject unsafe provider base URLs.
- Product Extraction, Evidence, ImportVerifier AI and Radar ingestion preserve HTTP 413 for oversized bodies; internal Radar ingestion also rejects non-JSON content with 415.
- Canonical site-origin validation is fail-closed and exact-origin protected.
- Supabase session refresh middleware covers authenticated client APIs while excluding Stripe webhook/internal endpoints.
- EU regulatory engine, Product Regulatory Twin, persisted evidence readiness and Regulatory Impact Radar architecture are implemented.
- Official EUR-Lex RSS adapter, normalization, deduplication and protected refresh/ingest endpoints exist. Radar live claims remain disabled while production event count is 0.
- Shopify/Amazon/Etsy connector architecture exists; OAuth/API remains unavailable until official credentials exist.
- Dashboard/auth/legal/intelligence/report surfaces are localized in ES/EN/FR/DE/IT/PT where customer-active.
- Google auth button includes a visible Google mark; production code pins Google/signup/recovery return flow to the canonical ImportVerifier domain.
- PWA private-cache hardening, localized manifest, own-brand icons, safe areas, 44px touch targets, iOS form sizing and review-modal keyboard/scroll behavior are covered.
- PWA cache is restricted to public static style/script/image/font requests and refuses private/no-store/no-cache responses.
- Upload UI supports spreadsheet/document/photo inputs and declares `.heic`, `.heif` and `image/*`; server recognizes HEIC/HEIF when MIME information agrees.
- Mobile cards wrap long unbroken filenames and constrain flex children.
- PDF/XLSX/template downloads use explicit filenames, Blob URLs and 60-second delayed revocation for Safari/iPadOS save-to-Files robustness.
- Dashboard API parsing is defensive against malformed/non-object JSON.
- PDF/Excel reports include localized regulatory narrative, evidence and source traceability; spreadsheet formula injection is avoided by writing user strings as strings.
- Public/developer docs no longer point to the obsolete production domain, monthly free reset or legacy public pricing tiers.
- `ACTIVE_MARKET_CODES` remains EU-only; US/CN/GB/JP are structurally isolated and inactive.

## CI / HEAD last verified 2026-08-31
- Previous exact head `63435feb9794a27565c7fea2bc316a3f6e0bac0f` had GitHub release verification **SUCCESS** and Netlify Deploy Preview for **importverifier** **SUCCESS**.
- Functional security head `a13a405f2cfaca746de7a058e7e3d054e0e0c373` adds the market-guidance host policy and its regression tests. Exact-head GitHub `verify` completed **SUCCESS**; Netlify checks were still processing at the last observation.
- PR #4 remains **open**, mergeable and **not merged**.

## Production facts last checked 2026-08-31
- Supabase project: `hfuwwjdcyudflamwwnon`.
- Free usage read-only check: maximum observed lifetime usage is 5 and zero accounts exceed 5.
- `subscriptions` had no persisted subscription rows at last read-only check.
- Recent Auth logs still showed requests/referers from `https://euproductradar.netlify.app/`; repository config is canonical, so Supabase Site URL/redirect allowlist and/or a higher-precedence Netlify environment override still require external correction and real retest.
- Supabase connector available here does not expose Auth Site URL/redirect writes: **BLOCKED EXTERNAL**.
- Supabase leaked-password protection remains disabled: **BLOCKED EXTERNAL** dashboard setting.
- Stripe live webhook exists on the canonical endpoint; matching `STRIPE_WEBHOOK_SECRET` in Netlify is **BLOCKED EXTERNAL** configuration.
- Radar persisted events remain 0; keep `REGULATORY_RADAR_LIVE=false` until official ingestion succeeds.

## IN PROGRESS / NEXT — execute without asking
1. Reconfirm exact newest HEAD GitHub CI and Netlify Deploy Preview; repair any regression immediately.
2. **Mobile photo MIME robustness:** static QA found that `Dashboard` substitutes `application/octet-stream` when browser `File.type` is empty, while Product Extraction currently requires image MIME agreement for known image extensions. Harden the path for legitimate iOS/iPadOS HEIC/HEIF/JPEG selections with missing MIME without weakening spoofing protection; prefer magic-byte/type normalization and regression tests rather than trusting extension alone.
3. Continue static mobile/iPhone/iPad/PWA QA around drag/drop multiple-file behavior and save-to-Files. Current drag/drop intentionally consumes only the first file; make that behavior explicit or reject multi-file drops rather than silently ignoring extras if UX copy/flow is updated.
4. Continue security sweep of external links and customer-facing provenance. Market guidance host drift is now regression-protected; keep future-market domains exact and inactive until legally substantiated.
5. Recheck production Auth logs after Supabase/Netlify domain wiring is corrected; canonical Google login must never return to the old domain.
6. Use `/importverifier-sample-5-products.csv` for final new-account acceptance once canonical Auth works; prove history/PDF/XLSX end-to-end from that account.
7. Keep EU as the only active market; do not remove historical plan IDs/monthly schema merely for naming cleanliness.

## BLOCKED EXTERNAL / browser or service-console work
- Supabase Auth: set Site URL to `https://importverifier.netlify.app` and canonical callbacks; retest Google login and Auth logs.
- Netlify: confirm production branch/env override, live `STRIPE_WEBHOOK_SECRET`, canonical Stripe env, SiliconFlow/free-only AI vars and truthful legal-provider variables.
- Netlify + GitHub: configure the same strong `REGULATORY_INGEST_SECRET`; ingest real EUR-Lex events before enabling Radar live.
- Supabase Auth dashboard: enable leaked-password protection and suitable CAPTCHA/signup-abuse controls.
- Configure/test production SMTP/signup/reset with a non-owner email.
- Real iPhone/iPad/PWA upload/export/save-to-Files QA requires a real browser/device.
- Official Shopify/Amazon/Etsy apps and credentials are required before connectors can become active.

## Definition of finished
Do not call ImportVerifier finished until exact current CI is green; canonical Netlify runs latest code; a genuinely new user can complete login on the canonical domain and consume exactly five free products lifetime; sixth-product rejection is proven; history isolation and PDF/XLSX work end-to-end; production free-only AI works without premium leakage; legal/billing/webhook/portal/cancellation pass; Radar claims match real ingestion; inactive markets/connectors remain honest; and desktop/iPhone/iPad/PWA QA passes.
