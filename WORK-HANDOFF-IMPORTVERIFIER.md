# ImportVerifier — detailed architecture and release handoff

Production target: `https://importverifier.netlify.app/`

Repository: `manetalax/eu-product-radar`

Active PR: `#4` — **Import Rules Verifier · versión paralela basada en PR #3**

Active branch: `feat/import-rules-verifier-branding`

Always read `WORK-CHAT-CONTINUITY.md` first. It is the operational source of truth for exact HEAD, CI, Deploy Preview, blockers and immediate NEXT. Never create a replacement project and never merge PR #4 without explicit owner instruction.

---

## 1. Product and commercial invariants

ImportVerifier is an AI-assisted EU product-regulatory workflow for sellers, importers and ecommerce operators. It accepts catalogues, spreadsheets, documents, text and images; identifies candidate EU regulatory requirements; separates supplied evidence from inference; records missing evidence and supplier actions; and maintains product-level state through Regulatory Twin and Impact Radar architecture.

Commercial rules:

- Exactly **5 products free in total per account**, lifetime/cumulative, no monthly reset and no card.
- One paid feature entitlement: **ImportVerifier Unlimited**.
- Unlimited has three billing modalities with identical capabilities:
  - **EUR 9.95/month**.
  - **EUR 89.95/year**.
  - **EUR 149 Lifetime**, one-time.
- `starter` is only the internal compatibility plan ID.
- Monthly/annual are recurring subscriptions. Lifetime is persistent one-time access.
- Historical `growth`, `pro`, `business` and `one_time_audits` are compatibility/history only and are not sold.
- Unlimited remains subject to technical anti-abuse/rate/file-size safeguards; those safeguards are not marketed as a product quota.

Canonical live Stripe prices:

- Monthly: `price_1UAJy5HJnO8odw1Mn4jMVjFt`.
- Annual: `price_1UAjP0HJnO8odw1M7RBK8jsR`.
- Lifetime: `price_1UAjP8HJnO8odw1MmSXdkNIh`.

---

## 2. Billing and entitlement architecture

### Checkout

`lib/plans.ts` exposes one public Unlimited capability and three billing choices. `lib/billing.ts` maps each choice to the exact canonical Stripe price, amount, recurrence and Checkout mode.

Checkout requirements:

- Same-origin request + authenticated account.
- Only internal `starter` may create public paid access.
- Billing option must be `monthly`, `annual` or `lifetime`; missing legacy option maps to monthly.
- Small billing JSON requests are bounded to 4 KiB rather than inheriting the general API body ceiling.
- Production fails closed until truthful legal/provider configuration exists.
- Stripe price is re-read and must exactly match active EUR amount/type/recurrence.
- Monthly/annual use `subscription` mode and may use promotion codes.
- Lifetime uses `payment` mode, does not permit promotion codes and must later prove a genuinely paid PaymentIntent.
- Checkout/Portal navigation is restricted to trusted Stripe HTTPS destinations.

**Current-state Stripe preflight:** Supabase is treated as a billing projection, not sole authority. Before creating a new Checkout for a known Stripe customer, the server paginates the customer's current subscriptions directly from Stripe. Terminal `canceled`/`incomplete_expired` records are ignored. Abandoned `incomplete` subscriptions are canceled so they cannot remain payable beside a newer successful purchase. Any other current recurring subscription causes the user to be routed to Billing Portal instead of creating duplicate recurring value. This protects against delayed webhooks and stale local state.

Open Checkout sessions are also reconciled before creating a new one: only one payable ImportVerifier Checkout should remain open for an account, same-modality open Checkout can be reused, and switching modalities expires sibling open sessions. Idempotency generation prevents truly concurrent requests from creating multiple payable sessions.

### Subscription entitlement

- Signed webhook events are persisted idempotently.
- Production rejects non-live events before persistence/synchronization.
- Subscription events re-read the latest Stripe subscription.
- Exactly one subscription item and a recognized configured price are required.
- Persisted Stripe-customer ownership is authoritative over mutable metadata. An unknown customer ID cannot self-attach to a user through subscription metadata; conflicting metadata is rejected.
- `active`/`trialing` monthly or annual subscriptions grant the same Unlimited entitlement.
- Historical recurring plan IDs normalize to Unlimited while active; canceled/expired records fall back to free.
- Browser Checkout confirmation syncs the latest subscription but returns `confirmed: true` only when the Stripe subscription is actually `active` or `trialing`. Other states remain pending rather than generating a false success message.
- Browser confirmation derives monthly/annual from the current Stripe subscription item price after re-reading Stripe, not from mutable Checkout metadata.

### Billing Portal

Portal is a recurring-subscription management surface, not a generic customer page. Before creating a Portal session the server checks current Stripe subscriptions for the persisted customer. Lifetime-only customers without a current recurring subscription receive no subscription-management destination. Monthly/annual customers retain Portal access for cancellation and billing management.

### Webhook execution serialization

`stripe_webhook_events` is not only a deduplication ledger; its `processing`/`processed` state serializes event execution.

- A successfully completed event is acknowledged as an idempotent duplicate on later delivery.
- A duplicate delivery that finds a recent `processing` row **must not execute the handler in parallel** and returns non-2xx, preserving Stripe retry pressure in case the first worker crashes.
- A `processing` row older than five minutes is recoverable. The retry atomically claims it with a conditional `UPDATE ... status=processing AND updated_at < staleBefore`; only the retry that receives the claimed row continues.
- Handler failures leave the event recoverable rather than deleting the ledger row.
- This model prevents duplicate billing side effects while avoiding permanent loss of an event when a serverless invocation dies mid-handler.

### Lifetime entitlement

Stored in `public.unlimited_lifetime_entitlements` with forced RLS and account-owned authenticated read access.

A Lifetime grant requires:

- Checkout `mode=payment`.
- `payment_status=paid`.
- A PaymentIntent.
- Exactly one canonical Lifetime price.
- `plan_id=starter` + `billing_option=lifetime` metadata.
- Stripe customer ownership matching the persisted user.

`no_payment_required` never grants Lifetime. A fully refunded Lifetime payment is revoked. A dispute suspends access; a won dispute restores only if the current underlying Charge remains collected. Revoked same-payment replay cannot resurrect the entitlement. A delayed *different* Checkout cannot overwrite the payment identity of a newer active Lifetime entitlement; a genuinely new paid purchase can replace a revoked entitlement.

Production migration `unlimited_lifetime_entitlement` is applied to Supabase project `hfuwwjdcyudflamwwnon`, with forced RLS and own-row SELECT policy.

### Account deletion and billing safety

Account deletion is fail-closed around recurring billing. The local subscription row is used only to locate the Stripe customer. Before deleting Supabase identity/data, the server paginates **all** Stripe subscriptions for that customer and immediately cancels every cancellable non-terminal subscription. This prevents duplicate/historical subscriptions from surviving merely because the local one-row billing projection only knew about one subscription. If the Stripe customer/subscription is already absent (`resource_missing`), deletion can continue because no recurring Stripe object remains; other Stripe failures block deletion.

Lifetime is non-recurring and is removed through the account-owned cascade when the Auth user is deleted.

### Server-side Supabase privilege model

`createAdminClient()` uses the server-only Supabase secret and reaches PostgreSQL through PostgREST as the privileged service role. RLS alone does not replace SQL object privileges, so every internal object used by server code must explicitly retain the minimum privilege needed by that role while browser roles remain closed.

Production migrations `20260901090429` and `20260901090719` establish the required boundary:

- `consume_api_rate_limit(uuid,text,integer,integer)` is executable by `service_role` but not by `public`, `anon` or `authenticated`.
- `subscriptions`: `service_role` SELECT/INSERT/UPDATE.
- `unlimited_lifetime_entitlements`: `service_role` SELECT/INSERT/UPDATE; authenticated users retain only their RLS-filtered own-row read.
- `ai_usage_events`: `service_role` SELECT/INSERT only.
- `regulatory_change_events`: `service_role` SELECT/INSERT/UPDATE only.
- `stripe_webhook_events`: `service_role` SELECT/INSERT/UPDATE only.
- No DELETE privilege is granted to service_role for those internal tables by this repair, and internal telemetry/Radar/webhook tables remain unreadable to `anon`/`authenticated`.
- `api_rate_limits` remains accessed through the server-only SECURITY DEFINER RPC rather than broad direct table grants.

Do not add blanket grants to service_role or client roles. Add a privilege only when an actual server code path requires it and lock that requirement with a regression test.

---

## 3. Authentication and purchase continuity

- Supabase Auth: email signup/login/reset/logout and Google OAuth with visible Google identity.
- Password minimum: eight characters.
- Auth/OAuth destinations restricted to canonical ImportVerifier/Supabase origins.
- `plan=starter` and `billing=monthly|annual|lifetime` survive email and Google auth as a one-shot purchase intent.
- A fresh authenticated `plan_interest` user-metadata record can recover annual/Lifetime for the immediate post-auth Checkout when an older client omits the billing option. The metadata is strictly validated, expires after 15 minutes, explicit request billing is authoritative, and invalid/stale metadata falls back to monthly.
- Invalid billing values are discarded and consumed purchase intent cannot repeatedly reopen Checkout for an already-Unlimited user.
- Histories and account-owned records are isolated by RLS/ownership checks.
- Supabase leaked-password protection/CAPTCHA and genuinely fresh SMTP acceptance remain external acceptance tasks.

---

## 4. AI and ingestion

- Customer-facing name: **ImportVerifier AI**; never expose provider/model names.
- Production cost policy: fail-closed `AI_COST_POLICY=free_only`.
- CSV/XLS/XLSX parsing is local and AI-free.
- TXT/MD/JSON/RTF and text-layer PDF/DOCX/ODT use bounded local extraction before compatible AI structuring.
- PNG/JPEG/WebP/HEIC/HEIF use signature/MIME/extension agreement checks; iOS blank/octet-stream MIME is accepted only when signature + extension establish type.
- Legacy `.doc` and unsupported scanned-PDF paths fail honestly rather than silently spending premium AI.
- Uploaded material is untrusted data; embedded prompts/instructions cannot override extraction policy.
- External AI calls have timeouts and trusted destinations; telemetry excludes prompts, document/product content and customer PII.

---

## 5. Analysis, quota, Evidence and Regulatory Twin

- Analyses are private, versioned and request-idempotent for retries/races.
- Free lifetime quota is atomic server/database-side: exactly five products/account, never reset by date.
- Paid recurring or active Lifetime access does not mutate the historical free counter.
- Runtime API-shape validation occurs before client state mutation.
- Evidence records requirement status plus document/page/URL/note traceability and remains account-owned.
- Regulatory/evidence URLs are sanitized at persistence, API, render, export and AI-context boundaries.
- Regulatory Twin joins product identity/category confidence, candidate rules, evidence, uncertainty, actions and Radar impacts.

---

## 6. EU regulatory engine and Radar

EU is the only active market.

- Versioned deterministic EU engine produces candidate category, uncertainty, potentially applicable acts, obligations, evidence requests, official references and human-confirmation flags.
- Completeness/model confidence never equals certification or legal compliance.
- Radar has persisted event/matching architecture plus official EUR-Lex RSS ingestion.
- Official-source URLs use strict HTTPS allowlists.
- Radar publication is fail-closed: live flag + same strong shared ingest secret + persisted official events are required.
- Keep `REGULATORY_RADAR_LIVE=false` until real official ingestion succeeds.

---

## 7. Reports and exports

- Premium localized PDF/XLSX in ES/EN/FR/DE/IT/PT.
- Evidence, official-source traceability, uncertainty and non-certification framing are retained.
- PDF uses consulting-style cover/executive hierarchy/repeated issuer-regulatory footer/pagination.
- XLSX protects formula-looking customer strings as data.
- Filenames: `importverifier-<market>-<date>-<id>.<format>`.
- Downloads use delayed blob URL revocation for mobile/iPad Save-to-Files reliability.
- Real multi-product typography/overflow inspection remains a browser/device acceptance item.

---

## 8. Web, i18n, SEO, PWA and mobile

- Next.js on Netlify; static/server-first localized routes `/es`, `/en`, `/fr`, `/de`, `/it`, `/pt`.
- Localized SEO metadata, FAQ and Schema.org reflect the same three Unlimited billing choices.
- Pricing layout is 3 columns desktop / 2 tablet / 1 mobile.
- Checkout-return progress copy uses neutral **Unlimited access** wording so Lifetime is not mislabeled as a subscription.
- PWA caches only safe public shell/assets and refuses private/auth/no-store/cookie-varying responses.
- Any public navigation eligible for the shared offline shell is fetched with `credentials: 'omit'` before it can enter cache, preventing cookie-personalized content from being persisted if public pages later become personalized. Cache generation `importverifier-shell-v7` invalidates the older behavior.
- Locale-keyed PWA start/offline/shortcuts; service worker registration deferred outside critical rendering.
- Mobile/iPad safeguards cover camera input, file cancellation/multi-file, safe areas, touch sizing, iOS form zoom and export cleanup.
- Physical iPhone/iPad/Safari/PWA acceptance remains external.

Do not make speculative landing performance changes without detailed TTFB/LCP/TBT/CLS/resource-waterfall evidence.

---

## 9. Marketplace connectors

Shopify, Amazon and Etsy share prepared capability/catalog architecture. Direct OAuth/API stays inactive until legitimate official applications, credentials and scopes exist. Never scrape around authentication or imply active partnerships.

---

## 10. Release acceptance

Do not call ImportVerifier fully launched until the exact production candidate proves:

- Current GitHub release check passes install, full tests, typecheck and production build.
- Correct `importverifier` Netlify production deploy is green and release config passes.
- Fresh account: signup/login → five products accepted → sixth rejected → isolated history → PDF/XLSX.
- Monthly EUR 9.95 → live webhook → Unlimited → Portal/cancel.
- Annual EUR 89.95 equivalent lifecycle.
- Lifetime EUR 149 paid → persistent Unlimited → full-refund revoke → dispute suspension → won/non-refunded restoration; replay cannot resurrect revoked value.
- Historical audits grant no quota.
- Free-only AI has no premium-provider leakage.
- Legal/provider data and billing behavior are truthful.
- Radar claims match actual persisted official ingestion.
- Auth abuse controls + fresh SMTP acceptance pass.
- Desktop/iPhone/iPad/PWA real-device flows pass.

---

## 11. Current external blockers

- Final Netlify production environment/promotion with complete truthful legal/provider variables, runtime secrets and free-only AI values.
- Controlled real monthly/annual/Lifetime purchase/cancel/refund/dispute acceptance.
- Same strong `REGULATORY_INGEST_SECRET` in runtime/scheduler + first real official EUR-Lex ingestion.
- Supabase Auth leaked-password protection + appropriate CAPTCHA/signup-abuse controls.
- Production SMTP signup/reset with a genuinely fresh non-owner mailbox.
- Physical iPhone/iPad/Safari/PWA upload/photo/export/save-to-Files/rotation QA.
- Official Shopify/Amazon/Etsy applications/credentials/scopes.
- Detailed browser performance evidence and real multi-product PDF visual QA.
