# Product Radar

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
- Identidad global centralizada y marca de mercado separada del núcleo del producto.
- Experiencias responsive diferenciadas para escritorio, tablet/iPad y móvil, con manifiesto PWA y safe areas.
- Planes, precios, límites e idiomas definidos en módulos TypeScript puros y reutilizables por futuros clientes web o nativos.
- Autenticación y registro de interés comercial encapsulados en servicios cliente, sin acoplar la interfaz directamente a Supabase.
- Pruebas automatizadas de importación, reglas y seguridad de base de datos.

## Planes preparados

- Starter: 19 €/mes, hasta 50 productos.
- Growth: 29 €/mes, hasta 150 productos.
- Pro: 49 €/mes, hasta 500 productos; opción recomendada.
- Business: 149 €/mes, hasta 2.000 productos.

La prueba gratuita conserva 5 productos. Los planes se muestran y formatean íntegramente en español, inglés, francés, alemán, italiano y portugués. La reserva registra interés: no existe todavía checkout ni cargo.

## Base para aplicaciones

`lib/plans.ts`, `lib/landing-i18n.ts`, `lib/analysis.ts`, `lib/markets.ts` y `lib/import-products.ts` concentran reglas y datos reutilizables sin componentes visuales. `lib/services/` aísla los proveedores web de autenticación y del interés comercial. Las futuras apps Android/iPhone pueden reutilizar el dominio y sustituir únicamente la capa de interfaz y el adaptador de autenticación.

## Ejecutar

```bash
npm ci
cp .env.example .env.local
# Configurar las tres variables públicas.
npm test
npm run build
npm run dev
```

## Alcance

El indicador actual cuenta campos ausentes: no comprueba veracidad, requisitos por categoría ni conformidad normativa. Europa es el único módulo operativo; los demás mercados son una hoja de ruta. Los planes de pago permiten registrar interés, pero no cobran suscripciones. El SMTP para clientes, controles de abuso, proceso de borrado y verificación en el entorno real son necesarios antes de abrir el servicio al público.
