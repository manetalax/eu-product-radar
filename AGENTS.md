<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

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
