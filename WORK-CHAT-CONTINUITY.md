# ImportVerifier — Chat ↔ Work continuity protocol

This file exists so ChatGPT chat and ChatGPT Work can continue the same project without losing state.

## Canonical project

- Production target: https://importverifier.netlify.app/
- Repository: `manetalax/eu-product-radar`
- PR: `#4`
- Branch: `feat/import-rules-verifier-branding`
- Do not create a replacement project or deploy obsolete EU Product Radar variants.

## Source-of-truth files

1. `WORK-HANDOFF-IMPORTVERIFIER.md` — product decisions, architecture, completed work, blockers and acceptance criteria.
2. `WORK-CHAT-CONTINUITY.md` — short operational status and handoff protocol between Chat and Work.

Both Chat and Work must read these files before making substantial changes.

## Mandatory handoff rule

Whenever Chat or Work completes a meaningful implementation pass:

1. Update the active branch only.
2. Run/inspect tests, typecheck and production build.
3. Record the resulting commit SHA.
4. Update `WORK-HANDOFF-IMPORTVERIFIER.md` if product architecture, decisions, blockers or acceptance criteria changed.
5. Update this file's **Current execution status** with what is DONE / IN PROGRESS / BLOCKED / NEXT.
6. Never mark a task DONE merely because code exists; DONE requires the relevant automated check or acceptance path to pass when technically possible.
7. If an external account/configuration is required, mark it BLOCKED EXTERNAL and state the exact account/UI/configuration needed.

When Work becomes available, the user can simply say:

> Continue ImportVerifier from `WORK-HANDOFF-IMPORTVERIFIER.md` and `WORK-CHAT-CONTINUITY.md` on PR #4 / branch `feat/import-rules-verifier-branding`. Do not repeat completed work. Start from the first IN PROGRESS or NEXT item and update both handoff files before stopping.

When returning from Work to Chat, Chat must re-read both files and the latest PR HEAD before continuing.

## Current execution status

### DONE

- Import Rules Verifier / ImportVerifier brand foundation.
- Production target normalized to `https://importverifier.netlify.app/` in active release configuration.
- Free entry: 5 products.
- Public commercial plan changed to one plan: **Unlimited · €9.95/month**.
- Legacy plan IDs retained internally for backwards compatibility.
- PDF/Excel/report branding centralized and strengthened.
- Versioned EU regulatory assessment with category candidates, obligations, uncertainty and official sources.
- Universal input foundation for spreadsheets, text/documents and images.
- ImportVerifier AI authenticated regulatory-agent endpoint.
- Free-first AI router with premium fallback architecture.
- Product Regulatory Twin data foundation.
- Regulatory Impact Radar foundation.
- Shopify/Amazon/Etsy connector abstraction and safe platform detection.
- Visible Intelligence Suite mounted in dashboard: AI, Twin, Radar, Connect.
- PWA manifest + service worker + registration; private API/auth responses excluded from cache.
- Native roadmap fixed: Capacitor for iOS/iPadOS/Android; Tauri for Windows/macOS/Linux.
- New DB migration `202608310001_unlimited_plan.sql` removes historical starter=50 database entitlement and maps active starter subscriptions to the Unlimited fair-use guardrail.
- Pricing regression test updated for the one-plan strategy.

### IN PROGRESS

- Re-run CI after Unlimited pricing/test/database migration changes and fix every failure.
- Remove remaining legacy pricing/audit language from authenticated dashboard/settings and all six localized surfaces.
- Make paid Unlimited UI display `Uso ilimitado` rather than artificial remaining counts/progress bars.
- Connect Regulatory Twin readiness to real uploaded evidence rather than initializing all obligation evidence as missing.

### BLOCKED EXTERNAL

- Create/configure the live Stripe recurring price at €9.95/month and map it to internal plan ID `starter` / `STRIPE_PRICE_STARTER`.
- Apply latest Supabase migrations to production and run security advisors.
- Configure/verify Netlify production environment values.
- Configure SiliconFlow API key if free-first AI should be active in production.
- Configure OpenAI fallback key if retained.
- Register official Shopify app/OAuth credentials.
- Register Amazon SP-API application/credentials.
- Register Etsy API app/OAuth credentials.
- Verify production SMTP/Resend and Supabase auth redirects.
- Enable leaked-password protection and suitable signup abuse/CAPTCHA controls in Supabase.

### NEXT

1. CI green: tests + typecheck + build.
2. Unlimited authenticated UX cleanup.
3. Real-evidence Regulatory Twin readiness.
4. Production-safe privacy/subprocessor disclosure for AI routing.
5. End-to-end customer journey on `https://importverifier.netlify.app/`.
6. OAuth/API activation for platform connectors once official credentials exist.
7. Live official-source ingestion/change detection for Impact Radar; do not claim live monitoring before this exists.
8. Final iPhone/iPad/desktop responsive QA and installability QA.

## Definition of finished

ImportVerifier is not finished until:

- CI is green;
- the production journey passes;
- free and Unlimited billing entitlements behave correctly;
- AI failures fall back safely;
- reports are branded and source-backed;
- account isolation/deletion/auth recovery work;
- no dead pricing or connector buttons mislead the user;
- mobile/iPad/desktop layouts are usable;
- every external production setting still required is either completed or explicitly listed as BLOCKED EXTERNAL with exact action.
