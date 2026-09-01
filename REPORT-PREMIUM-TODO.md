# ImportVerifier — Premium report design & conversion backlog

Queued by owner. This file now records both completed work and the remaining premium polish so future passes do not repeat finished tasks.

## PDF premium redesign

### DONE

- ImportVerifier identity is prominent on the report cover/header through a PDF-native geometric brand mark aligned with the product identity.
- Premium institutional/compliance visual system applied: dark cover, regulatory document classification, executive metrics, stronger hierarchy, section bands, page chrome and restrained accent system.
- Red `VERIFIED` decorative seal implemented as an explicit **ImportVerifier review** mark, localized ES/EN/FR/DE/IT/PT; it does not claim EU/government certification.
- Every page carries a restrained regulatory-context footer with ImportVerifier issuer identity, EU context, source/traceability framing and pagination.
- Existing evidence traceability, document/page/URL references, official-source URLs, regulatory disclaimers and export correctness remain preserved.
- Regression coverage locks report branding, geometric identity, repeated footer rendering, localization, source attribution, issuer identity and independence notice.

### REMAINING / CONDITIONAL

- Country-specific commerce/trade-authority context must only be added when the user's country is known independently from interface language and the correct authority plus permitted logo/asset usage can be determined reliably. **Do not infer a ministry from language alone.**
- Third-party institutional logos remain conditional on applicable trademark/logo rules. Where permission is uncertain, prefer authority name plus verified official-source reference rather than a logo.
- Continue visual QA against real multi-page reports after production acceptance data exists; adjust typography/overflow only from observed report issues, not speculative coordinate churn.

## Conversion marketing across the web

### DONE

- Landing hero now makes the five-product lifetime free entry explicit, no card required, and presents the single continuation offer `ImportVerifier Unlimited · €9.95/month` without fabricated urgency.
- Added a large red `VERIFIED · ImportVerifier review` seal to the hero as a brand/decorative trust device rather than a certification claim.
- Commerce/payment/institutional visual marks have stronger responsive presence while compatibility/payment notes remain truthful.
- Pricing hierarchy now reinforces one plan / everything included, with benefit-led Unlimited copy and clear price cadence.
- Trial exhaustion is a high-intent upgrade moment with concrete retained value: Unlimited catalogue analysis, ImportVerifier AI + Regulatory Twin, PDF/Excel history/traceability and secure monthly Stripe checkout.
- Conversion remains ethical: no fabricated scarcity, countdowns, fake customer counts/reviews, invented savings or false regulatory claims.
- Active marketing additions are localized ES/EN/FR/DE/IT/PT and responsive for mobile/iPad.
- Regression coverage protects five-product trial claims, single-plan continuation, review-seal wording, high-intent upgrade value proof and mobile treatment.

### PERFORMANCE PASS DONE

- Public landing was converted from a page-wide client component to a server-rendered page.
- Smooth-scroll JavaScript handlers were replaced by native anchor navigation.
- Language switching is isolated to a tiny client island that persists `iv_lang`/localStorage before navigation.
- Root language provider no longer imports the large landing copy bundle into client runtime.
- CI/test coverage locks the server-rendered landing architecture.

## Remaining conversion polish

- Measure the current exact Deploy Preview with Lighthouse/Web Vitals after the server-rendering refactor; optimize only current bottlenecks rather than the stale historical score.
- During production acceptance, verify that report-download/completed-analysis moments do not need an additional non-obstructive Unlimited prompt beyond the existing trial-exhaustion surface.
- Preserve cancellation/price/recurrence clarity and Stripe fail-closed safeguards in every future marketing change.

## Acceptance target

The web and PDF should communicate the confidence, precision and polish of a top-tier compliance product. A user should quickly understand the regulatory risk being reduced, the value already delivered by the free analysis, and why Unlimited is the natural continuation, while all commercial and regulatory claims remain accurate.
