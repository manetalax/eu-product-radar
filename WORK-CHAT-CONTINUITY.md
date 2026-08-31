# ImportVerifier — Chat ↔ Work continuity protocol

## Canonical project
- Production target: https://importverifier.netlify.app/
- Repository: `manetalax/eu-product-radar`
- PR: `#4`
- Branch: `feat/import-rules-verifier-branding`
- Never create a replacement project and never merge PR #4 unless the owner explicitly asks.

## Read order
1. This file — current operational source of truth.
2. `WORK-HANDOFF-IMPORTVERIFIER.md` — detailed architecture and acceptance model.
3. Latest PR #4 HEAD + exact-HEAD GitHub CI + Netlify status.
4. `AGENTS.md` — autonomous execution standard.

## Owner operating instruction
Continue autonomously through every actionable task. Never stop because one task is BLOCKED EXTERNAL; record it and continue elsewhere. Batch browser/credential/device work for the end. Do not merge without explicit owner instruction.

## Commercial invariants
- Exactly **5 free products total per account**, no card and no monthly reset.
- After the free allowance: only **ImportVerifier Unlimited · €9.95/month**.
- `starter` is only the internal Stripe/database compatibility ID for Unlimited.
- End users see **ImportVerifier AI**, never provider/model names.
- Production AI cost policy is fail-closed `AI_COST_POLICY=free_only`.
- Paid checkout remains fail-closed until truthful legal-provider variables exist.

## DONE — release-critical product
- Lifetime free quota is enforced cumulatively in production by `free_account_usage` + `enforce_free_lifetime_product_quota`. Current production aggregate: zero accounts over five; maximum observed usage exactly five.
- Analysis creation is idempotent for retries/races; the public five-product sample is regression-tested.
- Stripe live canonical offer is `ImportVerifier Unlimited`, EUR 9.95/month, price `price_1UAJy5HJnO8odw1Mn4jMVjFt`; Checkout revalidates amount/currency/monthly recurrence and only accepts internal `starter`.
- Live Stripe webhook is enabled at `https://importverifier.netlify.app/api/billing/webhook` for Checkout completion and subscription create/update/delete events. Stripe and DB currently contain zero subscriptions, so no entitlement drift is observed before launch.
- Checkout/Portal navigation is final-boundary allowlisted to exact Stripe HTTPS surfaces; return confirmation is structurally validated and provider errors are not shown to customers.
- Dashboard, Latest Regulatory Assessment, Analysis Review Gate, Evidence, Intelligence Suite, Trial and Unlimited success payloads have runtime trust boundaries; malformed 2xx data fails closed.
- RLS/account isolation, evidence ownership, privileged-table deny-all posture and server-only privilege hardening are implemented.
- Evidence and official regulatory URLs are sanitized at persistence/API/render/export/AI-context boundaries.
- Production AI policy is `free_only`; CSV/XLS/XLSX stay local; supported text/doc/image paths use free-compatible extraction when configured; unsupported scanned/legacy paths fail honestly instead of leaking premium spend.
- External AI calls have bounded abort timeouts; unsafe provider URLs fail closed; provider/model details stay server-side.
- EU regulatory engine, Product Regulatory Twin, persisted Evidence and Regulatory Impact Radar architecture are implemented.
- Official EUR-Lex RSS adapter, normalization, deduplication and protected ingest/refresh endpoints exist. Production Radar event count remains **0**, therefore live Radar claims remain disabled.
- Radar scheduler is pinned to the canonical ImportVerifier refresh endpoint. The internal refresh route now requires a >=32-character secret, timing-safe Bearer comparison, JSON content type, an empty JSON object, a 1 KiB request limit and sanitized error responses.
- Shopify/Amazon/Etsy connector architecture exists; direct OAuth/API remains inactive until official credentials exist.
- Dashboard/auth/legal/intelligence/report surfaces are localized in ES/EN/FR/DE/IT/PT where customer-active.
- Google OAuth button has visible Google identity; code pins auth returns to canonical ImportVerifier and validates SDK-returned Supabase OAuth destinations. Latest observed Supabase Auth flow uses `https://importverifier.netlify.app` / canonical callback; earlier `euproductradar` entries are historical traffic.
- PWA private-cache hardening, language-keyed offline landing cache, own-brand icons, safe areas, touch targets and iOS form/modal behavior are covered.
- Universal uploads support spreadsheets/documents/photos including HEIC/HEIF; binary signatures are validated and spoofing fails closed.
- Dedicated mobile camera capture uses `capture="environment"` without breaking the broad picker; cancellation/multi-file ambiguity do not consume quota.
- PDF/XLSX/template browser downloads use delayed object-URL revocation for Safari/iPad save-to-Files robustness.
- Premium PDF includes PDF-native ImportVerifier identity, executive hierarchy, localized ImportVerifier `VERIFIED` review seal, evidence/source traceability and repeated issuer/EU-context footer. It does not claim government/EU certification.
- Landing conversion clearly states five lifetime free products/no card, one Unlimited plan at €9.95/month and truthful value proof without fabricated scarcity/social proof.

## DONE — current landing performance architecture
- Public landing is a server component rather than page-wide client React; navigation uses native anchors and language switching remains a tiny client island.
- Six landing variants `/es`, `/en`, `/fr`, `/de`, `/it`, `/pt` are statically generated.
- Root `app/layout.tsx` no longer calls `cookies()`/`headers()`/`serverLanguage()`, removing a Next.js dynamic-render opt-in from the public landing tree.
- Localized SEO metadata moved to `app/[lang]/layout.tsx`; localized titles are absolute so the root title template cannot duplicate the brand.
- `LanguageProvider` resolves a static locale pathname before query/storage/browser fallbacks; `LandingLanguagePicker` navigates directly between `/${lang}` routes rather than leaving localized content on a stale path with only `?lang=` changed.
- PWA registration waits for an idle window (with fallback timeout) after `load`; the redundant immediate `registration.update()` following `register()` was removed. Online/visibility updates remain safely caught.
- Service Worker public cache remains language-keyed and private/authenticated routes remain excluded.
- Netlify Lighthouse on exact landing architecture head `25a2e62d...` measured **Performance 16 / Accessibility 100 / Best Practices 92 / SEO 100**. This is essentially unchanged from 17 before the static-root/idle-PWA pass, proving the remaining performance bottleneck is not solved by further speculative React/landing architecture churn. Detailed Lighthouse audits are not exposed through available connectors; require metric-level evidence before another performance rewrite.

## Latest exact functional verification — 2026-08-31
- Current functional HEAD before this handoff commit: **`7df92122444e900e182958ace08b364fcb1c628f`**.
- GitHub `ImportVerifier release check` **#1281 SUCCESS** on exact `7df92122...` (`npm ci`, full tests, typecheck and build).
- GitHub/Netlify commit status confirms Deploy Preview **READY** on exact `7df92122...` at `https://deploy-preview-4--importverifier.netlify.app`.
- Latest Netlify Lighthouse result available for the same landing architecture (head `25a2e62d...`) is 16/100/92/100; commits after that measurement only harden Radar/tests and do not alter the landing.
- PR #4 is **open, mergeable and not merged**.
- This handoff update creates a newer docs-only HEAD; reconfirm exact CI/Netlify status for that newest docs HEAD before treating it as release head.

## Production service facts checked
- Supabase project: `hfuwwjdcyudflamwwnon`.
- Aggregate: `free_accounts_over_limit=0`, `max_free_products_used=5`, `subscriptions_count=0`, `radar_events_count=0`, `ai_usage_events_count=0`.
- Production function/trigger names are lifetime versions (`enforce_free_lifetime_product_quota`, `analyses_enforce_free_lifetime_product_quota`).
- Supabase security advisor reports one real Auth warning: **leaked-password protection disabled**. No-policy RLS advisories are intentional for server-only deny-all tables.
- Supabase performance advisor only reports currently-unused indexes; do not remove them merely from pre-launch usage statistics.
- Stripe live exposes one active canonical Unlimited product/price and one enabled canonical ImportVerifier webhook; no live subscriptions exist yet.

## NEXT — execute without asking
1. Reconfirm exact CI + correct `importverifier` Deploy Preview for the newest docs-only HEAD; repair any regression immediately.
2. For performance, obtain detailed Lighthouse/Web Vitals/audit evidence before changing landing architecture again; aggregate Performance=16 alone is insufficient to select a bottleneck.
3. Continue only genuinely new trust-boundary/security findings; do not repeat hardened Dashboard/Intelligence/Evidence/Latest/Review/Trial/Unlimited/Stripe/OAuth/source-URL/Radar-internal work.
4. Review PDF typography/overflow only against a real multi-product acceptance output; avoid speculative coordinate churn.
5. During real production acceptance, run `/importverifier-sample-5-products.csv` with a genuinely new account: canonical signup/login → five accepted → sixth rejected → isolated history → premium PDF → Excel → Checkout → webhook entitlement → Portal/cancel lifecycle.
6. Keep Radar live disabled until the same strong ingest secret is configured in production and official EUR-Lex ingestion persists real events.
7. Keep EU as the only active market and marketplace connectors inactive until legitimate credentials exist.

## BLOCKED EXTERNAL / requires service-console, secret or physical device
- Netlify has no available connector here. Confirm production branch/env precedence, live `STRIPE_WEBHOOK_SECRET`, canonical Stripe vars, truthful legal-provider vars, SiliconFlow/free-only AI vars and promote the intended release if production is not already exact HEAD.
- Configure the same strong `REGULATORY_INGEST_SECRET` wherever the production scheduler/runtime requires it, then run first real official ingestion before `REGULATORY_RADAR_LIVE=true`.
- Supabase Auth dashboard: enable leaked-password protection and appropriate CAPTCHA/signup-abuse controls; available connector exposes the warning but not the Auth-config write.
- Production SMTP/signup/reset acceptance with a genuinely new non-owner email requires a real mailbox/browser flow.
- Physical iPhone/iPad/Safari/PWA upload/photo/export/save-to-Files/rotation QA requires a real device/browser.
- Official Shopify/Amazon/Etsy applications, credentials and scopes are required before direct connectors can become active.
- Truthful legal-provider identity/address/tax/jurisdiction/refund values must be supplied before paid checkout can intentionally pass the production legal guard.

## Definition of finished
Do not call ImportVerifier fully launched until current exact CI is green; canonical Netlify production runs the intended release; a genuinely new user proves five-free-lifetime + sixth rejection + isolated history + PDF/XLSX; free-only AI is configured and works without premium leakage; legal/billing/webhook/Portal/cancellation pass; Radar claims match real ingestion; inactive markets/connectors remain honest; leaked-password/signup-abuse controls are enabled; and desktop/iPhone/iPad/PWA QA passes.
