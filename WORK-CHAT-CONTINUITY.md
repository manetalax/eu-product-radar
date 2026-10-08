# ImportVerifier — Chat ↔ Work continuity protocol

## Estado canónico actual — 2026-10-08

- El propietario ha solicitado explícitamente migrar el alojamiento de la aplicación completa a Vercel y conservar las funciones, usuarios, base de datos, pagos y precios existentes.
- Repositorio: `manetalax/eu-product-radar`; Postispop está en otro sitio y no debe tocarse.
- GitHub Pages solo publica una edición estática local y no puede alojar la aplicación completa Next.js. No presentarla como sustituto de producción.
- El proyecto Supabase existente `EuProductRadar` (`hfuwwjdcyudflamwwnon`) se reactivó y está `ACTIVE_HEALTHY`. Están presentes sus migraciones y tablas; las filas de las tablas de producto consultadas eran cero.
- Vercel MCP no devuelve equipos ni proyectos. El intento de enlazar GitHub reporta que falta una conexión de inicio de sesión GitHub; el navegador mostró OAuth con botón `Authorize` deshabilitado. No se ha creado un proyecto Vercel ni se han transferido secretos.
- Continuar desde el Next.js existente en `manetalax/eu-product-radar`, sin reconstruirlo ni cambiar de base o de procesador de pago.

## Regla operativa

Continuar autónomamente por trabajo IN PROGRESS/NEXT. No repetir tareas ya cerradas. Si algo requiere una consola externa o una capacidad no disponible, marcarlo como bloqueo externo y continuar con el siguiente trabajo posible. Nunca exponer secretos.

## Oferta comercial vigente

- Free: 5 productos totales por cuenta, con ImportVerifier AI.
- Mensual: **9,95 € / mes**, con IA.
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

## Trabajo completado en esta migración

- Se publicó una edición ligera en GitHub Pages como sitio separado, sin tocar Postispop. No tiene servidor ni funciones de cuenta, historial, IA remota, Radar automático o pagos.
- El panel completo oculta ahora la navegación tras un botón compacto; historial, informes, Radar, IA y suscripciones siguen en la aplicación Next.js.
- Se reactivó el proyecto Supabase original y se comprobó que el esquema/migraciones están disponibles.
- La documentación operativa ahora describe el objetivo Vercel, conserva el Supabase/Stripe existentes y detalla el cambio posterior de callbacks y webhook.

## NEXT

1. Completar el inicio de sesión/conexión de GitHub con Vercel y enlazar el repositorio `manetalax/eu-product-radar`.
2. Transferir a Vercel las claves existentes desde sus fuentes seguras (Supabase, Stripe, proveedor de IA y datos legales); nunca pedir que se peguen en el chat ni guardarlas en Git.
3. Asignar el dominio canónico y actualizar Supabase Auth/Google OAuth, Stripe webhook y GitHub Actions Radar a ese dominio.
4. Desplegar el Next.js completo en `main` y verificar login, importación, historial, IA, Radar, PDF/XLSX, pagos y portal de Stripe antes de retirar la edición estática de Pages.
5. Mantener las ofertas actuales y el límite de 5 productos Free; no degradar el proyecto Supabase original.

## Bloqueos externos que no deben frenar el resto

- La autorización de GitHub/Vercel y acceso al proyecto Vercel cuando no haya una sesión iniciada.
- Los secretos de producción (Supabase server key, Stripe live/webhook, proveedor de IA, identidad legal y Radar) si no están presentes en un almacén conectado; no pueden recuperarse de forma segura desde este repositorio.
- Configuración administrativa en proveedores externos cuando no haya acción disponible desde las herramientas conectadas.
- QA físico específico en dispositivos si no existe navegador/dispositivo accesible en la sesión.
- Eliminación de ramas Git remotas antiguas si la interfaz conectada no expone una operación de borrado de refs.

## Diagnóstico Radar — 2026-10-08

- Los runs programados de GitHub Actions fallan en `test -n "$SITE_ORIGIN"`: en el runner, `vars.NEXT_PUBLIC_SITE_URL` y `secrets.REGULATORY_INGEST_SECRET` llegan vacíos.
- El workflow ahora señala explícitamente qué variable falta o no cumple formato. Para activar el refresco hacen falta el dominio canónico y el secreto en GitHub Actions, más el mismo secreto y `REGULATORY_RADAR_LIVE=true` en Vercel.
- La integración actual de IA usa SiliconFlow y necesita `SILICONFLOW_API_KEY` en el entorno de servidor de Vercel. Su crédito de bienvenida no garantiza uso gratuito permanente; vigilar coste operativo y límites. IA habilitada para Free y todos los planes pagados (10 consultas/hora/cuenta) por decisión del propietario el 2026-10-08.

## Definición de terminado

No considerar ImportVerifier terminado hasta que Vercel despliegue el HEAD exacto con configuración segura, login/importación/historial/PDF/XLSX/billing/IA/Radar funcionen según las reglas vigentes y el responsive esté validado en móvil, tablet y escritorio.
