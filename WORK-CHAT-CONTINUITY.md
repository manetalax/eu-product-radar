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
- Evidence source URLs require a well-formed HTTPS URL with a real hostname, no whitespace and no embedded username/password; malformed schemes/credential-bearing links are rejected server-side with regression tests.
- Failed evidence saves now roll back optimistic state, surface a localized alert in all six languages and restore unsaved text-field values instead of leaving the form visually inconsistent.

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
- Global mobile CSS covers 44px touch targets, focus visibility, safe areas, wrapping and 16px iOS form controls.
- Product-review modal has explicit iOS/iPadOS safe-area padding, `100dvh`, contained momentum scrolling, 44px remove/actions, visible keyboard focus and 16px form controls.

## DONE — localization / reports / critical import UX
- Main dashboard navigation, notices/errors, quota, import, onboarding, KPIs, results, history, reports, settings, privacy and dates follow ES/EN/FR/DE/IT/PT.
- Dashboard exports receive the selected language explicitly and Unlimited pricing uses exact two-decimal EUR formatting.
- Unlimited-active banner and exhausted-free-trial upgrade prompt use the selected language and canonical `UNLIMITED_PLAN.monthlyPriceEur` with locale-aware two-decimal formatting instead of hardcoded/rounded price copy.
- Landing Intelligence/pricing and reset-password language flow are localized.
- Report/guide/documentation layers provide six-language visible structure and documentary guidance.
- PDF localizes market/operator/missing-field/documentary surfaces; Excel passes language explicitly into nested documentary and regulatory worksheets.
- EU regulatory narrative has deterministic localization for category, applicability reasons, obligations, evidence requests, uncertainty and disclaimer while official act titles/references/URLs stay unchanged.
- `RegulatoryAssessment` and latest-regulatory wrapper use selected UI language instead of hardcoded Spanish.
- Readiness/evidence UI is localized in six languages. Localized obligation/evidence text is displayed while persistence continues to use canonical evidence keys, preventing language-switch data loss.
- Deterministic readiness labels/blockers/actions are localized with regression coverage.
- Pre-analysis product-review UI and market display are localized in six languages; cancellation aborts locally with `AbortError` rather than returning a fake HTTP error, only explicit confirmation reaches native fetch, and quota remains unconsumed before confirmation. Regression tests protect these semantics.
- `market-i18n.ts` provides market display names/short names/operator labels for EU/US/CN/GB/JP in all six languages and is used by current PDF/Excel market/operator surfaces.
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

## LATEST VERIFIED BUILD
- Functional HEAD `b6f8705d880e7133dfd9a96040cc9176093af701` completed `ImportVerifier release check` run #558 successfully: tests + typecheck + build green.
- This continuity-only commit must be checked at its exact SHA before claiming exact-current-HEAD green.
- PR #4 is open, unmerged and mergeable.

## IN PROGRESS / NEXT — execute without asking
1. Keep exact latest HEAD CI green; fix any failure immediately.
2. Continue security/account/billing sweep: audit exported/user-supplied hyperlinks and any remaining URL-bearing fields for equivalent trust-boundary validation without weakening legitimate official references.
3. Audit ImportVerifier AI/Twin/Radar and remaining ancillary dashboard components for Spanish leakage in EN/FR/DE/IT/PT.
4. Continue desktop/iPhone/iPad/PWA QA, especially upload/export flows, table overflow, modal keyboard behavior and touch/safe-area edge cases.
5. Audit any remaining customer-visible price copy to ensure EUR 9.95 always comes from the canonical plan definition and never rounds to 10.
6. Localize US/CN/GB/JP documentary narratives before any of those markets becomes customer-active.
7. Revisit localized worksheet tab names only with formula-safe indirection/backward compatibility; current stable Spanish sheet IDs are deliberate.
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
