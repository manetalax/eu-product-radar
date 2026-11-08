# Despliegue completo de ImportVerifier — Vercel

La aplicación completa es Next.js y requiere servidor. GitHub Pages solo puede servir la edición ligera que analiza archivos localmente; no puede sustituir cuentas, API, Supabase, IA remota, Radar ni pagos. El destino de producción solicitado es Vercel, conectado al repositorio `manetalax/eu-product-radar`. Postispop permanece en su propio repositorio y alojamiento.

## Estado de la migración

- El código completo y sus rutas de servidor están en este repositorio.
- El proyecto Supabase existente `EuProductRadar` (`hfuwwjdcyudflamwwnon`) fue reactivado y responde como `ACTIVE_HEALTHY`. Sus migraciones, tablas, cuentas, análisis y una suscripción existente siguen presentes; no se realizó ninguna migración ni cambio de datos.
- La cuenta Vercel disponible aún no tiene la conexión de GitHub que permite enlazar el repositorio. No publicar la edición estática como si fuera la aplicación completa.
- Mantener la URL canónica de producción que asigne Vercel en `NEXT_PUBLIC_SITE_URL`; no inventar ni reemplazar el dominio público hasta tenerlo confirmado.

## Configuración de Vercel

Crear/enlazar el proyecto al repositorio `manetalax/eu-product-radar` con la raíz del repositorio, framework Next.js y rama de producción `main`. Configurar las variables de producción desde la configuración segura de Vercel. No guardar secretos en GitHub, en el repositorio, en el cliente ni en esta documentación.

Variables necesarias, según `.env.production.example`:

- Públicas: `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
- Supabase servidor: `SUPABASE_SECRET_KEY`.
- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_STARTER`, `STRIPE_PRICE_ANNUAL`, `STRIPE_PRICE_LIFETIME`, `STRIPE_PRICE_CUSTOM`.
- Identidad legal requerida para cobrar: `LEGAL_PROVIDER_NAME`, `LEGAL_PROVIDER_ADDRESS`, `LEGAL_TAX_ID`, `LEGAL_JURISDICTION`, `LEGAL_REFUND_POLICY`.
- IA gratuita: `AI_COST_POLICY=free_only`, `SILICONFLOW_API_KEY`, `SILICONFLOW_BASE_URL=https://api.siliconflow.com/v1`, y los modelos configurados.
- Radar automático: `REGULATORY_INGEST_SECRET` (mínimo 32 caracteres), `REGULATORY_RADAR_LIVE=true` en el servidor y el mismo secreto en Actions. La agenda de GitHub ya ejecuta el endpoint seguro del servidor cada seis horas usando `NEXT_PUBLIC_SITE_URL` como variable de repositorio.
- Opcionales: `OPENAI_API_KEY`, `RESEND_API_KEY`, `NEXT_PUBLIC_POSTHOG_KEY` según las integraciones que ya se quieran conservar.

Los ID de precio canónicos están fijados en `lib/billing.ts` y validados por el gate de release. Mensual y anual siguen siendo suscripciones; Lifetime sigue siendo pago único. El checkout y el portal de clientes continúan usando la misma cuenta Stripe al configurar las credenciales live existentes.

## Mantener servicios y datos

El cambio de alojamiento no requiere crear una base ni migrar las tablas. Mantener la URL y la clave pública del proyecto Supabase existente y la clave secreta de servidor correspondiente. Conservar sus políticas RLS, Auth, migraciones, historial, cuotas, evidencias y entitlements.

Cuando Vercel asigne el dominio canónico:

1. Añadirlo a `NEXT_PUBLIC_SITE_URL` en los entornos de producción de Vercel.
2. Actualizar Supabase Auth: Site URL y allowlist para el dominio y las rutas `/auth/callback`, `/auth/confirm` y `/reset-password`; actualizar también el proveedor Google OAuth.
3. Actualizar el endpoint webhook de Stripe a `https://<dominio-canonico>/api/billing/webhook`, conservando los mismos productos y precios.
4. Configurar `vars.NEXT_PUBLIC_SITE_URL` en GitHub Actions con ese dominio y el secreto `REGULATORY_INGEST_SECRET` idéntico al del servidor.
5. No retirar ni redirigir el alojamiento anterior hasta comprobar el nuevo sitio completo con usuarios de prueba y las funciones antiguas.

## Aceptación de producción

El release se considera completo solo cuando el despliegue de `main` en Vercel queda READY con las variables requeridas y se comprueban en el dominio nuevo: registro e inicio de sesión, importación, historial Supabase, IA, Radar, informes PDF/XLSX, tres modalidades de pago Unlimited, personalización, portal de Stripe, retorno de Checkout, responsive y renovación/refund de entitlements. La edición de GitHub Pages no cuenta como despliegue de producción.
