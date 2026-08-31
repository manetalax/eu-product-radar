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
- Intelligence Suite no longer derives customer labels from connector capability slugs such as `catalog-import`, `listing-import`, `asin-monitoring` or `compliance-alerts`.
- Added `lib/platform-capability-i18n.ts` with explicit ES/EN/FR/DE/IT/PT labels while preserving canonical internal connector capability IDs.
- `components/IntelligenceSuite.tsx` now renders capabilities through `platformCapabilityLabel(language, item)`.
- Intelligence Suite section headings/eyebrow are language-aware; Product Regulatory Twin, Regulatory Impact Radar and Connect no longer remain hardcoded English outside EN.
- Auth redirect hardening uses central origin validation in OAuth callback and email/signup/recovery confirmation routes.
- Production login bug was reproduced from Supabase Auth logs: Google OAuth `/authorize` and `/callback` were using the legacy `https://euproductradar.netlify.app/` referer/return flow at ~06:26 UTC.
- `components/AuthForm.tsx` no longer trusts `NEXT_PUBLIC_SITE_URL` for production OAuth/signup/reset callbacks. Non-local browser auth callbacks are pinned to `IMPORTVERIFIER_PRODUCTION_URL` (`https://importverifier.netlify.app`); localhost/127.0.0.1 remain usable for development.
- `app/auth/callback/route.ts` and `app/auth/confirm/route.ts` now force `IMPORTVERIFIER_PRODUCTION_URL` whenever `NODE_ENV === 'production'`, so a stale but syntactically valid Netlify URL cannot redirect authenticated users back to the obsolete domain.
- Regression tests now explicitly reject `euproductradar.netlify.app` leakage and protect canonical production routing.
- Functional HEAD `d597cb2544059540aeebd8b7ddc0d9a2b8982730` passed exact-head `ImportVerifier release check` run #801 **SUCCESS**: tests, typecheck and build all passed.
- Billing Checkout and Portal were inspected in the preceding sweep and already use `configuredSiteOrigin()` plus same-origin request protection; no duplicate change required.

## Production facts last checked 2026-08-31
- Supabase project: `hfuwwjdcyudflamwwnon`.
- Supabase Auth logs still show recent legacy-domain OAuth traffic; code is now fail-safe, but Auth Site URL / Redirect URL configuration must also be corrected externally so Supabase never falls back to the old domain.
- No free-usage counter checked above 5; production lifetime quota trigger/function are `analyses_enforce_free_lifetime_product_quota` / `enforce_free_lifetime_product_quota`.
- Legacy `monthly_product_usage` remains inert compatibility/history; do not drop casually.
- Active Stripe subscriptions at last check: 0.
- Stripe live webhook exists and is enabled on canonical production URL; signing secret must still be configured in Netlify externally.
- Radar events at last check: 0; keep live claim disabled.
- `pg_cron` and `pg_net` are not enabled; do not add hidden dependencies on them.
- Supabase security advisor substantive external setting still pending: leaked-password protection disabled.

## IN PROGRESS / NEXT — execute without asking
1. Verify exact latest HEAD CI after this handoff-only commit; fix tests/typecheck/build regressions immediately.
2. BLOCKED EXTERNAL: in Supabase Auth URL Configuration, set Site URL to `https://importverifier.netlify.app` and ensure redirect allowlist includes `https://importverifier.netlify.app/auth/callback` (and remove/stop using the legacy EU Product Radar URL for production auth).
3. BLOCKED EXTERNAL: in Netlify production env, set `NEXT_PUBLIC_SITE_URL=https://importverifier.netlify.app`; code no longer trusts a stale value for auth redirects, but billing/release config still correctly requires the canonical value.
4. After external URL config/deploy, retest Google login from the canonical production site and confirm Supabase auth logs no longer reference `euproductradar.netlify.app`.
5. Continue security/account/billing sweep for remaining user-controlled or persisted links rendered in UI/exports, especially external document/source links and recovery/failure paths not already covered.
6. Continue desktop/iPhone/iPad/PWA QA, especially upload/export flows, table overflow, keyboard/modal behavior, touch targets and safe-area edge cases.
7. Continue customer-visible i18n sweep inside Intelligence Suite and reports; branded shorthand may remain, but explanatory English copy must not leak into non-English locales.
8. Audit every customer-visible price surface to remain sourced from canonical plan definitions and exact locale-aware EUR 9.95 formatting.
9. Review generated PDF/Excel visual hierarchy for a more premium consulting-style report system without weakening evidence/uncertainty/legal disclaimers.
10. Refresh `WORK-HANDOFF-IMPORTVERIFIER.md` only after a material architecture/release-state change or external production wiring change.

## BLOCKED EXTERNAL / USER OR WORK BROWSER NEEDED
- Supabase Auth URL Configuration: canonical Site URL + redirect allowlist correction described above.
- Netlify: confirm canonical production site deploys latest PR #4 branch and production env has canonical `NEXT_PUBLIC_SITE_URL`.
- Netlify: set live `STRIPE_WEBHOOK_SECRET`; confirm canonical `STRIPE_PRICE_STARTER`.
- Netlify: configure `SILICONFLOW_API_KEY`, `AI_COST_POLICY=free_only` and free-model vars.
- Netlify + GitHub secret: configure same strong `REGULATORY_INGEST_SECRET`; only after successful official ingestion set `REGULATORY_RADAR_LIVE=true`.
- Supabase Auth dashboard: enable leaked-password protection and appropriate CAPTCHA/signup-abuse controls.
- Verify Google OAuth provider redirect setup remains attached to the canonical Supabase callback and production app flow.
- Verify production SMTP/signup/reset with a non-owner email.
- Configure truthful legal provider identity/address/tax/jurisdiction/refund policy; paid checkout deliberately remains blocked until then.
- Register official Shopify OAuth app/scopes, Amazon SP-API app/permissions and Etsy OAuth app before advertising connectors as active.

## Continuous execution
Keep working while safe/actionable work remains. External blockers must not stop unrelated work. Never repeat DONE work. Never merge PR #4 without explicit owner instruction.

## Definition of finished
Do not call ImportVerifier finished until exact current CI is green; canonical Netlify runs latest code; 5-product lifetime trial works end-to-end; legal provider data is published; Unlimited checkout/webhook/portal/cancellation pass; production free-only AI works without premium leakage; supported inputs behave honestly; dashboard/reports follow user language; evidence/account isolation passes; Radar claims match actual ingestion; connectors are either truly working or clearly unavailable; and desktop/iPhone/iPad/PWA QA passes.
