# Import Rules Verifier

Parallel product identity based on the exact HEAD of PR #3 (`64821798bfd335e9670dce43bd9cc361cbd86cdf`).

- Product: **Import Rules Verifier**
- Target URL: **https://importverifier.netlify.app**
- Source branch: `feat/import-rules-verifier-branding`
- Original `feat/account-deletion-security` remains untouched.

## Deployment variables

Set `NEXT_PUBLIC_SITE_URL=https://importverifier.netlify.app` in the parallel Netlify site. Preserve the same required Supabase/Stripe/provider variables as the source deployment, using secrets only in the deployment environment.

## External configuration checklist

For the parallel deployment, add `https://importverifier.netlify.app/auth/callback` and the required password-confirm/reset callback paths to the authorized redirect URLs in Supabase/Google OAuth. Do not remove the existing EU Product Radar URLs while both products remain active.
