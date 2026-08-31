# ImportVerifier — Chat ↔ Work continuity protocol

## Canonical project
- Production target: https://importverifier.netlify.app/
- Repository: `manetalax/eu-product-radar`
- PR: `#4`
- Branch: `feat/import-rules-verifier-branding`
- Never create a replacement project and never merge PR #4 unless the owner explicitly asks.

## Read order
1. This file — latest operational state and source of truth.
2. `WORK-HANDOFF-IMPORTVERIFIER.md` — detailed architecture.
3. Latest PR #4 HEAD + exact-HEAD CI/Deploy Preview.
4. `AGENTS.md` — autonomous execution standard.

## Owner operating instruction
Continue autonomously through every actionable task. Never stop because one task is BLOCKED EXTERNAL; record it and continue. Batch browser/credential/device work for the end. Do not merge without explicit owner instruction.

## Commercial invariants
- Exactly **5 free products total per account**, no card and no monthly reset.
- After the free allowance: only **ImportVerifier Unlimited · €9.95/month**.
- `starter` is only the internal Stripe/database compatibility ID for Unlimited.
- End users see **ImportVerifier AI**, never provider/model names.
- Production AI cost policy is fail-closed `AI_COST_POLICY=free_only`.
- Paid checkout remains fail-closed until truthful legal-provider variables exist.

## DONE — release-critical product
- Lifetime free quota is enforced cumulatively in production by `free_account_usage` + `enforce_free_lifetime_product_quota`. Current production aggregate check: zero accounts over five; maximum observed usage is exactly five.
- Analysis creation is idempotent for retries/races; five-product acceptance sample is regression-tested.
- Stripe live canonical offer is `ImportVerifier Unlimited`, EUR 9.95/month, price `price_1UAJy5HJnO8odw1Mn4jMVjFt`; Checkout revalidates amount/currency/monthly recurrence and only accepts internal `starter`.
- Live Stripe webhook endpoint is enabled at `https://importverifier.netlify.app/api/billing/webhook` for Checkout completion and subscription create/update/delete events.
- Stripe/DB currently both contain zero subscriptions, so there is no observed entitlement drift before launch.
- Checkout/Portal navigation is final-boundary allowlisted to exact Stripe HTTPS surfaces; return confirmation is structurally validated and provider errors are not shown to customers.
- Dashboard, Latest Regulatory Assessment, Analysis Review Gate, Evidence, Intelligence Suite, Trial and Unlimited success payloads have runtime trust boundaries; malformed 2xx data fails closed.
- RLS/account isolation, evidence ownership, privileged-table deny-all posture and server-only privilege hardening are implemented.
- Evidence and official regulatory URLs are sanitized at persistence/API/render/export/AI-context boundaries.
- Production AI policy is `free_only`; CSV/XLS/XLSX stay local; supported text/doc/image paths use free-compatible extraction when configured; unsupported scanned/legacy paths fail honestly instead of leaking premium spend.
- External AI calls have bounded abort timeouts; unsafe provider URLs fail closed; provider/model details stay server-side.
- EU regulatory engine, Product Regulatory Twin, persisted Evidence and Regulatory Impact Radar architecture are implemented.
- Official EUR-Lex RSS adapter, normalization, deduplication and protected ingest/refresh endpoints exist. Production Radar event count remains **0**, so live Radar claims remain disabled.
- Shopify/Amazon/Etsy connector architecture exists; direct OAuth/API remains inactive until official credentials exist.
- Dashboard/auth/legal/intelligence/report surfaces are localized in ES/EN/FR/DE/IT/PT where customer-active.
- Google OAuth button has visible Google identity; code pins auth returns to canonical ImportVerifier and validates SDK-returned Supabase OAuth destinations.
- Current Supabase Auth logs show successful Google OAuth/token/user traffic with referer `https://importverifier.netlify.app` and callback `https://importverifier.netlify.app/auth/callback`. Old `euproductradar.netlify.app` entries are historical earlier traffic, not the latest observed flow.
- PWA private-cache hardening, language-keyed offline landing cache, own-brand icons, safe areas, touch targets and iOS form/modal behavior are covered.
- Universal uploads support spreadsheets/documents/photos including HEIC/HEIF; binary signatures are validated and spoofing fails closed.
- Dedicated mobile camera capture uses `capture="environment"` without breaking the broad file picker; cancellation/multi-file ambiguity do not consume quota.
- PDF/XLSX/template browser downloads use delayed object-URL revocation for Safari/iPad save-to-Files robustness.
- Premium PDF includes PDF-native ImportVerifier identity, executive hierarchy, localized ImportVerifier `VERIFIED` review seal, evidence/source traceability and repeated issuer/EU-context footer. It does not claim government/EU certification.
- Landing conversion pass clearly states five lifetime free products/no card, one Unlimited plan at €9.95/month, truthful value proof and strong trial-exhaustion conversion without fabricated scarcity/social proof.
- Third-party commerce/payment marks are larger/responsive but copy does not imply unsupported PayPal/payment methods or partnerships.

## DONE — landing performance/PWA pass
- Public landing is server-rendered rather than page-wide client React.
- Language switching is a tiny client island; smooth-scroll JS was replaced by native anchors.
- Dashboard-only CSS is not loaded by the public shell; PWA registration is deferred outside critical load.
- Six landing variants `/es`, `/en`, `/fr`, `/de`, `/it`, `/pt` are statically generated; root selection happens before Supabase session work.
- Service Worker v6 stores public landing cache per language and no longer treats `/` as one language-neutral offline document.
- Exact preview Lighthouse after these changes is currently **Performance 17 / Accessibility 100 / Best Practices 92 / SEO 100**. The aggregate confirms performance is still poor, but the detailed Netlify Lighthouse breakdown is not exposed through available connectors; avoid speculative visual/architecture churn without metric-level evidence.

## Latest exact verification — 2026-08-31
- Functional HEAD before this handoff update: **`17e4b06eceb6a7e087542a52a746803af284ed2e`** (`test: lock language-keyed offline landing cache`).
- GitHub `ImportVerifier release check` **#1247 SUCCESS** on that exact head.
- Netlify bot confirms Deploy Preview READY for exact `17e4b06...` on the correct `importverifier` project: `https://deploy-preview-4--importverifier.netlify.app`.
- PR #4 is **open, mergeable, not merged**.
- This handoff update creates a newer docs-only HEAD; reconfirm its exact CI/preview before calling it release head.

## Production service facts checked in this continuation
- Supabase project: `hfuwwjdcyudflamwwnon`.
- Production aggregate: `free_accounts_over_limit=0`, `max_free_products_used=5`, `subscriptions_count=0`, `radar_events_count=0`, `ai_usage_events_count=0`.
- Production function/trigger names are the lifetime versions (`enforce_free_lifetime_product_quota`, `analyses_enforce_free_lifetime_product_quota`).
- Supabase security advisor has no new release-critical database vulnerability. It reports intentional no-policy RLS on server-only tables and one real Auth warning: **leaked-password protection disabled**.
- Supabase performance advisor only reports currently-unused indexes; with launch-scale data this is not evidence they should be removed.
- Stripe live account exposes one active canonical Unlimited product/price and one enabled canonical ImportVerifier webhook; no Stripe subscriptions exist yet.

## NEXT — execute without asking
1. Reconfirm exact CI + correct `importverifier` Deploy Preview for the newest docs-only HEAD; fix any regression immediately.
2. Do not make speculative Lighthouse changes until detailed metric/audit data can be obtained; current aggregate score is 17 and code-side high-confidence optimizations are already applied.
3. Continue only genuinely new trust-boundary/security findings; do not repeat hardened Dashboard/Intelligence/Evidence/Latest/Review/Trial/Unlimited/Stripe/OAuth/source-URL work.
4. During real production acceptance, run `/importverifier-sample-5-products.csv` with a genuinely new account: canonical signup/login → five accepted → sixth rejected → isolated history → premium PDF → Excel → Checkout → webhook entitlement → Portal/cancel lifecycle.
5. Keep Radar live disabled until a strong shared ingest secret exists and official EUR-Lex ingestion produces persisted events.
6. Keep EU as the only active market and marketplace connectors inactive until legitimate credentials exist.

## BLOCKED EXTERNAL / requires service-console, secret or physical device
- Netlify has no available connector in this chat. Confirm production branch is `feat/import-rules-verifier-branding`, production env precedence, live `STRIPE_WEBHOOK_SECRET`, canonical Stripe vars, truthful legal-provider vars, SiliconFlow/free-only AI vars, then promote the intended release if production is not already exact HEAD.
- Configure the same strong `REGULATORY_INGEST_SECRET` in Netlify and GitHub scheduler; ingest real official EUR-Lex events before `REGULATORY_RADAR_LIVE=true`.
- Supabase Auth dashboard: enable leaked-password protection and appropriate CAPTCHA/signup-abuse controls. The available Supabase connector exposes the warning but no Auth-config mutation endpoint.
- Production SMTP/signup/reset acceptance with a genuinely new non-owner email still needs a real mailbox/browser flow.
- Physical iPhone/iPad/Safari/PWA upload/photo/export/save-to-Files/rotation QA needs a real device/browser.
- Official Shopify/Amazon/Etsy applications, credentials and scopes are required before direct connectors can become active.
- Truthful legal-provider identity/address/tax/jurisdiction/refund values must be supplied before paid checkout can intentionally pass the production legal guard.

## Definition of finished
Do not call ImportVerifier fully launched until current exact CI is green; canonical Netlify production runs the intended release; a genuinely new user proves five-free-lifetime + sixth rejection + isolated history + PDF/XLSX; free-only AI is configured and works without premium leakage; legal/billing/webhook/Portal/cancellation pass; Radar claims match real ingestion; inactive markets/connectors remain honest; leaked-password/signup-abuse controls are enabled; and desktop/iPhone/iPad/PWA QA passes.
