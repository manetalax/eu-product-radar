# ImportVerifier — live handoff for Work

Target production site: https://importverifier.netlify.app/

Repository: `manetalax/eu-product-radar`

Active PR: `#4` — **Import Rules Verifier · versión paralela basada en PR #3**

Active branch: `feat/import-rules-verifier-branding`

This document is the operational handoff for Work. Treat it as the source of truth for current product decisions, completed work, external blockers and the next execution queue. Do not deploy to obsolete EU Product Radar instances and do not create a replacement project.

---

## 1. Product direction now fixed

ImportVerifier is evolving from a catalogue checker into an **AI Product Compliance OS** for sellers, importers and ecommerce operators.

Primary promise:

> Show ImportVerifier a product or catalogue and it helps identify which EU regulatory requirements may apply, what evidence exists, what is missing, what to ask the supplier for, what should be reviewed first and how the product's regulatory state changes over time.

Commercial direction currently chosen by owner:

- Free entry: 5 product analyses.
- One public paid plan only: **Unlimited · €9.95/month**.
- Commercially unlimited product use, with internal technical/fair-use safeguards against automated abuse and runaway infrastructure/AI cost.
- Public product should not expose underlying AI providers. The user sees only **ImportVerifier AI**.
- Internal AI routing should prefer free/lowest-cost capable providers and use premium providers only as fallback.
- Every 10 days, review the market for new free AI models/APIs that can materially improve OCR, vision, extraction, translation, reasoning or regulatory chat. Replace/add providers only when the improvement is meaningful.

Important legal/product principle:

- Never present ImportVerifier as an EU authority, certification body or legal certification.
- Never claim a product is compliant merely from missing-field checks or AI output.
- Always separate supplied evidence, inference, uncertainty and verified official sources.

---

## 2. Already implemented before latest phase

- Supabase authentication and private histories.
- Google OAuth UI/flow.
- CSV/XLS/XLSX import pipeline.
- PDF and Excel reports.
- Stripe Checkout, customer portal and signed webhooks in code.
- Free quota and paid entitlement model.
- Self-service account deletion with session revocation and cascade deletion.
- Responsive/PWA foundation.
- Main UI translations in ES/EN/FR/DE/IT/PT.
- ImportVerifier / Import Rules Verifier branding foundation.
- Universal upload path accepts photo, PDF, Word, text, CSV, Excel and related formats.
- AI-based product extraction for documents/images.
- Versioned EU regulatory engine with category candidates, applicable acts, obligations, evidence requests, uncertainty flags and official URLs.
- PDF and Excel regulatory exports.
- Report branding centralized through `lib/brand.ts`.
- Regulatory report headers/footers and metadata branded as Import Rules Verifier / ImportVerifier.

---

## 3. Latest work completed in this phase

### 3.1 Branded generated documents

Files involved:

- `lib/brand.ts`
- `lib/export-pdf.ts`
- `lib/export-report.ts`
- `lib/export-regulatory.ts`

Completed:

- Brand name centralized.
- Tagline/brand description available centrally.
- PDF title/creator/producer/keywords branding added.
- PDF title and footer use Import Rules Verifier branding.
- Excel creator/title/footer branding updated.
- Regulatory worksheet uses central brand instead of hardcoded product name.
- Production domain referenced in document branding where appropriate.

Design intent for future pass:

- Upgrade generated reports to a premium consulting-style branded document system with stronger header hierarchy, recognizable IRV/ImportVerifier visual identity and consistent report cover treatment.

### 3.2 Pricing strategy changed to one plan

File: `lib/plans.ts`

Current public plan:

- `Unlimited`
- €9.95/month
- `starter` remains the internal Stripe/plan ID for compatibility.

Internal compatibility:

- Legacy `growth`, `pro`, `business` definitions remain hidden so old Stripe records/webhooks do not become unreadable.
- `UNLIMITED_FAIR_USE_CEILING = 1_000_000` is an infrastructure guardrail, not a public product quota.

Public commercial goal:

- Show only **Unlimited · €9.95/month** to new customers.
- Remove old Starter/Growth/Pro/Business positioning from all public UX.
- Remove the one-time audit from the public offer unless owner later explicitly restores it.

Important:

- The backend/database/Stripe environment may still contain old Price IDs. Do not delete legacy compatibility before Stripe migration is verified.
- A new Stripe price for €9.95/month still needs to be created/configured in the live Stripe account if not already done.

### 3.3 AI provider router — free-first architecture

New file: `lib/ai-provider.ts`

Direction implemented:

1. Prefer free/zero-cost provider capability where configured.
2. Fall back to premium provider when the free provider is unavailable, rate-limited or insufficient.
3. Keep the regulatory engine deterministic/source-backed instead of asking an LLM to invent the regulatory result.

Current intended free provider setup:

- SiliconFlow-compatible API.
- Text model default intended: `THUDM/GLM-Z1-9B-0414` or configured equivalent.
- OCR/vision model intended: `PaddlePaddle/PaddleOCR-VL-1.5` or configured equivalent.

Environment variables added/planned:

- `SILICONFLOW_API_KEY`
- `SILICONFLOW_BASE_URL`
- `SILICONFLOW_TEXT_MODEL`
- `SILICONFLOW_OCR_MODEL`
- existing OpenAI variables remain fallback.

Privacy requirement:

- Do not expose provider names in end-user UI.
- Privacy policy must still accurately disclose processors/subprocessors and international data transfers where legally required.

Cost strategy:

- CSV/XLS/XLSX path should remain AI-free where possible.
- Use free OCR/extraction for images/documents where quality permits.
- Use free model for chat/reasoning where safe.
- Use premium provider only as fallback.

### 3.4 Regulatory AI Agent

New API route: `app/api/regulatory-agent/route.ts`

Implemented:

- Authenticated endpoint.
- Same-origin protection.
- Context-limited regulatory Q&A.
- Instructions prohibit inventing rules/certificates/lab results.
- Instructions prohibit declaring certification/compliance.
- Distinguishes evidence, inference and uncertainty.
- Uses the free-first AI router.
- Provider/model may be returned internally for observability, but must not be displayed to end users.

Intended UX examples:

- “What is still missing for this product?”
- “What exactly should I ask my supplier for?”
- “Why might RED apply?”
- “I uploaded these documents; what gap remains?”

### 3.5 Product Regulatory Twin foundation

New file: `lib/regulatory-twin.ts`

Implemented data concepts:

- regulatory evidence links;
- evidence status;
- product/market/category/confidence;
- rule version;
- readiness score;
- applicable rules;
- evidence list;
- uncertainties;
- actions;
- regulatory impacts and severity ranking.

Product vision:

Each product should become a persistent **regulatory digital twin** rather than a one-off report.

Desired future state:

`product ↔ category ↔ regulations ↔ obligations ↔ evidence ↔ document/page ↔ version ↔ alerts`

The readiness score must eventually reflect real supplied/verified evidence rather than simply assuming all evidence is missing.

### 3.6 Regulatory Impact Radar foundation

Current implementation derives visible review/action items from the current regulatory assessment.

Long-term target:

- Monitor official regulatory sources and Safety Gate/recall data.
- Determine which saved products are affected by a new rule/change.
- Recompute only affected twins.
- Notify users with a concise impact summary such as:
  - unaffected;
  - needs review;
  - action required.

Do not claim live monitoring until the official-source ingestion/scheduler actually exists.

### 3.7 Platform connector architecture

New file: `lib/platform-connectors.ts`

Connectors defined:

- Shopify
- Amazon
- Etsy

Current capabilities declared:

- catalog/listing import;
- refresh;
- compliance status sync;
- ASIN monitoring/compliance alerts concept for Amazon.

Current state:

- Common adapter interface exists.
- HTTPS platform URL detection exists.
- OAuth/API implementations do **not** yet exist.

External work required:

- Register official apps/integrations with Shopify, Amazon and Etsy.
- Obtain legitimate credentials/scopes.
- Implement secure OAuth/token storage.
- Implement paginated catalogue import adapters.
- Add webhook/polling refresh paths where supported.

Never scrape or bypass platform authentication if an official API is available.

### 3.8 New visible Intelligence Suite

New files:

- `components/IntelligenceSuite.tsx`
- `components/IntelligenceSuite.module.css`

Dashboard integration:

- `app/dashboard/page.tsx` now mounts `IntelligenceSuite` after the existing stable dashboard.

Visible modules:

1. **ImportVerifier AI**
   - loads latest analysis;
   - product selector;
   - asks `/api/regulatory-agent`;
   - end user sees only ImportVerifier AI.

2. **Product Regulatory Twin**
   - category;
   - confidence;
   - candidate rule count;
   - evidence count;
   - readiness visualization;
   - priority actions.

3. **Regulatory Impact Radar**
   - surfaces current actions/review items from the assessment;
   - clearly describes live official-source monitoring as the next connection, not as already active.

4. **Connect**
   - cards for Shopify/Amazon/Etsy;
   - platform URL detection;
   - authorization buttons intentionally disabled until official OAuth credentials/adapters are implemented.

Design strategy:

- Intelligence Suite was added alongside the stable dashboard rather than rewriting the working import/history flow, reducing regression risk.

### 3.9 PWA / future native architecture

Existing manifest confirmed:

- `public/manifest.webmanifest`

New/installability work:

- service worker added;
- registration layer added;
- application shell caching added;
- `/api` and `/auth` intentionally excluded from caching to avoid persisting private responses in the offline cache.

Future packaging direction fixed:

#### iOS / iPadOS / Android

Use Capacitor shell around the web product where appropriate.

Native capabilities to add:

- camera/document scan;
- share-to-ImportVerifier;
- push notifications for Impact Radar;
- secure storage;
- native file picker/share/export;
- mobile safe areas and touch flows.

#### Windows / macOS / Linux

Use Tauri shell where appropriate.

Desktop capabilities to add:

- drag/drop large local files;
- file associations;
- native notifications;
- secure token storage;
- auto update;
- optional local preprocessing/OCR later.

Architecture rule:

- Keep regulatory logic, billing, AI routing and canonical data in the shared backend so mobile/desktop are clients, not separate products.

---

## 4. Public landing/pricing work currently in progress

`app/page.tsx` has been rewritten in the current phase to move toward:

- one plan only;
- €9.95/month displayed with 2 decimal places;
- Unlimited messaging;
- ImportVerifier AI / Regulatory Twin / Impact Radar prominently surfaced;
- 5-product free entry;
- one paid CTA using internal plan ID `starter`;
- no one-time audit shown publicly;
- no four-plan grid shown publicly.

Important QA needed immediately:

- Run TypeScript/build because the landing rewrite is recent.
- Verify all six languages render acceptably.
- Verify CSS classes used by new feature list exist or degrade gracefully.
- Verify no old pricing copy appears elsewhere (login, dashboard settings, FAQ, metadata, emails, Stripe descriptions).
- Verify €9.95 is not rounded to €10 anywhere.

---

## 5. Known inconsistencies / technical debt to resolve now

### 5.1 Dashboard quota UI still assumes finite quotas

`components/Dashboard.tsx` still has UI such as:

- “X libres”;
- quota progress bars;
- `used / limit`;
- “Disponible el próximo mes”;
- plan selection structures that may still reference legacy plans/audit.

Required change:

- For paid Unlimited plan, show `Uso ilimitado` instead of a huge artificial remaining count.
- Hide quota percentage/progress for Unlimited.
- Keep free user 5-product quota UI.
- Remove public audit/legacy plan purchase UI.
- Keep “Gestionar suscripción” for paid Unlimited.

### 5.2 Database quota enforcement may still use old plan limits

Review Supabase migrations/triggers/functions:

- `202608300001_stripe_subscriptions.sql`
- `202608300002_one_time_audits.sql`
- `202608300003_analysis_evidence_and_safe_reanalysis.sql`
- related quota enforcement logic.

Need to ensure a paid `starter` subscription now gets Unlimited/fair-use semantics and is not capped at the historical 50 products/month.

Do not simply remove all server-side safeguards. Preserve reasonable anti-abuse/file-size/request-rate limits.

### 5.3 Stripe mapping still uses legacy env naming

Likely current mapping still references:

- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_GROWTH`
- `STRIPE_PRICE_PRO`
- `STRIPE_PRICE_BUSINESS`

Preferred safe migration:

- Continue using `STRIPE_PRICE_STARTER` for the new Unlimited €9.95 plan initially to avoid unnecessary schema churn.
- Keep legacy mappings readable for existing records but do not expose them to new customers.
- Confirm Stripe webhook maps new €9.95 price → `starter` → Unlimited entitlement.

### 5.4 AI Intelligence Suite uses latest analysis independently from main dashboard selection

Current implementation intentionally avoids destabilizing existing dashboard state.

Follow-up improvement:

- Share current analysis state between Dashboard and Intelligence Suite or move intelligence modules into the existing selected-product context.
- Until then, Suite uses latest analysis and its own product selector.

### 5.5 Regulatory Twin readiness is placeholder-ish

Current visible readiness uses obligation evidence slots initialized as missing.

Required upgrade:

- Read actual uploaded evidence from evidence store/API.
- Link evidence to requirement IDs.
- Mark supplied / needs_review / verified_source appropriately.
- Calculate readiness from evidence graph.

### 5.6 Impact Radar is not yet live monitoring

Current visible radar summarizes the saved regulatory assessment.

Required upgrade:

- Official-source ingestion.
- Version/change detection.
- Product impact matching.
- Persisted impacts/notifications.
- Optional scheduled re-evaluation.

### 5.7 Connectors are not authorized yet

Buttons must remain clearly unavailable until official app setup exists.

Required setup:

- Shopify app + scopes.
- Amazon SP-API application + region/marketplace handling.
- Etsy API app + OAuth.

---

## 6. AI provider maintenance rule

A scheduled review has been created every 10 days starting 2026-09-10 to evaluate newly available free AI models/APIs.

Evaluation criteria:

1. zero/near-zero cost;
2. quality on OCR/product extraction/regulatory context;
3. rate limits;
4. API stability;
5. privacy/data residency/GDPR implications;
6. OpenAI-compatible API where useful;
7. latency;
8. structured output reliability;
9. fallback behavior.

Do not switch providers just because a model is new. Switch only for a material improvement.

---

## 7. P0 production wiring still required

1. Confirm Netlify production branch is `feat/import-rules-verifier-branding` or the final chosen ImportVerifier release branch and production URL is exactly `https://importverifier.netlify.app`.
2. `NEXT_PUBLIC_SITE_URL=https://importverifier.netlify.app`.
3. Supabase OAuth redirect URLs use that domain.
4. Google OAuth callback config matches production.
5. Create/configure Stripe Unlimited €9.95 recurring price and map it safely to internal `starter`.
6. Verify Stripe webhook signature validation + idempotency.
7. Configure real SMTP/Resend sender and test signup/password reset on a non-owner email.
8. Enable Supabase leaked-password protection and suitable anti-abuse/CAPTCHA controls.
9. Add/configure `SILICONFLOW_API_KEY` if free-first AI is to be active in production.
10. Keep OpenAI credentials as fallback unless/until a robust second free provider replaces it.
11. Update privacy policy/subprocessor disclosure for AI providers and international transfers where required.

---

## 8. Required end-to-end billing acceptance after Unlimited migration

Test with Stripe test mode first:

- Free user gets exactly 5-product free quota.
- User sees only Unlimited €9.95/month as the paid offer.
- Checkout upgrades correct authenticated user.
- Verified webhook activates entitlement.
- Paid Unlimited user does not hit historical 50/150/500/2000 product limits.
- Reasonable anti-abuse safeguards remain.
- Customer portal opens.
- Cancellation keeps paid access through the paid period.
- Access falls back appropriately after period end.
- Failed/expired payments do not leave entitlement indefinitely.
- Duplicate webhook is idempotent.
- Legacy subscription records remain readable but are not sold.

---

## 9. Required regulatory engine product standard

Output per product should contain:

- identified product/category and confidence;
- applicable EU legislation/rule families;
- required documentation;
- required markings/labels/warnings;
- manufacturer/importer/responsible-person obligations;
- missing evidence vs supplied evidence;
- priority/reasons;
- official-source citations/URLs;
- uncertainty/human-confirmation flags;
- independent-tool/legal disclaimer.

Preserve versioned rule evaluation so old saved reports remain reproducible.

Next regulatory expansion priorities from competitor review:

- GPSR depth;
- CE sector handling;
- EPR/packaging;
- Safety Gate/recall monitoring;
- foods;
- cosmetics;
- batteries;
- textiles;
- chemicals/CLP;
- technical-file workflow;
- harmonised standards where reliably sourced.

---

## 10. Universal product input acceptance

Continue using `lib/product-ingestion.ts` as normalization boundary.

Supported/intended inputs:

- CSV/XLS/XLSX;
- pasted/free text;
- PDF;
- DOC/DOCX/RTF/ODT/plain text/JSON as technically supported;
- images/photos/camera.

Required UX standard:

- identify multiple products where present;
- never invent a product when uncertain;
- show ambiguity/confidence;
- allow review/edit/remove/merge before quota consumption;
- reject unsupported/oversized input clearly;
- define retention/deletion policy for uploaded customer material.

---

## 11. Competitive features to exceed

Competitor review identified useful market features to beat:

- periodic/automatic rescans;
- Safety Gate/recall monitoring;
- report version history;
- document integrity/hash;
- Shopify/Amazon catalogue integration;
- technical file/document package generation;
- multilingual reports;
- API/team capability;
- EPR/packaging coverage;
- regulatory-document re-generation after product changes.

ImportVerifier differentiation should be stronger than a GPSR checker:

### A. ImportVerifier AI
Contextual regulatory assistant tied to each product/evidence set.

### B. Product Regulatory Twin
Persistent regulatory state per product.

### C. Evidence Intelligence
Map:

`requirement → document → page → excerpt/data → evidence status`

### D. Regulatory Impact Radar
New rule/change → affected catalogue products → priority/action.

### E. Universal input
Photo/document/text/catalogue/connected platform.

### F. One low-price plan
€9.95/month Unlimited with fair-use technical protections.

---

## 12. Authentication / privacy / trust acceptance

- Verify Google login branding/accessibility.
- Add Apple only if real provider is configured.
- Test full signup/login/reset/logout/OAuth cancellation.
- Verify two-account isolation.
- Verify account deletion production flow.
- Privacy/Terms/data retention/support must be current.
- No server secrets exposed client-side or committed.
- Trust badges only when factual.
- No invented EU affiliation or third-party certification.

---

## 13. Internationalization acceptance

Audit ES/EN/FR/DE/IT/PT across:

- landing;
- pricing;
- auth;
- dashboard;
- Intelligence Suite;
- errors;
- billing;
- reports;
- account lifecycle;
- upload/extraction;
- transactional emails.

Reports should follow user/preferred language eventually. Current report strings may still be mainly Spanish and need full localization.

---

## 14. Mobile / iPad / desktop acceptance

The product owner explicitly wants future native apps.

Immediate web requirements:

- excellent iPhone/iPad responsive behavior;
- camera capture;
- large touch targets;
- no hover-only controls;
- safe areas;
- responsive tables/cards;
- PWA installability;
- PDF/Excel export usable on iOS/iPadOS.

Future native packages:

- Capacitor: iOS/iPadOS/Android.
- Tauri: Windows/macOS/Linux.

Do not fork business logic per platform.

---

## 15. Next execution queue for Work / current assistant

Execute in this order unless a fresh production blocker appears:

1. Run CI on current head and fix TypeScript/test/build errors from latest landing + Intelligence Suite work.
2. Update `components/Dashboard.tsx` for Unlimited semantics and remove legacy/audit purchasing UX.
3. Search entire repository for old prices/plan names/audit public messaging and remove from new-customer UX while preserving backend compatibility.
4. Update billing/quota tests for Unlimited.
5. Inspect Supabase quota trigger/function and migrate historical Starter 50-limit behavior to Unlimited/fair-use behavior.
6. Verify Stripe checkout/webhook mapping for `starter` → Unlimited €9.95.
7. Connect actual evidence storage to Regulatory Twin readiness.
8. Move ImportVerifier AI/Twin/Radar into the currently selected analysis state rather than latest-analysis-only.
9. Add real platform OAuth adapters when credentials/apps exist.
10. Implement official-source monitoring architecture for Impact Radar.
11. Add Evidence Intelligence mapping down to document/page/excerpt.
12. Localize Intelligence Suite and generated reports.
13. Validate PWA install and iPad/mobile layouts.
14. Complete Netlify/Supabase/Stripe/email production configuration.
15. Run full production acceptance journey.

---

## 16. Final production acceptance journey

Complete this exact journey on `https://importverifier.netlify.app/`:

1. Visitor sees localized landing and only current pricing.
2. Register via email and separately Google.
3. Confirm/recover credentials using real email.
4. Import through spreadsheet, text and image/document paths.
5. Review extracted products before analysis.
6. Run free 5-product flow.
7. Use ImportVerifier AI on a product.
8. View Product Regulatory Twin.
9. View current Impact Radar items.
10. Download branded localized PDF and Excel reports.
11. Reopen saved analysis after new session.
12. Upgrade to Unlimited €9.95 using Stripe test checkout.
13. Confirm historical monthly product caps no longer block paid Unlimited user.
14. Open billing portal and test cancellation lifecycle.
15. Verify second account cannot access first account data.
16. Delete test account and verify sessions/data removed.
17. Test desktop, iPhone-size and iPad-size layouts/PWA installation.
18. Run automated tests, typecheck and production build with no release blockers.

---

## 17. Definition of done

Do not call ImportVerifier finished until:

- production journey above passes;
- pricing is consistently Unlimited €9.95/month;
- no legacy plan UI leaks into new-customer experience;
- paid Unlimited users are not blocked by old product quotas;
- AI Agent works with free-first provider routing and safe fallback;
- regulatory output is category-specific and source-backed;
- Evidence/Twin readiness is based on real evidence, not placeholder counts;
- PDFs/Excel are correctly branded;
- mobile/iPad experience is strong;
- security/privacy/billing configuration is production-ready;
- platform connectors are clearly marked inactive until genuinely authorized.

Keep this file updated whenever product decisions or implementation state changes so Work can resume without relying on chat history.
