# Actualización: guía documental y PDF

## Cambios
- Botón «Descargar PDF» en Productos e Informes para el análisis seleccionado.
- Excel conserva Resumen, Productos y Datos técnicos; añade Guía documental.
- Panel Informes muestra instrucciones por producto, estado, aplicabilidad, a quién pedir la documentación y fuentes oficiales.
- Una guía compartida alimenta las tres presentaciones.
- Compatible con análisis anteriores missing-fields-v1. Sin migraciones ni cambios en login, permisos o historial.

## Límites deliberados
No se han implementado subida ni verificación de documentos. No se determina normativa sectorial a partir del nombre. «Dato no aportado» significa vacío en el catálogo, no documento inexistente. CE y ensayos permanecen pendientes de determinar aplicabilidad. Para una fase posterior se requieren categoría, características, mercados y papel del operador, más revisión de evidencias y reglas normativas validadas.
La guía se genera con la versión actual al descargar; no representa una evaluación documental histórica. El indicador original no cambia.
PDF: los caracteres no latinos se representan mediante códigos Unicode visibles; el Excel conserva el texto original. Los enlaces oficiales se incluyen como URL escrita en PDF y como hipervínculos en Excel.

## Publicación segura
1. Actualizar los archivos en la rama feat/real-accounts, incluido package-lock.json. No sustituir la rama por main ni publicar directamente el ZIP en Netlify Drop: este es código fuente Next.js.
2. Netlify debe reconstruir el Deploy Preview de esa rama.
3. Probar acceso Google con la cuenta existente, abrir un análisis del historial y descargar Excel y PDF.
4. Comprobar que el Excel tiene cuatro hojas y el PDF muestra resumen, fichas, fuentes y numeración.
5. Solo después, integrar la rama en main y revisar el dominio de producción y los redirects OAuth existentes.
No cambiar claves, variables de entorno ni tablas para esta actualización.

## Verificación local
npm ci
npm run typecheck
npm test
npm run build

Las pruebas incluyen aislamiento RLS entre dos usuarios, conservación del Excel, estados documentales y PDF con textos largos. La comprobación real del login Google en Netlify requiere el despliegue y la cuenta del propietario.
