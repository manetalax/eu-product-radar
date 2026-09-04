# Despliegue de ImportVerifier — Sites

**Destino de frontend válido: Sites únicamente.**

GitHub mantiene el código fuente y el historial. No se deben crear, restaurar ni utilizar despliegues Netlify, deploy previews ni copias de producción anteriores.

## Variables de publicación

Configura en el entorno de Sites las variables públicas y secretos necesarios para la aplicación. `NEXT_PUBLIC_SITE_URL` debe contener el origen HTTPS canónico que Sites esté publicando para ImportVerifier.

Variables públicas principales:

- `NEXT_PUBLIC_SITE_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

Secretos de servidor principales:

- `SUPABASE_SECRET_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_STARTER`
- `STRIPE_PRICE_ANNUAL`
- `STRIPE_PRICE_LIFETIME`
- credenciales de IA y servicios internos que correspondan

Los secretos nunca deben almacenarse en el repositorio ni exponerse al cliente.

## URLs externas

Supabase Auth, Google OAuth, Stripe webhooks y cualquier otro proveedor externo deben usar exclusivamente el dominio HTTPS canónico de Sites y sus rutas reales (`/auth/callback`, `/auth/confirm`, `/reset-password`, APIs de billing, etc.). Elimina de sus allowlists cualquier URL de preview o dominio legacy cuando ya no sea necesaria.

## Criterio de publicación

Antes de publicar una nueva versión en Sites:

1. `npm test`
2. `npm run typecheck`
3. `npm run build`
4. comprobar login, importación, historial, exportaciones y cobros en el dominio de Sites
5. comprobar responsive en móvil, tablet y escritorio
6. confirmar que no quedan referencias activas a Netlify ni a previews antiguos

No se considera una versión lista si cualquiera de estas comprobaciones falla.
