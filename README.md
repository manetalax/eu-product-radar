# ImportVerifier

Next.js + TypeScript. SaaS de análisis regulatorio de productos para importadores y vendedores, con cuentas privadas, trazabilidad documental y foco inicial en la Unión Europea.

## Producción

- Frontend objetivo: **Sites únicamente**.
- GitHub se mantiene como control de versiones y fuente del código.
- No crear ni restaurar Netlify, deploy previews ni copias legacy.
- `NEXT_PUBLIC_SITE_URL` debe ser el origen HTTPS canónico publicado por Sites.

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

- **Free:** 5 productos totales por cuenta.
- **Mensual:** 9,95 €/mes, sin IA.
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

Antes de publicar en Sites deben pasar tests, typecheck y build, además de verificarse login, importación, historial, PDF/XLSX, billing, acceso a IA según plan, entrada por URL y responsive en móvil/tablet/escritorio. No debe quedar ninguna dependencia activa de Netlify ni de previews anteriores.
