# ImportVerifier — Chat ↔ Work continuity protocol

## Canonical project

- Production target: https://importverifier.netlify.app/
- Repository: `manetalax/eu-product-radar`
- PR: `#4`
- Branch: `feat/import-rules-verifier-branding`
- Do not create a replacement project and do not merge PR #4 unless the owner explicitly asks.

## Source-of-truth order

1. `WORK-CHAT-CONTINUITY.md` — latest operational state; wins over stale text.
2. `WORK-HANDOFF-IMPORTVERIFIER.md` — detailed architecture/background.
3. Latest PR #4 HEAD + latest CI result.
4. `AGENTS.md` — autonomous execution standard.

## Execution standard — default for Chat and Work

- Keep working while any safe/actionable task remains.
- Human-only blockers go to `BLOCKED EXTERNAL`; immediately continue with another task.
- Do not stop merely because one task is complete.
- Never repeat DONE work.
- Inspect tests/typecheck/build/CI after meaningful changes and repair regressions when possible.
- Update this file after a meaningful pass.

## Commercial invariants

- Exactly **5 free products total per account**, no card, no monthly reset.
- After the 5 free products: only **ImportVerifier Unlimited · €9.95/month**.
- Internal `starter` ID maps to public Unlimited for backwards compatibility.
- Unlimited must never expose an artificial product ceiling to customers.
- AI provider names/models must never be exposed to end users; the product is simply **ImportVerifier AI**.

## AI cost policy

- Production default: `AI_COST_POLICY=free_only`.
- The runtime now fails closed: if production omits/invalidates `AI_COST_POLICY`, it resolves to `free_only` rather than `free_first`.
- Release config rejects production policies that permit premium AI spending.
- Free path: SiliconFlow-compatible text + vision/OCR models.
- Current configured model defaults: text `THUDM/GLM-Z1-9B-0414`; OCR/vision `PaddlePaddle/PaddleOCR-VL-1.5`.
- `free_only` must never call OpenAI.
- Images use free-only vision routing in production.
- TXT/Markdown/JSON/RTF are decoded locally then sent through the free text model.
- CSV/XLS/XLSX remain locally parsed and AI-free in the dashboard path.
- PDF/DOC/DOCX/ODT still need a local/free parser to preserve full universal-input coverage under `free_only`; until then they fail clearly rather than incur a paid fallback.
- OpenAI remains optional fallback only outside production policy or when policy is explicitly changed later.

## DONE

- ImportVerifier branding and canonical domain.
- 5-product lifetime trial implemented atomically in production Supabase via `free_account_usage`; active paid subscriptions bypass free counter.
- Dashboard cleaned to Gratis → Unlimited only; legacy audit/public plan ladder removed.
- Post-trial Unlimited CTA implemented.
- Stripe live product/price exists: `ImportVerifier Unlimited` / €9.95 monthly; internal plan id `starter`.
- Checkout accepts only Unlimited and validates active EUR 9.95 monthly Stripe price before redirect.
- Versioned EU regulatory engine with category candidates, applicable acts, obligations, uncertainties and official sources.
- ImportVerifier AI authenticated endpoint; provider/model removed from browser response.
- Free-only/free-first AI cost router implemented for text and vision.
- Product extraction routes image + text-like files through free AI; document fallback is blocked under free_only.
- AI usage telemetry table applied to production Supabase. It stores only task/provider/model/success/premium/fallback/latency; no prompt, product, document, user id, email or customer PII.
- Regulatory Twin linked to persisted evidence.
- Evidence traceability stores requirement → document → page/section → note → HTTPS URL.
- PDF includes evidence traceability; Excel includes `Evidencia` worksheet.
- Regulatory Impact Radar persistent store applied to production Supabase.
- `/api/regulatory-changes` authenticated read endpoint implemented.
- Radar relevance matching filters official events against selected product/category and relevant events enter ImportVerifier AI context.
- Official-event normalizer implemented with HTTPS EU-domain allowlist, size limits, date normalization, stable fingerprint and deduplication.
- Server-only idempotent Radar event upsert implemented.
- Protected `/api/internal/regulatory-ingest` implemented; bearer secret must be >=32 chars.
- Official EUR-Lex RSS source verified and adapter script added: `scripts/fetch-eurlex-radar.ts`.
- Scheduled GitHub workflow added to poll EUR-Lex every 6 hours and push normalized events to ImportVerifier ingest once `REGULATORY_INGEST_SECRET` is configured.
- Safety Gate remains a second-source target; do not claim live Safety Gate ingestion until a stable official export/API is wired.
- Shopify/Amazon/Etsy connector abstraction and HTTPS platform detection exist; OAuth/API credentials not configured yet.
- PWA manifest/service worker/registration implemented.
- Private `/dashboard`, `/api`, `/auth`, password-reset content is excluded from offline caching.
- Service worker refreshes on focus/online to reduce stale installed-app versions.
- Mobile/iPad safe areas, touch targets, evidence forms and scrollable tables hardened.
- Native roadmap: Capacitor for iOS/iPadOS/Android; Tauri for Windows/macOS/Linux; shared backend remains canonical.
- Global security headers include nosniff, frame denial, strict referrer policy, restrictive permissions policy, HSTS and `Cross-Origin-Opener-Policy: same-origin-allow-popups`; API/auth remain no-store.
- Release checker requires only active Stripe Unlimited env, accepts free AI without requiring OpenAI, enforces production `free_only`, validates free_only/SiliconFlow pairing, and validates strong Radar ingest secret when configured.
- `.env.example` / `.env.production.example` cleaned of active legacy plan prices; production example defaults to `AI_COST_POLICY=free_only`.
- `AGENTS.md` codifies continuous autonomous execution + blocker deferral.

## IN PROGRESS

1. Keep latest HEAD CI green; repair any test/typecheck/build regression immediately.
2. Finish local/free parsing for PDF/DOCX/ODT so production `free_only` restores truly universal document input.
3. Validate EUR-Lex parser/workflow behavior under CI and then activate it once the shared ingest secret exists externally.
4. Continue mobile/iPad responsive and PWA release QA at code level.
5. Continue auth/billing/security/privacy release sweep.
6. Refresh long Work handoff with these overrides.

## BLOCKED EXTERNAL / USER OR WORK BROWSER NEEDED

- Netlify: deploy latest PR #4 branch and set `STRIPE_PRICE_STARTER=price_1UAJy5HJnO8odw1Mn4jMVjFt`.
- Netlify: configure `SILICONFLOW_API_KEY`, `AI_COST_POLICY=free_only`, `SILICONFLOW_TEXT_MODEL`, `SILICONFLOW_VISION_MODEL`, and a >=32-char `REGULATORY_INGEST_SECRET`.
- GitHub repository secret: configure the same `REGULATORY_INGEST_SECRET` so the scheduled EUR-Lex Radar workflow can call production ingest.
- Confirm remaining production env vars and Stripe webhook URL/signing secret in Netlify.
- Supabase Auth dashboard: enable leaked-password protection.
- Configure CAPTCHA/signup abuse controls.
- Verify Supabase + Google OAuth redirect allowlists for `https://importverifier.netlify.app`.
- Verify production SMTP/Resend signup/reset on a non-owner email.
- Register official Shopify OAuth app/scopes.
- Register Amazon SP-API application/permissions.
- Register Etsy API app/OAuth.
- Add final legal identity/address/tax/jurisdiction/refund details before taking paid customers.

## NEXT — execute without asking

1. Inspect current HEAD CI and fix failures.
2. Implement/tests for local/free document parsing where feasible without unsafe dependencies.
3. Add tests/guards for the EUR-Lex adapter and scheduled workflow.
4. Add/verify cost telemetry queries so we can measure percentage of AI tasks resolved at zero premium cost.
5. Continue PWA/mobile/security QA.
6. Update long handoff.
7. When Work/Cloud Browser is available, finish Netlify/Auth external wiring and run the complete production customer journey.

## Continuous execution

A recurring task runs hourly with no fixed end date while ImportVerifier remains unfinished. Hourly is the maximum supported automation frequency. Every run must read this file, skip DONE items, work through actionable IN PROGRESS/NEXT tasks, fix CI regressions, and defer human-only blockers instead of stopping.

## Definition of finished

Do not call ImportVerifier finished until: latest CI is green; canonical Netlify runs latest code; 5-product lifetime trial works; Unlimited checkout/webhook/portal/cancellation work end-to-end; production free-only AI works without premium leakage; supported input formats behave honestly; reports/evidence are traceable; auth/isolation/recovery/deletion pass; Radar claims match actual ingestion; marketplace connectors are working or clearly unavailable; and desktop/iPhone/iPad/PWA QA passes.
