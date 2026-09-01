# Deploy paralelo en Netlify

Crear un sitio Netlify independiente conectado a este repositorio y fijar la rama de producción a `feat/import-rules-verifier-branding`.

Nombre del sitio: `importverifier`.

URL objetivo: `https://importverifier.netlify.app`.

Variables públicas: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

Secretos solo en Netlify: `SUPABASE_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` y los cuatro identificadores `STRIPE_PRICE_*` de `.env.example`. No pegarlos en el repositorio ni en conversaciones.

Antes del despliegue, aplicar `supabase/migrations/202608300001_stripe_subscriptions.sql`. En Stripe, crear los cuatro precios mensuales, activar el portal de cliente y registrar `https://importverifier.netlify.app/api/billing/webhook` para `checkout.session.completed` y `customer.subscription.created`, `customer.subscription.updated` y `customer.subscription.deleted`.

OAuth/Auth: añadir el nuevo dominio y callbacks a las allowlists de Supabase y Google sin borrar las URLs de EU Product Radar.
