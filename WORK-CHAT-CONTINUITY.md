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

Chat and Work must read all three before substantial changes. After each meaningful pass, update this file and the long handoff when architecture/decisions change.

## Commercial invariant — do not change without explicit owner instruction

- Every new account gets a **free trial of exactly 5 product analyses**.
- No card is required for those 5 free products.
- After the free allowance is exhausted, the only public paid offer is **ImportVerifier Unlimited · €9.95/month**.
- The free 5-product acquisition hook must remain visible and must not be removed while cleaning legacy plan/audit code.
- Internal fair-use/technical ceilings must never be presented as a commercial product quota to Unlimited customers.

## DONE

- ImportVerifier / Import Rules Verifier brand foundation.
- Free entry: **exactly 5 product analyses per account**.
- Public commercial offer: **Unlimited · €9.95/month** only.
- Internal `starter` ID retained as Unlimited for backwards-compatible Stripe/database handling; legacy plan IDs remain internal only.
- Public landing rebuilt around Unlimited, ImportVerifier AI, Product Regulatory Twin, Regulatory Impact Radar and Connect.
- PDF/Excel/regulatory report branding centralized and strengthened.
- Universal product input foundation for spreadsheets, text/documents and images.
- Versioned EU regulatory engine with category candidates, obligations, uncertainty flags and official sources.
- Authenticated ImportVerifier AI endpoint with free-first provider router + premium fallback architecture.
- AI provider identities hidden from end-user UI.
- Regulatory Twin foundation implemented and readiness linked to persisted `analysis_evidence` instead of assuming all evidence is missing.
- Evidence traceability implemented: document, page/section, note and HTTPS source URL can be persisted for each requirement; production Supabase schema migrated and verified.
- PDF export includes saved evidence traceability per product.
- Excel export includes a dedicated `Evidencia` sheet with product, requirement, state, document, page/section, note and URL.
- Regulatory Impact Radar persistent event store created and applied to production Supabase.
- Authenticated `/api/regulatory-changes` endpoint reads active server-managed Radar events.
- Intelligence Suite Radar now displays persisted official events when present and otherwise labels local analysis signals honestly.
- Shopify/Amazon/Etsy connector abstraction + safe HTTPS platform detection implemented; OAuth buttons remain unavailable until official credentials exist.
- PWA manifest, service worker and registration implemented; `/api` and `/auth` excluded from offline cache.
- Native roadmap fixed: Capacitor for iOS/iPadOS/Android; Tauri for Windows/macOS/Linux.
- Mobile/iPad dashboard hardened with safe-area support, minimum touch targets, narrow-layout evidence forms and horizontally scrollable results tables.
- Supabase production project confirmed: `hfuwwjdcyudflamwwnon`.
- Unlimited entitlement migration applied in production Supabase.
- DB historical starter=50 cap removed; technical fair-use ceiling supported.
- Supabase advisors run; server-only `stripe_webhook_events` RLS/no-policy result is intentional.
- Stripe live account connected: **EU Radar** (`acct_1U8gkeHJnO8odw1M`).
- Stripe live product: `ImportVerifier Unlimited` (`prod_VAfIBj5MLhAJKr`).
- Stripe live recurring price: **€9.95/month** (`price_1UAJy5HJnO8odw1Mn4jMVjFt`).
- Stripe metadata maps Unlimited to internal `starter`.
- Checkout backend accepts only Unlimited and verifies that the configured Stripe Price is active, EUR 9.95 and recurring monthly before Checkout.
- Terms updated to Unlimited/fair-use model; privacy updated for dynamic AI subprocessors/transfers.
- `UnlimitedExperience` hides legacy audit purchase UI and every artificial fair-use/quota number from paid Unlimited users.
- Security headers strengthened globally: no-sniff, frame denial, strict referrer policy and restrictive permissions policy; API/auth responses remain no-store.
- Multiple prior release checks are green, including CI run #92; current HEAD must still be verified after each new commit.

## IN PROGRESS

- Verify CI for current HEAD after Radar + evidence export changes; fix any regression immediately.
- Continue semantic cleanup of legacy audit/finite-quota code in `components/Dashboard.tsx` while preserving the 5-product free trial.
- Build official-source ingestion/normalization for the Radar event store; do not claim broad live coverage before ingestion is running.
- Continue mobile/iPad responsive and PWA release QA at code level.
- Continue security/privacy/release sweep for anything resolvable without user intervention.

## BLOCKED EXTERNAL / USER OR WORK BROWSER NEEDED

- **Netlify:** set `STRIPE_PRICE_STARTER=price_1UAJy5HJnO8odw1Mn4jMVjFt`; verify current production branch, all env vars, webhook configuration and deploy latest PR #4 branch.
- **Supabase Auth dashboard:** enable leaked-password protection (advisor still warns it is disabled).
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
2. Remove remaining user-visible legacy plan/audit semantics, never removing or weakening the free 5-product trial.
3. Implement official-source Radar ingestion and safe change normalization/deduplication.
4. Add matching of Radar events to affected Regulatory Twins/products.
5. Continue mobile/iPad/camera/file/PWA installability hardening.
6. Review auth/billing/API caching and security headers for regressions.
7. Add tests for new Radar/evidence paths as they stabilize.
8. Update both handoffs after every meaningful pass.
9. Once Work/Cloud Browser is available, finish Netlify + auth external wiring and run full production user journey.

## Continuous execution instruction

A recurring continuation task is scheduled **hourly with no fixed end date** while ImportVerifier remains unfinished. Hourly is the highest scheduling frequency supported. Every execution must re-read this file, the long handoff and latest PR HEAD; skip DONE work; work through as many actionable IN PROGRESS/NEXT items as reasonable; inspect CI; fix regressions; and leave human-only blockers to the end rather than stopping on them.

## Definition of finished

Do not call ImportVerifier finished until latest CI is green, canonical Netlify has the latest build, the **5-product free trial** and Unlimited billing pass end-to-end, webhook/portal/cancellation are verified, AI routing/fallback works in production, reports and evidence are traceable, auth/isolation/recovery/deletion pass, connectors are truly working or clearly unavailable, Impact Radar wording matches actual monitoring capability, and desktop/iPhone/iPad/PWA QA passes.
