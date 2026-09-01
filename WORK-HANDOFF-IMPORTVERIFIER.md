# ImportVerifier — detailed architecture and release handoff

Production target: `https://importverifier.netlify.app/`

Repository: `manetalax/eu-product-radar`

Active PR: `#4` — **Import Rules Verifier · versión paralela basada en PR #3**

Active branch: `feat/import-rules-verifier-branding`

Always read `WORK-CHAT-CONTINUITY.md` first. It is the operational source of truth for exact HEAD, CI, Deploy Preview, blockers and immediate NEXT. This file describes durable architecture and acceptance requirements. Never create a replacement project, never deploy obsolete EU Product Radar instances, and never merge PR #4 without explicit owner instruction.

---

## 1. Product and commercial invariants

ImportVerifier is an AI-assisted product-regulatory workflow for EU sellers, importers and ecommerce operators. It accepts catalogues, spreadsheets, documents, text and images; identifies candidate EU regulatory requirements; separates supplied evidence from inference; records missing evidence and supplier actions; and keeps product-level regulatory state through the Regulatory Twin and Impact Radar architecture.

Commercial rules:

- Exactly **5 products free in total per account**, lifetime/cumulative, no monthly reset and no card.
- There is one paid feature entitlement: **ImportVerifier Unlimited**.
- Unlimited has three billing modalities with identical product capability:
  - **Monthly: EUR 9.95/month**.
  - **Annual: EUR 89.95/year**.
  - **Lifetime: EUR 149 one-time**.
- `starter` remains the internal compatibility plan ID; it is never a public tier name.
- Monthly and annual are recurring subscription entitlements.
- Lifetime is a persistent one-time entitlement and must originate only from a canonical paid Stripe Checkout. A full refund or active/lost dispute revokes/suspends access; a won dispute may restore it only while the underlying charge remains collected.
- Historical `growth`, `pro`, `business` and `one_time_audits` remain compatibility/history only and are not sold. Historical audit records never grant entitlement.
- Unlimited is commercially unlimited while retaining reasonable anti-abuse, rate and file-size safeguards.

Canonical Stripe live prices on `ImportVerifier Unlimited`:

- Monthly: `price_1UAJy5HJnO8odw1Mn4jMVjFt`.
- Annual: `price_1UAjP0HJnO8odw1M7RBK8jsR`.
- Lifetime: `price_1UAjP8HJnO8odw1MmSXdkNIh`.

---

## 2. Billing and entitlement architecture

`lib/plans.ts` exposes one public Unlimited capability and three public billing offers. `lib/billing.ts` maps billing options to exact canonical live Stripe prices, amounts, checkout modes and recurrence.

Checkout requirements:

- Same-origin and authenticated account required.
- Only internal `starter` may create new public paid access.
- Billing option must be `monthly`, `annual` or `lifetime`; legacy missing option maps to monthly for compatibility.
- Production Checkout fails closed until required legal-provider configuration exists.
- Stripe price is re-read and must exactly match the selected active EUR amount/type/recurrence.
- Monthly/annual use Checkout `subscription` mode and may use promotion codes.
- Lifetime uses `payment` mode, requires an actually paid Checkout + PaymentIntent and does **not** allow promotion codes, preventing zero-charge permanent value.
- Checkout/Portal browser destinations are restricted to trusted Stripe HTTPS hosts and return URLs derive from the validated site origin.
- Existing active recurring Unlimited routes to Customer Portal; existing active Lifetime cannot buy duplicate Unlimited.

Subscription entitlement:

- Signed webhook events are idempotently persisted.
- Production rejects non-live Stripe events before persistence/synchronization.
- Subscription events re-read the current Stripe subscription instead of trusting stale event snapshots.
- Exactly one subscription item and a recognized configured price are required.
- Persisted Stripe customer ownership is authoritative over mutable metadata.
- Active/trialing monthly or annual subscriptions grant the same Unlimited entitlement.
- Active historical subscription plan IDs normalize to Unlimited; canceled/expired records fall back to free.

Lifetime entitlement:

- Stored in `public.unlimited_lifetime_entitlements` with forced RLS and account-owned authenticated read access.
- `syncLifetimeCheckoutSession` requires `mode=payment`, `payment_status=paid`, a PaymentIntent, exactly one canonical Lifetime price, `starter` + `lifetime` metadata and Stripe customer ownership matching the persisted user.
- `no_payment_required` is never an entitlement source.
- The same Lifetime payment cannot be resurrected after refund/dispute revocation: if its Checkout session or PaymentIntent already maps to a revoked entitlement, synchronization returns a no-op rather than reactivating it.
- The browser confirmation endpoint treats that no-op as unconfirmed and fails closed with a conflict response. Webhook processing can still mark a stale/replayed event processed instead of entering an endless 503 retry loop.
- Full `charge.refunded` revokes the matching Lifetime entitlement by PaymentIntent identity.
- `charge.dispute.created` immediately suspends Lifetime access by revoking the matching PaymentIntent entitlement.
- `charge.dispute.closed` restores only when Stripe reports `won` **and** the latest Charge is not fully refunded; all other closed outcomes remain revoked.
- Dispute handling re-reads the current Charge before changing entitlement state.
- The production Stripe webhook endpoint is configured for Checkout/subscription events plus `charge.refunded`, `charge.dispute.created` and `charge.dispute.closed`.
- The quota trigger treats active Lifetime as paid Unlimited without mutating the historical five-product free counter.
- Never reuse historical `one_time_audits` as an entitlement source.

Production database status established 2026-09-01:

- Migration `unlimited_lifetime_entitlement` is applied to Supabase project `hfuwwjdcyudflamwwnon`.
- Table exists with RLS enabled + forced and exactly one own-row SELECT policy.
- Entitlement row count was 0 immediately after migration, which is the expected pre-sale baseline.

Release safety:

- Production configuration validates all three canonical Stripe prices.
- `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_ANNUAL`, `STRIPE_PRICE_LIFETIME` must match the canonical prices above.
- Production Stripe secret must be live and webhook secret valid.
- Billing still fails closed when truthful legal-provider variables are incomplete.

Authentication purchase continuity:

- `plan=starter` is the only public plan intent.
- `billing=monthly|annual|lifetime` survives email login/signup/confirmation and Google OAuth using a one-shot local purchase intent.
- Invalid billing query values are discarded.
- Purchase intent is consumed once and never repeatedly reopens Checkout for an already-Unlimited account.

---

## 3. AI and ingestion

- Customers see **ImportVerifier AI**, never provider/model names.
- Production cost policy is fail-closed `AI_COST_POLICY=free_only`.
- CSV/XLS/XLSX parsing is local and AI-free.
- TXT/MD/JSON/RTF and text-layer PDF/DOCX/ODT use bounded local extraction before compatible AI processing.
- PNG/JPEG/WebP/HEIC/HEIF input uses signature/MIME/extension agreement checks; missing iOS MIME is accepted only when signature + extension establish the type.
- Legacy `.doc` and unsupported scanned PDF paths fail honestly rather than silently using paid AI.
- Uploaded material is untrusted data: instructions inside files cannot override extraction policy and prompts require grounded product facts only.
- External AI calls use timeouts and validated destinations; server telemetry excludes prompts/documents/product content and customer PII.

---

## 4. Authentication and account lifecycle

- Supabase Auth supports email signup/login/reset/logout and Google OAuth with visible Google identity.
- Auth callback/browser navigation is restricted to canonical ImportVerifier and the configured Supabase authorization endpoint.
- Password minimum is eight characters for new/reset passwords.
- Histories are account-isolated through RLS/ownership checks.
- Account deletion cancels any remaining recurring Stripe subscription before deletion and invokes the authenticated deletion lifecycle. Lifetime records reference `auth.users(id) on delete cascade`, so account deletion removes the non-recurring entitlement without leaving a background recurring charge.
- Supabase leaked-password protection/CAPTCHA and fresh SMTP acceptance remain external console/browser acceptance tasks.

---

## 5. Analysis, quota, Evidence and Regulatory Twin

- Analyses are private, versioned and request-idempotent for mobile/network retries and duplicate races.
- Lifetime free quota is enforced atomically database/server-side: exactly five products/account, never reset by date.
- Paid subscription or active Lifetime access does not mutate the historical free counter.
- Runtime parsers validate quota/history/details/evidence/extracted-product responses before client state mutation.
- Evidence is account-owned and records requirement key/status plus document/page/URL/note traceability.
- Evidence and official regulatory URLs are sanitized at persistence, API, render, export and AI-context boundaries.
- Regulatory Twin joins product identity, category/market confidence, candidate rules, evidence, uncertainty, actions and Radar impacts.

---

## 6. EU regulatory engine and Radar

EU is the only active market. Other market architecture may exist but must not be advertised as active.

- Versioned deterministic EU engine produces candidate category, uncertainty, potentially applicable acts, obligations, evidence requests, official references and human-confirmation flags.
- It never equates field completeness/model confidence with certification or compliance.
- Radar has persisted event/matching architecture plus official EUR-Lex RSS ingestion.
- Official-source URLs use strict HTTPS allowlists.
- Radar publication is fail-closed: live flag + strong shared ingest secret + persisted official events are required before monitoring may be presented as live.
- Keep Radar disabled until real official ingestion succeeds.

---

## 7. Reports and exports

- Premium PDF/XLSX reports use canonical ImportVerifier issuer identity and ES/EN/FR/DE/IT/PT customer language.
- Reports retain evidence, official-source traceability, uncertainty and non-certification framing.
- PDF has consulting-style cover/executive hierarchy/repeated issuer-regulatory footer/pagination.
- XLSX preserves localized surfaces/evidence worksheet and protects formula-looking customer strings as data.
- Filenames use `importverifier-<market>-<date>-<id>.<format>`.
- Downloads use delayed blob URL revocation for mobile/iPad save-to-Files reliability.
- Final typography/overflow inspection still needs a real multi-product browser/device output.

---

## 8. Web, i18n, SEO and PWA

- Next.js on Netlify; landing is server/static-first with `/es`, `/en`, `/fr`, `/de`, `/it`, `/pt` statically generated.
- Root layout avoids request-time language APIs that force dynamic public rendering.
- Locale routes own localized SEO metadata; language selection is a small client island.
- Pricing presents one Unlimited capability with three payment cards. Annual is value-emphasized without inventing feature differences.
- Every CTA preserves `plan=starter`, selected billing option and language through auth; FAQ and Schema.org expose the same truthful offers.
- Pricing is 3 columns desktop / 2 tablet / 1 mobile.
- PWA service worker only caches safe public shell/assets and refuses private/auth/no-store/cookie-varying responses.
- PWA start/offline/shortcuts are locale-keyed; registration is deferred outside the critical rendering window.
- Mobile/iPad safeguards cover camera input, cancellation/multi-file, safe areas, touch sizing, iOS form zoom and export cleanup.
- Physical iPhone/iPad/Safari/PWA QA remains external.

Performance baseline remains approximately Performance 17 / Accessibility 100 / Best Practices 92 / SEO 100. Do not change landing architecture speculatively without TTFB/LCP/TBT/CLS/resource-waterfall evidence.

---

## 9. Marketplace connectors

Shopify, Amazon and Etsy share a prepared capability/URL/catalog architecture. Direct OAuth/API remains inactive until legitimate official applications, credentials and scopes exist. Never scrape around authentication or imply active partnerships.

---

## 10. Release acceptance

Do not call ImportVerifier fully launched until the exact production candidate satisfies all of the following:

- GitHub release check passes install, full tests, typecheck and production build.
- Correct `importverifier` Netlify production deploy is green and release guard passes.
- Fresh account proves signup/login → exactly five free products → sixth rejection → isolated history → PDF/XLSX.
- Monthly EUR 9.95 Checkout → live webhook → Unlimited → Portal/cancel passes.
- Annual EUR 89.95 equivalent lifecycle passes.
- Lifetime EUR 149 **paid** Checkout → persistent Unlimited passes; controlled full refund revokes it; dispute-created suspends it; won dispute restores only non-refunded value; replay cannot resurrect a revoked payment.
- Historical audits grant no quota.
- Free-only AI has no premium-provider leakage.
- Legal/provider data and billing behavior are truthful.
- Radar claims match actual persisted official ingestion.
- Auth abuse controls + fresh SMTP acceptance pass.
- Desktop/iPhone/iPad/PWA real-device flows pass.

---

## 11. Current external blockers

- Final Netlify production environment/promotion with complete truthful legal-provider variables, canonical service secrets and free-only AI values.
- Real production monthly/annual/Lifetime purchase/cancel/refund/dispute acceptance with controlled test transactions.
- Same strong `REGULATORY_INGEST_SECRET` in runtime/scheduler + first real official EUR-Lex ingestion.
- Supabase Auth leaked-password protection + appropriate CAPTCHA/signup-abuse controls.
- Production SMTP signup/reset with a genuinely fresh non-owner mailbox.
- Physical iPhone/iPad/Safari/PWA upload/photo/export/save-to-Files/rotation QA.
- Official Shopify/Amazon/Etsy applications/credentials/scopes.
- Detailed browser performance evidence and real multi-product PDF visual QA.
