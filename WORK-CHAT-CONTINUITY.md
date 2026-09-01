# ImportVerifier — Chat ↔ Work continuity protocol

## Canonical project
- Production target: `https://importverifier.netlify.app/`
- Repository: `manetalax/eu-product-radar`
- Historical PR `#4` was merged externally into `main` on 2026-09-01; **do not merge again**.
- Continued hardening branch: `feat/import-rules-verifier-branding`.
- Never create a replacement project or retarget this branch without explicit owner instruction.

## Read order
1. This file.
2. `WORK-HANDOFF-IMPORTVERIFIER.md`.
3. Exact branch HEAD + exact-HEAD GitHub Actions run.
4. `AGENTS.md`.

## Operating rule
Continue autonomously through actionable IN PROGRESS/NEXT work. Skip anything already DONE. If a task needs credentials, browser/payment console, physical device or other human-only action, mark it `BLOCKED EXTERNAL` and immediately continue elsewhere. Never expose secrets. Do not make speculative changes without evidence.

## Commercial invariants
- Exactly 5 free products total per account, lifetime/cumulative, no reset and no card.
- One paid entitlement: ImportVerifier Unlimited.
- EUR 9.95/month, EUR 89.95/year, EUR 149 Lifetime one-time; identical Unlimited feature set.
- Internal compatibility plan remains `starter`.
- Monthly/annual recurring; Lifetime persistent only after canonical paid Stripe Checkout.
- Canonical live Stripe prices:
  - Monthly `price_1UAJy5HJnO8odw1Mn4jMVjFt`
  - Annual `price_1UAjP0HJnO8odw1M7RBK8jsR`
  - Lifetime `price_1UAjP8HJnO8odw1MmSXdkNIh`
- Customer-facing AI name is ImportVerifier AI; production cost policy is fail-closed `AI_COST_POLICY=free_only`.

## DONE — do not repeat
- Atomic/idempotent five-product lifetime free quota and account-isolated histories/RLS.
- Monthly/annual/Lifetime Checkout, entitlement, Portal, webhook serialization, current-state Stripe sync, duplicate-subscription prevention, refund/dispute/Lifetime reversal hardening, request bounds and trusted Stripe navigation.
- Auth/OAuth purchase-intent continuity, email/Google auth flows and localized recovery surfaces.
- Universal CSV/XLS/XLSX/document/text/photo ingestion including HEIC/HEIF, upload limits and prompt-injection boundaries.
- EU deterministic regulatory engine, Evidence, Regulatory Twin and fail-closed Radar architecture; official URL sanitization across persistence/render/export/AI context.
- Premium localized PDF/XLSX, spreadsheet formula-injection protection and mobile download cleanup.
- PWA private-cache hardening, credentialless public shell/static assets, localized manifest/offline/shortcuts and iOS/mobile upload safeguards.
- Server-only Supabase privilege repair and advisor review; browser roles remain closed.
- Dashboard exposes all three Unlimited purchase choices and handles five-free → upgrade correctly.
- Checkout return no longer claims payment success before server confirmation.
- Account-deletion confirmation moves focus into the form and restores focus on cancel; mobile inputs are 16px with touch-sized controls.

## DONE — current hardening execution (2026-09-01)
- Reconfirmed pre-change branch HEAD `3748b0a7d47a0b535d04b49106ff79eb0953f281` and exact push release check **#1855 SUCCESS**.
- Audited `CheckoutReturnSync` as a genuinely new accessibility surface.
- Found that the initial “confirming Unlimited access” message relied only on a live region that is already populated on first render, which is not reliably announced by assistive technology.
- Fixed the confirmation state so the containing live region is atomic and the busy message itself has `role="status"`; failure remains `role="alert"`.
- Added `tests/checkout-return-announcement.test.ts` to lock the status/alert semantics.
- Functional commit: `9829b47ad3ea2a5cfc328b704eeffad1199d8379`.
- Test commit / current functional HEAD before this handoff update: `7b07a56b1c57aebc68528b9f8ca2a174ce981dfa`.
- Exact release check for `7b07a56…`: **#1861** was created by the branch push and was still `pending` at the last observation; do not call it green until GitHub reports `completed/success`.

## Production facts
- Supabase project `hfuwwjdcyudflamwwnon` is production.
- Lifetime entitlement migration is applied; production server-only privilege migrations are applied.
- Stripe live product has all three canonical prices and webhook coverage.
- Keep `REGULATORY_RADAR_LIVE=false` until official ingestion persists real events with a strong shared ingest secret.
- Supabase leaked-password protection remains disabled and requires an external Auth-setting path not exposed by the current connector.
- Production env templates intentionally omit secrets and sensitive legal identifiers.

## NEXT — execute without asking
1. Reconfirm the exact current branch HEAD after this documentation commit and its exact GitHub Actions release check. If a test/typecheck/build failure appears, diagnose and fix it before new feature work.
2. Continue genuinely new keyboard/focus review, prioritizing actions that programmatically switch Dashboard tabs and unmount the initiating control (for example “view results” / opening a history item) so keyboard focus does not fall back to the document body.
3. Continue new evidence-backed findings across security, mobile/iPad/PWA, billing, AI, Evidence, reports and Radar; prioritize correctness, revenue protection, privacy and customer friction over cosmetic churn.
4. Obtain browser performance evidence before any TTFB/LCP/TBT/CLS optimization.
5. Inspect PDF typography/overflow only against a real multi-product output.
6. Keep EU as the only active market and direct Shopify/Amazon/Etsy connectors inactive until legitimate credentials exist.

## BLOCKED EXTERNAL
- Final production env/promotion with privileged Supabase/Stripe secrets, truthful sensitive legal fields and free-only AI secret.
- Controlled live monthly/annual/Lifetime Checkout → webhook → entitlement → Portal/cancel/refund/dispute acceptance.
- Fresh non-owner SMTP signup/reset acceptance.
- Strong Radar ingest secret in runtime + scheduler and first official EUR-Lex persisted ingestion.
- Supabase leaked-password/CAPTCHA configuration requiring external provider/Auth-console capability.
- Physical iPhone/iPad/Safari/PWA QA.
- Official Shopify/Amazon/Etsy credentials/scopes.
- Detailed browser performance evidence and real multi-product PDF visual QA.

## Definition of finished
Do not call ImportVerifier fully launched until the exact current CI and canonical production are green; fresh-account five-free/sixth-rejection/history/PDF/XLSX passes; free-only AI is proven; all three paid lifecycles and reversals pass; legal/provider data is truthful; Radar claims match persisted official ingestion; Auth/SMTP controls pass; and desktop/iPhone/iPad/PWA QA passes.
