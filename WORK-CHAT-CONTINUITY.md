# ImportVerifier — Chat ↔ Work continuity protocol

## Estado canónico actual — 2026-09-03

- Frontend de producción: **Sites únicamente**.
- Repositorio: `manetalax/eu-product-radar`.
- Rama activa de trabajo: `feat/import-rules-verifier-branding`.
- No crear, restaurar ni reutilizar Netlify, deploy previews ni copias legacy.
- GitHub se usa como control de versiones y fuente del código; Sites es el único destino de publicación.
- No empezar otro proyecto ni reconstruir ImportVerifier desde cero. Continuar desde el estado real existente y conservar lo que funciona.

## Regla operativa

Continuar autónomamente por trabajo IN PROGRESS/NEXT. No repetir tareas ya cerradas. Si algo requiere una consola externa o una capacidad no disponible, marcarlo como bloqueo externo y continuar con el siguiente trabajo posible. Nunca exponer secretos.

## Oferta comercial vigente

- Free: 5 productos totales por cuenta.
- Mensual: **9,95 € / mes**, sin IA.
- Anual: **89,95 € / año**, con IA.
- Lifetime: **299,95 €**, pago único, con IA.
- Personalizada: **995,50 €**, incluyendo personalización técnica, dominio, logo e integración de WhatsApp.
- Los precios deben conservar siempre sus decimales exactos y formato localizado.

## DONE — no rehacer

- Cuota gratuita acumulativa de cinco productos y aislamiento del historial por cuenta/RLS.
- Stripe Checkout, Portal, sincronización de entitlement, webhooks y protecciones de billing ya existentes.
- Auth email/Google, recuperación, continuidad de intención de compra y borrado de cuenta.
- Importación CSV/XLS/XLSX/documentos/texto/imágenes compatibles.
- Motor regulatorio UE, Evidence, Regulatory Twin y arquitectura Radar.
- Exportaciones PDF/XLSX localizadas y endurecidas.
- PWA, responsive móvil/iPad y protecciones de caché privada.
- Mejoras previas de accesibilidad asíncrona en Auth, Evidence, Intelligence Suite y otros flujos ya auditados.
- Dashboard con herramientas de escalado para catálogos grandes y componentes modulares añadidos en la rama activa.

## Sites-only cleanup completado en esta pasada

- Eliminado `NETLIFY-PRODUCTION-ENV.example`.
- Eliminado `netlify-import-rules-verifier.toml`.
- Eliminado `netlify.toml`.
- Eliminada `netlify/functions/regulatory-radar.mjs`; al quedar vacía, la carpeta Netlify deja de formar parte del árbol activo.
- El validador de release ya no fija `importverifier.netlify.app`; producción exige un origen HTTPS canónico y rechaza hosts `*.netlify.app`.
- `docs/IMPORT_RULES_VERIFIER_DEPLOY.md` reescrito para Sites.
- `SETUP.md` saneado para Sites y para los planes vigentes.
- El árbol actual de la rama activa no contiene archivos o carpetas con `netlify` en el nombre.

## IA gratuita — actualización 2026-09-10

- Añadido Cloudflare Workers AI como segundo proveedor gratuito, con `@cf/qwen/qwen3.8-27b` para texto/razonamiento y visión.
- Orden conservador por defecto: **SiliconFlow → Cloudflare → OpenAI solo si la política permite coste**. No se cambia el proveedor gratuito ya operativo sin credenciales y benchmark real de producción.
- Endpoint Cloudflare construido internamente desde un `CLOUDFLARE_ACCOUNT_ID` hexadecimal validado; no se admite base URL configurable para evitar desvíos de datos/SSRF.
- Variables preparadas: `CLOUDFLARE_ACCOUNT_ID`, `CLOUDFLARE_AI_API_TOKEN`, `CLOUDFLARE_AI_MODEL`, `CLOUDFLARE_VISION_MODEL`.
- Telemetría actualizada para considerar Cloudflare proveedor gratuito. El constraint de `public.ai_usage_events` en Supabase producción ya admite `cloudflare` además de los proveedores previos.
- Pruebas estáticas añadidas para orden de fallback, modelo, endpoint fijo, validación de account id y timeout compartido.
- Radar producción comprobado en BD el 2026-09-10: 2 eventos, 2 activos; evento más reciente visto el 2026-09-09 09:05:34 UTC.
- El runner local de esta sesión no tiene salida de red a GitHub y los commits creados por la conexión GitHub no han generado todavía un workflow asociado al HEAD, por lo que tests/typecheck/build completos siguen pendientes de ejecución verificable en CI/Sites.

## NEXT

1. Continuar el rediseño profundo del dashboard modular para cientos/miles de productos sin renderizado interminable.
2. Aplicar en código/UI las reglas comerciales vigentes: mensual sin IA, anual/lifetime con IA, Lifetime 299,95 €, Personalizada 995,50 €.
3. Corregir todo copy de conexión por URL para expresar una función real: pegar URL para conectar/importar; nunca “próximamente”.
4. Auditar referencias de host legacy dentro del contenido de archivos restantes y retirarlas cuando estén activas, sin borrar historial útil.
5. Ejecutar tests, typecheck y build del HEAD exacto y corregir cualquier regresión.
6. Verificar responsive y funcionalidades reales antes de preparar la versión final para Sites.

## Bloqueos externos que no deben frenar el resto

- Configuración administrativa en proveedores externos cuando no haya acción disponible desde las herramientas conectadas.
- QA físico específico en dispositivos si no existe navegador/dispositivo accesible en la sesión.
- Eliminación de ramas Git remotas antiguas si la interfaz conectada no expone una operación de borrado de refs.

## Definición de terminado

No considerar ImportVerifier terminado hasta que el HEAD exacto pase tests/typecheck/build, el dominio canónico de Sites no dependa de Netlify, login/importación/historial/PDF/XLSX/billing/IA por plan funcionen según las reglas vigentes y el responsive esté validado en móvil, tablet y escritorio.
