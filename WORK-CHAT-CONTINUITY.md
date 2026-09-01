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
- Checkout return confirmation uses explicit atomic status semantics for assistive technology; failures remain alerts.
- Account-deletion confirmation moves focus into the form and restores focus on cancel; mobile inputs are 16px with touch-sized controls.
- Dashboard destructive view changes preserve keyboard focus by moving it to the updated workspace heading, while persistent side navigation keeps focus on the selected nav control.
- Cancelling the pre-analysis product-review dialog restores focus to its still-mounted opener; successful confirmation intentionally does not restore stale opener focus over the results destination.
- Auth email/Google async work exposes `aria-busy` and a persistent polite atomic status region; existing error alerts and success statuses remain unchanged and no forced focus is introduced.

## DONE — current hardening execution (2026-09-01)
- Reconfirmed pre-change branch HEAD `c2e20ad02cc24c4f2bc8542a32bcd788330dcdcb`; exact push release check **#1870 SUCCESS**.
- Continued the new asynchronous accessibility audit rather than repeating previously closed focus work.
- Found login/signup/password-reset and Google OAuth controls correctly disabled while `busy`, but the start of server/OAuth work was not exposed through a persistent live status region. Button-label changes alone are not a reliable announcement for assistive technology.
- `AuthForm` now marks the authentication card `aria-busy={busy}` and keeps an always-mounted screen-reader-only `role="status"` / `aria-live="polite"` / `aria-atomic="true"` region whose content changes to the localized processing copy while work is active. Errors remain assertive `role="alert"`; successful notices retain `role="status"`; keyboard focus is not moved.
- Functional auth accessibility commit: `f305cfbc3f3647e4fdd5e4cd626ff4748b0fd581`.
- Added `tests/auth-async-announcement.test.ts` to lock the busy semantics, persistent live-region shape and absence of forced `.focus()` in `AuthForm`.
- Test commit / functional HEAD before this handoff update: `6d2ae8c0bc449b6ac77af097597be37fbbc9db36`.
- Exact release check **#1872** for `6d2ae8c0bc449b6ac77af097597be37fbbc9db36` was created and was still `pending` at the last pre-handoff observation; do not call it green until GitHub completes it.
- New evidence-backed NEXT identified in `ReadinessEvidencePanel`: optimistic Evidence saves can overlap for the same row while its controls remain enabled, and saving feedback is visual-only. Harden same-row save serialization/disable semantics and provide a persistent polite live announcement without blocking edits to unrelated evidence rows.

## Production facts
- Supabase project `hfuwwjdcyudflamwwnon` is production.
- Lifetime entitlement migration is applied; production server-only privilege migrations are applied.
- Stripe live product has all three canonical prices and webhook coverage.
- Keep `REGULATORY_RADAR_LIVE=false` until official ingestion persists real events with a strong shared ingest secret.
- Supabase leaked-password protection remains disabled and requires an external Auth-setting path not exposed by the current connector.
- Production env templates intentionally omit secrets and sensitive legal identifiers.

## NEXT — execute without asking
1. Reconfirm the exact current branch HEAD after this documentation commit and its exact GitHub Actions release check. If tests/typecheck/build fail, diagnose and fix before new feature work.
2. Harden `ReadinessEvidencePanel` same-row async saves: prevent overlapping writes/late rollback for the same Evidence item while keeping unrelated rows usable, and announce save progress accessibly through persistent polite status semantics. Add regression coverage.
3. Continue genuinely new asynchronous accessibility review after Evidence: disabled controls, status/error announcements and focus behavior around other server work. Do not repeat Dashboard, Checkout-return, account-delete, ProductReview or AuthForm work now DONE.
4. Continue new evidence-backed findings across security, mobile/iPad/PWA, billing, AI, Evidence, reports and Radar; prioritize correctness, revenue protection, privacy and customer friction over cosmetic churn.
5. Obtain browser performance evidence before any TTFB/LCP/TBT/CLS optimization.
6. Inspect PDF typography/overflow only against a real multi-product output.
7. Keep EU as the only active market and direct Shopify/Amazon/Etsy connectors inactive until legitimate credentials exist.

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
