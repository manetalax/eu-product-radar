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
- Lifetime free quota is enforced cumulatively in production by `free_account_usage` + `enforce_free_lifetime_product_quota`. Production aggregate: zero accounts over five; maximum observed usage exactly five.
- Analysis creation is idempotent for retries/races; the public five-product sample is regression-tested.
- Stripe live canonical offer is `ImportVerifier Unlimited`, EUR 9.95/month, price `price_1UAJy5HJnO8odw1Mn4jMVjFt`; Checkout revalidates amount/currency/monthly recurrence and only accepts internal `starter`.
- Live Stripe webhook is enabled at `https://importverifier.netlify.app/api/billing/webhook` for Checkout completion and subscription create/update/delete events. Stripe and DB currently contain zero subscriptions, so no entitlement drift is observed before launch.
- Production Stripe runtime only accepts `sk_live_`; test keys remain available outside production. In production, Checkout and webhook entitlement mapping pin `starter` to the canonical live Unlimited price, so a drifted `STRIPE_PRICE_STARTER` cannot grant entitlement.
- Checkout/Portal navigation is final-boundary allowlisted to exact Stripe HTTPS surfaces; return confirmation is structurally validated and provider errors are not shown to customers.
- Dashboard, Latest Regulatory Assessment, Analysis Review Gate, Evidence, Intelligence Suite, Trial and Unlimited success payloads have runtime trust boundaries; malformed 2xx data fails closed.
- RLS/account isolation, evidence ownership, privileged-table deny-all posture and server-only privilege hardening are implemented.
- Production Supabase runtime accepts only the exact canonical project root `https://hfuwwjdcyudflamwwnon.supabase.co`; credentials, paths, query/hash, wrong/lookalike hosts and noncanonical production origins fail closed. Local HTTP is allowed only for explicit localhost development.
- Production release validation now also requires a Supabase `sb_publishable_` public key and `sb_secret_` privileged key, matching runtime expectations.
- Evidence and official regulatory URLs are sanitized at persistence/API/render/export/AI-context boundaries.
- Production AI policy is `free_only`; CSV/XLS/XLSX stay local; supported text/doc/image paths use free-compatible extraction when configured; unsupported scanned/legacy paths fail honestly instead of leaking premium spend.
- SiliconFlow credential destination is pinned to exact official `https://api.siliconflow.com/v1`; unsafe scheme, credentials, wrong/lookalike host, nonstandard port, wrong path, query and fragment fail closed before an API key can be sent.
- External AI calls have bounded abort timeouts; provider/model details stay server-side.
- EU regulatory engine, Product Regulatory Twin, persisted Evidence and Regulatory Impact Radar architecture are implemented.
- Official EUR-Lex RSS adapter, normalization, deduplication and protected ingest/refresh endpoints exist. Production Radar event count remains **0**, therefore live Radar claims remain disabled.
- Radar publication now uses one centralized fail-closed runtime gate: live flag + strong shared ingest secret + persisted events. Pre-live persisted events are never returned to customers or inserted into ImportVerifier AI context. When Radar is disabled, customer retrieval and the AI assistant also skip Radar storage reads, so an inactive subsystem cannot add avoidable latency or make AI fail.
- Radar schedulers are pinned to canonical `https://importverifier.netlify.app/api/internal/regulatory-refresh`; neither can redirect the Bearer secret through mutable site configuration. Both send `{}` JSON. Internal refresh authenticates first, requires `application/json`, accepts only an empty JSON object, caps body at 1 KiB, preserves 413/415 semantics and redacts internal errors.
- Shopify/Amazon/Etsy connector architecture exists; direct OAuth/API remains inactive until official credentials exist.
- Dashboard/auth/legal/intelligence/report surfaces are localized in ES/EN/FR/DE/IT/PT where customer-active.
- Google OAuth button has visible Google identity; code pins auth returns to canonical ImportVerifier and validates SDK-returned Supabase OAuth destinations. Latest observed Supabase Auth flow uses `https://importverifier.netlify.app` / canonical callback; earlier `euproductradar` entries are historical traffic.
- PWA private-cache hardening, language-keyed offline landing cache, own-brand icons, safe areas, touch targets and iOS form/modal behavior are covered. Installed PWA start URLs now launch directly on the selected static locale route (`/es`, `/en`, `/fr`, `/de`, `/it`, `/pt`) instead of routing through `/?lang=...`.
- Universal uploads support spreadsheets/documents/photos including HEIC/HEIF; binary signatures are validated and spoofing fails closed.
- Dedicated mobile camera capture uses `capture="environment"` without breaking the broad picker; cancellation/multi-file ambiguity do not consume quota.
- PDF/XLSX/template browser downloads use delayed object-URL revocation for Safari/iPad save-to-Files robustness.
- Premium PDF includes PDF-native ImportVerifier identity, executive hierarchy, localized ImportVerifier `VERIFIED` review seal, evidence/source traceability and repeated issuer/EU-context footer. It does not claim government/EU certification.
- Landing conversion clearly states five lifetime free products/no card, one Unlimited plan at €9.95/month and truthful value proof without fabricated scarcity/social proof.

## DONE — production fail-closed release gate
- `next.config.ts` runs `checkReleaseConfig()` only for Netlify `CONTEXT=production`; CI and Deploy Previews remain usable without production secrets.
- A Netlify production build now fails before publish if critical configuration is incomplete or unsafe: canonical site URL, canonical Supabase project/public+secret keys, Stripe live key/webhook/canonical Unlimited price, truthful legal-provider fields, `AI_COST_POLICY=free_only`, SiliconFlow free key and official provider endpoint.
- Radar may remain disabled as a warning; declaring Radar live without a strong shared ingest secret is a release error.
- This turns the previous manual release checklist into an executable production safety barrier. Do not weaken it to make an incomplete production deploy pass.

## DONE — current landing performance architecture
- Public landing is a server component rather than page-wide client React; navigation uses native anchors and language switching remains a tiny client island.
- Six landing variants `/es`, `/en`, `/fr`, `/de`, `/it`, `/pt` are statically generated.
- Root `app/layout.tsx` no longer calls request-time language APIs, removing a Next.js dynamic-render opt-in from the public landing tree.
- Localized SEO metadata lives under `app/[lang]`; language picker navigates directly among static locale paths.
- PWA registration waits for an idle window after `load`; redundant immediate Service Worker update was removed. Online/visibility checks remain contained.
- Service Worker public cache remains language-keyed and private/authenticated routes remain excluded.
- Latest measured Netlify Lighthouse aggregate before the security-only pass was roughly **Performance 16–17 / Accessibility 100 / Best Practices 92 / SEO 100**. The detailed audit breakdown is unavailable through current connectors. Do not continue speculative React/CSS rewrites without TTFB/LCP/TBT/CLS/resource-level evidence.

## Latest exact functional verification — 2026-09-01
- Functional HEAD before this handoff update: **`7d6a3fd87db9b31bf90cea696ee3a466110b94e6`** (`test: keep disabled Radar out of storage paths`).
- GitHub `ImportVerifier release check` **#1367 SUCCESS** on exact `7d6a3fd...`: **307 tests passed**, typecheck passed and production build passed.
- Netlify Deploy Preview for exact `7d6a3fd...` was still **PENDING** at the last check on the correct project `importverifier`; recheck it before treating this head as fully preview-verified.
- PR #4 is **open, mergeable and not merged**.
- This documentation update creates a newer docs-only HEAD. Reconfirm exact CI/preview for that docs head before calling it the final release head.

## Production service facts checked
- Supabase project: `hfuwwjdcyudflamwwnon`.
- Aggregate: `free_accounts_over_limit=0`, `max_free_products_used=5`, `subscriptions_count=0`, `radar_events_count=0`, `ai_usage_events_count=0`, `one_time_audits_count=0`, `analyses_count=6`, `free_usage_accounts=4` at last check.
- Production function/trigger names are lifetime versions (`enforce_free_lifetime_product_quota`, `analyses_enforce_free_lifetime_product_quota`).
- Supabase security advisor reports one real Auth warning: **leaked-password protection disabled**. No-policy RLS advisories are intentional for server-only deny-all tables.
- Supabase performance advisor only reports currently-unused indexes; do not remove them merely from pre-launch usage statistics.
- Stripe live exposes one active canonical Unlimited product/price and one enabled canonical ImportVerifier webhook; no live subscriptions exist yet.
- Recent Gmail search did not provide evidence of a production signup/reset email, so SMTP delivery is **not** considered verified.

## NEXT — execute without asking
1. Reconfirm exact CI + correct `importverifier` Deploy Preview for the newest docs-only HEAD; repair any regression immediately.
2. Continue only genuinely new code/security findings. Do not repeat hardened Dashboard/Intelligence/Evidence/Latest/Review/Trial/Unlimited/Stripe/OAuth/Supabase-provider/Radar/source-URL work.
3. For performance, obtain detailed Lighthouse/Web Vitals evidence before changing landing architecture again.
4. Review PDF typography/overflow only against a real multi-product acceptance output; avoid speculative coordinate churn.
5. During real production acceptance, run `/importverifier-sample-5-products.csv` with a genuinely new account: canonical signup/login → five accepted → sixth rejected → isolated history → premium PDF → Excel → Checkout → webhook entitlement → Portal/cancel lifecycle.
6. Keep Radar live disabled until the same strong ingest secret is configured in production/scheduler and official EUR-Lex ingestion persists real events.
7. Keep EU as the only active market and marketplace connectors inactive until legitimate credentials exist.

## BLOCKED EXTERNAL / requires service-console, secret or physical device
- Netlify has no available connector here. Configure production env so the new fail-closed build guard passes, confirm production branch is `feat/import-rules-verifier-branding`, then deploy/promote the intended exact release. Required real values include canonical Supabase keys, live Stripe secret + webhook signing secret + canonical price, truthful legal-provider identity/address/tax/jurisdiction/refund values and SiliconFlow/free-only AI configuration.
- Configure the same strong `REGULATORY_INGEST_SECRET` in production and scheduler, run first real official EUR-Lex ingestion and only then enable `REGULATORY_RADAR_LIVE=true`.
- Supabase Auth dashboard: enable leaked-password protection and appropriate CAPTCHA/signup-abuse controls; available connector exposes the warning but not the Auth-config write.
- Production SMTP/signup/reset acceptance with a genuinely new non-owner email requires a real mailbox/browser flow.
- Physical iPhone/iPad/Safari/PWA upload/photo/export/save-to-Files/rotation QA requires a real device/browser.
- Official Shopify/Amazon/Etsy applications, credentials and scopes are required before direct connectors can become active.

## Definition of finished
Do not call ImportVerifier fully launched until current exact CI is green; canonical Netlify production runs the intended release and passes the fail-closed production configuration gate; a genuinely new user proves five-free-lifetime + sixth rejection + isolated history + PDF/XLSX; free-only AI is configured and works without premium leakage; legal/billing/webhook/Portal/cancellation pass; Radar claims match real ingestion; inactive markets/connectors remain honest; leaked-password/signup-abuse controls are enabled; SMTP acceptance passes; and desktop/iPhone/iPad/PWA QA passes.
