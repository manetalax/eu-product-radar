# Product Radar

Next.js 15.5.24 + TypeScript. Primera implementación de cuentas reales y catálogos privados con Supabase.

## Activación

Sigue [SETUP.md](SETUP.md) antes de publicar esta versión: incluye la migración SQL, las direcciones de autenticación, las plantillas de correo y la prueba de aceptación. Crear un proyecto en Supabase no aplica automáticamente estas configuraciones.

## Implementado

- Registro, confirmación de correo, acceso, cierre de sesión y cambio/recuperación de contraseña.
- Panel privado sin productos precargados y con historial persistente.
- Importación CSV UTF-8 / XLS / XLSX validada, con límites de tamaño y filas.
- Módulo europeo activo con guía documental, fuentes oficiales e informes Excel y PDF.
- Arquitectura por mercado: Europa activa; Estados Unidos, China, Reino Unido y Japón preparados como próximos módulos.
- RLS y permisos explícitos que aíslan los catálogos de cada cuenta.
- Identidad global centralizada y marca de mercado separada del núcleo del producto.
- Pruebas automatizadas de importación, reglas y seguridad de base de datos.

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
