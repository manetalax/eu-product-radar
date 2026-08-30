# Import Rules Verifier

Next.js 16.3.3 + TypeScript. Implementación de cuentas reales y catálogos privados con Supabase.

## Activación

Sigue [SETUP.md](SETUP.md) antes de publicar esta versión: incluye la migración SQL, las direcciones de autenticación, las plantillas de correo y la prueba de aceptación. Crear un proyecto en Supabase no aplica automáticamente estas configuraciones.

## Implementado

- Registro, confirmación de correo, acceso, cierre de sesión y cambio/recuperación de contraseña.
- Panel privado sin productos precargados y con historial persistente.
- Importación CSV UTF-8 / XLS / XLSX validada, con límites de tamaño y filas.
- Lectura flexible de exportaciones de comercio electrónico: el nombre es obligatorio y los campos ausentes se convierten en tareas del análisis.
- Módulo europeo activo con guía documental, fuentes oficiales e informes Excel y PDF.
- Arquitectura por mercado: Europa activa; Estados Unidos, China, Reino Unido y Japón preparados como próximos módulos.
- RLS y permisos explícitos que aíslan los catálogos de cada cuenta.
- Borrado autoservicio de cuenta y datos con doble confirmación, revocación global de sesiones y eliminación en cascada mediante una Edge Function protegida por JWT.
- Identidad global centralizada y marca de mercado separada del núcleo del producto.
- Identidad regulatoria europea propia en portada, con señal visual UE y aviso explícito de análisis independiente sin afiliación institucional.
- Experiencias responsive diferenciadas para escritorio, tablet/iPad y móvil, con manifiesto PWA y safe areas.
- Planes, precios, límites e idiomas definidos en módulos TypeScript puros y reutilizables por futuros clientes web o nativos.
- Portada, autenticación y controles de borrado traducidos a español, inglés, francés, alemán, italiano y portugués; la API de cuenta devuelve códigos estables, no mensajes fijados a un idioma.
- Autenticación con Supabase y suscripciones mensuales con Stripe Checkout, portal de cliente y webhooks firmados.
- Pruebas automatizadas de importación, reglas y seguridad de base de datos.

## Planes preparados

- Starter: 19 €/mes, hasta 50 productos.
- Growth: 29 €/mes, hasta 150 productos.
- Pro: 49 €/mes, hasta 500 productos; opción recomendada.
- Business: 149 €/mes, hasta 2.000 productos.

La prueba gratuita conserva 5 productos. Los planes se muestran y formatean íntegramente en español, inglés, francés, alemán, italiano y portugués. Stripe activa y revoca las cuotas automáticamente según el estado real de la suscripción.

## Base para aplicaciones

`lib/plans.ts`, `lib/billing.ts`, `lib/landing-i18n.ts`, `lib/analysis.ts`, `lib/markets.ts` y `lib/import-products.ts` concentran reglas y datos reutilizables sin componentes visuales. `supabase/functions/delete-account` ofrece el mismo borrado seguro a la web y a futuros clientes autorizados. Las futuras apps Android/iPhone pueden reutilizar el dominio y sustituir únicamente la capa de interfaz y el adaptador de autenticación.

## Ejecutar

```bash
npm ci
cp .env.example .env.local
# Configurar las variables públicas y los secretos indicados en .env.example.
npm test
npm run build
npm run dev
```

## Alcance

El indicador actual cuenta campos ausentes: no comprueba veracidad, requisitos por categoría ni conformidad normativa. Europa es el único módulo operativo; los demás mercados son una hoja de ruta. Antes de abrir el servicio al público deben completarse la configuración de Stripe y OAuth, SMTP real, protección de contraseñas filtradas/CAPTCHA y la prueba de aceptación con cuentas y tarjetas de prueba.
