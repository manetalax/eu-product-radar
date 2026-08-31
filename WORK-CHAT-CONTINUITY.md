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
- **PWA public-shell cache boundary hardened 2026-08-31:** service-worker precache fetches public shell resources with `credentials: 'omit'`; responses varying on `Cookie` or `Authorization` are not cached; query-bearing navigations cannot overwrite canonical pathname cache entries; activation deletes only obsolete `importverifier-shell-*` caches instead of unrelated origin caches. Regression coverage locks these invariants.
- Upload UI supports spreadsheet/document/photo inputs and declares `.heic`, `.heif` and `image/*`.
- **Mobile photo MIME robustness hardened 2026-08-31:** Product Extraction now validates PNG/JPEG/WebP/HEIC/HEIF from binary signatures plus filename extension and any MIME metadata that exists. Legitimate Safari/iOS/iPadOS images with blank/`application/octet-stream` MIME are accepted only when their magic bytes agree; extension spoofing and MIME/signature disagreement remain fail-closed. The image `data:` payload is normalized to the detected MIME before calling vision.
- **Multi-file drag/drop ambiguity removed 2026-08-31:** Dashboard now rejects drops containing more than one file without processing any of them, shows localized ES/EN/FR/DE/IT/PT guidance, and ignores drag/drop imports while busy/loading or when the free quota is exhausted. The touch/file picker remains intentionally single-file. Regression coverage prevents silently returning to `files[0]` behavior.
- Mobile cards wrap long unbroken filenames and constrain flex children.
- PDF/XLSX/template downloads use explicit filenames, Blob URLs and 60-second delayed revocation for Safari/iPadOS save-to-Files robustness.
- Dashboard API parsing is defensive against malformed/non-object JSON.
- **Intelligence Suite client API boundary hardened 2026-08-31:** history, detail, Evidence, Radar and ImportVerifier AI responses are parsed as defensive JSON objects; failed history/detail HTTP states no longer continue as trusted data; malformed/non-object JSON degrades safely; AI responses require a non-empty string answer; raw server/provider `body.error` values are never rendered to customers. Regression coverage prevents reintroducing parser/provider error leakage.
- PDF/Excel reports include localized regulatory narrative, evidence and source traceability; spreadsheet formula injection is avoided by writing user strings as strings.
- Public/developer docs no longer point to the obsolete production domain, monthly free reset or legacy public pricing tiers.
- `ACTIVE_MARKET_CODES` remains EU-only; US/CN/GB/JP are structurally isolated and inactive.

## CI / HEAD last verified 2026-08-31
- Functional head `2a64ef2a5c27f2c3b4089873ebc0582814f62bef` contains the hardened PWA public-shell cache boundary plus defensive Intelligence Suite API parsing/error privacy and their regression coverage.
- GitHub `ImportVerifier release check` **#1087 SUCCESS** on that exact functional head: `npm ci`, **257 tests**, `npm run typecheck` and `npm run build` passed.
- Intermediate release check **#1085 FAILURE** was caused only by a test RegExp `s` flag incompatible with the current TypeScript target; production code/tests otherwise passed. Commit `2a64ef2a…` replaced the incompatible assertion and #1087 verified the repair.
- Previous exact-head Netlify Deploy Preview for **importverifier** was READY; reconfirm the preview after this continuity-only commit before treating the newest HEAD as preview-verified.
- PR #4 remains **open** and **not merged**.

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
1. Reconfirm exact newest HEAD GitHub CI and Netlify Deploy Preview after this continuity-only commit; repair any regression immediately.
2. Harden Dashboard client-side Stripe navigation as defense in depth: reuse `trustedStripeNavigationUrl` before `window.location.assign` for Checkout and Portal, without weakening the already server-side allowlisted billing boundary.
3. Continue static mobile/iPhone/iPad/PWA QA around camera/photo import, drag/drop states and save-to-Files; real-device validation remains external.
4. Continue security sweep of remaining client API response-shape/trust boundaries and customer-facing external links without duplicating the already-protected market/evidence/Radar URL work.
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
