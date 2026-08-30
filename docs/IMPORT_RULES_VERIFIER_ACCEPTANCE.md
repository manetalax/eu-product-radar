# Import Rules Verifier · acceptance

Before declaring the parallel deployment finished:

1. Build from `feat/import-rules-verifier-branding`.
2. Set `NEXT_PUBLIC_SITE_URL=https://importrulesverifier.netlify.app`.
3. Keep the original EU Product Radar deployment and PR #3 unchanged.
4. Confirm home, login, dashboard, account deletion and report flows load under the new hostname.
5. Confirm Google/Supabase redirect allowlists include the new hostname without removing the old one.
6. Run `npm test`, `npm run typecheck`, `npm run build` and `npm audit --omit=dev`.
7. Check desktop, iPad/tablet and mobile.
8. Verify title, Open Graph, PWA manifest, robots and sitemap show Import Rules Verifier and the new hostname.
