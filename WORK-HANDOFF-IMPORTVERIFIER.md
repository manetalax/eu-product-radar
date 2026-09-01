# ImportVerifier — detailed architecture and release handoff

Production target: `https://importverifier.netlify.app/`

Repository: `manetalax/eu-product-radar`

Active PR: `#4` — **Import Rules Verifier · versión paralela basada en PR #3**

Active branch: `feat/import-rules-verifier-branding`

Always read `WORK-CHAT-CONTINUITY.md` first. It is the operational source of truth for exact HEAD, CI, Deploy Preview, blockers and immediate NEXT. This file describes durable architecture and acceptance requirements. Never create a replacement project, never deploy obsolete EU Product Radar instances, and never merge PR #4 without explicit owner instruction.

---

## 1. Product and commercial invariants

ImportVerifier is an AI-assisted product-regulatory workflow for EU sellers, importers and ecommerce operators. It accepts catalogues, spreadsheets, documents, text and images; identifies candidate EU regulatory requirements; separates supplied evidence from inference; records missing evidence and supplier actions; and keeps a product-level regulatory state through the Regulatory Twin and Impact Radar architecture.

Commercial rules:

- Exactly **5 products free in total per account**.
- The five-product allowance is lifetime/cumulative, never monthly, and requires no card.
- There is one paid product capability: **ImportVerifier Unlimited**.
- Unlimited has three purchase modalities with the same feature entitlement:
  - **Monthly: EUR 9.95/month**.
  - **Annual: EUR 89.95/year**.
  - **Lifetime: EUR 149 one-time**.
- `starter` remains the internal compatibility plan ID for the public Unlimited entitlement. It is not a customer-facing tier name.
- Monthly and annual are recurring Stripe subscription entitlements.
- Lifetime is a persistent one-time entitlement. It does not depend on an active subscription and must only be granted after a validated paid Stripe Lifetime Checkout; a full refund revokes it.
- Historical `growth`, `pro`, `business` and historical one-time audit storage remain readable only for compatibility/history. They are not sold to new customers. Historical `one_time_audits` never grant current entitlement.
- Unlimited remains commercially unlimited while retaining technical fair-use, abuse, rate and file-size safeguards.

Canonical Stripe live prices on product `ImportVerifier Unlimited`:

- Monthly: `price_1UAJy5HJnO8odw1Mn4jMVjFt` — EUR 9.95 recurring monthly.
- Annual: `price_1UAjP0HJnO8odw1M7RBK8jsR` — EUR 89.95 recurring yearly.
- Lifetime: `price_1UAjP8HJnO8odw1MmSXdkNIh` — EUR 149 one-time.

---

## 2. Billing and entitlement architecture

`lib/plans.ts` exposes one public Unlimited capability and three public billing offers. `lib/billing.ts` maps billing options to the exact canonical live Stripe prices, amounts, checkout modes and recurrence.

Checkout requirements:

- Same-origin + authenticated account required.
- Only internal purchase ID `starter` may create new public paid access.
- Billing option must be exactly `monthly`, `annual` or `lifetime`; legacy missing option means monthly for compatibility.
- Production checkout is fail-closed until required legal-provider configuration exists.
- Price is re-read from Stripe and must match the selected option’s exact active EUR amount and expected recurrence/type before Checkout opens.
- Monthly/annual use Checkout `subscription` mode and may use Stripe promotion codes.
- Lifetime uses Checkout `payment` mode and **does not allow promotion codes**. This prevents a 100% discount from creating irreversible permanent value without payment.
- Checkout navigation is validated against exact trusted Stripe hosts.
- Return URLs derive only from the validated configured site origin.
- Existing active Unlimited subscription routes to Stripe Customer Portal rather than opening duplicate recurring purchases.
- Existing active Lifetime rejects another Unlimited purchase.

Subscription entitlement:

- Signed Stripe webhook events are idempotently persisted.
- Production rejects non-live Stripe events before event persistence or entitlement synchronization.
- Subscription webhooks re-read current Stripe subscription state before persistence.
- Exactly one subscription item and a recognized configured price are required.
- Persisted Stripe customer ownership is authoritative over mutable metadata.
- Current active/trialing monthly or annual subscriptions grant the same Unlimited entitlement.
- Active historical subscription plan IDs normalize to Unlimited; canceled/expired legacy records fall back to free.

Lifetime entitlement:

- Stored separately in `public.unlimited_lifetime_entitlements` with RLS and account ownership.
- `syncLifetimeCheckoutSession` requires `mode=payment`, exact `payment_status=paid`, a non-null PaymentIntent, exactly one canonical Lifetime price, `starter` + `lifetime` metadata, a recognized Stripe customer and a user identity matching the persisted customer owner.
- `no_payment_required` is never an entitlement source and the webhook ignores such one-time Checkout states instead of retrying a grant that must fail.
- Synchronous Checkout confirmation and webhook processing share the same Lifetime synchronizer.
- Full Stripe refunds revoke the matching active Lifetime entitlement by payment-intent identity.
- The database quota trigger treats an active Lifetime record as paid Unlimited without mutating the five-product lifetime free counter.
- New Lifetime storage is distinct from the retired audit product. Do not reuse `one_time_audits` as an entitlement source.

Release safety:

- Production configuration must validate all three canonical Stripe prices, not only monthly.
- Monthly env: `STRIPE_PRICE_STARTER`.
- Annual env: `STRIPE_PRICE_ANNUAL`.
- Lifetime env: `STRIPE_PRICE_LIFETIME`.
- Production Stripe secret must be live and webhook secret valid.
- Payment configuration remains BLOCKED EXTERNAL until truthful legal-provider env values and production secret wiring are complete.

Authentication purchase continuity:

- `plan=starter` is the only public plan intent.
- The selected `billing` option survives email login, signup/confirmation and Google OAuth through the one-shot local purchase intent.
- Invalid billing query values are discarded rather than influencing Checkout.
- Purchase intent is consumed once and must not repeatedly reopen Checkout after a failure or for an already-Unlimited account.

---

## 3. AI and ingestion

- Customers see **ImportVerifier AI**, never provider/model names.
- Production cost policy is fail-closed `AI_COST_POLICY=free_only`.
- CSV/XLS/XLSX parsing remains local and AI-free.
- TXT/MD/JSON/RTF and text-layer PDF/DOCX/ODT use bounded local extraction before compatible AI processing.
- Images/photos include PNG/JPEG/WebP/HEIC/HEIF with signature/MIME/extension agreement checks; missing iOS MIME is accepted only when signature and extension establish the type.
- Legacy `.doc` and unsupported scanned PDF paths fail honestly rather than silently using paid AI.
- Uploaded text/document/image material is untrusted data. Instructions inside customer material cannot override extraction policy; prompts require grounded product facts only.
- External AI calls use bounded timeouts and validated provider destinations. Server telemetry excludes prompt/document/product content and customer PII.

---

## 4. Authentication and account lifecycle

- Supabase Auth supports email signup/login/reset/logout and Google OAuth with visible Google identity.
- Auth callback and browser navigation are restricted to canonical ImportVerifier and the configured canonical Supabase authorization endpoint.
- Password minimum is eight characters for new/reset passwords.
- Account histories are isolated through RLS/ownership checks.
- Account deletion is billing-aware and removes account-owned records through the intended lifecycle.
- Production Auth abuse controls, leaked-password protection/CAPTCHA and fresh SMTP acceptance remain external console/browser acceptance tasks.

---

## 5. Analysis, quota, Evidence and Regulatory Twin

- Product analyses are persisted privately and versioned.
- Creation is idempotent for mobile/network retries and duplicate races.
- The lifetime free quota is enforced database/server-side, atomically: exactly five products per account, never reset by date.
- Paid subscription or active Lifetime usage does not mutate the historical five-product free counter.
- Runtime parsers validate quota, history, details, evidence and extracted-product success payloads before client state mutation.
- Evidence is account-owned and records requirement key/status plus document/page/URL/note traceability.
- Evidence URLs and official regulatory URLs are sanitized at persistence, API, rendering, export and AI-context boundaries.
- The Regulatory Twin joins product identity, category/market confidence, applicable candidate rules, evidence, uncertainty, actions and Radar impacts. Reports export the same traceability rather than a disconnected narrative.

---

## 6. EU regulatory engine and Radar

EU is the only active market. Other market architecture may exist but must not be advertised as active coverage.

- The deterministic/versioned EU engine produces candidate category, uncertainty, potentially applicable acts, obligations, evidence requests, official-source references and human-confirmation flags.
- It never treats field completeness or model confidence as product certification/compliance.
- Regulatory Impact Radar has persisted event/matching architecture plus official EUR-Lex RSS ingestion.
- Official source URLs use explicit HTTPS allowlists.
- Radar publication is fail-closed: flag + strong shared ingest secret + persisted official events are required before the product may present monitoring as live.
- Production currently has no established persisted official event baseline in the handoff; keep Radar disabled until real official ingestion succeeds.

---

## 7. Reports and exports

- Premium PDF/XLSX reports use canonical ImportVerifier issuer identity and customer language ES/EN/FR/DE/IT/PT.
- Reports retain evidence and official-source traceability, uncertainty and non-certification framing.
- PDF has consulting-style cover, executive hierarchy, repeated issuer/regulatory context/footer and pagination.
- XLSX preserves localized visible surfaces, evidence worksheet, formulas/structure and protects formula-looking customer strings as data.
- Customer filenames use `importverifier-<market>-<date>-<id>.<format>`.
- Browser downloads preserve delayed blob URL revocation for mobile/iPad save-to-Files reliability.
- Final typography/overflow inspection still requires a real multi-product output in browser/device acceptance.

---

## 8. Web, i18n, SEO and PWA

- Next.js application deployed on Netlify.
- Public landing is server/static-first; `/es`, `/en`, `/fr`, `/de`, `/it`, `/pt` are statically generated.
- Root layout avoids request-time language APIs that would force dynamic public rendering.
- Localized SEO metadata is owned by static locale routes.
- Language selection is a small client island and preserves locale across navigation/auth.
- Public pricing now presents one Unlimited capability with **three localized payment cards**: monthly, annual and Lifetime. Annual is the visual value recommendation; no feature differences are invented between payment modalities.
- Each pricing CTA preserves `plan=starter`, the selected `billing=monthly|annual|lifetime`, and language through auth. FAQ and Schema.org offers publish the same three truthful prices.
- Pricing grid is responsive: three columns desktop, two tablet, one mobile; this avoids the obsolete five-plan layout on iPad/smaller screens.
- PWA registration is deferred outside the critical rendering window.
- Service worker only caches public safe shell/assets and refuses private/authenticated/no-store/cookie-varying responses.
- PWA start/offline/shortcuts are language-keyed.
- Mobile/iPad protections include camera flow, cancellation/multi-file safeguards, safe areas, touch sizing, iOS input zoom protection and safe export cleanup.
- Physical iPhone/iPad/Safari/PWA QA remains BLOCKED EXTERNAL.

Performance baseline:

- Netlify Lighthouse has remained approximately Performance 17 / Accessibility 100 / Best Practices 92 / SEO 100.
- Static landing/PWA architecture changes did not materially improve aggregate performance.
- Do not make speculative performance changes without TTFB/LCP/TBT/CLS and resource-waterfall evidence.

---

## 9. Marketplace connectors

Architecture exists for Shopify, Amazon and Etsy with a common capability model, URL detection and future catalog/listing refresh concepts. Direct OAuth/API integrations remain inactive until legitimate official credentials/scopes exist. Do not scrape around authentication or imply active partnerships.

---

## 10. Release acceptance

Do not call ImportVerifier fully launched until all of the following are true on the exact current production candidate:

- GitHub release check succeeds: install, full tests, typecheck and production build.
- Correct `importverifier` Netlify production deploy is green and production release guard passes.
- A genuinely fresh account proves signup/login, exactly five free products, sixth rejection, isolated history, PDF and XLSX.
- Monthly EUR 9.95 Checkout → live webhook → Unlimited → Portal/cancel lifecycle passes.
- Annual EUR 89.95 Checkout → live webhook → Unlimited → Portal/cancel lifecycle passes.
- Lifetime EUR 149 one-time **paid** Checkout → persistent Unlimited passes and a controlled full-refund test revokes it correctly.
- Historical audit rows demonstrably grant no quota.
- Free-only AI works without premium-provider leakage.
- Legal pages/provider details and billing behavior are truthful.
- Radar claims match actual official persisted ingestion.
- Auth abuse controls and fresh SMTP acceptance pass.
- Desktop, iPhone, iPad and PWA flows pass real-device QA.

---

## 11. BLOCKED EXTERNAL

- Netlify production env/branch/deploy promotion with real canonical Supabase keys, live Stripe secret/webhook/all three canonical prices, truthful legal-provider variables and SiliconFlow/free-only values.
- Applying/confirming the new Lifetime entitlement migration in production Supabase if not already applied.
- Same strong `REGULATORY_INGEST_SECRET` in runtime/scheduler + first real official EUR-Lex ingestion before Radar may be live.
- Supabase Auth leaked-password protection and appropriate CAPTCHA/signup-abuse controls.
- Production SMTP signup/reset acceptance with a genuinely fresh non-owner mailbox/browser flow.
- Physical iPhone/iPad/Safari/PWA photo/upload/export/save-to-Files/rotation validation.
- Official Shopify/Amazon/Etsy applications, credentials and scopes.
- Real production billing acceptance across monthly, annual, Lifetime, webhook, Portal/cancel and refund.
- Detailed browser performance evidence and real multi-product PDF visual QA.
