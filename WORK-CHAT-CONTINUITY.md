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

## Execution standard
- Keep working while any safe/actionable task remains.
- Human-only blockers go to `BLOCKED EXTERNAL`; immediately continue elsewhere.
- Never repeat DONE work.
- Inspect CI/tests/typecheck/build after meaningful changes and repair regressions.
- Update this file after meaningful passes.

## Commercial invariants
- Exactly **5 free products total per account**, no card, no monthly reset.
- After the free allowance: only **ImportVerifier Unlimited · €9.95/month**.
- `starter` remains the internal compatibility ID for Unlimited.
- Unlimited must never expose an artificial product ceiling to customers.
- End users see only **ImportVerifier AI**, never provider/model names.

## DONE — product/release core
- ImportVerifier branding + canonical domain.
- 5-product lifetime trial atomically enforced in production Supabase; paid active subscriptions bypass free counter.
- Dashboard public purchase flow cleaned to Gratis → Unlimited; audit/legacy plan ladder removed.
- Stripe live Unlimited product/price exists; recurring price `price_1UAJy5HJnO8odw1Mn4jMVjFt` = EUR 9.95/month.
- Checkout only accepts Unlimited and validates price/currency/monthly cadence before redirect.
- Billing portal now validates a safe configured site URL before creating Stripe session.
- Billing entitlement only treats active/trialing + unexpired subscription as paid; cancellation/expiry falls back safely.

## DONE — zero-cost AI architecture
- Production default/fail-closed policy is `AI_COST_POLICY=free_only`.
- Production release config rejects policies that allow premium AI spend.
- SiliconFlow-compatible free text + vision/OCR routing implemented.
- Defaults: `THUDM/GLM-Z1-9B-0414` text; `PaddlePaddle/PaddleOCR-VL-1.5` vision/OCR.
- `free_only` never calls OpenAI.
- CSV/XLS/XLSX parse locally without AI.
- Images use free vision/OCR when configured.
- TXT/MD/JSON/RTF and PDF/DOCX/ODT with text layer use local extraction + free text model.
- PDF without usable text and legacy `.doc` fail clearly under free_only instead of leaking premium spend.
- Dependency-free local document parser + tests cover DOCX, ODT, RTF and text-layer PDF, including ZIP/output limits.
- AI telemetry is server-only and contains no prompts/product/document/user/email/PII.
- `readAiUsageSummary` can measure total/free/premium/fallback/success/latency and zero-premium rate.

## DONE — AI abuse controls
- Server-only atomic rate limiter implemented in Supabase.
- Production migration `api_rate_limits` applied.
- ImportVerifier AI: 60 requests/account/hour technical guardrail.
- AI-backed product extraction: 30 documents/account/hour technical guardrail.
- These are anti-abuse controls, not commercial product quotas.
- Integration coverage now forces the atomic limiter to its ceiling, verifies rejection, invalid-parameter fail-closed behavior and fixed-window reset.

## DONE — regulatory engine / evidence / Twin
- Versioned EU regulatory engine with candidate category, rules, obligations, uncertainty and official sources.
- ImportVerifier AI contextual regulatory endpoint is authenticated/same-origin and never declares certification/compliance.
- Product Regulatory Twin uses persisted evidence readiness.
- Evidence traceability: requirement → status → document → page/section → note → HTTPS URL.
- Evidence UI, PDF traceability and Excel `Evidencia` worksheet implemented.
- RLS enforces account isolation.
- Production DB now also has composite `(analysis_id,user_id)` FK defense-in-depth so evidence cannot be attached to another account's analysis even through a future privileged-code bug.
- Integration coverage now verifies the composite evidence-owner FK rejects cross-account evidence even outside RLS while accepting the true owner.

## DONE — Regulatory Impact Radar
- Persistent `regulatory_change_events` store applied in production.
- Authenticated `/api/regulatory-changes` read endpoint.
- Official-source event normalization: HTTPS EU allowlist, size limits, date normalization, stable fingerprint, deduplication.
- Protected server-only `/api/internal/regulatory-ingest`, strong bearer secret required.
- EUR-Lex adapter uses official RSS feeds 162/161/222, timeout/size guards, CELEX/ELI extraction and product-compliance keyword classification.
- EUR-Lex now discards official items with no product/compliance relevance to avoid noise/storage growth.
- Tests cover official host/RSS IDs, external-link rejection, XML/CDATA, product relevance, batteries/packaging/market surveillance, CE/DPP/RoHS/WEEE/labelling.
- Scheduled GitHub workflow polls EUR-Lex every 6h and posts to production ingest once the shared secret is configured.
- Radar `live` is fail-closed: it becomes true only when `REGULATORY_RADAR_LIVE=true` and official events exist. Do not claim live monitoring before external activation.
- Safety Gate remains a second-source target; no undocumented API is to be invented.

## DONE — PWA/mobile/security
- PWA manifest/service worker/registration implemented.
- `/dashboard`, `/api`, `/auth`, password reset/private content excluded from offline cache.
- Service worker update checks on focus/online.
- Tests protect PWA identity/installability and private-route cache exclusions.
- Mobile/iPad safe areas, touch targets, evidence forms and scrollable result tables hardened.
- Roadmap fixed: Capacitor for iOS/iPadOS/Android; Tauri for Windows/macOS/Linux; shared backend stays canonical.
- Security headers: nosniff, frame denial, strict referrer, restrictive permissions policy, HSTS, same-origin-allow-popups, cross-domain-policy none, conservative CSP (`object-src none`, `base-uri self`, `frame-ancestors none`, `form-action self`).
- API/auth remain `private, no-store`.
- Tests protect critical security headers and no-store behavior.

## DONE — reports
- PDF/Excel carry ImportVerifier branding and evidence traceability.
- New `report-i18n.ts` provides structural report labels for ES/EN/FR/DE/IT/PT.
- PDF exporter accepts a language argument (Spanish default for backwards compatibility) and localizes major structural labels/statuses.

## LATEST PASS
- Previous HEAD `0f8c4aa092ed17c69967098cff3d15c3ea31e042` completed both Netlify Deploy Previews successfully.
- Security integration test commit: `ea6fc9830741bb114818ab875d2cc49066910725` (`tests/security-invariants.test.ts`).
- At the time of this handoff update, GitHub Actions `verify` jobs for `ea6fc983…` were running; no failure had been reported yet.
- This continuity update intentionally does not merge PR #4.

## IN PROGRESS — continue without asking
1. Keep the latest HEAD CI green; fix any failure immediately.
2. Finish Excel structural localization safely: localize worksheet names, make formulas refer to localized sheet names safely, and pass active language into the regulatory worksheet; add regression tests for formulas/worksheet identity.
3. Pass the active user language into PDF/Excel exports wherever the dashboard/export call sites still omit it; then extend dashboard copy localization structurally (no DOM-translation hacks).
4. Continue report narrative localization while preserving verbatim official references/source URLs and avoiding AI-invented translations of legal meaning.
5. Continue security/auth/account isolation sweep after the new rate-limit/FK integration coverage.
6. Continue iPhone/iPad/PWA QA; add 180/192/512 raster install icons when a binary-capable Work/browser path is available.
7. Refresh the long Work handoff when architecture/product state materially changes; security tests alone do not require rewriting its historical background.

## BLOCKED EXTERNAL / USER OR WORK BROWSER NEEDED
- Netlify: deploy latest PR #4 branch.
- Netlify: `STRIPE_PRICE_STARTER=price_1UAJy5HJnO8odw1Mn4jMVjFt`.
- Netlify: configure `SILICONFLOW_API_KEY`, `AI_COST_POLICY=free_only`, SiliconFlow model vars, and a >=32-char `REGULATORY_INGEST_SECRET`.
- GitHub repository secret: configure the same `REGULATORY_INGEST_SECRET` for scheduled EUR-Lex workflow.
- After both Radar ingestion sides are truly active and verified, set `REGULATORY_RADAR_LIVE=true` in production.
- Verify Stripe webhook URL/signing secret in Netlify/Stripe.
- Supabase Auth dashboard: enable leaked-password protection and CAPTCHA/signup abuse controls.
- Verify Supabase/Google OAuth redirect allowlists for `https://importverifier.netlify.app`.
- Verify production SMTP/Resend signup/reset on a non-owner email.
- Register official Shopify OAuth app/scopes, Amazon SP-API app/permissions and Etsy OAuth app.
- Add iOS/iPadOS raster app icons (binary asset workflow).
- Add final legal identity/address/tax/jurisdiction/refund details before taking paid customers.

## Continuous execution
An hourly continuation task runs indefinitely while ImportVerifier remains unfinished. Hourly is the maximum supported frequency. Each run must read this file, skip DONE items, work through IN PROGRESS/NEXT, repair CI regressions, and defer human blockers rather than stopping.

## Definition of finished
Do not call ImportVerifier finished until: current CI is green; canonical Netlify runs latest code; 5-product lifetime trial works end-to-end; Unlimited checkout/webhook/portal/cancellation pass; production free-only AI works without premium leakage; supported inputs behave honestly; reports follow user language; evidence/account isolation passes; Radar claims match actual ingestion; connectors are either truly working or clearly unavailable; and desktop/iPhone/iPad/PWA QA passes.
