# ImportVerifier — Chat ↔ Work continuity protocol

## Canonical project
- Production target: https://importverifier.netlify.app/
- Repository: `manetalax/eu-product-radar`
- PR: `#4`
- Branch: `feat/import-rules-verifier-branding`
- Never create a replacement project and never merge PR #4 unless the owner explicitly asks.

## Read order
1. This file — latest operational state; wins over stale text.
2. `WORK-HANDOFF-IMPORTVERIFIER.md` — background/architecture.
3. Latest PR #4 HEAD + exact-HEAD CI.
4. `AGENTS.md` — autonomous execution standard.

## Commercial invariants
- Exactly **5 free products total per account**, no card, no monthly reset.
- After free allowance: only **ImportVerifier Unlimited · €9.95/month**.
- `starter` remains the internal compatibility ID for Unlimited.
- Unlimited has no public product ceiling; technical rate limits are anti-abuse only.
- End users see only **ImportVerifier AI**, never provider/model names.
- Paid checkout remains fail-closed in production until truthful legal provider data is configured.

## DONE — release-critical foundations
- Lifetime 5-product free quota enforced cumulatively; historical monthly trigger no longer governs analyses.
- Stripe Unlimited live price is `price_1UAJy5HJnO8odw1Mn4jMVjFt`, EUR 9.95 monthly; checkout revalidates canonical price/currency/periodicity and only accepts internal `starter`.
- Billing entitlement, portal, signed webhook idempotency/recovery and account deletion cancellation safety are implemented.
- RLS/account isolation, composite evidence ownership FK, server-only privilege hardening and SECURITY DEFINER restrictions are implemented.
- Evidence persists requirement/status/document/page/note/HTTPS URL and keeps canonical keys across language changes.
- Evidence, marketplace and Radar URLs reject malformed/HTTP/credential-bearing/whitespace-bearing unsafe values where applicable.
- Failed evidence saves roll back optimistic UI state and restore unsaved values with localized errors.
- Production AI policy is fail-closed `free_only`; CSV/XLS/XLSX remain local/AI-free, supported documents/images use free extraction/vision when configured, and unsupported scanned/legacy inputs do not leak premium spend.
- AI telemetry stores no prompt/product/email content or user PII; server reconstructs regulatory context and treats stored content as untrusted data.
- Versioned EU regulatory engine, Product Regulatory Twin, persisted evidence readiness and Regulatory Impact Radar foundation are implemented.
- Radar ingestion has official EUR-Lex RSS adapter, allowlisted official-source normalization, idempotent persistence and protected refresh/ingest endpoints; do not claim live monitoring until real official events exist.
- Shopify/Amazon/Etsy connector architecture exists; official OAuth/API adapters remain external-credential work and must not be advertised active.
- PWA private-content cache hardening, security headers, same-origin protections, 44px touch targets, safe areas, iOS 16px form controls and product-review modal keyboard/scroll behavior are covered.
- Main dashboard, legal/auth surfaces, readiness/evidence, regulatory presentation, PDF/Excel, worksheet tabs and market/operator display are localized in ES/EN/FR/DE/IT/PT where customer-active.
- Google auth button includes visible Google mark.
- Sitemap/robots/canonical metadata/OpenGraph own-brand assets are implemented.

## DONE — latest pass 2026-08-31
- Intelligence Suite no longer derives customer labels from connector capability slugs and its customer-visible section copy is language-aware.
- Production login bug was reproduced from Supabase Auth logs: Google OAuth was using the legacy `https://euproductradar.netlify.app/` return flow.
- Auth callbacks are now pinned to `https://importverifier.netlify.app` in production across Google OAuth, signup confirmation and password recovery, with regression tests that reject the legacy domain.
- Persisted evidence URLs are now revalidated on client read and again during Excel export through `safeEvidenceUrl`; unsafe legacy/manipulated URLs are rendered as empty text and never become active Excel hyperlinks.
- Added `tests/evidence-export-url-hardening.test.ts` for HTTPS-only, no-credentials, no-whitespace and export-time revalidation invariants.
- Radar now shares one client-safe official-source URL validator between ingestion, API output and rendering (`lib/regulatory-source-url.ts`). Only HTTPS URLs on allowed official EU hosts survive; lookalikes, credentials, whitespace, HTTP and malformed values are stripped/rejected.
- `app/api/regulatory-changes/route.ts` sanitizes persisted `source_url` before any authenticated client receives it; `relevantRadarChanges` revalidates again before rendering, and Intelligence Suite only creates a link when the sanitized official URL exists.
- Radar regression coverage includes malicious historical values, hostname lookalikes and API-boundary sanitization.
- Dashboard mobile import layout fixed: `.import-actions` itself spans the full upload card below 700px; choose-file/template controls are full-width 48px touch targets.
- Added `tests/dashboard-mobile-import.test.ts` to protect mobile upload layout and accepted spreadsheet/document/photo inputs.
- Product image extraction now accepts `.heif` filenames consistently with the already-supported `image/heif` MIME while retaining strict extension/MIME agreement and HEIC↔HEIF compatibility; spreadsheet formats remain local-only.
- Price regression test is bound to `UNLIMITED_PLAN.monthlyPriceEur`, protecting canonical EUR 9.95 locale formatting without a duplicated test literal as the source of truth.
- Supabase security advisor rechecked: RLS-with-no-policy INFO notices are intentional deny-all server-only tables (`ai_usage_events`, `api_rate_limits`, `regulatory_change_events`, `stripe_webhook_events`); do not add client policies merely to silence the advisor. The substantive WARN remains leaked-password protection disabled.
- PDF export upgraded from a mostly linear text report to a premium consulting-style document system: branded dark cover, executive KPI cards, reusable section hierarchy, product score callouts, page chrome and separated footer treatment. Evidence, official-source references, uncertainty and legal disclaimers remain intact.
- Regulatory Excel worksheet upgraded to the same premium visual language: branded navy title band, explanatory scope band, purple headers, alternating rows, borders and print hierarchy while preserving filters, localized labels, regulatory evidence and source traceability.
- PWA manifest is now generated dynamically from the active server language instead of remaining permanently Spanish. ES/EN/FR/DE/IT/PT receive localized description/shortcut labels while brand identity, installation scope and icon assets remain stable.
- Service worker cache moved to `importverifier-shell-v3`; the localized `/manifest.webmanifest` is deliberately excluded from the offline shell and fetch cache so a user-language manifest cannot become stale after a language change. Private routes remain excluded.
- PWA/icon/upload/export regression tests cover manifest language parity, real icon assets, private-cache exclusion, HEIC/HEIF input safety and premium report structure.
- Concurrent mobile QA additionally corrected Intelligence Suite safe-area padding so left/right insets are independent, retains bottom safe-area spacing and keeps 16px iOS form controls; `tests/intelligence-suite-mobile-safe-area.test.ts` protects these invariants.
- Latest validated branch HEAD `f9af353e6f3aa6b200c6b957f049723a8fb883a8` passed exact-head `ImportVerifier release check` run #873 **SUCCESS**: tests, typecheck and build all passed. Core PWA/export functional work is contained in `5164e0cd8eef43768e1b0f2c5d448d17fc9a85f2` and predecessors.

## Production facts last checked 2026-08-31
- Supabase project: `hfuwwjdcyudflamwwnon`.
- Supabase Auth logs showed legacy-domain OAuth traffic before code hardening; Auth Site URL / Redirect URL configuration must still be corrected externally so Supabase never falls back to the old domain.
- No free-usage counter checked above 5; production lifetime quota trigger/function are `analyses_enforce_free_lifetime_product_quota` / `enforce_free_lifetime_product_quota`.
- Legacy `monthly_product_usage` remains inert compatibility/history; do not drop casually.
- Active Stripe subscriptions at last check: 0.
- Stripe live webhook exists and is enabled on canonical production URL; signing secret must still be configured in Netlify externally.
- Radar events at last check: 0; keep live claim disabled.
- `pg_cron` and `pg_net` are not enabled; do not add hidden dependencies on them.
- Supabase security advisor substantive external setting still pending: leaked-password protection disabled.

## IN PROGRESS / NEXT — execute without asking
1. Verify exact latest HEAD CI after this handoff-only commit; fix any tests/typecheck/build regression immediately.
2. Continue static desktop/iPhone/iPad/PWA export QA: inspect blob-download lifecycle and save-to-Files behavior for PDF/XLSX/template generation; real-device/browser execution remains BLOCKED EXTERNAL.
3. Continue security sweep for remaining customer-visible external URLs or values that become hyperlinks outside Evidence/Radar/documentary official sources.
4. Continue customer-visible i18n sweep inside Intelligence Suite/reports and PWA install surfaces; branded shorthand may remain, explanatory fallback English must not leak into non-English locales.
5. Future-market US/CN/GB/JP documentary narratives remain non-customer-active; fully localize and substantiate them before activation. `ACTIVE_MARKET_CODES` must remain EU-only until that work is complete.
6. Continue canonical-price audit when new surfaces are touched; all public price rendering must originate from `UNLIMITED_PLAN` and remain EUR 9.95/month.
7. Consider adding explicit `.heif` to the Dashboard file picker accept list in addition to `image/*` when next touching that component; server support is already correct.
8. Refresh `WORK-HANDOFF-IMPORTVERIFIER.md` only after a material architecture/release-state change or external production wiring change.
9. Do not remove legacy monthly-usage schema or historical plan IDs merely to simplify naming.

## BLOCKED EXTERNAL / USER OR WORK BROWSER NEEDED
- Supabase Auth URL Configuration: set Site URL to `https://importverifier.netlify.app`, ensure redirect allowlist includes `https://importverifier.netlify.app/auth/callback`, and stop using the legacy EU Product Radar production URL.
- Netlify: confirm canonical production site deploys latest PR #4 branch and production env has `NEXT_PUBLIC_SITE_URL=https://importverifier.netlify.app`.
- After those changes, retest Google login from canonical production and confirm Supabase Auth logs no longer reference the old domain.
- Netlify: set live `STRIPE_WEBHOOK_SECRET`; confirm canonical `STRIPE_PRICE_STARTER`.
- Netlify: configure `SILICONFLOW_API_KEY`, `AI_COST_POLICY=free_only` and free-model vars.
- Netlify + GitHub secret: configure same strong `REGULATORY_INGEST_SECRET`; only after successful official ingestion set `REGULATORY_RADAR_LIVE=true`.
- Supabase Auth dashboard: enable leaked-password protection and appropriate CAPTCHA/signup-abuse controls.
- Verify Google OAuth provider redirect setup remains attached to the canonical Supabase callback and production app flow.
- Verify production SMTP/signup/reset with a non-owner email.
- Real iPhone/iPad/PWA upload/export/save-to-Files QA requires browser/device execution.
- Configure truthful legal provider identity/address/tax/jurisdiction/refund policy; paid checkout deliberately remains blocked until then.
- Register official Shopify OAuth app/scopes, Amazon SP-API app/permissions and Etsy OAuth app before advertising connectors as active.

## Continuous execution
Keep working while safe/actionable work remains. External blockers must not stop unrelated work. Never repeat DONE work. Never merge PR #4 without explicit owner instruction.

## Definition of finished
Do not call ImportVerifier finished until exact current CI is green; canonical Netlify runs latest code; 5-product lifetime trial works end-to-end; legal provider data is published; Unlimited checkout/webhook/portal/cancellation pass; production free-only AI works without premium leakage; supported inputs behave honestly; dashboard/reports follow user language; evidence/account isolation passes; Radar claims match actual ingestion; connectors are either truly working or clearly unavailable; and desktop/iPhone/iPad/PWA QA passes.
