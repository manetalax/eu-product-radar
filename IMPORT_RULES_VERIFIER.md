# ImportVerifier

ImportVerifier is the canonical product identity for the work in PR #4.

- Product: **ImportVerifier / Import Rules Verifier**
- Production URL: **https://importverifier.netlify.app**
- Repository: `manetalax/eu-product-radar`
- Branch: `feat/import-rules-verifier-branding`
- PR: `#4`
- Operational source of truth: `WORK-CHAT-CONTINUITY.md`

Do not create a replacement project, switch production back to the legacy EU Product Radar domain or merge PR #4 unless the owner explicitly asks.

## Commercial invariant

- Exactly **5 products free total per account**, without card or monthly reset.
- After the free allowance, the only public paid offer is **ImportVerifier Unlimited · 9,95 €/month**.
- `starter` remains an internal compatibility identifier only.

## Deployment

Production must use:

```text
NEXT_PUBLIC_SITE_URL=https://importverifier.netlify.app
```

Secrets for Supabase, Stripe, free-only AI, Radar and legal configuration belong only in deployment/provider environments and must never be committed.

## Auth configuration

Supabase Auth must use `https://importverifier.netlify.app` as Site URL and allow the canonical application callback, including:

```text
https://importverifier.netlify.app/auth/callback
```

Production Auth flows must not fall back to `euproductradar.netlify.app`. Google OAuth must return through the canonical Supabase callback and then to ImportVerifier.

For full current release blockers and acceptance steps, use `WORK-CHAT-CONTINUITY.md` and `SETUP.md`.
