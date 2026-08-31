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
- New production legal guard requires `LEGAL_PROVIDER_NAME`, `LEGAL_PROVIDER_ADDRESS`, `LEGAL_TAX_ID`, `LEGAL_JURISDICTION`, `LEGAL_REFUND_POLICY` before checkout can start.
- Release checker also fails production when those legal values are incomplete.
- Privacy and Terms render configured legal identity/refund policy, otherwise explicitly state that paid checkout is disabled.
- Account deletion now cancels any Stripe subscription before deleting the Supabase user; deletion aborts if cancellation fails.
- Stripe cancellation webhook now safely acknowledges a terminal canceled subscription arriving after the Supabase user was already deleted, preventing infinite retries/FK failures.
- Tests protect the account-delete → Stripe-cancel ordering and late cancellation webhook behavior.

## DONE — zero-cost AI / trustworthy context
- Production default/fail-closed policy is `AI_COST_POLICY=free_only`.
- Release config rejects production policies that permit premium AI spend.
- Free route: SiliconFlow-compatible text + vision/OCR; `free_only` never calls OpenAI.
- CSV/XLS/XLSX parse locally without AI.
- Images use free vision/OCR when configured.
- TXT/MD/JSON/RTF and PDF/DOCX/ODT with usable text layer use local extraction + free text model.
- Scanned PDF without usable text and legacy `.doc` fail clearly under free_only instead of leaking premium spend.
- Local document parser + tests cover text-layer PDF, DOCX, ODT and RTF with output/ZIP limits.
- AI telemetry is server-only and stores no prompts/product/document/user/email/PII; summary helper can measure free/premium/fallback/success/latency.
- ImportVerifier AI no longer accepts browser-supplied regulatory context. Browser sends only `analysisId`, `productIndex`, question and language; the server reconstructs the owned analysis, regulatory result, saved evidence and relevant official Radar events from authenticated data.
- ImportVerifier AI remains same-origin/authenticated and never declares certification/compliance.

## DONE — AI abuse controls
- Atomic server-only Supabase rate limiter applied in production.
- ImportVerifier AI: 60 requests/account/hour technical guardrail.
- AI-backed product extraction: 30 documents/account/hour technical guardrail.
- These are anti-abuse controls, not commercial quotas.

## DONE — regulatory engine / evidence / Twin
- Versioned EU regulatory engine with candidate category, rules, obligations, uncertainty and official sources.
- Product Regulatory Twin uses persisted evidence readiness.
- Evidence traceability: requirement → status → document → page/section → note → HTTPS URL.
- Evidence UI, PDF traceability and Excel `Evidencia` worksheet implemented.
- RLS enforces account isolation.
- Production DB also has composite `(analysis_id,user_id)` FK defense-in-depth, preventing evidence from being linked to another account's analysis even through future privileged-code mistakes.

## DONE — Regulatory Impact Radar foundation
- Persistent `regulatory_change_events` store applied in production.
- Authenticated `/api/regulatory-changes` read endpoint.
- Official event normalization: HTTPS EU allowlist, size limits, date normalization, stable fingerprint, deduplication.
- Protected server-only `/api/internal/regulatory-ingest` and `/api/internal/regulatory-refresh`; bearer secret >=32 chars.
- EUR-Lex adapter uses official RSS 162/161/222, timeout/size guards, CELEX/ELI extraction and product-compliance keyword classification.
- Irrelevant official items with no product/compliance keywords are discarded before persistence.
- Scheduled GitHub workflow was simplified: every 6h it calls the protected production `/api/internal/regulatory-refresh` directly; it no longer checks out code, installs Node dependencies or maintains a duplicate parser.
- `REGULATORY_RADAR_LIVE=true` is release-valid only with a strong ingest secret; UI `live` is still fail-closed and also requires official events.
- Production currently has **0 Radar events**, so do not claim live regulatory monitoring yet.
- Safety Gate remains a future second official source; do not invent an undocumented API.

## DONE — PWA/mobile/security
- PWA manifest/service worker/registration implemented.
- `/dashboard`, `/api`, `/auth`, password reset/private content excluded from offline cache.
- PWA tests protect identity/installability and private-route cache exclusions.
- Global security headers include HSTS, frame denial, no-sniff, strict referrer, restrictive permissions, same-origin-allow-popups and conservative CSP.
- `sameOrigin` now fails closed if `NEXT_PUBLIC_SITE_URL` is missing/malformed instead of throwing 500.
- Intelligence Suite mobile CSS now enforces 44px touch targets, keyboard focus visibility, safe areas, text wrapping and 16px form controls on iPhone/iPad widths to avoid iOS auto-zoom.
- Roadmap remains Capacitor for iOS/iPadOS/Android and Tauri for Windows/macOS/Linux with shared backend/business logic.

## DONE — localization / reports
- `report-i18n.ts` provides ES/EN/FR/DE/IT/PT structural labels.
- PDF detects active browser language with Spanish server/test fallback and localizes major structural labels/statuses.
- Excel localizes major visible structural labels/statuses while retaining stable internal worksheet names where required for formula compatibility.
- Regulatory Excel worksheet follows active language while preserving legal references/source URLs verbatim.
- Intelligence Suite is localized ES/EN/FR/DE/IT/PT and sends selected language to ImportVerifier AI.
- `dashboard-copy-v2.ts` now contains complete auditable ES/EN/FR/DE/IT/PT dictionaries + interpolation helper. Tests verify key parity, non-empty values, real translation on major surfaces and template interpolation.
- Obsolete partial `dashboard-i18n.ts` was removed so there is one dashboard-copy source of truth.
- Main `Dashboard.tsx` still needs to be mechanically wired to `dashboard-copy-v2.ts`; do not use DOM translation hacks.

## DONE — auth hardening so far
- OAuth callback only accepts safe internal destinations.
- Callback now validates/preserves `lang` and has a canonical ImportVerifier fallback origin if `NEXT_PUBLIC_SITE_URL` is missing/malformed.
- Tests protect safe destination/language/canonical origin behavior.
- `AuthForm.tsx` still needs its outgoing Google/signup/reset callback URLs to append the selected language. A direct connector edit was blocked; retry later via a safe code-edit path rather than forcing it.

## DONE — SEO / public indexing
- Sitemap includes canonical homepage, Privacy and Terms.
- Production robots excludes dashboard/API/auth/login/reset surfaces; preview/branch deploys disallow all indexing.
- Root metadata/canonical/OpenGraph branding is ImportVerifier/Import Rules Verifier with canonical domain.
- Raster OpenGraph/app icons remain binary-asset work for Work/browser.

## Production database facts checked 2026-08-31
- Supabase project: `hfuwwjdcyudflamwwnon`.
- Evidence, Radar, AI telemetry and API rate-limit tables exist.
- Radar events = 0; AI usage events = 0 at the check time.
- `pg_cron` and `pg_net` are not enabled; do not add hidden dependencies on them.

## IN PROGRESS — execute without asking
1. Keep latest HEAD CI green; fix any failure immediately.
2. Wire `components/Dashboard.tsx` to `dashboard-copy-v2.ts`, including localized tabs, notices, quota text, reports/settings copy, date locale and `formatPrice(language, ...)`.
3. Retry `AuthForm.tsx` callback-language wiring safely.
4. Continue report narrative localization while preserving official references/URLs and avoiding invented legal meaning.
5. Continue auth/account/billing/security sweep and add targeted tests for every critical invariant found.
6. Continue mobile/iPhone/iPad/PWA QA; add 180/192/512 raster icons and OG image when binary-capable Work/browser is available.
7. Refresh long Work handoff after material architecture/release-state changes.

## BLOCKED EXTERNAL / USER OR WORK BROWSER NEEDED
- Netlify: deploy latest PR #4 branch to `https://importverifier.netlify.app/`.
- Netlify: set `STRIPE_PRICE_STARTER=price_1UAJy5HJnO8odw1Mn4jMVjFt`.
- Netlify: configure `SILICONFLOW_API_KEY`, `AI_COST_POLICY=free_only`, SiliconFlow model vars.
- Netlify + GitHub repository secret: configure the same >=32-char `REGULATORY_INGEST_SECRET`.
- Only after scheduled refresh works and official events are persisted, set `REGULATORY_RADAR_LIVE=true`.
- Verify Stripe webhook URL/signing secret.
- Supabase Auth dashboard: enable leaked-password protection and CAPTCHA/signup abuse controls.
- Verify Supabase/Google OAuth redirect allowlists for canonical domain.
- Verify production SMTP/signup/reset on a non-owner email.
- Configure truthful legal provider identity/address/tax/jurisdiction/refund policy; paid checkout is deliberately blocked until then.
- Register official Shopify OAuth app/scopes, Amazon SP-API app/permissions and Etsy OAuth app.
- Add iOS/iPadOS raster app icons and social OG image through binary-capable workflow.

## Continuous execution
Keep working while any safe/actionable task remains. Human-only blockers go to the external list and must not stop work elsewhere. Never repeat DONE work. Never merge PR #4 without explicit owner instruction.

## Definition of finished
Do not call ImportVerifier finished until: current CI is green; canonical Netlify runs latest code; 5-product lifetime trial works end-to-end; legal provider data is published; Unlimited checkout/webhook/portal/cancellation pass; production free-only AI works without premium leakage; supported inputs behave honestly; dashboard/reports follow user language; evidence/account isolation passes; Radar claims match actual ingestion; connectors are either truly working or clearly unavailable; and desktop/iPhone/iPad/PWA QA passes.
