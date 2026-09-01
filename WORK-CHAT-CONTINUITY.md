# ImportVerifier — Chat ↔ Work continuity protocol

## Canonical project
- Production: `https://importverifier.netlify.app/`
- Repository: `manetalax/eu-product-radar`
- Canonical production branch after merge: `main`.
- PR #4 was merged on 2026-09-01 at 11:11:57Z.
- Merge commit: `3cc3e1f43458d35ddcf1962eab29141c529e27f6`.
- Current `main` HEAD observed 2026-09-01: `cc91fd3fb5664565aaf3db8dcd1e3fea0f4fbe69` (`chore: trigger ImportVerifier production deploy`).
- Historical feature branch `feat/import-rules-verifier-branding` remains at `33c4e4bd55e278019a27e89f0bf9fc4525b79ad0`; do not treat it as the production source of truth.
- Post-merge hardening branch: `chore/post-merge-launch-hardening`, created from `cc91fd3f...`; do not merge automatically.
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
- CI duplicate push/PR release checks on feature branches were removed while preserving PR validation.
- PR #4 exact pre-merge HEAD `33c4e4bd55e278019a27e89f0bf9fc4525b79ad0` passed release check #1836 and Netlify Deploy Preview.
- PR #4 merged successfully into `main` as `3cc3e1f43458d35ddcf1962eab29141c529e27f6`.
- Supabase Security Advisor rechecked 2026-09-01: no new client-table access vulnerability; only four intentional INFO `rls_enabled_no_policy` notices on internal server-only tables plus the existing WARN for leaked-password protection.

## IN PROGRESS — post-merge release hardening
- Demonstrated release-safety gap found: production-bound direct commits on `main` had no GitHub release check because CI push validation still targeted a legacy release-prep branch. This matters now that Netlify production follows `main`.
- Fix prepared on `chore/post-merge-launch-hardening`: `.github/workflows/release-check.yml` validates `pull_request` plus `push` to `main`, while still avoiding duplicate push checks on feature branches. Fix commit: `5581a79566a769828015c4b8ae1cc8cdc8fa3ac8`.
- This branch must be validated by PR CI before any merge; do not merge automatically.

## Latest exact verification — 2026-09-01
- `main` HEAD: `cc91fd3fb5664565aaf3db8dcd1e3fea0f4fbe69`.
- `main` commit message: `chore: trigger ImportVerifier production deploy`.
- GitHub commit status for `cc91fd3f...`: no statuses attached (`total_count: 0`); this is the release-safety gap being fixed, not evidence of a failed deployment.
- Public production HTTP verification remains unavailable from the connected runtime; canonical Netlify production deployment is still an acceptance target.
- Historical feature branch release check #1836: SUCCESS.
- Historical feature branch Netlify Deploy Preview: SUCCESS.

## Production facts
- Supabase project `hfuwwjdcyudflamwwnon` is production.
- Lifetime entitlement migration is applied.
- Production migrations `20260901090429` and `20260901090719` establish minimum server-only privileges required by current APIs.
- Stripe live product has all three canonical prices and canonical webhook coverage for Checkout/subscriptions/refunds/disputes.
- Radar remains non-live; keep `REGULATORY_RADAR_LIVE=false` until official ingestion persists events.
- Supabase leaked-password protection remains disabled; connected tools do not expose the required Auth configuration write.
- Production env template intentionally keeps privileged secrets and sensitive legal identifiers blank; never commit them.

## NEXT — execute without asking
1. Open a draft PR from `chore/post-merge-launch-hardening` to `main` so the release check validates the CI-target correction; do not merge automatically.
2. Inspect the exact PR CI result and correct any regression.
3. Reconfirm exact `main` HEAD and verify Netlify production is actually serving the intended production commit when authenticated/public evidence becomes available.
4. If production is green, run fresh-account acceptance: signup/login → five products accepted → sixth rejected → isolated history → premium PDF/XLSX.
5. Run controlled billing acceptance when live browser/payment conditions permit: monthly → webhook → Unlimited → Portal/cancel; annual equivalent; Lifetime paid → persistent Unlimited → controlled refund/dispute lifecycle.
6. Obtain TTFB/LCP/TBT/CLS/resource evidence before performance changes.
7. Inspect PDF typography/overflow only against a real multi-product output.
8. Keep Radar disabled until the same strong ingest secret exists runtime/scheduler and real official EUR-Lex ingestion persists events.
9. Keep EU the only active market and direct marketplace connectors inactive until legitimate credentials exist.

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



## Sites deployment — 2026-09-01
- Existing Sites project reused: title `ImportVerifier`, slug `importverifier`, project `appgprj_6a96cd06b2a081919da932e4c77f6fd8`.
- Access changed with explicit owner approval from custom owner-only to `public` at 2026-09-01T13:26:03Z.
- Latest saved Sites version is version 2, source commit `8fe3924704ed3915ebea237b63302213d802e829`; this is the Sites artifact prepared immediately after the Netlify PR #6 work. Sites has no version 6; Netlify Deploy Preview 6 is a separate deployment identifier.
- Public production deployment started with deployment `appgdep_6a96d27ee6648191bd645a3abcc707c2` at 2026-09-01T13:26:23Z. Latest observed status at 2026-09-01T13:29:26Z: `building`; no URL returned yet.
- Sites runtime environment revision is 0 with no entries. No secrets were added, exposed or committed. Safe public variables and privileged runtime credentials still require secure configuration after a stable Sites URL exists.
- Current GitHub hardening PR #6 remains open/draft, branch `chore/post-merge-launch-hardening`, latest documented HEAD before this update `59a45e9fa324f848eec6feac31a2949474e75659`; its Netlify Deploy Preview status is SUCCESS at `https://deploy-preview-6--importverifier.netlify.app`.
- Canonical `main` remains `cc91fd3fb5664565aaf3db8dcd1e3fea0f4fbe69`; no merge was performed.
- Next: poll the public Sites deployment until terminal; if successful, record the production URL, configure only safe public values plus securely supplied secrets, and run the final Sites acceptance journey. If it remains stuck or fails, do not claim publication and continue from the exact deployment status.
