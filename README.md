# ImportVerifier

Next.js + TypeScript. SaaS de análisis regulatorio de productos para importadores y vendedores, con cuentas privadas, trazabilidad documental y foco inicial en la Unión Europea.

## Producción

- La aplicación completa usa Next.js y necesita alojamiento con servidor; la migración solicitada tiene como destino Vercel conectado a `main`.
- GitHub se mantiene como control de versiones y fuente del código.
- Supabase y Stripe se conservan: cambiar el alojamiento web no significa cambiar de base de datos, usuarios, historial, precios ni pagos.
- `NEXT_PUBLIC_SITE_URL` debe ser el origen HTTPS canónico de producción asignado por Vercel.

## Edición ligera de GitHub Pages

Este repositorio incluye una edición estática independiente en `github-pages/`, publicada en `https://manetalax.github.io/eu-product-radar/` mediante GitHub Actions cuando se integra en `main`. Procesa CSV/XLS/XLSX en el navegador con el motor determinista existente y no sube el catálogo.

GitHub Pages no ejecuta las rutas Next.js del servidor. Esta edición no incluye cuentas, historial sincronizado, IA remota, Stripe ni el Radar automático; es solo una edición ligera y no sustituye la aplicación completa. El análisis es orientativo y no certifica cumplimiento.

## Implementado

- Registro, confirmación de correo, acceso, Google OAuth, cierre de sesión y recuperación de contraseña.
- Panel privado con historial persistente y aislamiento por cuenta mediante RLS.
- 5 productos gratuitos totales por cuenta.
- Importación CSV/XLS/XLSX, texto, documentos e imágenes compatibles.
- Motor regulatorio UE, Product Regulatory Twin, evidencia y Radar regulatorio.
- Informes PDF y Excel localizados.
- Stripe Checkout, Portal y sincronización de entitlement.
- PWA y experiencia responsive para escritorio, móvil e iPad.
- Arquitectura preparada para conectores marketplace sin presentarlos como activos hasta disponer de credenciales oficiales.
- Dashboard con componentes y herramientas de escalado para catálogos grandes.

## Oferta comercial vigente

- **Free:** 5 productos totales por cuenta, con ImportVerifier AI.
- **Mensual:** 9,95 €/mes, con ImportVerifier AI.
- **Anual:** 89,95 €/año, con IA.
- **Lifetime:** 299,95 €, pago único, con IA.
- **Personalizada:** 995,50 €, incluyendo personalización técnica de la plataforma, dominio, logo e integración de WhatsApp.

Los precios se muestran con sus decimales exactos y formato localizado.

## Base reutilizable

`lib/plans.ts`, `lib/billing.ts`, `lib/analysis.ts`, `lib/markets.ts` y `lib/import-products.ts` concentran reglas reutilizables para web y futuras aplicaciones iPhone/iPad/Android sin duplicar el dominio regulatorio.

## Ejecutar

```bash
npm ci
cp .env.example .env.local
npm test
npm run typecheck
npm run build
npm run dev
```

## Publicación

Antes de publicar la aplicación completa en Vercel deben pasar las comprobaciones de release y verificarse login, importación, historial, PDF/XLSX, billing, acceso a IA según plan, Radar y responsive en móvil/tablet/escritorio. La aceptación está descrita en `docs/IMPORT_RULES_VERIFIER_DEPLOY.md`.
