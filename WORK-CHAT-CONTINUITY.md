# ImportVerifier — Chat ↔ Work continuity protocol

## Canonical project
- Production target: https://importverifier.netlify.app/
- Repository: `manetalax/eu-product-radar`
- PR: `#4`
- Branch: `feat/import-rules-verifier-branding`
- Never create a replacement project and never merge PR #4 unless the owner explicitly asks.

## Read order
1. This file — latest operational state and source of truth.
2. `WORK-HANDOFF-IMPORTVERIFIER.md` — detailed current architecture.
3. Latest PR #4 HEAD + exact-HEAD CI.
4. `AGENTS.md` — autonomous execution standard.

## Owner operating instruction
- Continue autonomously through all actionable work until the product is finished or only manual/external-input tasks remain.
- Never stop merely because one task is BLOCKED EXTERNAL; record it and immediately continue with another actionable item.
- Batch manual credentials/browser/device work for the end wherever possible.
- Before ending an execution, record exact HEAD/CI/preview state and leave a clear NEXT while unfinished.

## Commercial invariants
- Exactly **5 free products total per account**, no card and no monthly reset.
- After free allowance: only **ImportVerifier Unlimited · €9.95/month**.
- `starter` is only the internal compatibility ID for Unlimited.
- End users see **ImportVerifier AI**, never provider/model names.
- Production AI cost policy is fail-closed `AI_COST_POLICY=free_only`.
- Paid checkout remains fail-closed until truthful legal provider data exists.

## DONE — release-critical foundations
- Lifetime 5-product quota is enforced cumulatively in production by `free_account_usage`/`enforce_free_lifetime_product_quota`; a transactional production probe accepted five products, rejected the sixth and rolled back cleanly. Zero observed free accounts exceed five.
- Analysis creation is idempotent for mobile/network retries; duplicate `requestId` races recover the existing authenticated analysis without double-consuming quota.
- Public acceptance sample `public/importverifier-sample-5-products.csv` contains exactly five distinct EU products and is regression-tested.
- Stripe live canonical offer is `ImportVerifier Unlimited` at EUR 9.95/month (`price_1UAJy5HJnO8odw1Mn4jMVjFt`). Checkout revalidates price/currency/amount/month interval and only accepts internal `starter`.
- Checkout/portal server and client navigation are allowlisted to exact credential-free canonical Stripe HTTPS surfaces; lookalikes, wrong surfaces, ports and unsafe schemes fail closed.
- Checkout-return confirmation requires a structurally valid `confirmed === true`; raw parser/provider failures are not shown to customers.
- Dashboard billing, account, history, analysis-create/detail, extraction and quota success payloads pass runtime validation before state mutation.
- Latest Regulatory Assessment, Analysis Review Gate, Evidence, Intelligence Suite, Trial and Unlimited success payloads have dedicated runtime trust boundaries; malformed 2xx data fails closed.
- RLS/account isolation, evidence ownership, privileged-table deny-all posture and server-only privilege hardening are implemented.
- Evidence URLs are sanitized at persistence/API/render/export/AI-context boundaries; evidence supports document/page/URL/note traceability.
- Official Radar/regulatory/guidance URLs are HTTPS allowlisted and revalidated at ingestion/API/render/export/AI-context boundaries; credentials, lookalikes and non-default ports are rejected.
- Production AI policy is `free_only`; CSV/XLS/XLSX stay local, supported text/doc/image paths use free-compatible extraction when configured, and unsupported scanned/legacy formats fail honestly instead of leaking premium spend.
- External AI calls are bounded by abort timeouts; unsafe provider base URLs fail release/runtime validation; provider/model information is hidden from end users.
- Oversized request paths preserve HTTP 413 where implemented; internal Radar ingestion also requires JSON and protects its internal endpoint.
- Canonical site-origin validation is fail-closed and exact-origin protected.
- Supabase session refresh middleware covers authenticated client APIs while excluding Stripe webhook/internal endpoints.
- EU regulatory engine, Product Regulatory Twin, persisted Evidence and Regulatory Impact Radar architecture are implemented.
- Official EUR-Lex RSS adapter, normalization, deduplication and protected refresh/ingest endpoints exist. Radar live claims remain disabled while production event count is 0.
- Shopify/Amazon/Etsy connector architecture exists; OAuth/API remains unavailable until official credentials exist.
- Dashboard/auth/legal/intelligence/report surfaces are localized in ES/EN/FR/DE/IT/PT where customer-active.
- Google auth button includes a visible Google mark; production code pins Google/signup/recovery return flow to the canonical ImportVerifier domain.
- Supabase OAuth SDK-returned navigation is validated: exact configured Supabase origin + `/auth/v1/authorize`; remote HTTP, credentials, lookalikes, unexpected paths and nonstandard ports fail closed.
- PWA private-cache hardening, localized manifest, own-brand icons, safe areas, touch targets, iOS form sizing and modal keyboard/scroll behavior are covered.
- PWA public-shell precache uses credential-free fetches, refuses Cookie/Authorization/private/no-store/no-cache responses, prevents query-navigation cache poisoning and deletes only ImportVerifier caches.
- PWA visibility/online service-worker update failures are contained so Safari/iPadOS/offline transitions cannot create unhandled rejections.
- Upload UI supports spreadsheet/document/photo input and explicitly declares `.heic`, `.heif` and `image/*`.
- Image extraction identifies PNG/JPEG/WebP/HEIC/HEIF from binary signatures; blank/octet-stream iOS MIME is accepted only when signature/extension agree; spoofing fails closed.
- Multi-file drag/drop is rejected without processing or quota consumption.
- Dedicated mobile camera capture keeps the broad universal picker intact and adds separate image-only `capture="environment"`; both reuse the same secure load/quota/idempotency pipeline.
- Camera/file-picker cancellation is regression-tested to avoid entering the import pipeline; universal picker is regression-locked against forced capture.
- Mobile cards handle long filenames; PDF/XLSX/template Blob URLs use delayed revocation for Safari/iPadOS save-to-Files robustness.
- PDF/Excel reports include localized regulatory narrative, evidence and source traceability; spreadsheet user strings avoid formula injection.

## DONE — premium PDF + conversion pass (2026-08-31)
- **Premium PDF v2:** `lib/export-pdf.ts` now has a PDF-native geometric ImportVerifier brand mark instead of the provisional `IV` monogram, dark institutional cover, localized regulatory document classification, executive metrics, stronger section hierarchy and branded interior chrome.
- PDF red `VERIFIED` seal is explicitly localized as an **ImportVerifier review** mark; it does not claim EU/government certification.
- Every PDF page has restrained ImportVerifier issuer identity, EU regulatory-context/traceability footer and pagination; Evidence document/page/URL, official-source references, independence notice and regulatory disclaimers remain intact.
- Country/ministry context is intentionally **not inferred from language alone**. Add only when country and permitted authority/asset usage are reliable; otherwise use verified authority name/source rather than a logo.
- Landing hero now clearly communicates the truthful five-product lifetime free entry/no-card offer, exact Unlimited continuation and PDF+Excel value.
- Large responsive red `VERIFIED · ImportVerifier review` hero seal added as a decorative brand trust element, not certification.
- Commerce/payment/institutional marks have stronger responsive visual presence while explanatory compatibility/payment copy remains truthful; do not imply unsupported PayPal/payment methods or partnerships.
- Pricing reinforces one paid plan/everything included; no fake tier grid, fake scarcity, countdown, ratings/customer counts, invented savings or false compliance claims.
- Trial exhaustion now gives a high-intent localized upgrade surface with concrete value: Unlimited catalogue analysis, ImportVerifier AI + Regulatory Twin, PDF/Excel history/traceability and secure monthly Stripe wording.
- `REPORT-PREMIUM-TODO.md` now records completed premium work and only conditional/remaining polish.

## DONE — landing performance architecture (2026-08-31)
- Public `app/page.tsx` was converted from page-wide client rendering to an async server-rendered page.
- JavaScript `scrollIntoView` navigation was replaced by native anchors.
- Language switching is isolated to tiny `components/LandingLanguagePicker.tsx`; it persists `iv_lang` + existing localStorage preference before navigation.
- Root `LanguageProvider` no longer imports the ~44 KB landing-copy module into client runtime; it keeps a small supported-language tuple locally.
- Regression coverage locks server rendering, tiny language island, preference persistence and removal of client scroll handlers.
- This work targets the historically poor preview performance score; re-measure current exact preview before deciding the next optimization.

## Latest functional verification — 2026-08-31
- Exact functional head **`707bf9efb6e63919b0d6e84b3d7d57677d09b47a`** repaired the only regression from Premium PDF v2: an obsolete test still expected the removed `drawMonogram`; it now validates `drawBrandMark` + current hierarchy.
- GitHub `ImportVerifier release check` **#1209 SUCCESS** on exact functional head `707bf9ef...`: `npm ci`, full tests, `npm run typecheck` and `npm run build` all succeeded.
- Netlify bot confirms **Deploy Preview READY on the correct `importverifier` project for exact functional head `707bf9ef...`**: `https://deploy-preview-4--importverifier.netlify.app`.
- PR #4 remains **open, mergeable and not merged**.
- Documentation was updated after that functional head (`REPORT-PREMIUM-TODO.md`, refreshed long handoff, then this short handoff), creating a newer docs-only HEAD. Reconfirm exact newest docs HEAD CI/preview before relying on it as release head.

## Production facts last checked 2026-08-31
- Supabase project: `hfuwwjdcyudflamwwnon`.
- Free usage read-only check: maximum observed lifetime usage is 5 and zero accounts exceed 5.
- `subscriptions` had no persisted subscription rows at last read-only check.
- Historical recent Auth logs still showed requests/referers from `https://euproductradar.netlify.app/`; repository code is canonical, so Supabase Site URL/redirect allowlist and/or a higher-precedence Netlify environment override still require external correction and real retest.
- Supabase connector available in prior execution did not expose Auth Site URL/redirect writes: **BLOCKED EXTERNAL**.
- Supabase leaked-password protection remained disabled: **BLOCKED EXTERNAL** dashboard setting.
- Stripe live webhook exists on the canonical endpoint; matching live Netlify secret/config requires external verification.
- Radar persisted events remain 0; keep `REGULATORY_RADAR_LIVE=false` until official ingestion succeeds.

## IN PROGRESS / NEXT — execute without asking
1. Reconfirm the newest docs-only HEAD GitHub CI and correct `importverifier` Deploy Preview; repair any regression immediately.
2. Measure current post-server-render Deploy Preview performance/Web Vitals. Optimize only current verified bottlenecks; do not chase the stale historical Lighthouse score.
3. Continue static mobile/iPhone/iPad/PWA QA on export/share/save-to-Files and responsive premium-seal/report edge cases; physical-device validation remains external.
4. Continue customer-facing API/link trust-boundary sweep only if an actually unvalidated path is discovered; do not duplicate already-hardened Dashboard/Intelligence/Evidence/latest-assessment/review-gate/trial/Unlimited/Stripe/OAuth/source-URL work.
5. Review Premium PDF overflow/typography against real multi-product acceptance output and fix observed issues; do not add national-authority logos without reliable country + permitted usage.
6. Keep Radar/AI/Evidence failure states honest while production secrets/ingestion are absent.
7. After canonical Supabase/Netlify Auth wiring is corrected externally, run `/importverifier-sample-5-products.csv` through a genuinely new account and prove: canonical login → five accepted → sixth rejected → isolated history → PDF → Excel → Stripe/portal lifecycle.
8. Keep EU as the only active market; do not remove historical plan IDs/schema solely for naming cleanliness.

## BLOCKED EXTERNAL / browser or service-console work
- Supabase Auth: set Site URL to `https://importverifier.netlify.app` and canonical callback/redirect allowlist; retest Google login and Auth logs.
- Netlify: confirm production branch/env override, live `STRIPE_WEBHOOK_SECRET`, canonical Stripe env, SiliconFlow/free-only AI vars and truthful legal-provider variables; promote correct release when ready.
- Netlify + GitHub: configure the same strong `REGULATORY_INGEST_SECRET`; ingest real EUR-Lex events before enabling Radar live.
- Supabase Auth dashboard: enable leaked-password protection and suitable CAPTCHA/signup-abuse controls.
- Configure/test production SMTP/signup/reset with a non-owner email.
- Real iPhone/iPad/PWA upload/export/save-to-Files/rotation QA requires a real browser/device.
- Official Shopify/Amazon/Etsy apps and credentials are required before connectors can become active.

## Definition of finished
Do not call ImportVerifier finished until exact current CI is green; canonical Netlify production runs the intended release; a genuinely new user can complete login on the canonical domain and consume exactly five free products lifetime; sixth-product rejection is proven; history isolation and premium PDF/XLSX work end-to-end; production free-only AI works without premium leakage; legal/billing/webhook/portal/cancellation pass; Radar claims match real ingestion; inactive markets/connectors remain honest; and desktop/iPhone/iPad/PWA QA passes.
