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
- Google auth button includes visible Google mark; auth callback and client callback construction reject unsafe external/malformed redirect origins.
- Sitemap/robots/canonical metadata/OpenGraph own-brand assets are implemented.

## DONE — latest pass 2026-08-31
- Intelligence Suite no longer derives customer labels from connector capability slugs such as `catalog-import`, `listing-import`, `asin-monitoring` or `compliance-alerts`.
- Added `lib/platform-capability-i18n.ts` with explicit ES/EN/FR/DE/IT/PT labels while preserving canonical internal connector capability IDs.
- `components/IntelligenceSuite.tsx` now renders capabilities through `platformCapabilityLabel(language, item)`.
- Added `tests/platform-capability-i18n.test.ts` to prevent raw capability IDs/English-normalized slugs leaking into localized UI.
- Intelligence Suite section headings/eyebrow are now language-aware through `lib/intelligence-section-i18n.ts`; Product Regulatory Twin, Regulatory Impact Radar and Connect no longer remain hardcoded English outside EN.
- Added `tests/intelligence-section-i18n.test.ts` to protect six-language section-copy coverage and structural wiring.
- Functional head before this handoff update: `640b4a56b7f484a17cf883e85bc0b8630627fdcc`; exact-head `ImportVerifier release check` run #773 was in progress when this handoff was written. Verify final handoff HEAD CI next and fix any failure immediately.

## Production facts last checked 2026-08-31
- Supabase project: `hfuwwjdcyudflamwwnon`.
- No free-usage counter checked above 5; production lifetime quota trigger/function are `analyses_enforce_free_lifetime_product_quota` / `enforce_free_lifetime_product_quota`.
- Legacy `monthly_product_usage` remains inert compatibility/history; do not drop casually.
- Active Stripe subscriptions at last check: 0.
- Stripe live webhook exists and is enabled on canonical production URL; signing secret must still be configured in Netlify externally.
- Radar events at last check: 0; keep live claim disabled.
- `pg_cron` and `pg_net` are not enabled; do not add hidden dependencies on them.
- Supabase security advisor substantive external setting still pending: leaked-password protection disabled.

## IN PROGRESS / NEXT — execute without asking
1. Verify exact latest HEAD CI after this handoff-only commit; fix tests/typecheck/build regressions immediately.
2. Continue security/account/billing sweep for remaining user-supplied URL-like fields, redirects, exported links and failure-recovery paths.
3. Continue customer-visible i18n sweep inside Intelligence Suite and reports; the feature badge `AI · TWIN · RADAR · CONNECT` may remain branded shorthand, but no explanatory English copy should leak into non-English locales.
4. Future-market US/CN/GB/JP documentary narratives remain non-customer-active; fully localize them before activation.
5. Continue desktop/iPhone/iPad/PWA QA, especially upload/export flows, table overflow, keyboard/modal behavior, touch targets and safe-area edge cases.
6. Audit every customer-visible price surface to remain sourced from canonical plan definitions and exact locale-aware EUR 9.95 formatting.
7. Review generated PDF/Excel visual hierarchy for a more premium consulting-style report system without weakening evidence/uncertainty/legal disclaimers.
8. Refresh `WORK-HANDOFF-IMPORTVERIFIER.md` only after a material architecture/release-state change or external production wiring change; this pass did not alter architecture.
9. Do not remove legacy monthly-usage schema or historical plan IDs merely to simplify naming.

## BLOCKED EXTERNAL / USER OR WORK BROWSER NEEDED
- Netlify: confirm canonical production site deploys latest PR #4 branch and correct production env.
- Netlify: set live `STRIPE_WEBHOOK_SECRET`; confirm canonical `STRIPE_PRICE_STARTER`.
- Netlify: configure `SILICONFLOW_API_KEY`, `AI_COST_POLICY=free_only` and free-model vars.
- Netlify + GitHub secret: configure same strong `REGULATORY_INGEST_SECRET`; only after successful official ingestion set `REGULATORY_RADAR_LIVE=true`.
- Supabase Auth dashboard: enable leaked-password protection and appropriate CAPTCHA/signup-abuse controls.
- Verify Supabase/Google OAuth redirect allowlists for canonical production origin.
- Verify production SMTP/signup/reset with a non-owner email.
- Configure truthful legal provider identity/address/tax/jurisdiction/refund policy; paid checkout deliberately remains blocked until then.
- Register official Shopify OAuth app/scopes, Amazon SP-API app/permissions and Etsy OAuth app before advertising connectors as active.

## Continuous execution
Keep working while safe/actionable work remains. External blockers must not stop unrelated work. Never repeat DONE work. Never merge PR #4 without explicit owner instruction.

## Definition of finished
Do not call ImportVerifier finished until exact current CI is green; canonical Netlify runs latest code; 5-product lifetime trial works end-to-end; legal provider data is published; Unlimited checkout/webhook/portal/cancellation pass; production free-only AI works without premium leakage; supported inputs behave honestly; dashboard/reports follow user language; evidence/account isolation passes; Radar claims match actual ingestion; connectors are either truly working or clearly unavailable; and desktop/iPhone/iPad/PWA QA passes.
