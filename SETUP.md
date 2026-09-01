# ImportVerifier — configuración y prueba de producción

Este documento describe la activación actual de **ImportVerifier**. Para el estado operativo más reciente lee primero `WORK-CHAT-CONTINUITY.md`; si algún documento histórico lo contradice, prevalece ese handoff.

## Proyecto canónico

- Producción: `https://importverifier.netlify.app`
- Repositorio: `manetalax/eu-product-radar`
- Rama de trabajo: `feat/import-rules-verifier-branding`
- PR: `#4`
- Supabase: proyecto `hfuwwjdcyudflamwwnon`
- No hacer merge del PR #4 sin instrucción explícita del propietario.

## Oferta que debe conservarse

- **5 productos gratuitos totales por cuenta**, sin tarjeta y sin reinicio mensual.
- Después de consumirlos, único plan público: **ImportVerifier Unlimited · 9,95 €/mes**.
- `starter` existe solo como identificador interno compatible con Stripe/BD.
- El price live canónico es `price_1UAJy5HJnO8odw1Mn4jMVjFt`.

La migración lifetime ya está aplicada en producción. La tabla histórica `monthly_product_usage` puede seguir existiendo por compatibilidad, pero no debe volver a utilizarse para reiniciar la prueba gratuita.

## 1. Variables de producción en Netlify

Configura los secretos únicamente en Netlify/servicios externos; no los publiques en GitHub ni en archivos de cliente.

Variables principales:

```text
NEXT_PUBLIC_SITE_URL=https://importverifier.netlify.app
NEXT_PUBLIC_SUPABASE_URL=https://hfuwwjdcyudflamwwnon.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SECRET_KEY=...
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
STRIPE_PRICE_STARTER=price_1UAJy5HJnO8odw1Mn4jMVjFt
AI_COST_POLICY=free_only
SILICONFLOW_API_KEY=...
REGULATORY_INGEST_SECRET=...
REGULATORY_RADAR_LIVE=false
LEGAL_PROVIDER_NAME=...
LEGAL_PROVIDER_ADDRESS=...
LEGAL_TAX_ID=...
LEGAL_JURISDICTION=...
LEGAL_REFUND_POLICY=...
```

`REGULATORY_RADAR_LIVE` debe permanecer `false` hasta que la ingesta oficial esté configurada y existan eventos regulatorios persistidos reales. El checkout de pago permanece deliberadamente fail-closed mientras falten datos legales veraces del proveedor.

## 2. Supabase Auth: dominio y redirects

En **Authentication → URL Configuration** usa:

**Site URL**

```text
https://importverifier.netlify.app
```

**Redirect URLs**

```text
https://importverifier.netlify.app/auth/callback
https://importverifier.netlify.app/auth/confirm
https://importverifier.netlify.app/reset-password
```

Puedes mantener redirects de Deploy Preview solo cuando sean necesarios para QA, pero el flujo de producción no debe caer en `euproductradar.netlify.app`.

El código de ImportVerifier ya fija el origen canónico en producción. Si Supabase redirige al dominio antiguo aun recibiendo `redirect_to=https://importverifier.netlify.app/auth/callback`, significa que el redirect canónico no está admitido o el Site URL administrativo sigue obsoleto.

Mantén habilitada la confirmación de correo. Configura **Custom SMTP** con un remitente verificado antes de abrir registros reales y activa en **Authentication → Attack Protection** la protección frente a contraseñas filtradas y controles de abuso/CAPTCHA apropiados.

## 3. Google OAuth

El botón visible «Continuar con Google» usa Supabase OAuth/PKCE y conserva el idioma seleccionado.

1. Configura el proveedor Google en Supabase con el cliente OAuth web correspondiente.
2. En Google, autoriza el callback de Supabase indicado por el propio proveedor.
3. En Supabase, asegúrate de que el retorno de la aplicación canónica está permitido como se describe arriba.
4. Desde `https://importverifier.netlify.app/login`, inicia con una cuenta nueva y comprueba que termina en `/dashboard` del mismo dominio.
5. Revisa los Auth logs: no debe aparecer ningún retorno a `euproductradar.netlify.app`.

## 4. Stripe

Producción usa un único producto público:

```text
ImportVerifier Unlimited
EUR 9,95 / month
price_1UAJy5HJnO8odw1Mn4jMVjFt
```

El webhook live debe apuntar a:

```text
https://importverifier.netlify.app/api/stripe/webhook
```

Eventos necesarios: checkout completado, altas/cambios/bajas de suscripción y facturas pagadas/fallidas. El signing secret del endpoint debe coincidir con `STRIPE_WEBHOOK_SECRET` en Netlify.

El backend vuelve a comprobar price, moneda, importe, periodicidad y estado antes de abrir Checkout. La suscripción solo concede entitlement cuando su estado real es válido; cancelación y borrado de cuenta están integrados.

## 5. IA y entradas de producto

- CSV/XLS/XLSX: parsing local; no usa IA.
- TXT/MD/JSON/RTF y PDF/DOCX/ODT con texto: extracción local y flujo gratuito compatible.
- Imágenes JPG/JPEG/PNG/WEBP/GIF/BMP/HEIC/HEIF: visión/OCR gratuito cuando SiliconFlow está configurado.
- PDF escaneado sin texto y `.doc` legado: en producción `free_only` deben fallar de forma honesta con una alternativa, nunca caer silenciosamente a un proveedor de pago.

El cliente solo ve **ImportVerifier AI**; no se muestran proveedor ni modelo.

## 6. Prueba de aceptación de la cuenta gratuita

La prueba que habilita el lanzamiento debe hacerse en el dominio canónico con una cuenta nueva:

1. Abrir `https://importverifier.netlify.app` y entrar en registro/login.
2. Crear una cuenta nueva por Google o email y completar confirmación si aplica.
3. Confirmar que el dashboard muestra **5 productos disponibles**.
4. Importar `tests/fixtures/catalogue.csv`, que contiene cinco productos de prueba conocidos.
5. Revisar los cinco resultados y abrir el análisis guardado desde Historial.
6. Descargar PDF y Excel y comprobar que ambos se guardan/abren correctamente.
7. Intentar un sexto producto en otra importación: debe rechazarse sin guardado parcial y sin alterar los cinco ya consumidos.
8. Cerrar sesión, volver a entrar y confirmar que el historial permanece.
9. Con una segunda cuenta, confirmar que no puede leer el historial ni un `analysisId` de la primera.
10. Probar recuperación de contraseña y, con una cuenta desechable, borrado completo de cuenta.

Las pruebas automatizadas cubren la cuota lifetime, concurrencia y aislamiento, pero no sustituyen esta aceptación real de navegador.

## 7. Radar regulatorio

La arquitectura de Radar usa fuentes oficiales EUR-Lex, normalización allowlisted, deduplicación y endpoint interno protegido. Para activarlo:

1. Crear un `REGULATORY_INGEST_SECRET` fuerte.
2. Configurar el mismo secreto en Netlify y GitHub Actions.
3. Ejecutar la ingesta oficial y confirmar que persiste eventos reales.
4. Solo entonces cambiar `REGULATORY_RADAR_LIVE=true`.

Mientras no existan eventos reales, la interfaz debe hablar de capacidad/preparación y no de monitorización oficial activa.

## 8. Mercados y conectores

Europa (`EU`) es el único mercado activo. US/CN/GB/JP están aislados como arquitectura futura y no deben activarse hasta completar documentación y validación regulatoria específicas.

Shopify/Amazon/Etsy tienen arquitectura de conectores preparada, pero OAuth/API oficiales requieren credenciales externas. Hasta entonces se muestran como próximos/no activos y no deben publicitarse como integración operativa.

## 9. QA móvil/PWA

Revisar en iPhone/iPad/PWA instalada:

- selector de archivos desde Files/Fotos/cámara;
- HEIC/HEIF;
- modal de revisión y teclado;
- safe areas y controles táctiles;
- descarga/guardado de PDF y XLSX;
- descarga de plantilla CSV;
- historial privado sin contenido cacheado tras cerrar sesión.

El código y tests protegen estas rutas, pero la validación final de “Guardar en Archivos” requiere dispositivo/navegador real.

## 10. Comandos de validación

```bash
npm ci
npm test
npm run typecheck
npm run build
```

El workflow `ImportVerifier release check` ejecuta estas comprobaciones. No declarar listo un HEAD cuyo workflow exacto no esté verde.

## Bloqueos externos antes del lanzamiento

Los puntos administrativos que no pueden resolverse mediante código se mantienen en `WORK-CHAT-CONTINUITY.md`. Entre ellos: configuración real de Supabase Auth, secretos/env de Netlify, SMTP, leaked-password protection/CAPTCHA, datos legales de cobro, SiliconFlow, secreto de Radar, credenciales marketplace y QA en dispositivo real.
