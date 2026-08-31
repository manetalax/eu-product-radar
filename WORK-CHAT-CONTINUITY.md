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
- After the free allowance: only **ImportVerifier Unlimited · €9.95/month**.
- `starter` remains the internal compatibility ID for Unlimited.
- Unlimited never exposes an artificial product ceiling; rate limits are technical anti-abuse controls only.
- End users see only **ImportVerifier AI**, never provider/model names.
- Production paid checkout stays blocked until truthful legal provider data is configured.

## DONE — billing / account / quota safety
- Stripe live Unlimited product exists at EUR 9.95/month; canonical price `price_1UAJy5HJnO8odw1Mn4jMVjFt` is active, monthly and mapped internally to `starter`.
- Checkout accepts only `starter`, re-validates the canonical active EUR 9.95 monthly price and production release config rejects another `STRIPE_PRICE_STARTER`.
- Billing entitlement requires active/trialing + unexpired subscription; portal validates canonical site URL.
- Production legal guard requires real provider identity/address/tax/jurisdiction/refund policy; paid checkout remains deliberately disabled until configured.
- Account deletion cancels Stripe first, aborts safely on cancellation failure, revokes sessions globally and deletes the Supabase user.
- Supabase `delete-account` Edge Function is ACTIVE version 2, requires JWT and limits the confirmation request body to 4 KB before parsing.
- Stripe cancellation webhook safely handles terminal events after account deletion.
- Live webhook endpoint exists and is enabled at `https://importverifier.netlify.app/api/billing/webhook` with checkout/subscription create-update-delete events; signing secret still must be placed in Netlify externally.
- Webhook idempotency is crash-recoverable: events are first recorded as `processing`, only marked `processed` after durable entitlement sync, and a retry of an interrupted `processing` event is safely re-applied through idempotent upserts.
- Lifetime free usage is enforced cumulatively at 5 products; historical counters were normalized without granting extra quota.
- Production quota trigger/function have been renamed to `analyses_enforce_free_lifetime_product_quota` / `enforce_free_lifetime_product_quota`; no monthly-reset trigger remains active.
- Database integration tests now exercise the lifetime free quota rather than the historical monthly implementation, and paid usage does not mutate the saved lifetime-free counter.

## DONE — database / evidence / RLS security
- RLS is active on analyses, evidence, free usage, one-time audit history and subscriptions with user ownership policies.
- Composite `(analysis_id,user_id)` FK prevents cross-account evidence linkage even outside RLS and has a covering index.
- Server-only telemetry/rate-limit/Radar/webhook tables expose no table privileges to `anon` or `authenticated`.
- Relevant SECURITY DEFINER functions are not executable by default PUBLIC.
- Evidence traceability is persisted as requirement → status → document → page/section → note → HTTPS URL.
- Evidence keys remain canonical/stable across UI language changes so saved evidence is not orphaned by localization.
- Evidence source URLs require a well-formed HTTPS URL with a real hostname, no whitespace and no embedded username/password; malformed schemes/credential-bearing links are rejected server-side with regression tests.
- Failed evidence saves roll back optimistic state, surface a localized alert in all six languages and restore unsaved text-field values instead of leaving the form visually inconsistent.
- Evidence and analysis APIs now return customer-facing errors in ES/EN/FR/DE/IT/PT using the shared request-language resolution.

## DONE — zero-cost AI / upload controls
- Production policy is fail-closed `AI_COST_POLICY=free_only`; production config rejects policies permitting premium AI spend.
- SiliconFlow-compatible free text + vision/OCR routing exists; `free_only` never calls OpenAI.
- CSV/XLS/XLSX parse locally without AI; text-layer PDF/DOCX/ODT and text formats extract locally then use free text AI; images use free vision/OCR when configured.
- Scanned PDF without usable text and legacy `.doc` fail clearly under free_only instead of leaking premium spend.
- Upload/MIME/data-URL/decoded-size checks run before rate limiting or AI calls; spreadsheet formats are not accepted by the remote extraction endpoint.
- Atomic server-only rate limits: regulatory AI 60/account/hour; AI extraction 30 documents/account/hour.
- AI telemetry stores no prompts, product/document content, email or user PII.
- Regulatory AI reconstructs owned context server-side and does not accept browser-supplied regulatory context.
- Regulatory-agent request order is origin check → authenticated session → bounded body → owned analysis/evidence context → AI; stored product/evidence text is explicitly treated as untrusted data rather than prompt instructions.
- Regulatory-agent errors/disclaimer and the regulatory context passed for presentation follow ES/EN/FR/DE/IT/PT; matching logic still uses canonical internal category values.

## DONE — regulatory engine / Twin / Radar foundation
- Versioned EU regulatory engine with candidate category, applicable acts, obligations, uncertainty and official HTTPS sources.
- Product Regulatory Twin uses persisted evidence readiness.
- Regulatory Impact Radar has a persistent event store, authenticated read API, protected ingest/refresh endpoints, stable fingerprints/deduplication and EUR-Lex RSS adapter.
- GitHub `regulatory-radar.yml` supports manual and scheduled 6-hour refresh calls to the canonical production endpoint using a repository secret.
- `REGULATORY_RADAR_LIVE=true` is release-valid only with a strong ingest secret and UI live status still requires real persisted official events.
- Last production check had 0 Radar events; do not claim live monitoring yet.
- Intelligence Suite presents localized regulatory category, obligations, evidence and local impact narrative while preserving canonical values for matching.

## DONE — PWA/mobile/security
- PWA manifest/service worker/registration implemented; dashboard/API/auth/reset/private content is excluded from offline caching.
- Own-brand icon assets make no institutional/EU-certification claim.
- HSTS, frame denial, no-sniff, strict referrer, restrictive permissions, conservative CSP and fail-closed canonical-origin checks are in place.
- Global mobile CSS covers 44px touch targets, focus visibility, safe areas, wrapping and 16px iOS form controls.
- Product-review modal has explicit iOS/iPadOS safe-area padding, `100dvh`, contained momentum scrolling, 44px remove/actions, visible keyboard focus, 16px form controls, background scroll lock and Escape-key cancellation when not processing.
- Cancelling pre-analysis review aborts locally and never consumes quota or displays a false HTTP error.

## DONE — localization / reports / critical import UX
- Main dashboard navigation, notices/errors, quota, import, onboarding, KPIs, results, history, reports, settings, privacy and dates follow ES/EN/FR/DE/IT/PT.
- Dashboard exports receive the selected language explicitly and Unlimited pricing uses exact locale-aware EUR formatting; €9.95 never rounds to €10.
- Unlimited-active banner and exhausted-free-trial upgrade prompt use the selected language and canonical `UNLIMITED_PLAN.monthlyPriceEur` instead of hardcoded price copy.
- Landing Intelligence/pricing and reset-password language flow are localized.
- Billing, product-extraction, analyses/quota, evidence and regulatory-agent API errors are localized in all six supported languages.
- Public Privacy and Terms pages render server-side in ES/EN/FR/DE/IT/PT from explicit `lang`, the `iv_lang` cookie or `Accept-Language`, while legal identity/tax/refund values remain literal configuration data.
- Report/guide/documentation layers provide six-language visible structure and documentary guidance.
- PDF localizes market/operator/missing-field/documentary surfaces; Excel passes language explicitly into nested documentary and regulatory worksheets.
- Excel worksheet tabs are now localized formula-safely (`Summary/Products/...`, equivalents in FR/DE/IT/PT) while Spanish keeps the historical names; formulas reference the localized Products sheet dynamically.
- EU regulatory narrative has deterministic localization for category, applicability reasons, obligations, evidence requests, uncertainty and disclaimer while official act titles/references/URLs stay unchanged.
- `RegulatoryAssessment`, Latest Regulatory Assessment and Intelligence Suite use selected UI language instead of hardcoded Spanish.
- Readiness/evidence UI is localized in six languages. Localized obligation/evidence text is displayed while persistence continues to use canonical evidence keys, preventing language-switch data loss.
- Deterministic readiness labels/blockers/actions are localized with regression coverage.
- Pre-analysis product-review UI and market display are localized in six languages; cancellation aborts locally with `AbortError`, only explicit confirmation reaches native fetch, and quota remains unconsumed before confirmation.
- `market-i18n.ts` provides market display names/short names/operator labels for EU/US/CN/GB/JP in all six languages and is used by current PDF/Excel market/operator surfaces.
- Future-market documentary narratives (US/CN/GB/JP) remain Spanish internally; those markets are not customer-active and must be localized before activation.

## DONE — auth / SEO
- OAuth callback accepts only safe internal destinations, validates/preserves language and has canonical ImportVerifier fallback origin.
- Client callback construction accepts configured `NEXT_PUBLIC_SITE_URL` only when it parses as HTTPS; malformed values fall back to the current origin instead of breaking Google/signup/reset.
- Google/email signup/reset flows propagate language; Google button has the visible multicolor Google mark.
- Auth errors are mapped to stable localized keys rather than displaying raw Supabase errors.
- Sitemap, production robots exclusions, canonical metadata/OpenGraph branding and dynamic 1200x630 own-brand OG image are implemented.

## Production facts last checked 2026-08-31
- Supabase project: `hfuwwjdcyudflamwwnon`.
- No free-usage counter is above 5; current maximum checked value is 5.
- Production lifetime trigger/function names are `analyses_enforce_free_lifetime_product_quota` / `enforce_free_lifetime_product_quota`.
- Legacy `monthly_product_usage` table still exists as inert historical data/schema; no active analyses trigger uses it. Do not drop it casually before launch.
- Active Stripe subscriptions in Stripe live at check time: 0.
- Stripe live Unlimited price: `price_1UAJy5HJnO8odw1Mn4jMVjFt`, active, EUR 995 cents, interval month.
- Stripe live webhook: `we_1UAMNFHJnO8odw1MlqGn7YFT`, enabled, canonical production URL, five expected checkout/subscription events.
- Stripe webhook event table now has nullable `processed_at`, `status` (`processing|processed`) and `updated_at` for crash-recoverable retries.
- Radar events: 0 at last check; do not enable live claim.
- `pg_cron` and `pg_net` are not enabled; do not add hidden dependencies on them.
- Supabase security advisor: only substantive warning is leaked-password protection disabled. RLS-without-policy entries are intentional server-only tables with no `anon/authenticated` privileges.
- Performance advisor only reports currently-unused indexes; do not remove them merely because the project has little production traffic.

## LATEST VERIFIED BUILD
- Exact HEAD `59e6f1d1d1607fabda131e25897af416fed59ec4` completed `ImportVerifier release check` run #638 successfully: tests + typecheck + build green.
- PR #4 is open, unmerged and mergeable.
- GitHub/Netlify may still surface legacy `euproductradar` checks because multiple Netlify sites are connected to the same repository; do not treat those as the canonical ImportVerifier deployment.

## IN PROGRESS / NEXT — execute without asking
1. Keep exact latest HEAD CI green; fix any failure immediately.
2. Continue security/account/billing sweep, especially any remaining URL-bearing/user-supplied fields and failure-recovery paths.
3. Continue customer-visible i18n sweep for secondary/ancillary surfaces; future-market US/CN/GB/JP documentary narratives must be localized before activation.
4. Continue desktop/iPhone/iPad/PWA QA, especially upload/export flows, table overflow, modal keyboard behavior and touch/safe-area edge cases.
5. Keep all customer-visible price copy sourced from canonical plan definitions and exact EUR 9.95 formatting.
6. Refresh `WORK-HANDOFF-IMPORTVERIFIER.md` after the next material architecture/release-state pass or when external production wiring changes.
7. Do not remove the legacy monthly-usage table or historical plan IDs merely to simplify names; they are inert compatibility data until a deliberate cleanup pass.

## BLOCKED EXTERNAL / USER OR WORK BROWSER NEEDED
- Netlify: confirm production site deploys latest PR #4 branch and correct production env. Direct visual browsing of the Netlify domain is not available in this session.
- Netlify: set live `STRIPE_WEBHOOK_SECRET` securely; confirm canonical `STRIPE_PRICE_STARTER`.
- Netlify: configure `SILICONFLOW_API_KEY`, `AI_COST_POLICY=free_only` and free-model vars.
- Netlify + GitHub repository secret: configure the same >=32-char `REGULATORY_INGEST_SECRET`; only after successful official ingestion set `REGULATORY_RADAR_LIVE=true`.
- Supabase Auth dashboard: enable leaked-password protection and suitable CAPTCHA/signup-abuse controls. Reference: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- Verify Supabase/Google OAuth redirect allowlists for `https://importverifier.netlify.app`.
- Verify production SMTP/signup/reset on a non-owner email.
- Configure truthful legal provider identity/address/tax/jurisdiction/refund policy; paid checkout deliberately remains blocked until then.
- Register official Shopify OAuth app/scopes, Amazon SP-API app/permissions and Etsy OAuth app before advertising those connectors as active.

## Continuous execution
Keep working while any safe/actionable task remains. Human-only blockers go to the external list and must not stop work elsewhere. Never repeat DONE work. Never merge PR #4 without explicit owner instruction.

## Definition of finished
Do not call ImportVerifier finished until exact current CI is green; canonical Netlify runs latest code; 5-product lifetime trial works end-to-end; legal provider data is published; Unlimited checkout/webhook/portal/cancellation pass; production free-only AI works without premium leakage; supported inputs behave honestly; dashboard/reports follow user language; evidence/account isolation passes; Radar claims match actual ingestion; connectors are either truly working or clearly unavailable; and desktop/iPhone/iPad/PWA QA passes.
