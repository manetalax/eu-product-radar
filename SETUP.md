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
- Mensual: 9,95 € / mes, con ImportVerifier AI.
- Anual: 89,95 € / año, con ImportVerifier AI.
- Lifetime: 299,95 € pago único, con ImportVerifier AI.
- Free: 5 productos acumulativos por cuenta, con ImportVerifier AI.
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

## Radar regulatorio y GitHub Actions

El workflow `ImportVerifier regulatory radar` necesita dos valores en los ajustes del repositorio GitHub (`Settings → Secrets and variables → Actions`):

- Variable `NEXT_PUBLIC_SITE_URL`: el origen HTTPS canónico de Sites, sin ruta ni barra final obligatoria.
- Secret `REGULATORY_INGEST_SECRET`: un valor aleatorio de al menos 32 caracteres.

En las variables de entorno de servidor de Sites configura también `REGULATORY_INGEST_SECRET` con el mismo valor y `REGULATORY_RADAR_LIVE=true`. Conserva configuradas las credenciales de Supabase de servidor. El endpoint valida el secreto de forma constante y el workflow muestra un error explícito si falta una variable o no tiene el formato esperado. No escribas el secreto en el repositorio ni en el código.

El workflow se ejecuta cada seis horas y también se puede iniciar manualmente desde GitHub Actions. Una ejecución correcta confirma que consultó EUR-Lex y guardó los eventos; tener la variable del workflow configurada por sí sola no activa la lectura del Radar en la aplicación.

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

ImportVerifier AI está disponible para las cuentas Free y para todas las modalidades de Unlimited, incluida Mensual, Anual, Lifetime y Personalizada. Free conserva el límite acumulativo de 5 productos; los pagos no alteran el acceso a IA. Para proteger el servicio, cada cuenta tiene un máximo de 10 consultas por hora.

La integración actual usa SiliconFlow para generación de texto y visión. Su oferta vigente incluye 1 USD en créditos iniciales y después cobra según consumo; por tanto, `AI_COST_POLICY=free_only` solo evita el fallback a OpenAI, pero no garantiza que SiliconFlow sea gratuito. Configura `SILICONFLOW_API_KEY` como secreto de servidor únicamente si se acepta ese modelo de costes y sus límites.

El acceso de los clientes a IA no tiene un suplemento ni exige un plan de pago. La aplicación debe fallar de forma explícita si un proveedor no está configurado o disponible; nunca simular un análisis exitoso. El proveedor de inferencia puede generar costes operativos para el servicio y debe tener límites de uso y presupuesto configurados.

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
