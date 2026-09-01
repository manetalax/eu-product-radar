# ImportVerifier — Chat ↔ Work continuity protocol

## Canonical project
- Production: `https://importverifier.netlify.app/`
- Repository: `manetalax/eu-product-radar`
- Historical PR: `#4` — merged externally into `main` on 2026-09-01 at 11:11:57Z; do not attempt another merge.
- Continued hardening branch: `feat/import-rules-verifier-branding`.
- Never create a replacement project. Do not merge or retarget work without explicit owner instruction.

## Read order
1. This file.
2. `WORK-HANDOFF-IMPORTVERIFIER.md`.
3. Exact branch HEAD + exact-HEAD GitHub CI + relevant deployment status.
4. `AGENTS.md`.

## Operating rule
Continue autonomously through actionable work. If one item is BLOCKED EXTERNAL, record it and continue elsewhere. Do not repeat DONE sweeps. Batch browser/credential/device acceptance for the end. Use connected tools before asking the owner for a credential or console action; reduce owner intervention to the irreducible external step.

`AGENTS.md` codifies a multidisciplinary senior review model covering product/strategy, UX/design, application engineering, architecture/platform, security/privacy, billing/revenue, AI/data, regulatory/evidence, QA/release, performance/reliability, growth/SEO/localization and operations/SRE. Apply relevant departments to each substantial change, but do not manufacture speculative work when a surface is already correct.

## Commercial invariants
- Exactly 5 free products total per account, lifetime/cumulative, no card/reset.
- One feature entitlement: ImportVerifier Unlimited.
- Monthly EUR 9.95, annual EUR 89.95, Lifetime EUR 149 one-time; identical Unlimited features.
- Internal compatibility plan ID remains `starter`.
- Monthly/annual are recurring. Lifetime is persistent and only comes from canonical paid Stripe Checkout.
- Full refund or active/lost dispute removes Lifetime access; won dispute restores only while the underlying charge remains collected.
- Historical `one_time_audits` never grant entitlement.
- Customer-facing AI brand is ImportVerifier AI; production cost policy is fail-closed `AI_COST_POLICY=free_only`.

## Canonical Stripe live prices
- Monthly: `price_1UAJy5HJnO8odw1Mn4jMVjFt`.
- Annual: `price_1UAjP0HJnO8odw1M7RBK8jsR`.
- Lifetime: `price_1UAjP8HJnO8odw1MmSXdkNIh`.

## DONE — do not repeat
- Five-product lifetime free quota, atomic/idempotent creation, isolated histories/RLS.
- Monthly/annual/Lifetime Checkout architecture and three live Stripe prices.
- Lifetime production migration with forced RLS/own-row read policy.
- Live-mode webhook gate, current-state subscription sync, webhook execution serialization, refund/dispute lifecycle and Lifetime replay/order hardening.
- Billing request 4 KiB boundary, safe parser errors, current-price recurring confirmation and recurring-only Portal semantics.
- Stripe customer ownership is persisted/authoritative; mutable metadata cannot attach an unknown customer.
- Auth/OAuth preserves allowlisted monthly/annual/Lifetime intent through same-site short-lived preference plus fresh metadata recovery.
- Checkout return uses bounded transient retries only.
- Landing/FAQ/Schema.org monthly/annual/Lifetime in ES/EN/FR/DE/IT/PT.
- Retired audit entitlement removal and legacy recurring-plan normalization.
- Universal CSV/XLS/XLSX/document/text/photo ingestion, HEIC/HEIF, prompt-injection/upload boundaries.
- EU deterministic regulatory engine, Evidence, Regulatory Twin and fail-closed Regulatory Impact Radar architecture.
- Official regulatory/evidence URL allowlists and persistence/render/export/AI-context sanitization.
- PWA private-cache hardening, credentialless public-shell caching, localized start/offline/shortcuts and iOS/mobile upload/export safeguards.
- Premium localized PDF/XLSX with evidence traceability and spreadsheet formula-injection protection.
- Static localized landing, recovery surfaces, SEO, security headers and production release guard.
- Shopify/Amazon/Etsy architecture exists but direct integrations remain inactive pending official credentials.
- Account deletion current-state Stripe cancellation and duplicate-subscription preflight.
- Production server-only Supabase RPC/table privilege repair; browser roles remain closed.
- Supabase advisors rechecked: only known leaked-password warning; internal RLS/no-policy INFO is intentional and unused-index INFO is not grounds for speculative deletion.
- Dashboard billing intent correctly carries monthly/annual/Lifetime through Checkout.
- Dashboard distinguishes Lifetime from recurring Unlimited and exposes all three canonical purchase choices responsively.
- Five-free → Unlimited upgrade surface synchronizes live when quota reaches zero and uses trusted Stripe navigation.

## DONE — 2026-09-01 post-merge hardening pass
- Detected that PR #4 had been merged externally despite the previous handoff saying open/unmerged. GitHub records merge commit `3cc3e1f43458d35ddcf1962eab29141c529e27f6` at 2026-09-01T11:11:57Z.
- Reconfirmed the continued hardening branch existed at prior HEAD `33c4e4bd55e278019a27e89f0bf9fc4525b79ad0`; release check #1836 for that HEAD was SUCCESS.
- Audited free-quota → three-option Checkout announcement/focus behavior.
- Fixed a demonstrated accessibility gap: when the fifth free product exhausts quota and the upgrade surface mounts dynamically, its explanatory copy now uses a polite atomic status announcement without programmatically stealing keyboard focus.
- Added regression coverage asserting the dynamic exhausted-quota announcement and absence of forced `.focus()` behavior.
- Detected CI regression caused by the external PR merge: with PR #4 closed and the branch previously removed from `push`, new hardening commits had no release check at all.
- Restored direct `push` validation for `feat/import-rules-verifier-branding` while preserving the existing pull-request validation, concurrency cancellation, immutable action pins and npm cache.

## Latest exact verification — 2026-09-01
- Last known green pre-change branch HEAD: **`33c4e4bd55e278019a27e89f0bf9fc4525b79ad0`**.
- Exact release check for that HEAD: **#1836 SUCCESS**.
- Accessibility fix commit: **`1a44c3616dad3103fe9d4eb970e37b91adc990e3`**.
- Accessibility regression-test commit: **`e9e22f02af4cd36b38672890750e172a6cd5db8f`**.
- CI trigger repair commit: **`5787626d58df0b9dbaaba2e379f5182e68dbde4b`**.
- At the first immediate query after `5787626d...`, no workflow run was yet returned. Reconfirm exact final HEAD and release-check result before any release decision.
- PR #4 is **merged/closed**, not open. Do not attempt another merge.

## Production facts
- Supabase project `hfuwwjdcyudflamwwnon` is production.
- Lifetime entitlement migration is applied; pre-sale baseline was 0 Lifetime rows.
- Production migrations `20260901090429` and `20260901090719` establish minimum server-only privileges required by current APIs.
- Stripe live product has all three canonical prices and canonical webhook coverage for Checkout/subscriptions/refunds/disputes.
- Radar remains non-live; keep `REGULATORY_RADAR_LIVE=false` until official ingestion persists events.
- Supabase leaked-password protection remains disabled. Current connected Supabase actions expose publishable keys/database operations but not the secret Auth configuration needed to enable this control.
- Production env template intentionally keeps privileged secrets and sensitive legal identifiers blank; never commit them.

## NEXT — execute without asking
1. Reconfirm exact final branch HEAD and exact GitHub release check after restoring branch push validation; repair any failing test/typecheck/build regression immediately.
2. Reconcile the long handoff header/release section with the externally merged PR #4 state when a safe complete-file update path is available; do not rewrite or truncate the detailed architecture content.
3. Continue genuinely new multidisciplinary review findings, prioritizing demonstrated security/revenue/correctness/user-friction issues over speculative architecture.
4. Continue keyboard/focus audit through Dashboard settings purchase controls and Checkout-return states; change only demonstrated issues.
5. Production acceptance when browser/payment conditions permit: monthly → webhook → Unlimited → Portal/cancel; annual equivalent; Lifetime paid → persistent Unlimited → controlled refund/dispute lifecycle.
6. Fresh-account acceptance: signup/login → five-product sample accepted → sixth rejected → isolated history → premium PDF/XLSX.
7. Obtain TTFB/LCP/TBT/CLS/resource evidence before performance changes.
8. Inspect PDF typography/overflow only against a real multi-product output.
9. Keep Radar disabled until same strong ingest secret exists runtime/scheduler and real official EUR-Lex ingestion persists events.
10. Keep EU the only active market and direct marketplace connectors inactive until legitimate credentials exist.

## BLOCKED EXTERNAL
- Final Netlify production env/promotion with privileged Supabase/Stripe secrets, truthful sensitive legal fields and free-only AI secret. Connected tools should be used to obtain/configure anything they legitimately expose before asking the owner.
- Controlled real monthly/annual/Lifetime Checkout/Portal/cancel/refund/dispute transactions.
- Strong shared Radar ingest secret in both runtime and scheduler + first official EUR-Lex ingestion.
- Supabase Auth leaked-password/CAPTCHA controls; current connector lacks Auth-setting writes and CAPTCHA requires a legitimate external provider credential.
- Fresh non-owner SMTP signup/reset acceptance.
- Physical iPhone/iPad/Safari/PWA QA.
- Official Shopify/Amazon/Etsy credentials/scopes.
- Detailed browser performance evidence and real multi-product PDF visual QA.

## Definition of finished
Do not call ImportVerifier fully launched until exact current CI and canonical production are green; release config passes; fresh-account five-free/sixth-rejection/history/PDF/XLSX passes; free-only AI is proven; all three paid lifecycles and reversals pass; legal/provider data is truthful; Radar claims match persisted official ingestion; Auth/SMTP controls pass; and desktop/iPhone/iPad/PWA QA passes.
