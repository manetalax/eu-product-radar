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
3. Latest PR #4 HEAD + latest CI.
4. `AGENTS.md` — autonomous execution standard.

## Commercial invariants
- Exactly **5 free products total per account**, no card, no monthly reset.
- After the free allowance: only **ImportVerifier Unlimited · €9.95/month**.
- `starter` remains the internal compatibility ID for Unlimited.
- Unlimited never exposes an artificial product ceiling; rate limits are technical anti-abuse controls only.
- End users see only **ImportVerifier AI**, never provider/model names.
- Production paid checkout stays blocked until truthful legal provider data is configured.

## DONE — billing / account safety
- Stripe live Unlimited product exists at EUR 9.95/month; canonical price `price_1UAJy5HJnO8odw1Mn4jMVjFt` is active, monthly and mapped internally to `starter`.
- Checkout only accepts `starter` and re-validates active EUR 9.95 monthly Stripe price before redirect.
- Release config now also rejects any different `STRIPE_PRICE_STARTER` in production; `.env.production.example` pins the canonical non-secret price ID.
- Billing entitlement only treats active/trialing + unexpired subscriptions as paid.
- Portal validates canonical site URL before creating Stripe session.
- Production legal guard requires `LEGAL_PROVIDER_NAME`, `LEGAL_PROVIDER_ADDRESS`, `LEGAL_TAX_ID`, `LEGAL_JURISDICTION`, `LEGAL_REFUND_POLICY`; obvious placeholders such as TODO/TBD/CHANGE_ME are rejected.
- Privacy and Terms render configured legal identity/refund policy; otherwise paid checkout remains explicitly disabled.
- Account deletion cancels any Stripe subscription before deleting the Supabase user; deletion aborts if cancellation fails.
- Production `delete-account` Edge Function is ACTIVE, JWT-protected, matches repository source, revokes sessions globally and then deletes the user.
- Stripe cancellation webhook safely acknowledges a terminal canceled subscription arriving after Supabase user deletion.
- **Stripe live production webhook now exists and is enabled** at `https://importverifier.netlify.app/api/billing/webhook`, endpoint id `we_1UAMNFHJnO8odw1MlqGn7YFT`, for checkout completion/async success and subscription create/update/delete.
- The webhook signing secret was obtained securely from Stripe but must still be placed in Netlify as `STRIPE_WEBHOOK_SECRET`; never expose it in chat or repository.

## DONE — lifetime free trial / database integrity
- Production trigger enforces cumulative lifetime use: new free accounts cannot persist more than 5 products total.
- Historical pre-lifetime usage was normalized in production so no `free_account_usage.product_count` remains above 5; this did not grant any additional free usage.
- Migration `20260831040918_normalize_lifetime_free_usage.sql` is applied and persisted in the repo.
- Composite evidence ownership FK has a covering `(analysis_id,user_id)` index in production and repository migration `20260831035722_analysis_evidence_owner_fk_index.sql`.
- Supabase advisors no longer report the unindexed evidence ownership FK.

## DONE — database / RLS security verification
- RLS is active on analyses, evidence, free usage, one-time audit history and subscriptions.
- Ownership policies use `auth.uid()`; evidence insert/update also verifies ownership of the linked analysis.
- Server-only tables `ai_usage_events`, `api_rate_limits`, `regulatory_change_events`, `stripe_webhook_events` grant no table privileges to `anon` or `authenticated`.
- Public SECURITY DEFINER functions currently relevant to quota/rate-limit/RLS bootstrap have execution restricted to `postgres`, not default PUBLIC.
- Supabase security advisor still reports **Leaked Password Protection Disabled**; this is an Auth-dashboard setting, not a SQL workaround.

## DONE — zero-cost AI / trustworthy context
- Production default/fail-closed policy is `AI_COST_POLICY=free_only`; release config rejects production policies that permit premium AI spend.
- SiliconFlow-compatible free text + vision/OCR routing exists; `free_only` never calls OpenAI.
- CSV/XLS/XLSX parse locally without AI.
- Images use free vision/OCR when configured.
- TXT/MD/JSON/RTF and PDF/DOCX/ODT with usable text layer use local extraction + free text model.
- Scanned PDF without usable text and legacy `.doc` fail clearly under free_only instead of leaking premium spend.
- Product-extraction user-visible upload/MIME/rate-limit/free-only errors are now localized ES/EN/FR/DE/IT/PT.
- `useLanguage()` persists a non-sensitive `iv_lang` cookie; server request-language resolution prioritizes explicit header, then cookie, then `Accept-Language`, Spanish fallback.
- AI telemetry is server-only and stores no prompts/product/document/user/email/PII.
- ImportVerifier AI reconstructs owned regulatory context server-side and does not accept browser-supplied regulatory context.
- Public regulatory-agent response contains only answer + disclaimer; provider/model remain server-side telemetry only.

## DONE — AI abuse / upload controls
- Atomic server-only Supabase rate limiter applied in production.
- ImportVerifier AI: 60 requests/account/hour technical guardrail.
- AI-backed product extraction: 30 documents/account/hour technical guardrail.
- Product extraction validates filename extension, declared MIME, data-URL MIME and decoded byte size before rate limiting or any AI call.
- Remote extraction endpoint does not accept CSV/XLS/XLSX; spreadsheets remain local parsing only.
- Image MIME allowlist covers PNG/JPEG/WebP/HEIC/HEIF and rejects extension/MIME mismatches.
- These are technical safeguards, not commercial quotas.

## DONE — regulatory engine / evidence / Twin
- Versioned EU regulatory engine with candidate category, rules, obligations, uncertainty and official sources.
- Product Regulatory Twin uses persisted evidence readiness.
- Evidence traceability: requirement → status → document → page/section → note → HTTPS URL.
- Evidence UI, PDF traceability and Excel `Evidencia` worksheet implemented.
- Composite `(analysis_id,user_id)` FK prevents evidence from being linked to another account's analysis even outside RLS.

## DONE — Regulatory Impact Radar foundation
- Persistent `regulatory_change_events` store applied in production.
- Authenticated `/api/regulatory-changes` read endpoint.
- Official event normalization: HTTPS EU allowlist, size limits, date normalization, stable fingerprint, deduplication.
- Protected server-only `/api/internal/regulatory-ingest` and `/api/internal/regulatory-refresh`; bearer secret >=32 chars.
- EUR-Lex adapter uses official RSS 162/161/222, timeout/size guards, CELEX/ELI extraction and product-compliance keyword classification.
- GitHub workflow `regulatory-radar.yml` is configured for manual execution plus every 6 hours at minute 17 and calls the canonical production refresh endpoint with repository secret only.
- `REGULATORY_RADAR_LIVE=true` is release-valid only with a strong ingest secret; UI live status also requires official persisted events.
- Production last checked with **0 Radar events**; do not claim live regulatory monitoring yet.
- Safety Gate remains future second official source; do not invent undocumented APIs.

## DONE — PWA/mobile/security
- PWA manifest/service worker/registration implemented.
- `/dashboard`, `/api`, `/auth`, reset/private content excluded from offline cache.
- ImportVerifier-owned app icon assets exist and make no institutional/EU-certification claim.
- Global security headers include HSTS, frame denial, no-sniff, strict referrer, restrictive permissions, same-origin-allow-popups and conservative CSP.
- `sameOrigin` fails closed if `NEXT_PUBLIC_SITE_URL` is missing/malformed.
- Intelligence Suite mobile CSS enforces 44px touch targets, keyboard focus visibility, safe areas, wrapping and 16px iOS form controls.

## DONE — localization / reports
- `dashboard-copy-v2.ts` is wired structurally into `Dashboard.tsx`; navigation, notices/errors, quota, import, onboarding, KPIs, results, history, reports, settings, privacy and dates follow ES/EN/FR/DE/IT/PT.
- Dashboard passes selected language explicitly to PDF and Excel exporters and displays Unlimited with exact two-decimal EUR pricing instead of rounding 9.95 to 10.
- Landing Intelligence (AI/Twin/Radar) and pricing labels no longer leak hardcoded Spanish in secondary languages.
- Reset-password invalid/expired-session redirect preserves validated language.
- `report-i18n.ts`, `guide-i18n.ts` and EU `documentationFor(...)` provide six-language visible structure/documentary guidance.
- Excel now passes selected language explicitly into nested documentary and regulatory worksheets; server-side English tests cover these paths.
- PDF now localizes visible market name, market operator label, missing-field labels and documentary guidance.
- `market-i18n.ts` provides display name/short name/operator labels for EU/US/CN/GB/JP in all six supported languages; integration into every remaining report surface is still in progress.
- Stable worksheet tab names remain Spanish for formula/backward compatibility at present.
- **Remaining deep language gap:** the EU regulatory engine's candidate category/reason/obligation/uncertainty narrative originates in Spanish. It needs deterministic ID/reference-based localization before reports can be called fully translated end-to-end.
- Future-market documentary narratives (US/CN/GB/JP) remain Spanish internally; those markets are not active in customer UX and must be localized before activation.

## DONE — auth hardening
- OAuth callback only accepts safe internal destinations.
- Callback validates/preserves `lang` and has canonical ImportVerifier fallback origin when site URL is missing/malformed.
- `AuthForm.tsx` propagates selected language through Google OAuth, email signup confirmation and password-reset callback.
- Google button includes the multicolor Google mark visibly in the UI.
- Production Auth logs observed successful OAuth flows from a legacy Netlify referer; canonical `importverifier.netlify.app` OAuth must still be explicitly verified after redirect allowlists are confirmed.

## DONE — SEO / public indexing
- Sitemap includes canonical homepage, Privacy and Terms.
- Production robots excludes dashboard/API/auth/login/reset surfaces; preview/branch deploys disallow all indexing.
- Root metadata/canonical/OpenGraph branding uses ImportVerifier/Import Rules Verifier and canonical domain.
- Dynamic 1200x630 `app/opengraph-image.tsx` exists with own-brand regulatory positioning.

## Production facts last checked 2026-08-31
- Supabase project: `hfuwwjdcyudflamwwnon`.
- Free-usage rows checked: no account counter above 5 after normalization.
- Active Stripe subscriptions in Supabase at check time: 0.
- Stripe webhook event rows at check time: 0 (webhook was created afterwards and still needs its signing secret in Netlify).
- Radar events = 0 at last check; do not enable live claim.
- `pg_cron` and `pg_net` are not enabled; do not add hidden dependencies on them.

## LATEST VERIFIED BUILD
- Commit `c243704fa5c1b449a9b8e505d4997f07d8c94bf7` completed `ImportVerifier release check` run #478 successfully: tests + typecheck + build green.
- Later legal/config/continuity commits must be checked at their exact HEAD before claiming exact-HEAD green.
- PR #4 remains open, unmerged and mergeable.

## IN PROGRESS — execute without asking
1. Keep exact latest HEAD CI green; fix any failure immediately.
2. Finish deterministic localization of EU regulatory-engine narrative in PDF/Excel/dashboard AI surfaces while preserving official titles/references/URLs verbatim where legally appropriate.
3. Integrate `marketDisplayFor(...)` into remaining Excel/PDF visible market/operator surfaces without altering canonical market codes or formulas.
4. Audit remaining price formatting so EUR 9.95 is never rounded to 10 on any customer surface.
5. Continue security/account/billing sweep and targeted regression tests.
6. Continue desktop/iPhone/iPad/PWA QA, especially upload/export flows and safe-area/keyboard behavior.
7. Localize US/CN/GB/JP documentary narratives before any of those markets becomes customer-active.
8. Refresh `WORK-HANDOFF-IMPORTVERIFIER.md` after the next material architecture/release-state pass.

## BLOCKED EXTERNAL / USER OR WORK BROWSER NEEDED
- Netlify: confirm production site `https://importverifier.netlify.app/` deploys the latest PR #4 branch and its production env.
- Netlify: set the newly created live webhook signing secret as `STRIPE_WEBHOOK_SECRET` (secret must not be copied into chat/repository).
- Netlify: confirm `STRIPE_PRICE_STARTER=price_1UAJy5HJnO8odw1Mn4jMVjFt`.
- Netlify: configure `SILICONFLOW_API_KEY`, `AI_COST_POLICY=free_only` and SiliconFlow model vars.
- Netlify + GitHub repository secret: configure the same >=32-char `REGULATORY_INGEST_SECRET`.
- Only after scheduled refresh works and official events persist, set `REGULATORY_RADAR_LIVE=true`.
- Supabase Auth dashboard: enable leaked-password protection and CAPTCHA/signup abuse controls.
- Verify Supabase/Google OAuth redirect allowlists for `https://importverifier.netlify.app`.
- Verify production SMTP/signup/reset on a non-owner email.
- Configure truthful legal provider identity/address/tax/jurisdiction/refund policy; paid checkout deliberately remains blocked until then.
- Register official Shopify OAuth app/scopes, Amazon SP-API app/permissions and Etsy OAuth app before advertising those connectors as active.

## Continuous execution
Keep working while any safe/actionable task remains. Human-only blockers go to the external list and must not stop work elsewhere. Never repeat DONE work. Never merge PR #4 without explicit owner instruction.

## Definition of finished
Do not call ImportVerifier finished until: exact current CI is green; canonical Netlify runs latest code; 5-product lifetime trial works end-to-end; legal provider data is published; Unlimited checkout/webhook/portal/cancellation pass; production free-only AI works without premium leakage; supported inputs behave honestly; dashboard/reports follow user language; evidence/account isolation passes; Radar claims match actual ingestion; connectors are either truly working or clearly unavailable; and desktop/iPhone/iPad/PWA QA passes.
