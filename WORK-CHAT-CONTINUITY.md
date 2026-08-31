# ImportVerifier — Chat ↔ Work continuity protocol

This file exists so ChatGPT chat and ChatGPT Work can continue the same project without losing state.

## Canonical project

- Production target: https://importverifier.netlify.app/
- Repository: `manetalax/eu-product-radar`
- PR: `#4`
- Branch: `feat/import-rules-verifier-branding`
- Do not create a replacement project or deploy obsolete EU Product Radar variants.

## Source-of-truth order

1. `WORK-CHAT-CONTINUITY.md` — **current execution status; this wins if an older handoff section is stale**.
2. `WORK-HANDOFF-IMPORTVERIFIER.md` — detailed product decisions, architecture, acceptance criteria and historical context.

Both Chat and Work must read both files plus the latest PR HEAD before making substantial changes.

## Mandatory handoff rule

Whenever Chat or Work completes a meaningful implementation pass:

1. Update only `feat/import-rules-verifier-branding` / PR #4.
2. Run or inspect tests, typecheck and production build.
3. Record the resulting commit SHA.
4. Update `WORK-HANDOFF-IMPORTVERIFIER.md` when architecture, product decisions or acceptance criteria change.
5. Always update this file's DONE / IN PROGRESS / BLOCKED EXTERNAL / NEXT sections.
6. Never mark a task DONE just because code exists; DONE requires the relevant automated check or acceptance path when technically possible.
7. If an external account/configuration is required, mark it BLOCKED EXTERNAL with the exact account/UI/configuration needed.
8. If this short file contradicts an older blocker in the long handoff, this file is authoritative until the long handoff is refreshed.

When Work becomes available, the user can simply say:

> Continue ImportVerifier from `WORK-CHAT-CONTINUITY.md` and `WORK-HANDOFF-IMPORTVERIFIER.md` on PR #4 / branch `feat/import-rules-verifier-branding`. Treat the short continuity file as the latest state, do not repeat DONE work, start from IN PROGRESS/NEXT, run CI, and update both handoff files before stopping.

When returning from Work to Chat, Chat must re-read both files and the latest PR HEAD before continuing.

## Current execution status

### DONE

- Import Rules Verifier / ImportVerifier brand foundation.
- Canonical production target: `https://importverifier.netlify.app/`.
- Free entry: 5 product analyses.
- Public commercial offer: one plan only, **Unlimited · €9.95/month**.
- Legacy `starter/growth/pro/business` IDs retained internally only for backwards compatibility; `starter` is the stable internal ID for Unlimited.
- Public landing rewritten around one plan, ImportVerifier AI, Regulatory Twin, Impact Radar and connectors.
- Pricing regression test updated to expect Unlimited €9.95.
- PDF/Excel/regulatory report branding centralized and strengthened.
- Versioned EU regulatory assessment with category candidates, obligations, uncertainty and official sources.
- Universal input foundation for spreadsheets, text/documents and images.
- ImportVerifier AI authenticated regulatory-agent endpoint.
- Free-first AI router with premium fallback architecture; providers hidden from end-user UI.
- Product Regulatory Twin data foundation.
- Twin readiness now reads real saved `analysis_evidence` state instead of assuming every evidence slot is missing.
- Regulatory Impact Radar foundation visible in dashboard; live official-source monitoring is still not claimed.
- Shopify/Amazon/Etsy connector abstraction and safe HTTPS platform detection.
- Visible Intelligence Suite mounted in dashboard: AI, Twin, Radar, Connect.
- Connector authorization buttons explicitly say they are upcoming until official OAuth/API credentials exist.
- PWA manifest + service worker + registration; `/api` and `/auth` excluded from offline cache.
- Native roadmap fixed: Capacitor for iOS/iPadOS/Android; Tauri for Windows/macOS/Linux.
- Supabase production project confirmed: `hfuwwjdcyudflamwwnon` (`EuProductRadar`, the backend used by ImportVerifier).
- Supabase migration `unlimited_plan_entitlement` applied successfully in production.
- DB `subscriptions_product_limit_check` now permits 5..1,000,000 technical guardrail instead of historical fixed plan limits.
- Active/trialing internal `starter` subscriptions are migrated to the Unlimited fair-use ceiling.
- Supabase security advisor run after migration.
- `stripe_webhook_events` RLS-with-no-client-policy advisory is intentional because the table is server-only.
- Supabase still reports leaked-password protection disabled (see BLOCKED EXTERNAL).
- Stripe live account connected: **EU Radar** (`acct_1U8gkeHJnO8odw1M`).
- Live Stripe product created: `ImportVerifier Unlimited` (`prod_VAfIBj5MLhAJKr`).
- Live Stripe recurring price created: **€9.95/month**, Price ID `price_1UAJy5HJnO8odw1Mn4jMVjFt`.
- Stripe product/price metadata maps public Unlimited to internal plan ID `starter`.
- Terms updated to one Unlimited subscription and fair-use wording; old public audit wording removed there.
- Privacy policy updated to disclose dynamic AI routing/subprocessors and international-transfer considerations without exposing providers in the product UI.
- Authenticated Unlimited polish component added: paid `starter` users see Unlimited messaging instead of artificial quota bars; public audit purchase card is hidden.
- CI run #76 for the core Intelligence Suite/Twin evidence change passed successfully (tests + typecheck + build).
- A failed CI run caused by stale four-plan tests was diagnosed and corrected rather than ignored.

### IN PROGRESS

- Verify the latest HEAD CI after authenticated Unlimited polish and legal-page changes; fix any new regression.
- Synchronize the newly created Stripe Price ID into Netlify production env as `STRIPE_PRICE_STARTER` (requires Netlify account access; no Netlify connector available in normal chat).
- Sweep authenticated dashboard/settings and localized copy for any remaining visible legacy plan/audit wording that CSS hiding does not eliminate semantically/accessibility-wise.
- Final production customer journey QA on the canonical Netlify site after current branch deploys.

### BLOCKED EXTERNAL

- **Netlify:** set `STRIPE_PRICE_STARTER=price_1UAJy5HJnO8odw1Mn4jMVjFt`, verify production branch, webhook/env values and deploy latest PR #4 branch. Normal chat has no Netlify connector; Work Cloud Browser can perform this.
- **Supabase Auth UI:** enable leaked-password protection; connector exposes advisors but not an Auth-setting mutation tool.
- Verify/configure Supabase CAPTCHA/signup abuse protection as appropriate in the dashboard.
- Configure `SILICONFLOW_API_KEY` in Netlify if free-first AI is to run in production.
- Configure/retain `OPENAI_API_KEY` as fallback if desired.
- Register official Shopify app/OAuth credentials and scopes.
- Register Amazon SP-API application/credentials and marketplace permissions.
- Register Etsy API app/OAuth credentials.
- Verify production SMTP/Resend sender and full signup/reset delivery on a non-owner email.
- Verify Supabase/Google OAuth production redirect allowlists for `https://importverifier.netlify.app`.
- Add final legal identity, address, tax information, jurisdiction and refund policy before accepting paid customers.

### NEXT

1. Latest HEAD CI green: tests + typecheck + build.
2. Semantic cleanup of remaining legacy pricing/audit UI (not merely hidden visually).
3. Add persisted/live regulatory-change ingestion pipeline for Impact Radar using official sources; until then keep UI wording explicitly non-live.
4. Add evidence document/page linking so Twin can move from “supplied” to “verified source” with traceability.
5. Activate Shopify/Amazon/Etsy OAuth/API adapters once official app credentials exist.
6. Work/Cloud Browser: finish Netlify env/deploy wiring and production OAuth/auth settings.
7. Execute complete production journey: registration, confirmation, imports, evidence, AI, reports, history, checkout, portal/cancel, second-account isolation, deletion.
8. Final iPhone/iPad/desktop responsive QA + PWA installability QA.
9. Only after production journey passes: begin customer acquisition.

## Current latest known code state

- Last HEAD observed before this continuity refresh: `7903d9d34c00d7605e5176209063247cc2ad3cb8` plus this documentation commit.
- PR #4 remains OPEN and must not be merged unless the owner explicitly asks.

## Definition of finished

ImportVerifier is not finished until:

- latest HEAD CI is green;
- canonical Netlify production deploy contains the latest code;
- free and Unlimited Stripe entitlements work end-to-end;
- Stripe webhook/portal/cancellation are production-verified;
- AI free-first routing and fallback work with production env;
- reports are branded and source-backed;
- account isolation, auth recovery and deletion work in production;
- Twin evidence state is persistent and traceable;
- connectors are either truly authorized/working or clearly labelled unavailable;
- Impact Radar does not claim live monitoring until live official-source change detection exists;
- mobile/iPad/desktop layouts are usable and PWA installability is verified;
- remaining external settings are completed rather than merely documented.
