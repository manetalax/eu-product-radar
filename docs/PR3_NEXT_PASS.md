# PR #3 · siguiente pasada de producto

Este documento deja preparado el siguiente bloque de trabajo sobre `feat/account-deletion-security` para aplicarlo sin perder contexto ni rehacer decisiones ya tomadas.

## Estado de implementación

Aplicado sobre el estado actual del PR #3:

- Identidad regulatoria europea propia, visible y sin apariencia de certificación oficial.
- Hero y mensajes regulatorios localizados en seis idiomas.
- Autenticación completa localizada, incluido Google OAuth, recuperación y mensajes de retorno.
- Borrado de cuenta localizado con códigos de error estables en servidor.
- Selector de idioma compartido y persistente entre portada y autenticación.
- Validación automatizada: 20 pruebas, typecheck, build de producción y auditoría sin vulnerabilidades.

Queda como aceptación externa verificar que Netlify despliega el SHA final, revisar la preview en los tres tamaños y ejecutar el borrado completo únicamente con una cuenta desechable.

## Objetivo

Convertir el estado actual del PR #3 en una versión visual y funcionalmente coherente con un producto premium centrado en análisis regulatorio europeo, manteniendo intacto el borrado seguro de cuenta ya implementado.

## 1. Identidad europea en portada

- Añadir una señal visual europea clara junto a `EU Product Radar` (bandera/estrellas UE o recurso equivalente propio).
- No insinuar pertenencia institucional, homologación o certificación oficial inexistente.
- Introducir una etiqueta propia como `EU Regulatory Intelligence` / traducción equivalente.
- Hero recomendado en español: `Conoce la normativa que necesita cada producto para venderse en la Unión Europea.`
- Subcopy recomendado: `Detecta requisitos, documentación pendiente y posibles riesgos regulatorios antes de comercializar tus productos en el mercado europeo.`
- Mantener el disclaimer de que la herramienta no certifica conformidad ni sustituye asesoramiento profesional.

## 2. Internacionalización completa

La portada ya dispone de `lib/landing-i18n.ts` para `es`, `en`, `fr`, `de`, `it`, `pt`. Todo texto nuevo debe entrar en ese sistema.

Además, la auditoría del PR #3 ha detectado textos privados aún hardcodeados en español que deben migrarse al mismo enfoque:

- `components/AuthForm.tsx`: títulos, errores, botones, Google OAuth, recuperación de contraseña, ayudas, trust mark y navegación.
- `app/login/page.tsx`: mensajes `password_updated`, `account_deleted` y `link_error`.
- `app/api/account/route.ts`: mensajes de error del borrado de cuenta; preferir códigos estables de error en servidor y traducción en cliente, en lugar de texto localizado en la API.
- Cualquier nuevo texto de `Mi cuenta → Eliminar cuenta y datos` debe traducirse a los seis idiomas.

No dejar cantidades, límites de planes, CTAs o mensajes regulatorios congelados en español/inglés cuando el idioma cambia.

## 3. Diseño responsive

Verificar tres experiencias independientes:

1. Escritorio: jerarquía completa, ancho cómodo y lectura rápida.
2. iPad/tablet: composición específica, sin limitarse a estirar móvil.
3. Móvil: cabecera compacta, sin overflow, CTAs a ancho útil y controles táctiles cómodos.

El bloque europeo no debe elevar en exceso el hero en móvil.

## 4. Confianza

Mantener una política estricta de claims verificables:

- Válido: `Security checks completed`, `Privacy review completed`, `Secure account controls`, `EU regulatory analysis`.
- No válido sin acreditación real: `Certificado por la UE`, `Aprobado por la Comisión Europea`, `Audited by ...` o equivalentes.
- `EPR Trust Mark` debe seguir descrito explícitamente como comprobación interna.

## 5. Arquitectura preparada para apps

- Componentes visuales reutilizables.
- Copys separados de lógica y centralizados por idioma.
- Autenticación, billing y análisis detrás de servicios/adaptadores.
- Nada que dependa de hover o interacción exclusiva de escritorio.
- Mantener compatibilidad futura con iPhone, Android e iPad sin reescribir dominio/API.

## 6. Criterio de terminación

No considerar esta pasada terminada solo porque compile.

Debe ejecutarse:

```bash
npm test
npm run typecheck
npm run build
npm audit --omit=dev
```

Después:

1. Push sobre `feat/account-deletion-security`.
2. Confirmar que Netlify despliega el último SHA del PR #3.
3. Abrir `https://deploy-preview-3--euproductradar.netlify.app`.
4. Verificar visualmente que el bloque europeo aparece de verdad.
5. Revisar español, inglés, francés, alemán, italiano y portugués.
6. Revisar escritorio, iPad/tablet y móvil.
7. Probar login Google y correo.
8. Probar borrado de cuenta solo con una cuenta desechable.
9. Si existe cualquier discrepancia entre código y preview, corregir y volver a desplegar antes de darlo por terminado.

## 7. Principio operativo para Work

Trabajar exclusivamente sobre el PR #3 y su rama `feat/account-deletion-security`. No partir de una versión anterior ni crear una aplicación paralela. Aplicar esta pasada sobre el estado actual, resolver de forma autónoma errores de build/UX y no declarar éxito hasta comprobar el Deploy Preview real.
