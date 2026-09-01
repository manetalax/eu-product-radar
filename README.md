# ImportVerifier

Next.js 16.3.3 + TypeScript. SaaS de análisis regulatorio de productos para importadores y vendedores, con cuentas privadas, trazabilidad documental y foco inicial en la Unión Europea.

## Activación

Sigue [SETUP.md](SETUP.md) y, para el estado operativo más reciente, lee primero [WORK-CHAT-CONTINUITY.md](WORK-CHAT-CONTINUITY.md). Crear servicios externos no aplica automáticamente sus redirects, secretos ni ajustes de seguridad.

## Implementado

- Registro, confirmación de correo, acceso, Google OAuth, cierre de sesión y cambio/recuperación de contraseña.
- Panel privado con historial persistente y aislamiento por cuenta mediante RLS.
- Exactamente 5 productos gratuitos totales por cuenta, sin tarjeta y sin reinicio mensual.
- Único plan público de pago: **ImportVerifier Unlimited · 9,95 €/mes**. `starter` se conserva únicamente como identificador interno compatible con Stripe y la base de datos.
- Stripe Checkout mensual, portal de cliente, sincronización de entitlement, webhooks firmados e integración con borrado de cuenta.
- Importación local CSV/XLS/XLSX y entrada mediante texto/documentos/imágenes compatibles; los flujos de IA de producción están diseñados para política `free_only` sin fuga a proveedores premium.
- Módulo regulatorio UE versionado, guía documental, fuentes oficiales, Product Regulatory Twin, evidencia persistida y Regulatory Impact Radar.
- Informes PDF y Excel localizados con evidencia, trazabilidad y advertencias de incertidumbre; el PDF y la hoja regulatoria usan una jerarquía visual premium.
- Estados Unidos, China, Reino Unido y Japón permanecen preparados como módulos separados pero **no están activos para clientes** hasta completar su validación documental.
- Borrado autoservicio de cuenta y datos con doble confirmación, revocación global de sesiones y eliminación segura.
- Experiencia responsive para escritorio, móvil e iPad y PWA con safe areas, controles táctiles e higiene de caché para contenido privado.
- Portada, autenticación, dashboard, informes y superficies activas traducidas a español, inglés, francés, alemán, italiano y portugués.
- Arquitectura de conectores Shopify/Amazon/Etsy preparada; no se anuncian como activos hasta disponer de OAuth/API oficiales.
- Pruebas automatizadas de importación, cuota lifetime, billing, reglas, seguridad, RLS, evidencia, Radar, i18n, PWA y exportación.

## Oferta comercial canónica

- **Free trial:** 5 productos totales por cuenta, sin tarjeta y sin reinicio.
- **ImportVerifier Unlimited:** 9,95 € al mes.

No existen planes públicos Starter, Growth, Pro o Business en la oferta actual. Cualquier referencia histórica a `starter` representa el ID interno del plan Unlimited y no una oferta distinta.

## Base para aplicaciones

`lib/plans.ts`, `lib/billing.ts`, `lib/landing-i18n.ts`, `lib/analysis.ts`, `lib/markets.ts` y `lib/import-products.ts` concentran reglas y datos reutilizables sin depender de la interfaz. La arquitectura mantiene preparada la evolución a clientes iPhone/iPad/Android y escritorio sin duplicar el dominio regulatorio.

## Ejecutar

```bash
npm ci
cp .env.example .env.local
# Configurar las variables públicas y los secretos indicados en .env.example.
npm test
npm run typecheck
npm run build
npm run dev
```

## Alcance y publicación

Europa es el único mercado operativo. El sistema presenta evaluación, evidencia, incertidumbres y documentación requerida; no debe anunciarse como certificación oficial ni afiliación institucional. La publicación real depende además de la configuración externa descrita en `WORK-CHAT-CONTINUITY.md`, incluyendo dominio/redirects de Auth, secretos de Netlify, SMTP, protección frente a contraseñas filtradas, proveedor gratuito de IA y datos legales veraces para habilitar cobros.
