# ImportVerifier — detailed architecture and release handoff

Production target: `https://importverifier.netlify.app/`

Repository: `manetalax/eu-product-radar`

Active PR: `#4` — **Import Rules Verifier · versión paralela basada en PR #3**

Active branch: `feat/import-rules-verifier-branding`

This is the detailed architectural handoff. Always read `WORK-CHAT-CONTINUITY.md` first: it is the short operational source of truth for exact HEAD, CI, blockers and immediate NEXT items. If this document conflicts with the short handoff, the short handoff wins. Never deploy to obsolete EU Product Radar instances, never create a replacement project, and never merge PR #4 without explicit owner instruction.

---

## 1. Product direction and immutable commercial rules

ImportVerifier is an **AI-assisted Product Compliance OS** for sellers, importers and ecommerce operators. The product accepts a catalogue, document, text or image and helps identify potentially applicable EU regulatory requirements, evidence already supplied, missing evidence, supplier requests, priority actions and the changing regulatory state of each saved product.

Commercial rules:

- Exactly **5 products free in total per account**.
- No card is required for the five-product trial.
- The allowance is lifetime/cumulative; it does not reset monthly.
- One public paid offer only: **ImportVerifier Unlimited · €9.95/month**.
- Internal plan ID `starter` remains for Stripe/database compatibility and must not leak as the public product name.
- Legacy plan IDs remain readable only for historical compatibility; they are not sold to new customers.
- Commercially Unlimited usage is still protected by reasonable technical anti-abuse/rate/file-size safeguards.

AI rules:

- End users see **ImportVerifier AI**, never provider/model names.
- Production cost policy is fail-closed `AI_COST_POLICY=free_only`.
- CSV/XLS/XLSX parsing stays local and AI-free.
- Supported text/document/image extraction may use free-compatible AI when configured.
- Unsupported scanned/legacy formats must fail honestly rather than silently spend through a premium fallback.

Legal/trust rules:

- ImportVerifier remains the identifiable issuer of its reports.
- Never claim EU/government certification, endorsement, approval or authorship unless it genuinely exists.
- Never declare a product compliant merely because fields are present or an AI response is confident.
- Keep supplied evidence, inference, uncertainty and verified official sources distinct.
- Strong institutional visual language is acceptable; fabricated authority is not.

---

## 2. Current system architecture

### 2.1 Web/runtime

- Next.js application deployed through Netlify.
- Responsive desktop/mobile/iPad web UX.
- PWA service worker and installability foundation.
- Private/authenticated content is deliberately excluded from persistent PWA caching.
- Public-shell cache requests omit credentials and refuse Cookie/Authorization-varying/private/no-store/no-cache responses.
- Service-worker visibility/online update failures are contained so Safari/iPadOS/offline transitions cannot create unhandled promise rejections.

### 2.2 Authentication and account lifecycle

- Supabase Auth.
- Email signup/login/reset/logout.
- Google OAuth UI/flow.
- Auth callback/confirmation origin handling is pinned to the canonical ImportVerifier origin in code.
- SDK-returned OAuth navigation is validated before browser navigation: exact configured Supabase origin and `/auth/v1/authorize` only; lookalikes, credentials, unsafe schemes, unexpected paths and nonstandard ports fail closed.
- Histories/data are account-isolated using RLS and authenticated ownership checks.
- Self-service account deletion revokes session/data and is billing-aware.

Remaining production console work for Auth is BLOCKED EXTERNAL and listed in the short handoff.

### 2.3 Product ingestion

Normalization boundary: `lib/product-ingestion.ts`.

Current input paths include:

- CSV/XLS/XLSX;
- text/JSON/RTF/MD;
- PDF/DOCX/ODT where local text extraction is supported;
- images/photos including PNG/JPEG/WebP/HEIC/HEIF;
- legacy `.doc` and scanned PDF without text fail honestly when no free-compatible path is available.

Mobile/camera behavior:

- Universal file picker remains broad and does **not** force camera capture.
- Separate image-only `capture="environment"` input exists for direct mobile/iPhone/iPad camera use.
- Both paths reuse the same `load()` pipeline, quota enforcement, idempotency and server-side binary validation.
- Blank or `application/octet-stream` iOS image MIME is accepted only when magic bytes and extension are consistent.
- Spoofed/disagreeing image type data fails closed.
- Camera/file-picker cancellation does not enter the import pipeline or consume quota.
- Multi-file drag/drop is rejected as a whole rather than silently processing only the first file.

### 2.4 Analysis and free allowance

- Product analysis is versioned and persisted privately.
- Creation has request idempotency for mobile/network retries.
- Lifetime free usage is enforced server/database-side, not just by UI.
- Production probe previously accepted products 1–5, rejected product 6 and rolled the probe back cleanly.
- Runtime client parsers validate quota, history, analysis detail/create and extracted-product payloads before React state updates.
- The free quota parser preserves `limit=5`, lifetime period and internally consistent used/remaining counts.

### 2.5 Billing

- Stripe Checkout + Customer Portal + signed webhook code exists.
- Canonical live public offer is Unlimited at EUR 9.95/month; live price recorded in short handoff.
- Checkout revalidates amount/currency/recurrence and only accepts internal `starter` for new purchases.
- Checkout and portal destination URLs are validated at the final browser navigation boundary against exact Stripe HTTPS hosts.
- Checkout return requires a structurally valid confirmation and does not expose raw parser/provider errors.
- Webhook ordering/idempotency and subscription synchronization are defended in code.
- Paid entitlement uses Unlimited semantics rather than historical public product caps.
- Trial exhaustion now presents a localized, high-intent but truthful continuation surface with concrete benefits, exact price/cadence and secure Stripe wording.

### 2.6 Regulatory engine

- EU is the only active market.
- US/CN/GB/JP architecture remains structurally present but inactive; do not imply live coverage.
- Deterministic/versioned EU regulatory engine produces:
  - candidate category;
  - confidence/uncertainty;
  - potentially applicable acts;
  - obligations;
  - evidence requests;
  - official-source references/URLs;
  - human-confirmation flags.
- Official/source URLs use explicit HTTPS host allowlists and reject credentials, lookalikes and non-default ports.
- Final React render and export boundaries revalidate source URLs.

### 2.7 Evidence Intelligence / Product Regulatory Twin

- Persisted evidence store is account-owned and RLS-protected.
- Evidence records support requirement key/status plus document/page/URL/note traceability.
- URLs are sanitized at persistence/API/render/export/AI-context boundaries.
- Client runtime validates evidence row IDs, product index, requirement key, status, bounded text fields and safe URL before state mutation.
- Malformed success responses cannot silently become trusted Evidence state.
- Regulatory Twin connects product, market/category/confidence, applicable rules, evidence, uncertainty, actions and regulatory impacts.
- Reports export the same traceability rather than creating a disconnected narrative.

### 2.8 ImportVerifier AI

- Authenticated `/api/regulatory-agent` is context-limited and source/evidence aware.
- The agent is instructed not to invent rules, certificates or lab results and not to declare certification/compliance.
- External AI calls have abort timeouts and safe configured-base-URL checks.
- Server-only AI telemetry avoids content/PII.
- User-facing client response handling requires safe object/string shapes and never renders raw provider error text.

### 2.9 Regulatory Impact Radar

- Persistent regulatory-change architecture, authenticated retrieval and product matching exist.
- Official ingestion normalizes/allowlists/deduplicates events and is protected by an internal secret.
- First real adapter consumes official EUR-Lex RSS feeds for Parliament/Council legislation, Commission proposals and OJ L acts.
- Keep `REGULATORY_RADAR_LIVE=false` until production has genuinely ingested official events. Last known persisted event count is 0.
- Do not claim live monitoring until the production secret/scheduler/ingestion has run successfully.

### 2.10 Marketplace connectors

Architecture exists for Shopify, Amazon and Etsy:

- common connector capability model;
- platform URL detection;
- catalogue/listing import/refresh/status-sync concepts.

OAuth/API implementations remain unavailable until legitimate official apps, credentials and scopes exist. Buttons must stay clearly inactive. Never scrape around official authentication.

---

## 3. Security/trust-boundary work completed

Do not repeat these sweeps unless a new code path is introduced:

- Site-origin/canonical-origin fail-closed validation.
- Stripe Checkout/Portal server and client navigation allowlists.
- Supabase OAuth browser-navigation allowlist.
- Dashboard 2xx runtime validation.
- Latest Regulatory Assessment 2xx runtime validation.
- Analysis Review Gate request-body runtime validation.
- Evidence GET/PUT runtime validation and optimistic rollback.
- Intelligence Suite history/detail/Evidence/Radar/AI response validation.
- Trial/Unlimited quota response validation.
- Raw API/provider error redaction on customer-facing surfaces.
- Oversized request 413 preservation on Analysis/Evidence/Product Extraction/AI/Radar surfaces where implemented.
- Internal Radar JSON content-type and body-size enforcement.
- Official regulatory/guidance URL allowlists and final render/export/AI-context sanitization.
- Account/RLS/privileged-table ownership hardening.
- PWA private-cache and cache-poisoning defenses.

When continuing the security sweep, only fix an actually discovered unvalidated surface; do not churn already-protected components.

---

## 4. Premium report system

`lib/export-pdf.ts` now implements the premium report direction rather than a raw export.

Completed:

- PDF-native geometric ImportVerifier brand mark; provisional `IV` monogram removed.
- Dark institutional cover with restrained purple/gold identity.
- Localized regulatory report classification.
- Executive metrics and clear section hierarchy.
- Red `VERIFIED` seal explicitly qualified as an **ImportVerifier review** in ES/EN/FR/DE/IT/PT.
- Branded page chrome on interior pages.
- Repeated footer with ImportVerifier issuer, EU regulatory context, traceability framing and pagination.
- Evidence/document/page/URL traceability preserved.
- Official-source references preserved.
- Independence notice and regulatory disclaimers preserved.
- Regression tests protect identity, footer, localization and traceability.

Country/ministry context rule:

- Do not infer a ministry/commerce authority from UI language alone.
- Add country-specific authority context only when country is reliably known and applicable logo/asset usage is permitted.
- If logo permission is uncertain, use the verified authority name and official source rather than copying a protected mark.

Excel remains the full data-oriented companion export, including evidence traceability.

---

## 5. Conversion/landing architecture

The public landing has completed a substantial truthful conversion pass:

- Five-product lifetime free entry is visible, with no card required.
- Exact Unlimited continuation price/cadence is visible.
- One paid plan only; no fake tier grid.
- Hero includes benefit/value proof and a large red `VERIFIED · ImportVerifier review` decorative mark.
- Commerce/payment/institutional visual marks are larger and responsive; explanatory compatibility/payment copy remains responsible for preventing implied partnerships or unsupported payment methods.
- Pricing emphasizes one plan/everything included.
- Trial-exhaustion upgrade surface explains retained value already experienced by the user.
- No fabricated scarcity, fake countdown, fake review/customer count, invented saving or false compliance claim is allowed.

### 5.1 Landing performance architecture — important

The landing page was converted from a page-wide client component to a **server-rendered page**:

- `app/page.tsx` is no longer `'use client'`.
- Native anchor links replace JavaScript `scrollIntoView` handlers.
- `components/LandingLanguagePicker.tsx` is the small dedicated client island for language changes.
- It writes the `iv_lang` cookie + existing localStorage preference before navigation so subsequent server HTML/metadata can follow the selected language.
- `lib/use-language.ts` no longer imports the large `landing-i18n` copy module into the root client provider.
- Server-rendering/performance regressions are covered by tests.

Reason: an older Netlify Lighthouse preview showed very poor performance despite strong accessibility. Do not optimize against that stale score; measure the current preview after this architecture change and target the actual remaining bottleneck.

---

## 6. Internationalization

Active customer language set:

- ES
- EN
- FR
- DE
- IT
- PT

Covered/actively maintained surfaces include landing, auth, dashboard, upload/extraction, billing, Evidence, Intelligence Suite, regulatory assessment, reports and account lifecycle.

Rules:

- Report language follows requested/current supported language.
- Language selection persists through `iv_lang` + localStorage.
- Do not infer geographic country/legal authority solely from language.
- Any new active customer-facing copy must ship in all six languages or have an explicit safe fallback.

---

## 7. Mobile/iPad/PWA acceptance standard

Already covered statically:

- safe-area handling;
- 44px/48px touch targets in key flows;
- iOS form sizing;
- review modal keyboard/scroll behavior;
- long filename wrapping;
- separate camera capture path;
- camera/picker cancel guard;
- HEIC/HEIF handling;
- multi-file drag/drop rejection;
- PDF/XLSX/template Blob URLs retained long enough for Safari/iPadOS save-to-Files behavior;
- PWA private-cache boundary;
- PWA update-failure containment.

Still required externally:

- real iPhone/iPad Safari camera return/cancel test;
- PWA install/update test;
- PDF/Excel save-to-Files/share test;
- rotation/safe-area visual check on physical devices.

Future native packaging direction remains Capacitor (iOS/iPadOS/Android) and Tauri (desktop), with backend business logic shared rather than forked.

---

## 8. Production services last known

Supabase project: `hfuwwjdcyudflamwwnon`.

Stripe:

- public product: ImportVerifier Unlimited;
- EUR 9.95/month;
- internal compatibility plan: `starter`;
- exact live price ID is recorded in `WORK-CHAT-CONTINUITY.md`.

Production caveats:

- Recent historical Auth logs still showed the obsolete euproductradar origin, so Supabase Site URL/redirect allowlist and/or Netlify higher-precedence env must be corrected and retested externally.
- Supabase leaked-password protection and desired CAPTCHA/signup-abuse controls require dashboard configuration.
- SMTP requires real production verification.
- SiliconFlow/free-only AI production variables require service configuration.
- Radar requires a strong shared ingestion secret and a successful real official-source ingestion before live claims.

These are BLOCKED EXTERNAL when console/browser credentials are unavailable. Skip them and continue code work rather than stopping.

---

## 9. Current release-quality verification model

Every functional head must pass:

1. `npm ci`
2. full `npm test`
3. `npm run typecheck`
4. `npm run build`
5. correct Netlify Deploy Preview on project **importverifier** at the exact head

Historical Netlify comments for project `euproductradar` are irrelevant to this product.

The short handoff records the exact latest verified CI/run/head and preview status. Do not copy an old successful run onto a newer head.

---

## 10. Final production acceptance journey

Do not call the product finished until a genuine fresh account completes this on `https://importverifier.netlify.app/`:

1. Localized landing renders current five-free + Unlimited offer.
2. Email registration/confirmation and Google login remain on canonical ImportVerifier domain.
3. Password reset works through production email.
4. Upload paths work for spreadsheet plus representative text/document/image input.
5. Extracted products can be reviewed before final analysis where applicable.
6. Exactly five free products are accepted lifetime.
7. Sixth free product is rejected without corrupting history/quota.
8. History is isolated to the account and persists across a new session.
9. ImportVerifier AI answers against the correct product/context without provider leakage.
10. Regulatory Twin/Evidence show saved traceability correctly.
11. Radar wording matches actual production ingestion state.
12. Premium localized PDF and Excel download successfully.
13. Upgrade uses exact Unlimited €9.95 monthly Stripe checkout.
14. Verified webhook activates entitlement.
15. Portal opens; cancellation retains access through paid period and expires correctly.
16. Second account cannot read first account analyses/evidence.
17. Account deletion removes/revokes expected data/session safely.
18. Desktop, iPhone, iPad and PWA flows pass.
19. Exact release head has green tests/typecheck/build and correct production deployment.

---

## 11. BLOCKED EXTERNAL bucket

Batch these for the owner/browser-enabled Work pass instead of interrupting code work:

- Supabase Auth Site URL + canonical redirect allowlist.
- Supabase leaked-password protection and CAPTCHA/signup abuse settings.
- Netlify production branch/env and production promotion.
- Netlify live Stripe webhook secret and other production secrets.
- Production SMTP sender/setup and non-owner email test.
- SiliconFlow/free-only AI credentials.
- Strong `REGULATORY_INGEST_SECRET` in GitHub/Netlify plus first real ingestion.
- Shopify/Amazon/Etsy official app/API credentials.
- Physical iPhone/iPad/Safari validation.

---

## 12. Remaining autonomous NEXT priorities

Do these without asking, while skipping BLOCKED EXTERNAL items:

1. Recheck exact current HEAD CI and correct importverifier Deploy Preview after every functional/docs batch; repair regressions immediately.
2. Measure current post-server-render landing performance/Web Vitals and optimize only verified bottlenecks.
3. Continue static mobile/iPad/PWA QA for export/share/camera edge states without duplicating completed tests.
4. Continue customer-facing API/link security sweep only where a genuinely unvalidated path is found.
5. Review report overflow/typography against real multi-product acceptance output and fix observed issues.
6. Keep Radar/AI/evidence failure modes fail-closed while production secrets are absent.
7. Once external canonical Auth wiring is corrected, run the full fresh-account five-product acceptance journey and prove history/PDF/XLSX/sixth-rejection end to end.

Keep this handoff architectural rather than chronological; keep exact operational state in `WORK-CHAT-CONTINUITY.md`.
