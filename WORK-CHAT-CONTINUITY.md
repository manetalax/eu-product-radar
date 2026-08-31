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
- Stripe cancellation webhook safely handles terminal events after account deletion.
- Live webhook endpoint exists at `https://importverifier.netlify.app/api/billing/webhook`; signing secret still must be placed in Netlify externally.
- Lifetime free usage is enforced cumulatively at 5 products; historical counters were normalized without granting extra quota.

## DONE — database / evidence / RLS security
- RLS is active on analyses, evidence, free usage, one-time audit history and subscriptions with user ownership policies.
- Composite `(analysis_id,user_id)` FK prevents cross-account evidence linkage even outside RLS and has a covering index.
- Server-only telemetry/rate-limit/Radar/webhook tables expose no table privileges to `anon` or `authenticated`.
- Relevant SECURITY DEFINER functions are not executable by default PUBLIC.
- Evidence traceability is persisted as requirement → status → document → page/section → note → HTTPS URL.
- Evidence keys remain canonical/stable across UI language changes so saved evidence is not orphaned by localization.

## DONE — zero-cost AI / upload controls
- Production policy is fail-closed `AI_COST_POLICY=free_only`; production config rejects policies permitting premium AI spend.
- SiliconFlow-compatible free text + vision/OCR routing exists; `free_only` never calls OpenAI.
- CSV/XLS/XLSX parse locally without AI; text-layer PDF/DOCX/ODT and text formats extract locally then use free text AI; images use free vision/OCR when configured.
- Scanned PDF without usable text and legacy `.doc` fail clearly under free_only instead of leaking premium spend.
- Upload/MIME/data-URL/decoded-size checks run before rate limiting or AI calls; spreadsheet formats are not accepted by the remote extraction endpoint.
- Atomic server-only rate limits: regulatory AI 60/account/hour; AI extraction 30 documents/account/hour.
- AI telemetry stores no prompts, product/document content, email or user PII.
- Regulatory AI reconstructs owned context server-side and does not accept browser-supplied regulatory context.

## DONE — regulatory engine / Twin / Radar foundation
- Versioned EU regulatory engine with candidate category, applicable acts, obligations, uncertainty and official HTTPS sources.
- Product Regulatory Twin uses persisted evidence readiness.
- Regulatory Impact Radar has a persistent event store, authenticated read API, protected ingest/refresh endpoints, stable fingerprints/deduplication and EUR-Lex RSS adapter.
- GitHub `regulatory-radar.yml` supports manual and scheduled 6-hour refresh calls to the canonical production endpoint using a repository secret.
- `REGULATORY_RADAR_LIVE=true` is release-valid only with a strong ingest secret and UI live status still requires real persisted official events.
- Last production check had 0 Radar events; do not claim live monitoring yet.

## DONE — PWA/mobile/security
- PWA manifest/service worker/registration implemented; dashboard/API/auth/reset/private content is excluded from offline caching.
- Own-brand icon assets make no institutional/EU-certification claim.
- HSTS, frame denial, no-sniff, strict referrer, restrictive permissions, conservative CSP and fail-closed canonical-origin checks are in place.
- Mobile CSS covers 44px touch targets, focus visibility, safe areas, wrapping and 16px iOS form controls.

## DONE — localization / reports
- Main dashboard navigation, notices/errors, quota, import, onboarding, KPIs, results, history, reports, settings, privacy and dates follow ES/EN/FR/DE/IT/PT.
- Dashboard exports receive the selected language explicitly and Unlimited pricing uses exact two-decimal EUR formatting.
- Landing Intelligence/pricing and reset-password language flow are localized.
- Report/guide/documentation layers provide six-language visible structure and documentary guidance.
- PDF localizes market/operator/missing-field/documentary surfaces; Excel passes language explicitly into nested documentary and regulatory worksheets.
- EU regulatory narrative now has deterministic localization for category, applicability reasons, obligations, evidence requests, uncertainty and disclaimer while official act titles/references/URLs stay unchanged.
- `RegulatoryAssessment` and the latest-regulatory wrapper now use the selected UI language rather than hardcoded Spanish.
- Readiness/evidence UI is localized in six languages. Localized obligation/evidence text is displayed while persistence continues to use canonical evidence keys, preventing language-switch data loss.
- Deterministic readiness labels/blockers/actions are localized with regression coverage.
- `market-i18n.ts` provides market display names/short names/operator labels for EU/US/CN/GB/JP in all six languages; remaining report-surface integration is still in progress.
- Stable worksheet tab names remain Spanish for formula/backward compatibility at present.
- Future-market documentary narratives (US/CN/GB/JP) remain Spanish internally; those markets are not customer-active and must be localized before activation.

## DONE — auth / SEO
- OAuth callback accepts only safe internal destinations, validates/preserves language and has canonical ImportVerifier fallback origin.
- Google/email signup/reset flows propagate language; Google button has the visible multicolor Google mark.
- Sitemap, production robots exclusions, canonical metadata/OpenGraph branding and dynamic 1200x630 own-brand OG image are implemented.

## Production facts last checked 2026-08-31
- Supabase project: `hfuwwjdcyudflamwwnon`.
- No free-usage counter remained above 5 after normalization.
- Active Stripe subscriptions in Supabase at check time: 0.
- Stripe webhook event rows at check time: 0 before webhook creation.
- Radar events: 0 at last check; do not enable live claim.
- `pg_cron` and `pg_net` are not enabled; do not add hidden dependencies on them.

## LATEST CI STATE
- Starting HEAD for this pass was `0b6858fc4ae879bd7a16f4980a384b8177e87351`; `ImportVerifier release check` run #504 completed successfully.
- Localization/readiness work then advanced the branch through `d54527772960ef73d81817afb66151b50d558d05`.
- Run #512 on predecessor `da15c5c8d3cd2978284600d556a3590a083e71aa` passed tests and typecheck and was building when last inspected; exact latest HEAD must still be rechecked before claiming it green.
- PR #4 remains open, unmerged and mergeable.

## IN PROGRESS / NEXT — execute without asking
1. Keep exact latest HEAD CI green; fix any failure immediately.
2. Integrate `marketDisplayFor(...)` into remaining Excel/PDF visible market/operator surfaces without altering canonical market codes or formulas.
3. Audit remaining customer-visible price formatting so EUR 9.95 is never rounded to 10.
4. Continue security/account/billing sweep and add targeted regression tests where an invariant is not yet covered.
5. Continue desktop/iPhone/iPad/PWA QA, especially upload/export flows, table overflow, touch targets, safe-area and keyboard behavior.
6. Audit ImportVerifier AI/Twin/Radar visible surfaces for any remaining Spanish leakage in EN/FR/DE/IT/PT.
7. Localize US/CN/GB/JP documentary narratives before any of those markets becomes customer-active.
8. Refresh `WORK-HANDOFF-IMPORTVERIFIER.md` after the next material architecture/release-state pass or when external production wiring changes.

## BLOCKED EXTERNAL / USER OR WORK BROWSER NEEDED
- Netlify: confirm production site deploys latest PR #4 branch and correct production env.
- Netlify: set live `STRIPE_WEBHOOK_SECRET` securely; confirm canonical `STRIPE_PRICE_STARTER`.
- Netlify: configure `SILICONFLOW_API_KEY`, `AI_COST_POLICY=free_only` and free-model vars.
- Netlify + GitHub repository secret: configure the same >=32-char `REGULATORY_INGEST_SECRET`; only after successful official ingestion set `REGULATORY_RADAR_LIVE=true`.
- Supabase Auth dashboard: enable leaked-password protection and suitable CAPTCHA/signup-abuse controls.
- Verify Supabase/Google OAuth redirect allowlists for `https://importverifier.netlify.app`.
- Verify production SMTP/signup/reset on a non-owner email.
- Configure truthful legal provider identity/address/tax/jurisdiction/refund policy; paid checkout deliberately remains blocked until then.
- Register official Shopify OAuth app/scopes, Amazon SP-API app/permissions and Etsy OAuth app before advertising those connectors as active.

## Continuous execution
Keep working while any safe/actionable task remains. Human-only blockers go to the external list and must not stop work elsewhere. Never repeat DONE work. Never merge PR #4 without explicit owner instruction.

## Definition of finished
Do not call ImportVerifier finished until exact current CI is green; canonical Netlify runs latest code; 5-product lifetime trial works end-to-end; legal provider data is published; Unlimited checkout/webhook/portal/cancellation pass; production free-only AI works without premium leakage; supported inputs behave honestly; dashboard/reports follow user language; evidence/account isolation passes; Radar claims match actual ingestion; connectors are either truly working or clearly unavailable; and desktop/iPhone/iPad/PWA QA passes.
