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
- Production paid checkout is intentionally blocked until truthful legal provider data is configured.

## DONE — billing / account safety
- Stripe live Unlimited product exists at EUR 9.95/month; price `price_1UAJy5HJnO8odw1Mn4jMVjFt`.
- Checkout only accepts internal `starter` and verifies active EUR 9.95 monthly Stripe price before redirect.
- Billing entitlement only treats active/trialing + unexpired subscriptions as paid.
- Portal validates canonical site URL before creating Stripe session.
- Production legal guard requires `LEGAL_PROVIDER_NAME`, `LEGAL_PROVIDER_ADDRESS`, `LEGAL_TAX_ID`, `LEGAL_JURISDICTION`, `LEGAL_REFUND_POLICY` before checkout can start.
- Release checker fails production when legal values are incomplete.
- Privacy and Terms render configured legal identity/refund policy; otherwise paid checkout remains explicitly disabled.
- Account deletion cancels any Stripe subscription before deleting the Supabase user; deletion aborts if cancellation fails.
- Stripe cancellation webhook safely acknowledges a terminal canceled subscription arriving after the Supabase user was deleted.
- Tests protect account-delete → Stripe-cancel ordering and late cancellation webhook behavior.

## DONE — zero-cost AI / trustworthy context
- Production default/fail-closed policy is `AI_COST_POLICY=free_only`.
- Release config rejects production policies that permit premium AI spend.
- SiliconFlow-compatible free text + vision/OCR routing exists; `free_only` never calls OpenAI.
- CSV/XLS/XLSX parse locally without AI.
- Images use free vision/OCR when configured.
- TXT/MD/JSON/RTF and PDF/DOCX/ODT with usable text layer use local extraction + free text model.
- Scanned PDF without usable text and legacy `.doc` fail clearly under free_only instead of leaking premium spend.
- AI telemetry is server-only and stores no prompts/product/document/user/email/PII.
- ImportVerifier AI no longer accepts browser-supplied regulatory context. Browser sends only `analysisId`, `productIndex`, question and language; server reconstructs owned analysis, regulatory result, saved evidence and relevant official Radar events.
- Public regulatory-agent response contains only answer + disclaimer; provider/model remain server-side telemetry only. Regression test protects this invariant.
- ImportVerifier AI remains same-origin/authenticated and never declares certification/compliance.

## DONE — AI abuse / upload controls
- Atomic server-only Supabase rate limiter applied in production.
- ImportVerifier AI: 60 requests/account/hour technical guardrail.
- AI-backed product extraction: 30 documents/account/hour technical guardrail.
- Product extraction now validates filename extension, declared MIME, data-URL MIME and decoded byte size before rate limiting or any AI call.
- Remote extraction endpoint no longer accepts CSV/XLS/XLSX; spreadsheets remain local parsing only.
- Image MIME allowlist covers PNG/JPEG/WebP/HEIC/HEIF and rejects extension/MIME mismatches.
- These are technical safeguards, not commercial quotas.

## DONE — regulatory engine / evidence / Twin
- Versioned EU regulatory engine with candidate category, rules, obligations, uncertainty and official sources.
- Product Regulatory Twin uses persisted evidence readiness.
- Evidence traceability: requirement → status → document → page/section → note → HTTPS URL.
- Evidence UI, PDF traceability and Excel `Evidencia` worksheet implemented.
- RLS enforces account isolation.
- Composite `(analysis_id,user_id)` FK defense-in-depth prevents evidence from being linked to another account's analysis even outside RLS.
- Security integration test creates the analysis under the correct JWT identity and proves the composite FK rejects cross-account evidence while accepting the owner.

## DONE — Regulatory Impact Radar foundation
- Persistent `regulatory_change_events` store applied in production.
- Authenticated `/api/regulatory-changes` read endpoint.
- Official event normalization: HTTPS EU allowlist, size limits, date normalization, stable fingerprint, deduplication.
- Protected server-only `/api/internal/regulatory-ingest` and `/api/internal/regulatory-refresh`; bearer secret >=32 chars.
- EUR-Lex adapter uses official RSS 162/161/222, timeout/size guards, CELEX/ELI extraction and product-compliance keyword classification.
- Scheduled GitHub workflow calls protected production `/api/internal/regulatory-refresh` directly every 6h; no duplicate parser/dependency install.
- `REGULATORY_RADAR_LIVE=true` is release-valid only with a strong ingest secret; UI `live` also requires official persisted events.
- Production last checked with **0 Radar events**; do not claim live regulatory monitoring yet.
- Safety Gate remains future second official source; do not invent undocumented APIs.

## DONE — PWA/mobile/security
- PWA manifest/service worker/registration implemented.
- `/dashboard`, `/api`, `/auth`, reset/private content excluded from offline cache.
- Missing `/icon.svg` bug fixed with own-brand ImportVerifier shield/check icon; no institutional/EU-certification claim.
- Raster app assets exist: `apple-touch-icon.png` 180x180, `icon-192.png`, `icon-512.png`.
- Manifest uses 192/512 PNG plus SVG; Next metadata exposes raster icons and Apple touch icon.
- Tests verify every manifest icon points to an existing public asset.
- Global security headers include HSTS, frame denial, no-sniff, strict referrer, restrictive permissions, same-origin-allow-popups and conservative CSP.
- `sameOrigin` fails closed if `NEXT_PUBLIC_SITE_URL` is missing/malformed.
- Intelligence Suite mobile CSS enforces 44px touch targets, keyboard focus visibility, safe areas, wrapping and 16px iOS form controls.
- Roadmap remains Capacitor for iOS/iPadOS/Android and Tauri for Windows/macOS/Linux with shared backend/business logic.

## DONE — localization / reports
- `report-i18n.ts` provides ES/EN/FR/DE/IT/PT structural labels.
- PDF detects active browser language with Spanish server/test fallback.
- PDF narrative has explicit ES/EN/FR/DE/IT/PT branches; visible priority is localized.
- `guide-i18n.ts` provides documentary scope in all six supported languages; PDF and Excel use it.
- Excel localizes major visible structural labels/statuses and follows active language while preserving stable internal formula references.
- Intelligence Suite is localized ES/EN/FR/DE/IT/PT and sends selected language to ImportVerifier AI.
- `dashboard-copy-v2.ts` contains complete auditable ES/EN/FR/DE/IT/PT dictionaries + interpolation helper; tests verify key parity and real translations.
- Obsolete partial `dashboard-i18n.ts` removed.
- EU `documentationFor(...)` now generates the documentary actions structurally in ES/EN/FR/DE/IT/PT, including statuses and EU operator display label, while preserving official source URLs verbatim.
- `tests/documentation-language.test.ts` protects six-language EU guidance and unchanged HTTPS official sources.
- Main `Dashboard.tsx` still needs structural wiring to `dashboard-copy-v2.ts`; do not use DOM translation hacks.
- Future-market documentary narratives (US/CN/GB/JP) remain Spanish internally; those markets are not active in customer UX yet and must be localized before activation.

## DONE — auth hardening
- OAuth callback only accepts safe internal destinations.
- Callback validates/preserves `lang` and has canonical ImportVerifier fallback origin when site URL is missing/malformed.
- `AuthForm.tsx` propagates selected language through Google OAuth, email signup confirmation and password-reset callback; reset returns to localized login.
- Regression tests protect Google/signup/reset language propagation and callback validation.

## DONE — SEO / public indexing
- Sitemap includes canonical homepage, Privacy and Terms.
- Production robots excludes dashboard/API/auth/login/reset surfaces; preview/branch deploys disallow all indexing.
- Root metadata/canonical/OpenGraph branding uses ImportVerifier/Import Rules Verifier and canonical domain.
- Dynamic 1200x630 `app/opengraph-image.tsx` exists with Import Rules Verifier branding and independent-EU-regulatory positioning.

## Production database facts last checked 2026-08-31
- Supabase project: `hfuwwjdcyudflamwwnon`.
- Evidence, Radar, AI telemetry and API rate-limit tables exist.
- Radar events = 0; AI usage events = 0 at check time.
- `pg_cron` and `pg_net` not enabled; do not add hidden dependencies on them.

## LATEST VERIFIED BUILD
- Functional commit `b4676bcd4a5642c38408abbb844d66f7a5878fd2` completed `ImportVerifier release check` run #434 successfully: tests + typecheck + build green.
- The following continuity-only commit must be checked at its exact HEAD before claiming exact-HEAD green.
- PR #4 remains open, unmerged and mergeable.

## IN PROGRESS — execute without asking
1. Keep exact latest HEAD CI green; fix any failure immediately.
2. Wire `components/Dashboard.tsx` structurally to `dashboard-copy-v2.ts`: tabs, notices/errors, quota, results/history/reports/settings, date locale and `formatPrice(language, ...)`.
3. Ensure report exporters pass the selected language explicitly into documentary guidance so server/test execution does not depend on browser-language inference.
4. Continue Excel structural localization: localize worksheet names safely while keeping formulas valid after translated sheet names.
5. Continue security/account/billing sweep and targeted regression tests.
6. Continue desktop/iPhone/iPad/PWA QA, especially upload/export flows and safe-area/keyboard behavior.
7. Localize US/CN/GB/JP documentary narratives before any of those markets becomes customer-active.
8. Refresh `WORK-HANDOFF-IMPORTVERIFIER.md` on the next material architecture/release-state pass; this localization pass did not change architecture.

## BLOCKED EXTERNAL / USER OR WORK BROWSER NEEDED
- Netlify: deploy latest PR #4 branch to `https://importverifier.netlify.app/` and confirm production branch/env.
- Netlify: set `STRIPE_PRICE_STARTER=price_1UAJy5HJnO8odw1Mn4jMVjFt`.
- Netlify: configure `SILICONFLOW_API_KEY`, `AI_COST_POLICY=free_only`, SiliconFlow model vars.
- Netlify + GitHub repository secret: configure same >=32-char `REGULATORY_INGEST_SECRET`.
- Only after scheduled refresh works and official events persist, set `REGULATORY_RADAR_LIVE=true`.
- Verify Stripe webhook URL/signing secret.
- Supabase Auth dashboard: enable leaked-password protection and CAPTCHA/signup abuse controls after verifying current Supabase docs/settings.
- Verify Supabase/Google OAuth redirect allowlists for canonical domain.
- Verify production SMTP/signup/reset on a non-owner email.
- Configure truthful legal provider identity/address/tax/jurisdiction/refund policy; paid checkout deliberately blocked until then.
- Register official Shopify OAuth app/scopes, Amazon SP-API app/permissions and Etsy OAuth app.

## Continuous execution
Keep working while any safe/actionable task remains. Human-only blockers go to the external list and must not stop work elsewhere. Never repeat DONE work. Never merge PR #4 without explicit owner instruction.

## Definition of finished
Do not call ImportVerifier finished until: exact current CI is green; canonical Netlify runs latest code; 5-product lifetime trial works end-to-end; legal provider data is published; Unlimited checkout/webhook/portal/cancellation pass; production free-only AI works without premium leakage; supported inputs behave honestly; dashboard/reports follow user language; evidence/account isolation passes; Radar claims match actual ingestion; connectors are either truly working or clearly unavailable; and desktop/iPhone/iPad/PWA QA passes.
