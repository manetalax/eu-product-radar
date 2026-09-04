# ImportVerifier — configuración actual para Sites

Este documento define el estado operativo vigente. Si un documento histórico lo contradice, prevalece este archivo y `WORK-CHAT-CONTINUITY.md`.

## Proyecto canónico

- Frontend de producción: **Sites**
- Repositorio: `manetalax/eu-product-radar`
- Rama activa de trabajo: `feat/import-rules-verifier-branding`
- No crear ni restaurar despliegues Netlify, deploy previews o copias de producción anteriores.

`NEXT_PUBLIC_SITE_URL` debe ser el origen HTTPS canónico publicado por Sites. No se permite usar un dominio `*.netlify.app` como origen de producción.

## Oferta comercial vigente

- Prueba gratuita: 5 productos totales por cuenta.
- Mensual: 9,95 € / mes, **sin IA**.
- Anual: 89,95 € / año, **con IA**.
- Lifetime: 299,95 € pago único, **con IA**.
- Personalizada: 995,50 €, incluyendo personalización técnica de la plataforma, dominio, logo e integración de WhatsApp.

Los precios deben mostrarse con sus decimales exactos y con formato localizado.

## Variables de producción

Variables públicas principales:

```text
NEXT_PUBLIC_SITE_URL=<ORIGEN_HTTPS_DE_SITES>
NEXT_PUBLIC_SUPABASE_URL=<SUPABASE_URL>
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<SUPABASE_PUBLISHABLE_KEY>
```

Secretos de servidor principales:

```text
SUPABASE_SECRET_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_STARTER=...
STRIPE_PRICE_ANNUAL=...
STRIPE_PRICE_LIFETIME=...
SILICONFLOW_API_KEY=...
REGULATORY_INGEST_SECRET=...
```

Los secretos no se publican en GitHub ni se exponen al cliente.

## Supabase Auth y OAuth

Configura `Site URL` y redirects con el origen real de Sites:

```text
<ORIGEN_HTTPS_DE_SITES>/auth/callback
<ORIGEN_HTTPS_DE_SITES>/auth/confirm
<ORIGEN_HTTPS_DE_SITES>/reset-password
```

Elimina de las allowlists cualquier URL Netlify o preview antiguo que ya no se utilice. Google OAuth debe terminar siempre en el dominio canónico de Sites.

## Stripe

Los success/cancel URLs y webhooks deben usar el origen canónico de Sites. No debe quedar ningún endpoint de cobro apuntando a Netlify o a previews antiguos.

Antes de habilitar pagos reales, comprobar:

- prices live correctos para cada plan;
- webhook firmado y activo;
- datos legales obligatorios completos;
- retorno de Checkout al dominio de Sites;
- entitlement correcto después del pago.

## IA

La interfaz debe aplicar las reglas de plan:

- mensual: IA bloqueada/no incluida;
- anual y lifetime: IA habilitada;
- Personalizada: IA según la configuración comercial del servicio personalizado.

La aplicación debe fallar de forma explícita si un proveedor necesario no está configurado; nunca simular un análisis exitoso.

## Importación y dashboard

El dashboard está orientado a catálogos grandes. Debe conservar módulos plegables/configurables y vistas escalables para cientos o miles de productos, evitando renderizados interminables.

La entrada por URL debe comunicar una acción real y disponible: el usuario puede pegar una URL para conectar/importar, sin textos de “próximamente”.

## QA obligatorio antes de Sites

Ejecutar:

```bash
npm ci
npm test
npm run typecheck
npm run build
```

Y verificar en el dominio de Sites:

1. registro/login y recuperación;
2. importación de 5 productos y bloqueo correcto del 6.º gratuito;
3. historial privado por usuario;
4. exportación PDF y Excel;
5. planes y cobros;
6. reglas de acceso a IA por plan;
7. entrada por URL;
8. responsive en móvil, tablet y escritorio;
9. ausencia de enlaces, callbacks, assets o configuración Netlify;
10. ausencia de previews o copias legacy en el flujo de producción.

No se considera terminada una versión hasta que estas comprobaciones sean satisfactorias.
