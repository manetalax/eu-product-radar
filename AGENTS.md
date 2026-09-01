<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos, the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# ImportVerifier execution standard

- Work autonomously through actionable project tasks instead of stopping after a single completed item.
- When a task requires owner credentials, browser access, external approval, legal identity data, or another human-only action, record it as `BLOCKED EXTERNAL` and immediately continue with another actionable task.
- Before ending a meaningful implementation pass, inspect tests/typecheck/build or the relevant CI, repair regressions when possible, and update `WORK-CHAT-CONTINUITY.md`.
- Read `WORK-CHAT-CONTINUITY.md` first, then `WORK-HANDOFF-IMPORTVERIFIER.md`, then the latest PR #4 HEAD/CI before substantial work. Do not repeat items marked DONE.
- Preserve the commercial invariant unless the owner explicitly changes it: exactly 5 product analyses free per account, lifetime/cumulative and without a card; afterwards there is one public entitlement, ImportVerifier Unlimited, available as EUR 9.95/month, EUR 89.95/year, or EUR 149 Lifetime one-time. The three purchase modalities unlock the same Unlimited product capability; they are not separate feature tiers.
- Treat monthly and annual as subscription entitlements. Treat Lifetime as a distinct persistent entitlement granted only by an authorized Stripe one-time Checkout for the canonical Lifetime price and revocable after a full refund. Historical one-time audit storage is not an entitlement source.
- Do not merge PR #4 without explicit owner instruction.

## Multidisciplinary product-company review model

For every substantial implementation pass, reason as a coordinated senior product-engineering organization rather than as a single specialty. Apply the relevant departments below to the changed surface and let each one challenge the work from its own discipline:

- **Product & strategy:** user value, scope, commercial coherence, activation, retention and unnecessary complexity.
- **UX & product design:** information hierarchy, clarity, accessibility, responsive/mobile/iPad behavior, interaction cost and visual consistency. Prefer simple, deliberate interfaces over decorative complexity.
- **Application engineering:** correctness, maintainability, typed contracts, state management, failure modes and upgrade-safe framework usage.
- **Architecture & platform:** boundaries, scalability, data ownership, idempotency, concurrency, observability and operational simplicity.
- **Security & privacy:** authentication, authorization, RLS, secrets, untrusted input, SSRF/XSS/injection, data minimization and fail-closed behavior.
- **Billing & revenue systems:** entitlement authority, payment lifecycle, retries, refunds/disputes, duplicate purchases, price integrity and customer-safe recovery.
- **AI & data:** grounding, prompt-injection resistance, provider privacy, cost policy, deterministic fallbacks, telemetry and data quality.
- **Regulatory & evidence:** truthful claims, provenance, uncertainty, official-source integrity and separation of evidence from inference.
- **QA & release engineering:** regression coverage, adversarial/edge cases, CI, exact-HEAD deploy status and reproducible acceptance criteria.
- **Performance & reliability:** measure before optimizing; inspect latency, bundle/resource cost, caching, offline behavior and graceful degradation using evidence rather than intuition.
- **Growth, SEO & localization:** discoverability, conversion friction, semantic metadata and complete ES/EN/FR/DE/IT/PT customer journeys without misleading claims.
- **Operations/SRE:** production configuration, monitoring signals, recovery paths, least-privilege service access and elimination of manual recurring work where safe.

A department review is not a requirement to manufacture changes. If a surface is already correct, leave it alone. Prioritize demonstrated defects, security/revenue risks, user-visible friction and measurable reliability improvements. Do not create speculative architecture merely to appear sophisticated.

When a department identifies a defect that can be corrected safely with the available repository/tool access, implement the correction and regression coverage in the same pass. When credentials or an external console are genuinely required, minimize owner work: discover and use connected tools first, prepare exact configuration/code beforehand, mark only the irreducible step `BLOCKED EXTERNAL`, and continue elsewhere.

Use ambitious product thinking while preserving disciplined engineering: pursue step-change improvements, but ship them through small verifiable changes; treat simplicity, coherence and craft as first-class requirements; and hold correctness, accessibility, privacy, reliability and testability to the standard expected of a mature global software product.
