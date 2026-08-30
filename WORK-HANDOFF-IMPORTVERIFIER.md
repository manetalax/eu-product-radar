# ImportVerifier — release handoff for Work

Target production site: https://importverifier.netlify.app/

This branch is release-prep work for ImportVerifier only. Do not deploy changes to obsolete Product Radar instances.

## Already present in the ImportVerifier base

- Supabase authentication and private histories.
- Google OAuth UI/flow.
- CSV/XLS/XLSX import pipeline.
- PDF and Excel reports.
- Stripe Checkout, customer portal and signed webhooks in code.
- Free quota and paid-plan entitlement model.
- Self-service account deletion with session revocation and cascade deletion.
- Responsive/PWA foundation.
- Main UI translations in ES/EN/FR/DE/IT/PT.
- ImportVerifier/Import Rules Verifier branding foundation.

## Release blockers — execute in this order

### P0. Production wiring

1. Confirm Netlify production branch is the ImportVerifier branch and production URL is exactly `https://importverifier.netlify.app`.
2. Set `NEXT_PUBLIC_SITE_URL=https://importverifier.netlify.app` and verify all Supabase OAuth redirect URLs use this domain.
3. Verify Stripe environment variables and Price IDs for Starter, Growth, Pro and Business.
4. Verify Stripe webhook endpoint is production-safe, signature validation is mandatory and idempotency table is server-only.
5. Configure real SMTP sender/domain and test signup + password reset on a non-owner email.
6. Enable Supabase leaked-password protection and CAPTCHA/abuse controls appropriate for public signup.

### P0. End-to-end billing acceptance

Run with Stripe test mode first, then production configuration without making a live charge:

- Free user receives exactly 5-product quota.
- Checkout upgrades the correct authenticated user.
- Webhook changes entitlement only after verified Stripe state.
- Starter = 50 products/month.
- Growth = 150 products/month.
- Pro = 500 products/month.
- Business = 2,000 products/month.
- Customer portal opens for an authenticated subscriber.
- Cancellation keeps access through the paid period and revokes paid quota at the correct time.
- Failed/expired payment does not leave a paid entitlement indefinitely.
- Duplicate webhook delivery is idempotent.

### P0. Regulatory engine upgrade

Current scoring is a field-presence/readiness indicator, not a conformity determination. Replace it with a structured EU regulatory assessment while preserving historical rule versions.

Required output per product:

- identified product/category and confidence;
- applicable EU legislation/rule families;
- required documentation;
- required markings/labels/warnings;
- manufacturer/importer/responsible-person obligations as applicable;
- missing evidence vs supplied evidence;
- risk/priority with explicit reasons;
- official-source citations/URLs;
- uncertainty flags and items requiring human confirmation;
- disclaimer that ImportVerifier is an independent compliance-assistance tool and not an EU authority or legal certification.

Do not claim conformity from missing-field checks. Preserve versioned rule evaluation so old saved reports remain reproducible.

### P1. Universal product input

Use `lib/product-ingestion.ts` as the single normalization boundary. Add adapters for:

1. Spreadsheet (existing CSV/XLS/XLSX path).
2. Free text/pasted product list.
3. Documents (at minimum PDF, DOCX and plain text where technically supported).
4. Images/photos, including camera capture on mobile/tablet.

Every adapter must extract one or more product candidates and pass them through `normalizeExtractedProducts` before analysis/storage. Users must be able to review/edit detected products before consuming quota.

Safety/UX rules:

- never silently invent a product name when confidence is low;
- show extraction confidence/ambiguity;
- allow remove/edit/merge before analysis;
- quota is consumed only after user confirms analysis;
- reject unsupported/oversized inputs cleanly;
- keep uploaded customer material private and define retention/deletion behavior.

### P1. Authentication polish

- Verify Google login button includes the official Google mark and correct accessible labeling.
- Add Apple sign-in only after configuring the real Apple provider; do not show a dead button.
- Test signup, confirmation, login, logout, reset password, expired links and cancelled OAuth.
- Verify session isolation across two accounts.

### P1. Privacy / account lifecycle

- Verify account deletion in production: double confirmation, revoke sessions, delete owned data, return user to public state.
- Add/verify Privacy Policy, Terms, cookie/analytics disclosure if applicable, data retention statement and support/contact path.
- Ensure no `service_role`, Stripe secret, SMTP password or OAuth client secret is client-exposed or committed.

### P1. Internationalization

Audit every public and authenticated screen for ES/EN/FR/DE/IT/PT, including validation errors, billing states, report labels, account deletion, upload/extraction and transactional email templates. Reports should use the user's active/preferred language.

### P1. Final premium UX

- No empty dead-end dashboard states; provide a clear first action.
- Loading, success and error states for every async action.
- Mobile/iPad camera/upload flows usable with touch and safe areas.
- Accessible keyboard/focus behavior and contrast.
- Pricing must make quota, renewal and cancellation terms unambiguous.
- Show trust/security/payment marks only when factually applicable; no invented certification or EU affiliation.

## Security checks before release

Run Supabase security/performance advisors after final migrations. Current known item to resolve: leaked-password protection is disabled. `stripe_webhook_events` has RLS enabled with no client policies; keep it inaccessible to anon/authenticated clients if it is intentionally server-only.

## Required final acceptance journey

Complete this exact journey on `https://importverifier.netlify.app/`:

1. New visitor sees localized landing/pricing.
2. Register with email and separately with Google.
3. Confirm/recover credentials using real email delivery.
4. Import products through spreadsheet, text and image/document paths.
5. Review extracted products before analysis.
6. Run free analysis and verify quota.
7. Download localized PDF and Excel reports.
8. Re-open saved analysis from history after a new session.
9. Upgrade via Stripe test checkout and verify entitlement update.
10. Open billing portal and test cancellation lifecycle.
11. Verify a second account cannot access first account data.
12. Delete the test account and verify sessions/data are removed.
13. Test desktop, iPhone-size and iPad-size layouts.
14. Run automated tests and production build with zero release-blocking errors.

## Definition of done

Do not call ImportVerifier finished until the production journey above passes and the regulatory output provides category-specific, source-backed obligations rather than only missing-field scoring.
