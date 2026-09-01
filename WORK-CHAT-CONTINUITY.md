# ImportVerifier — Chat ↔ Work continuity protocol

## Canonical project
- Production: `https://importverifier.netlify.app/`
- Repository: `manetalax/eu-product-radar`
- PR: `#4`
- Branch: `feat/import-rules-verifier-branding`
- Never create a replacement project. Never merge PR #4 without explicit owner instruction.

## Read order
1. This file.
2. `WORK-HANDOFF-IMPORTVERIFIER.md`.
3. Exact PR #4 HEAD + exact-HEAD GitHub CI + `netlify/importverifier/deploy-preview`.
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

## DONE — 2026-09-01 current pass
- Reconfirmed PR #4 open, mergeable, unmerged.
- Repaired obsolete Dashboard billing-intent regression; persisted purchase intent passes `intent.billingOption`, `startCheckout` accepts `UnlimitedBillingOption`, and the request sends `billingOption: option`.
- Dashboard settings distinguish Lifetime from recurring Unlimited: Lifetime has no misleading subscription-management action; monthly/annual retain Portal management.
- Free Dashboard users see all three canonical acquisition choices and explicit billing cadence; selected choice is sent to Checkout.
- Responsive Dashboard billing presentation: 3 choices desktop, 2+1 tablet, 1 mobile; annual visually emphasized without changing entitlement semantics.
- Added multidisciplinary operating standard and minimize-owner-intervention rule to `AGENTS.md`.
- CI efficiency review found the active PR branch was triggering two identical full release checks for every commit (`push` + `pull_request`). Removed the active branch from the push trigger while retaining PR validation, concurrency cancellation, immutable action pins and npm dependency caching. This cuts redundant CI work without weakening PR release validation.
- Fixed a conversion-state defect in the five-free → Unlimited transition: `FreeTrialUpgradePrompt` previously read quota only at mount, so consuming the fifth free product in-session could leave the purchase prompt hidden until reload. It now synchronizes with the live Dashboard quota reaching 100% and announces secure-checkout progress with an ARIA live status.
- Added `tests/free-trial-upgrade-live-quota.test.ts` to lock the mounted upgrade surface, live exhausted-quota synchronization, trusted Stripe navigation and accessible progress status.

## Latest exact verification — 2026-09-01
- Latest fully green functional/test HEAD before this handoff update: **`b562892f9edc997cec0bbd621dc6a5960fa99f0c`** (`test: lock live free-quota upgrade prompt`).
- Exact PR-triggered release check #1835: **SUCCESS** (`npm ci`, `npm test`, `npm run typecheck`, `npm run build` all green).
- Exact `netlify/importverifier/deploy-preview`: **SUCCESS**, target `https://deploy-preview-4--importverifier.netlify.app`.
- CI-efficiency functional commit remains **`27f5bd88d9c7c769d9c068265da8f2b5c3e447e3`** (`ci: avoid duplicate release checks on PR branch`).
- This handoff update creates a newer docs-only HEAD; reconfirm exact PR HEAD/CI/Netlify before further writes or release decisions.
- PR #4 remains open/unmerged. Never merge without explicit owner instruction.

## Production facts
- Supabase project `hfuwwjdcyudflamwwnon` is production.
- Lifetime entitlement migration is applied; pre-sale baseline was 0 Lifetime rows.
- Production migrations `20260901090429` and `20260901090719` establish minimum server-only privileges required by current APIs.
- Stripe live product has all three canonical prices and canonical webhook coverage for Checkout/subscriptions/refunds/disputes.
- Radar remains non-live; keep `REGULATORY_RADAR_LIVE=false` until official ingestion persists events.
- Supabase leaked-password protection remains disabled. Current connected Supabase actions expose publishable keys/database operations but not the secret Auth configuration needed to enable this control.
- Production env template intentionally keeps privileged secrets and sensitive legal identifiers blank; never commit them.

## NEXT — execute without asking
1. Reconfirm exact final HEAD after this handoff commit, exact PR-triggered GitHub release check and correct `netlify/importverifier/deploy-preview`; repair any regression immediately.
2. Continue genuinely new multidisciplinary review findings, prioritizing demonstrated security/revenue/correctness/user-friction issues over speculative architecture.
3. Audit keyboard/focus behavior and announcement semantics across the full free-quota → three-option Checkout path; change only demonstrated issues.
4. Production acceptance when browser/payment conditions permit: monthly → webhook → Unlimited → Portal/cancel; annual equivalent; Lifetime paid → persistent Unlimited → controlled refund/dispute lifecycle.
5. Fresh-account acceptance: signup/login → five-product sample accepted → sixth rejected → isolated history → premium PDF/XLSX.
6. Obtain TTFB/LCP/TBT/CLS/resource evidence before performance changes.
7. Inspect PDF typography/overflow only against a real multi-product output.
8. Keep Radar disabled until same strong ingest secret exists runtime/scheduler and real official EUR-Lex ingestion persists events.
9. Keep EU the only active market and direct marketplace connectors inactive until legitimate credentials exist.

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
