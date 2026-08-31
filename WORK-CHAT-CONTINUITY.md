# ImportVerifier — Chat ↔ Work continuity protocol

## Canonical project

- Production target: https://importverifier.netlify.app/
- Repository: `manetalax/eu-product-radar`
- PR: `#4`
- Branch: `feat/import-rules-verifier-branding`
- Do not create a replacement project, do not deploy obsolete EU Product Radar variants, and do not merge PR #4 unless the owner explicitly asks.

## Source-of-truth order

1. `WORK-CHAT-CONTINUITY.md` — latest operational state; this wins if older text is stale.
2. `WORK-HANDOFF-IMPORTVERIFIER.md` — detailed architecture, product decisions and acceptance criteria.
3. Latest PR #4 HEAD + latest CI result.
4. `AGENTS.md` — repository execution standard for autonomous continuation.

Chat and Work must read all four before substantial changes. After each meaningful pass, update this file and the long handoff when architecture/decisions change.

## Execution standard — default working style

- Keep working through actionable tasks instead of stopping after one completed item.
- If a task needs owner credentials, browser access, external approval, legal identity data or another human-only action, mark it `BLOCKED EXTERNAL` and immediately continue with another actionable item.
- Human intervention is accumulated for the end whenever technically possible.
- Before ending a meaningful pass, inspect CI/tests/typecheck/build and repair regressions when possible.
- Never repeat DONE work; always continue from IN PROGRESS/NEXT.

## Commercial invariant — do not change without explicit owner instruction

- Every new account gets a **free trial of exactly 5 product analyses total per account**.
- The 5 free products **do not reset monthly**.
- No card is required for those 5 free products.
- After the free allowance is exhausted, the only public paid offer is **ImportVerifier Unlimited · €9.95/month**.
- Internal fair-use/technical ceilings must never be presented as a commercial product quota to Unlimited customers.

## DONE

- ImportVerifier / Import Rules Verifier brand foundation.
- Free entry: exactly **5 product analyses total per account**, no card.
- Production Supabase migrated from monthly-free quota to atomic lifetime `free_account_usage`; active paid subscriptions bypass the free counter.
- API quota model and regression tests updated so the free allowance cannot reset by month.
- Public commercial offer: **Unlimited · €9.95/month** only.
- Dashboard semantically refactored to remove public audit/legacy-plan cards and show only Gratis → Unlimited.
- Dedicated post-trial conversion CTA opens Unlimited Checkout after the 5 free products are exhausted.
- Legacy CSS overrides removed from `UnlimitedExperience`; new Unlimited card can no longer be hidden accidentally.
- Internal `starter` ID retained as Unlimited for backwards-compatible Stripe/database handling; legacy plan IDs remain internal only.
- Public landing rebuilt around Unlimited, ImportVerifier AI, Product Regulatory Twin, Regulatory Impact Radar and Connect.
- PDF/Excel/regulatory report branding centralized and strengthened.
- Universal product input foundation for spreadsheets, text/documents and images.
- Versioned EU regulatory engine with category candidates, obligations, uncertainty flags and official sources.
- Authenticated ImportVerifier AI endpoint with free-first provider router + premium fallback architecture.
- AI provider identities hidden from end-user UI.
- Regulatory Twin foundation implemented and readiness linked to persisted `analysis_evidence`.
- Evidence traceability implemented: document, page/section, note and HTTPS source URL persisted per requirement; production Supabase schema migrated and verified.
- PDF export includes saved evidence traceability per product.
- Excel export includes dedicated `Evidencia` sheet.
- Regulatory Impact Radar persistent event store created and applied to production Supabase.
- Authenticated `/api/regulatory-changes` endpoint reads active server-managed Radar events.
- Intelligence Suite Radar displays persisted official events when present and otherwise labels local analysis signals honestly.
- Radar event relevance matching filters changes against the selected product/category and relevant events enter ImportVerifier AI context.
- Shopify/Amazon/Etsy connector abstraction + safe HTTPS platform detection implemented; OAuth buttons remain unavailable until official credentials exist.
- PWA manifest, service worker and registration implemented; `/api` and `/auth` excluded from offline cache.
- Native roadmap fixed: Capacitor for iOS/iPadOS/Android; Tauri for Windows/macOS/Linux.
- Mobile/iPad dashboard hardened with safe-area support, minimum touch targets, narrow-layout evidence forms and horizontally scrollable results tables.
- Supabase production project confirmed: `hfuwwjdcyudflamwwnon`.
- Unlimited entitlement migration applied in production Supabase.
- DB historical starter=50 cap removed; technical fair-use ceiling supported.
- Stripe live product `ImportVerifier Unlimited` and recurring EUR 9.95/month price exist.
- Checkout backend accepts only Unlimited and verifies configured Stripe price, currency and periodicity before Checkout.
- Terms/privacy updated for Unlimited, fair use and dynamic AI subprocessors/transfers.
- Security headers strengthened globally; API/auth responses remain no-store.
- `AGENTS.md` now codifies autonomous continuation and human-blocker deferral as repository working standard.

## IN PROGRESS

- Verify CI for current HEAD after Dashboard/free-trial refactor; fix any regression immediately.
- Build official-source ingestion/normalization for the Radar event store; do not claim broad live coverage before ingestion is running.
- Continue mobile/iPad responsive and PWA release QA at code level.
- Continue security/privacy/release sweep for anything resolvable without user intervention.
- Refresh `WORK-HANDOFF-IMPORTVERIFIER.md` with the lifetime-free-trial implementation and latest release architecture.

## BLOCKED EXTERNAL / USER OR WORK BROWSER NEEDED

- **Netlify:** set `STRIPE_PRICE_STARTER=price_1UAJy5HJnO8odw1Mn4jMVjFt`; verify current production branch, all env vars, webhook configuration and deploy latest PR #4 branch.
- **Supabase Auth dashboard:** enable leaked-password protection.
- Configure suitable Supabase CAPTCHA/signup abuse protection.
- Configure `SILICONFLOW_API_KEY` in Netlify for free-first AI production path.
- Configure/retain `OPENAI_API_KEY` fallback if desired.
- Verify production SMTP/Resend sender and signup/reset delivery on a non-owner email.
- Verify Supabase + Google OAuth redirect allowlists for `https://importverifier.netlify.app`.
- Register official Shopify OAuth app/scopes.
- Register Amazon SP-API application/permissions.
- Register Etsy API app/OAuth.
- Add final legal identity/address/tax/jurisdiction/refund details before taking paid customers.

## NEXT — execute without asking the user

1. Keep current HEAD CI green; repair failures immediately.
2. Implement official-source Radar ingestion and safe normalization/deduplication.
3. Continue mobile/iPad/camera/file/PWA installability hardening.
4. Review auth/billing/API caching and security headers for regressions.
5. Add tests for new Radar/checkout/free-trial paths as they stabilize.
6. Refresh long Work handoff.
7. Once Work/Cloud Browser is available, finish Netlify + auth external wiring and run full production user journey.

## Continuous execution instruction

A recurring continuation task is scheduled **hourly with no fixed end date** while ImportVerifier remains unfinished. Hourly is the highest scheduling frequency supported. Every execution must re-read this file, the long handoff and latest PR HEAD; skip DONE work; work through as many actionable IN PROGRESS/NEXT items as reasonable; inspect CI; fix regressions; and leave human-only blockers to the end rather than stopping on them.

## Definition of finished

Do not call ImportVerifier finished until latest CI is green, canonical Netlify has the latest build, the **5-product lifetime free trial** and Unlimited billing pass end-to-end, webhook/portal/cancellation are verified, AI routing/fallback works in production, reports and evidence are traceable, auth/isolation/recovery/deletion pass, connectors are truly working or clearly unavailable, Impact Radar wording matches actual monitoring capability, and desktop/iPhone/iPad/PWA QA passes.
