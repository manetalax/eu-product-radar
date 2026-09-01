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
Continue autonomously through actionable work. If one item is BLOCKED EXTERNAL, record it and continue elsewhere. Do not repeat DONE sweeps. Batch browser/credential/device acceptance for the end.

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
- Live-mode webhook gate, webhook idempotency/current-state subscription sync, refund/dispute lifecycle.
- Lifetime zero-charge protection: paid Checkout + PaymentIntent required; no promotion codes.
- Revoked same Lifetime payment cannot be resurrected by delayed Checkout/browser replay.
- Landing/FAQ/Schema.org monthly/annual/Lifetime in ES/EN/FR/DE/IT/PT and auth billing-option continuity.
- Retired audit runtime entitlement removal and legacy recurring-plan normalization.
- Universal CSV/XLS/XLSX/document/text/photo ingestion, HEIC/HEIF, prompt-injection and upload boundaries.
- EU deterministic regulatory engine, Evidence, Regulatory Twin and fail-closed Regulatory Impact Radar architecture.
- Official regulatory/evidence URL allowlists and persistence/render/export/AI-context sanitization.
- PWA private-cache hardening, localized start/offline/shortcuts and iOS/mobile upload/export safeguards.
- Premium localized PDF/XLSX with evidence traceability and spreadsheet formula-injection protection.
- Static localized landing, recovery surfaces, SEO, security headers and production release guard.
- Shopify/Amazon/Etsy architecture exists but direct integrations remain inactive pending official credentials.

## DONE — 2026-09-01 current execution
- Reconfirmed previous exact HEAD `53cbd208068d6c850a1972bec16c53aaf75d2dcc`: GitHub release check #1659 SUCCESS and correct `netlify/importverifier/deploy-preview` SUCCESS at `https://deploy-preview-4--importverifier.netlify.app`.
- Found and fixed a new Lifetime event-ordering flaw: because each user has one canonical entitlement row, a delayed *different* paid Checkout could overwrite the payment identity of a newer active Lifetime purchase. A later refund/dispute on that stale payment could then revoke valid access.
- `syncLifetimeCheckoutSession` now refuses to replace an already-active entitlement with a different Checkout/PaymentIntent. A revoked entitlement can still be replaced by a genuinely new paid Lifetime purchase, preserving legitimate repurchase after refund/dispute.
- Added regression coverage in `tests/lifetime-paid-entitlement.test.ts` locking the active-payment-identity ordering rule.
- Functional commit: `a4df1d32757a4346217215fc7a6163976755d280`.
- Regression-test commit / latest functional HEAD before this handoff: `14c8130c1c82a3eec14776de9560fd6bb24a7cd1`.
- GitHub release checks #1662/#1663 were running when this handoff was written. Reconfirm exact final HEAD CI and Netlify status before calling this execution verified.

## Production facts
- Supabase project `hfuwwjdcyudflamwwnon` was last established ACTIVE_HEALTHY.
- `unlimited_lifetime_entitlement` migration is applied; pre-sale entitlement baseline was 0 rows.
- Stripe live product has the three canonical prices above and the canonical webhook listens to Checkout/subscriptions/refunds/disputes.
- Radar remains non-live; keep `REGULATORY_RADAR_LIVE=false` until official ingestion persists events.
- Supabase leaked-password protection remains disabled externally.

## NEXT — execute without asking
1. Reconfirm exact HEAD after this handoff, release check and correct ImportVerifier Netlify Deploy Preview; fix any regression.
2. Continue only genuinely new billing/security reliability findings; do not repeat already-locked zero-charge/refund/dispute/replay sweeps.
3. Production acceptance when browser/payment conditions permit: monthly → webhook → Unlimited → Portal/cancel; annual equivalent; Lifetime paid → persistent Unlimited → controlled refund/dispute lifecycle.
4. Fresh-account acceptance: signup/login → five-product sample accepted → sixth rejected → isolated history → premium PDF/XLSX.
5. Obtain TTFB/LCP/TBT/CLS/resource evidence before performance changes.
6. Inspect PDF typography/overflow only against a real multi-product output.
7. Keep Radar disabled until the same strong ingest secret exists in runtime/scheduler and real official EUR-Lex ingestion persists events.
8. Review Supabase leaked-password protection/CAPTCHA when console capability is available.
9. Keep EU the only active market and direct marketplace connectors inactive until legitimate credentials exist.

## BLOCKED EXTERNAL
- Final production env/promotion with complete legal/provider, runtime and free-only AI secrets.
- Controlled real monthly/annual/Lifetime Checkout/Portal/cancel/refund/dispute transactions.
- Strong shared Radar ingest secret + first official EUR-Lex ingestion.
- Supabase Auth leaked-password/CAPTCHA controls.
- Fresh non-owner SMTP signup/reset acceptance.
- Physical iPhone/iPad/Safari/PWA QA.
- Official Shopify/Amazon/Etsy credentials/scopes.
- Detailed browser performance evidence and real multi-product PDF visual QA.

## Definition of finished
Do not call ImportVerifier fully launched until exact current CI and canonical production are green; release config passes; fresh-account five-free/sixth-rejection/history/PDF/XLSX passes; free-only AI is proven; all three paid lifecycles and reversals pass; legal/provider data is truthful; Radar claims match persisted official ingestion; Auth/SMTP controls pass; and desktop/iPhone/iPad/PWA QA passes.
