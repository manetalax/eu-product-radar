# ImportVerifier — detailed architecture and release handoff

Production target: `https://importverifier.netlify.app/`

Repository: `manetalax/eu-product-radar`

Active PR: `#4` — **Import Rules Verifier · versión paralela basada en PR #3**

Active branch: `feat/import-rules-verifier-branding`

Always read `WORK-CHAT-CONTINUITY.md` first. It is the short operational source of truth for exact HEAD, CI, Deploy Preview, blockers and immediate NEXT. This file describes durable architecture and acceptance requirements. Never create a replacement project, never deploy obsolete EU Product Radar instances, and never merge PR #4 without explicit owner instruction.

---

## 1. Product and immutable commercial rules

ImportVerifier is an **AI-assisted Product Compliance OS** for EU sellers, importers and ecommerce operators. It accepts catalogues, spreadsheets, documents, text and images; identifies candidate EU regulatory requirements; separates supplied evidence from inference; records missing evidence and supplier actions; and keeps a product-level regulatory state through the Regulatory Twin and Impact Radar architecture.

Commercial invariants:

- Exactly **5 products free in total per account**.
- The five-product allowance is lifetime/cumulative; it never resets monthly.
- No card is required for the free allowance.
- One public paid offer only: **ImportVerifier Unlimited · €9.95/month**.
- Internal plan ID `starter` remains only for Stripe/database compatibility and must not leak as a customer-facing plan name.
- Legacy plan IDs/schema remain readable for historical compatibility but are not sold to new customers.
- Unlimited is commercially unlimited while still protected by reasonable technical anti-abuse, rate and file-size safeguards.

AI invariants:

- Customers see **ImportVerifier AI**, never provider/model names.
- Production cost policy is fail-closed `AI_COST_POLICY=free_only`.
- CSV/XLS/XLSX parsing remains local and AI-free.
- Supported text/document/image extraction may use configured free-compatible AI.
- Unsupported scanned/legacy formats fail honestly rather than silently falling back to paid AI.

Legal/trust invariants:

- ImportVerifier is the identifiable issuer of its reports.
- Never claim EU/government certification, endorsement, approval or authorship without genuine authority.
- Never declare a product compliant merely from field completeness or AI confidence.
- Keep supplied evidence, inference, uncertainty and verified official sources distinct.
- Strong institutional visual language is acceptable; fabricated authority is not.

---

## 2. Runtime, landing and performance architecture

### Web/runtime

- Next.js application deployed through Netlify.
- Responsive desktop/mobile/iPad web UX.
- PWA service worker and installability foundation.
- Private/authenticated content is excluded from persistent PWA caching.
- Public-shell cache requests omit credentials and reject Cookie/Authorization-varying/private/no-store/no-cache responses.
- Service-worker online/visibility update failures are contained so Safari/iPadOS/offline transitions do not create unhandled rejections.
- App Router route failures, root-layout failures and unknown routes have explicit ImportVerifier recovery surfaces through `app/error.tsx`, `app/global-error.tsx` and `app/not-found.tsx`.
- Recovery copy is complete in ES/EN/FR/DE/IT/PT, does not render raw exception messages/stacks/digests, and synchronizes the document language to the detected supported locale.
- The global recovery surface is style-self-contained because `global-error` replaces the root layout and therefore cannot assume root CSS loaded successfully.
- `app/loading.tsx` provides an accessible, language-neutral skeleton/status surface for suspended navigation instead of leaving customers without transient feedback.

### Public landing

The landing is intentionally server/static-first:

- `app/page.tsx` is a Server Component; no page-wide `'use client'`.
- Native anchors replace JavaScript `scrollIntoView` navigation.
- `/es`, `/en`, `/fr`, `/de`, `/it`, `/pt` are statically generated.
- `app/layout.tsx` no longer reads `cookies()`, `headers()` or `serverLanguage()`. This avoids opting the public landing tree into request-time dynamic rendering.
- Localized SEO metadata lives in `app/[lang]/layout.tsx` and uses absolute localized titles to avoid duplicating the root title template.
- `components/LandingLanguagePicker.tsx` is the small landing language client island. It persists `iv_lang`/localStorage and navigates directly between static locale paths.
- `LanguageProvider` resolves a locale pathname before query/storage/browser fallbacks, keeping direct `/es`/`/de` etc. navigation aligned after hydration without reintroducing request-time APIs in the root layout.
- The large `landing-i18n` copy module is not imported into the root language client runtime.

PWA startup is also kept outside the critical rendering window:

- Registration is scheduled after `load` into `requestIdleCallback` where available, with a fallback timeout.
- Registration cleanup cancels idle/timer work when unmounted.
- `navigator.serviceWorker.register()` is not immediately followed by a redundant `registration.update()`; later online/visibility update checks remain contained.
- Public offline landing cache remains language-keyed; private/auth/API/reset routes remain excluded.

Performance evidence:

- Netlify Lighthouse on exact landing-architecture head `25a2e62d...` measured **Performance 16 / Accessibility 100 / Best Practices 92 / SEO 100**.
- The prior measured performance was 17. Removing request-time root language APIs and deferring PWA registration therefore did **not** materially change the aggregate score.
- The available connectors expose the aggregate but not the audit-level Lighthouse breakdown. Do not keep rewriting React/layout/CSS speculatively; obtain metric/audit evidence (TTFB/LCP/TBT/CLS/resource waterfall) before selecting the next performance change.

---

## 3. Authentication and account lifecycle

- Supabase Auth.
- Email signup/login/reset/logout flows exist.
- Google OAuth UI includes visible Google identity.
- Auth callback/confirmation return handling is pinned in code to canonical ImportVerifier surfaces.
- SDK-returned OAuth browser navigation is validated: exact configured Supabase origin and `/auth/v1/authorize`; lookalikes, credentials, unsafe schemes, unexpected paths and nonstandard ports fail closed.
- Histories/data are account-isolated through RLS and authenticated ownership checks.
- Self-service account deletion revokes expected session/data and is billing-aware.
- Latest observed Supabase Auth logs include successful Google OAuth/token/user activity from `https://importverifier.netlify.app` and canonical callback. Earlier `euproductradar` traffic remains historical.

Remaining Auth console/security acceptance is BLOCKED EXTERNAL and listed below.

---

## 4. Product ingestion and mobile input

Normalization boundary: `lib/product-ingestion.ts`.

Supported input paths include:

- CSV/XLS/XLSX;
- TXT/MD/JSON/RTF;
- PDF/DOCX/ODT where a local text layer can be extracted;
- images/photos including PNG/JPEG/WebP/HEIC/HEIF;
- legacy `.doc` and scanned PDF without text fail honestly when no free-compatible route exists.

Mobile/camera safeguards:

- Universal file picker stays broad and does not force camera capture.
- A separate image-only `capture="environment"` input supports direct mobile/iPhone/iPad camera capture.
- Both paths reuse the same secure load/quota/idempotency pipeline.
- Blank or `application/octet-stream` iOS image MIME is accepted only when magic bytes and extension agree.
- Spoofed/disagreeing image types fail closed.
- Camera/file-picker cancellation does not enter the import pipeline or consume quota.
- Multi-file drag/drop is rejected as a whole instead of silently processing one file.
- Long filenames wrap safely in mobile cards.

---

## 5. Analysis and lifetime free allowance

- Product analyses are versioned and persisted privately.
- Creation has request idempotency for mobile/network retries and duplicate races.
- Lifetime free usage is enforced server/database-side, not only by UI.
- Production aggregate currently shows zero accounts above five and maximum observed lifetime usage exactly five.
- A transactional production probe previously accepted products 1–5, rejected product 6 and rolled back cleanly.
- Runtime parsers validate quota, history, analysis detail/create and extracted-product payloads before state mutation.
- Free quota semantics remain `limit=5`, lifetime period and internally consistent used/remaining counts.

---

## 6. Billing

- Stripe Checkout + Customer Portal + signed webhook code exists.
- Canonical live public offer is ImportVerifier Unlimited at EUR 9.95/month; exact live price is recorded in the short handoff.
- Checkout revalidates amount, currency and monthly recurrence and only accepts internal `starter` for new purchases.
- Checkout/Portal destination URLs are validated at the final browser navigation boundary against exact Stripe HTTPS hosts.
- Checkout return requires structurally valid confirmation and never surfaces raw provider/parser failures.
- Webhook ordering/idempotency and subscription synchronization are defended in code.
- Paid entitlement uses Unlimited semantics rather than historical public product caps.
- Trial exhaustion presents a localized truthful upgrade surface with exact price/cadence and retained product value.
- Live Stripe webhook is enabled on the canonical production endpoint. Stripe and the application DB currently contain zero subscriptions, so no pre-launch entitlement drift is observed.

Paid production acceptance remains fail-closed until truthful legal-provider variables and Netlify live secret wiring are confirmed.

---

## 7. EU regulatory engine, Evidence and Regulatory Twin

EU is the only active market. US/CN/GB/JP architecture may remain structurally present but must not be marketed as active coverage.

The deterministic/versioned EU engine produces candidate category, confidence/uncertainty, potentially applicable acts, obligations, evidence requests, official-source references and human-confirmation flags.

Official-source URLs use explicit HTTPS host allowlists and reject credentials, lookalikes and non-default ports. Final render/export/AI-context boundaries revalidate them.

Evidence Intelligence:

- Persisted evidence store is account-owned and RLS-protected.
- Evidence records support requirement key/status plus document/page/URL/note traceability.
- URLs are sanitized at persistence/API/render/export/AI-context boundaries.
- Client runtime validates evidence IDs, product index, requirement key, status, bounded text fields and safe URLs before state mutation.
- Malformed success responses cannot silently become trusted Evidence state.

The Product Regulatory Twin connects product identity, market/category/confidence, applicable rules, supplied/missing evidence, uncertainty, actions and regulatory impacts. Reports export the same traceability rather than producing a disconnected narrative.

---

## 8. ImportVerifier AI

- Authenticated `/api/regulatory-agent` is context-limited and source/evidence aware.
- Agent policy forbids invented rules, certificates or lab results and forbids declaring certification/compliance merely from model confidence.
- External AI calls have abort timeouts and safe configured-base-URL validation.
- Server-only AI telemetry stores no prompt/document/product content or customer PII.
- User-facing responses require safe object/string shapes and never render raw provider errors.
- Provider/model identity is hidden from end users.

Production free-only AI still needs real service configuration/acceptance externally.

---

## 9. Regulatory Impact Radar

- Persistent regulatory-change architecture, authenticated retrieval and product matching exist.
- Official EUR-Lex RSS adapter handles Parliament/Council legislation, Commission proposals and OJ L acts.
- Events are normalized, official-host allowlisted, deduplicated and persisted idempotently.
- Production persisted event count remains **0**; keep `REGULATORY_RADAR_LIVE=false` until real official ingestion succeeds.

Current runtime hardening:

- Netlify scheduled function targets the canonical `https://importverifier.netlify.app/api/internal/regulatory-refresh` endpoint instead of trusting a mutable site-origin variable.
- Scheduler requires `REGULATORY_INGEST_SECRET` with at least 32 trimmed characters and sends it as Bearer auth.
- Internal refresh route requires the same minimum-strength secret and uses `timingSafeEqual` after equal-length validation.
- Route accepts only JSON, enforces a 1 KiB body ceiling and requires an empty JSON object.
- Oversize/invalid/content-type/auth/config failures return bounded sanitized errors; internal exceptions are logged server-side but not reflected raw to customers.
- Scheduler/route behavior has regression coverage.

Do not claim live monitoring until the production secret is configured and real official events are persisted.

---

## 10. Marketplace connectors

Architecture exists for Shopify, Amazon and Etsy: common capability model, platform URL detection, catalogue/listing import concepts, refresh and status-sync concepts.

Direct OAuth/API implementations stay inactive until legitimate official applications, credentials and scopes exist. Do not scrape around platform authentication and do not imply active partnerships.

---

## 11. Security/trust boundaries already completed

Do not redo these sweeps unless a genuinely new path appears:

- canonical site-origin validation;
- Stripe Checkout/Portal server and client navigation allowlists;
- Supabase OAuth navigation allowlist;
- Dashboard success payload validation;
- Latest Regulatory Assessment validation;
- Analysis Review Gate body validation;
- Evidence GET/PUT validation and optimistic rollback;
- Intelligence Suite history/detail/Evidence/Radar/AI validation;
- Trial/Unlimited quota validation;
- raw customer-facing API/provider error redaction;
- oversized request 413 preservation where implemented;
- internal Radar auth/content-type/body-size validation;
- official regulatory/guidance URL allowlists and final render/export/AI-context sanitization;
- account/RLS/privileged-table hardening;
- PWA private-cache/cache-poisoning defenses;
- App Router route/global error recovery redacts raw exceptions and preserves localized customer-safe fallback behavior.

Only fix newly discovered gaps; avoid security churn in already hardened surfaces.

---

## 12. Premium reports and exports

`lib/export-pdf.ts` implements the premium report direction:

- PDF-native geometric ImportVerifier brand mark;
- dark institutional cover and restrained purple/gold identity;
- localized regulatory report classification;
- executive metrics and clear hierarchy;
- localized red `VERIFIED` seal explicitly qualified as an **ImportVerifier review**, not authority certification;
- branded interior page chrome;
- repeated footer with ImportVerifier issuer, EU context, traceability framing and pagination;
- document/page/URL evidence traceability and official-source references;
- independence notice and regulatory disclaimers;
- regression tests for identity, localization and traceability.

Excel remains the full data-oriented companion export with evidence traceability.

Country/ministry context must never be inferred from UI language. Add authority context only when country is independently reliable and trademark/logo use is permitted; otherwise use authority name plus verified official source.

Further typography/overflow changes should come from real multi-product acceptance output, not speculative coordinate changes.

---

## 13. Internationalization

Active customer languages: ES, EN, FR, DE, IT, PT.

Covered/maintained surfaces include landing, auth, dashboard, upload/extraction, billing, Evidence, Intelligence Suite, regulatory assessment, reports, account lifecycle and failure/recovery UX.

Language rules:

- language selection persists through `iv_lang` + localStorage;
- static landing routes own locale-specific metadata/content;
- report language follows requested/current supported language;
- do not infer geographic country/legal authority solely from language;
- new active customer-facing copy ships in all six languages or has an explicit safe fallback.

---

## 14. Mobile/iPad/PWA acceptance standard

Already covered statically:

- safe areas and key touch targets;
- iOS form sizing;
- modal keyboard/scroll behavior;
- long filename wrapping;
- separate camera capture path and cancellation guard;
- HEIC/HEIF handling;
- multi-file rejection;
- delayed Blob URL revocation for PDF/XLSX/template save-to-Files robustness;
- PWA private-cache boundary and update-failure containment;
- language-keyed offline landing cache;
- responsive app-level loading, 404 and safe error recovery surfaces that remain usable even when the root layout fails.

Still external:

- real iPhone/iPad Safari camera return/cancel;
- PWA install/update;
- PDF/Excel save-to-Files/share;
- rotation/safe-area visual check on physical devices.

Future packaging direction remains Capacitor for iOS/iPadOS/Android and Tauri for desktop, sharing backend business logic rather than forking it.

---

## 15. Production service facts and BLOCKED EXTERNAL

Supabase project: `hfuwwjdcyudflamwwnon`.

Known production facts:

- free accounts above limit: 0;
- maximum observed lifetime free usage: 5;
- app subscription rows: 0;
- Stripe subscriptions: 0;
- persisted Radar events: 0;
- AI telemetry events observed at last check: 0;
- lifetime quota function/trigger names are canonical;
- Stripe has one active canonical Unlimited EUR 9.95 monthly price and one enabled canonical webhook;
- Supabase advisor still reports leaked-password protection disabled.

BLOCKED EXTERNAL when console/browser/secret access is unavailable:

- confirm Netlify production branch/env precedence and promote intended exact release;
- verify live `STRIPE_WEBHOOK_SECRET`, canonical Stripe vars, truthful legal-provider vars and SiliconFlow/free-only AI vars in Netlify;
- configure the same strong `REGULATORY_INGEST_SECRET` wherever production scheduler/runtime requires it and run first real EUR-Lex ingestion;
- enable Supabase leaked-password protection plus suitable CAPTCHA/signup-abuse controls;
- production SMTP signup/reset acceptance with a genuinely new non-owner mailbox;
- official Shopify/Amazon/Etsy apps/credentials/scopes;
- physical iPhone/iPad/Safari/PWA validation;
- truthful legal-provider identity/address/tax/jurisdiction/refund values before paid checkout intentionally passes the legal guard.

Skip blocked items and continue autonomous code work elsewhere.

---

## 16. Release verification and final acceptance

Every functional head must pass:

1. `npm ci`
2. full `npm test`
3. `npm run typecheck`
4. `npm run build`
5. correct Netlify Deploy Preview on project **importverifier** at the exact head

Historical `euproductradar`/`importrulesverifier` preview comments are irrelevant to release decisions.

Before calling ImportVerifier finished, a genuinely fresh account on production must prove:

1. localized landing and correct five-free/Unlimited offer;
2. canonical email registration/confirmation and Google login;
3. password reset through production email;
4. representative spreadsheet/text/document/image ingestion;
5. extracted-product review where applicable;
6. exactly five free products accepted lifetime;
7. sixth free product rejected without corrupting quota/history;
8. isolated persistent history across sessions/accounts;
9. ImportVerifier AI works without provider leakage or premium-cost leakage;
10. Regulatory Twin/Evidence traceability persists correctly;
11. Radar claims match real production ingestion state;
12. localized premium PDF and Excel download correctly;
13. exact Unlimited €9.95 monthly Stripe Checkout;
14. webhook activates entitlement;
15. Portal/cancel lifecycle retains access through paid period then expires correctly;
16. second account cannot read first account data;
17. account deletion safely removes/revokes expected data/session;
18. desktop/iPhone/iPad/PWA flows pass;
19. exact release head has green CI and correct production deployment.

---

## 17. Remaining autonomous NEXT priorities

1. Reconfirm exact CI and `importverifier` Deploy Preview after each functional/docs batch; repair regressions immediately.
2. Do not make another landing performance rewrite until audit-level Lighthouse/Web Vitals evidence identifies the actual remaining bottleneck; current aggregate performance is 16.
3. Continue static mobile/iPad/PWA QA only for newly discovered edge states.
4. Continue customer-facing API/link security work only where an actually unvalidated path is found.
5. Review PDF overflow/typography against real acceptance output and fix observed defects.
6. Keep Radar/AI/Evidence failure modes honest and fail-closed while production secrets are absent.
7. Once external Auth/Netlify/service wiring is corrected, run the complete fresh-account five-product + billing + reports acceptance journey.

Keep this file architectural rather than chronological; keep exact current HEAD/run/preview state in `WORK-CHAT-CONTINUITY.md`.
