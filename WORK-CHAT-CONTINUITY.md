# ImportVerifier — Chat ↔ Work continuity protocol

## Canonical project
- Production: `https://importverifier.netlify.app/`
- Repository: `manetalax/eu-product-radar`
- Canonical branch after merge: `main`
- PR #4 was merged on 2026-09-01 at 11:11:57Z.
- Merge commit: `3cc3e1f43458d35ddcf1962eab29141c529e27f6`.
- Historical feature branch `feat/import-rules-verifier-branding` remains at `33c4e4bd55e278019a27e89f0bf9fc4525b79ad0`; do not treat it as the production source of truth.
- Never create a replacement project.

## Read order
1. This file.
2. `WORK-HANDOFF-IMPORTVERIFIER.md`.
3. Exact `main` HEAD + production deploy evidence.
4. `AGENTS.md`.

## Operating rule
Continue autonomously through actionable work. If one item is BLOCKED EXTERNAL, record it and continue elsewhere. Do not repeat DONE sweeps. Use connected tools before asking the owner for a credential or console action; reduce owner intervention to the irreducible external step. After PR #4 merge, new development must be based on current `main` rather than accumulating unreleased work on the historical feature branch.

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
- Stripe customer ownership persisted/authoritative; mutable metadata cannot attach an unknown customer.
- Auth/OAuth preserves allowlisted monthly/annual/Lifetime intent through same-site short-lived preference plus fresh metadata recovery.
- Checkout return uses bounded transient retries only.
- Universal CSV/XLS/XLSX/document/text/photo ingestion, HEIC/HEIF, prompt-injection/upload boundaries.
- EU deterministic regulatory engine, Evidence, Regulatory Twin and fail-closed Regulatory Impact Radar architecture.
- Official regulatory/evidence URL allowlists and persistence/render/export/AI-context sanitization.
- PWA private-cache hardening, localized start/offline/shortcuts and iOS/mobile upload/export safeguards.
- Premium localized PDF/XLSX with evidence traceability and spreadsheet formula-injection protection.
- Static localized landing, recovery surfaces, SEO, security headers and production release guard.
- Shopify/Amazon/Etsy architecture exists but direct integrations remain inactive pending official credentials.
- Account deletion current-state Stripe cancellation and duplicate-subscription preflight.
- Production server-only Supabase RPC/table privilege repair; browser roles remain closed.
- Dashboard exposes monthly/annual/Lifetime correctly, distinguishes Lifetime from recurring Portal semantics, and is responsive desktop/tablet/mobile.
- Five-free → Unlimited transition updates live at quota exhaustion without reload; regression coverage exists.
- CI duplicate push/PR release checks on the historical feature branch were removed while preserving PR validation.
- PR #4 exact pre-merge HEAD `33c4e4bd55e278019a27e89f0bf9fc4525b79ad0` passed release check #1836 and Netlify Deploy Preview.
- PR #4 merged successfully into `main` as `3cc3e1f43458d35ddcf1962eab29141c529e27f6`.

## Latest exact verification — 2026-09-01
- `main` HEAD before this documentation correction: `3cc3e1f43458d35ddcf1962eab29141c529e27f6`.
- Historical feature branch HEAD: `33c4e4bd55e278019a27e89f0bf9fc4525b79ad0`.
- Historical branch release check #1836: SUCCESS.
- Historical branch `netlify/importverifier/deploy-preview`: SUCCESS.
- GitHub currently exposes no commit status on merge commit `3cc3e1f...`; this is not proof of deployment failure because release CI was intentionally PR-only and production Netlify status must be verified separately.
- Direct production HTTP verification is currently unavailable from the connected runtime, so canonical production deployment remains the immediate acceptance target.

## Production facts
- Supabase project `hfuwwjdcyudflamwwnon` is production.
- Lifetime entitlement migration is applied.
- Production migrations `20260901090429` and `20260901090719` establish minimum server-only privileges required by current APIs.
- Stripe live product has all three canonical prices and canonical webhook coverage for Checkout/subscriptions/refunds/disputes.
- Radar remains non-live; keep `REGULATORY_RADAR_LIVE=false` until official ingestion persists events.
- Supabase leaked-password protection remains disabled; connected tools do not expose the required Auth configuration write.
- Production env template intentionally keeps privileged secrets and sensitive legal identifiers blank; never commit them.

## NEXT — execute without asking
1. Reconfirm the new exact `main` HEAD after this handoff correction and verify production Netlify is actually serving that commit.
2. If production is green, run fresh-account acceptance: signup/login → five products accepted → sixth rejected → isolated history → premium PDF/XLSX.
3. Run controlled billing acceptance when live browser/payment conditions permit: monthly → webhook → Unlimited → Portal/cancel; annual equivalent; Lifetime paid → persistent Unlimited → controlled refund/dispute lifecycle.
4. Continue genuinely new multidisciplinary findings only; prioritize demonstrated security/revenue/correctness/user-friction defects over speculative architecture.
5. Obtain TTFB/LCP/TBT/CLS/resource evidence before performance changes.
6. Inspect PDF typography/overflow only against a real multi-product output.
7. Keep Radar disabled until the same strong ingest secret exists runtime/scheduler and real official EUR-Lex ingestion persists events.
8. Keep EU the only active market and direct marketplace connectors inactive until legitimate credentials exist.

## BLOCKED EXTERNAL
- Final Netlify production deploy/env verification with privileged Supabase/Stripe secrets, truthful legal fields and free-only AI secret.
- Controlled real monthly/annual/Lifetime Checkout/Portal/cancel/refund/dispute transactions.
- Strong shared Radar ingest secret in runtime/scheduler + first official EUR-Lex ingestion.
- Supabase Auth leaked-password/CAPTCHA controls; CAPTCHA requires a legitimate external provider credential.
- Fresh non-owner SMTP signup/reset acceptance.
- Physical iPhone/iPad/Safari/PWA QA.
- Official Shopify/Amazon/Etsy credentials/scopes.
- Detailed browser performance evidence and real multi-product PDF visual QA.

## Definition of finished
Do not call ImportVerifier fully launched until exact current CI and canonical production are green; release config passes; fresh-account five-free/sixth-rejection/history/PDF/XLSX passes; free-only AI is proven; all three paid lifecycles and reversals pass; legal/provider data is truthful; Radar claims match persisted official ingestion; Auth/SMTP controls pass; and desktop/iPhone/iPad/PWA QA passes.
