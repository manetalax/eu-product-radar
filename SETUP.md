# Activar cuentas y análisis privados

Esta rama prepara el primer bloque real. No se debe fusionar a `main` hasta completar los pasos 1 y 2. No se han aplicado cambios administrativos a Supabase desde el código.

## 1. Crear la tabla privada

En Supabase, abre **SQL Editor → New query**, copia el contenido completo de `supabase/migrations/202608270001_private_analyses.sql` y pulsa **Run**.

- La migración no borra datos y se ejecuta en una transacción.
- Ejecútala una sola vez. Si indica que la función o tabla ya existe, no la borres: comprueba primero si ya se aplicó esta migración.
- Activa RLS y permite solo leer e insertar análisis de la cuenta autenticada.
- No permite lectura anónima, cambios en análisis previos ni escritura para otro usuario.
- El indicador se recalcula con la versión de reglas guardada; solo existe `missing-fields-v1` en esta entrega.

## 2. Configurar las direcciones de autenticación

En **Authentication → URL Configuration**:

**Site URL**

```text
https://euproductradar.netlify.app
```

Añade estas dos direcciones exactas en **Redirect URLs**:

```text
https://euproductradar.netlify.app/auth/callback
https://euproductradar.netlify.app/auth/callback?next=/reset-password
```

Mantén habilitados el acceso con email y la confirmación de correo. No actives acceso anónimo ni desactives la confirmación para sortear problemas de entrega.

### Recomendado: enlaces compatibles con otro navegador o dispositivo

En **Authentication → Email Templates**, modifica solo el enlace del botón de estas plantillas:

**Confirm signup**:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Confirmar mi correo</a>
```

**Reset password**:

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=recovery">Cambiar mi contraseña</a>
```

La aplicación también admite el callback PKCE predeterminado; en ese caso solicita y abre el enlace desde el mismo navegador. Los enlaces caducados muestran un mensaje sin dar acceso a la cuenta.

## 3. Correo de pruebas y correo para clientes

El SMTP integrado de Supabase solo entrega a direcciones autorizadas del equipo del proyecto y tiene un límite de envío muy bajo. Para la primera prueba de registro usa el email de tu cuenta de Supabase. No presupongas que otro correo cualquiera recibirá el mensaje.

Antes de abrir el registro a clientes, configura **Custom SMTP**, un remitente verificado y revisa los límites de Auth. No publiques las credenciales SMTP ni las pegues en el repositorio.

Para probar el aislamiento con dos usuarios sin enviar invitaciones, el propietario puede crear dos cuentas de prueba en **Authentication → Users → Add user → Create new user**, eligiendo él mismo las contraseñas. Esto no prueba la entrega de correos: registro y recuperación deben probarse por separado.

## 4. Publicar desde GitHub

Con los pasos anteriores terminados, fusiona la rama de esta entrega en `main`. Netlify debe construir ese commit.

`netlify.toml` contiene la URL de la web, la URL del proyecto y su clave **publishable**, todas públicas. No contiene contraseña de base de datos, `service_role`, clave secreta ni credenciales administrativas. Si hay variables con los mismos nombres en la interfaz de Netlify, comprueba que coincidan.

Variables utilizadas:

```text
NEXT_PUBLIC_SITE_URL
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
```

## 5. Prueba de aceptación en la web publicada

1. Sin sesión, abrir `/dashboard`: debe redirigir a `/login`.
2. Crear una cuenta con un correo autorizado, confirmar y entrar con contraseña válida.
3. Importar `tests/fixtures/catalogue.csv`: aparecen cinco productos y puntuaciones **92, 64, 36, 36 y 8**. Debe mostrarse “Análisis guardado en tu cuenta”.
4. Cerrar sesión, cerrar la página y entrar de nuevo: abrir el análisis desde **Historial** y descargar el informe Excel.
5. Abrir otra cuenta en un navegador distinto: el análisis anterior no aparece. Pedir `/api/analyses?id=ID_DE_LA_OTRA_CUENTA` devuelve 404.
6. Con contraseña incorrecta se deniega el acceso. Sin sesión, `/api/analyses` devuelve 401. Cerrar sesión en una pestaña cierra también el panel de las otras.
7. Probar un CSV vacío, sin encabezados o con más de 1.000 productos: se muestra un error y no se guarda una importación parcial.
8. Solicitar recuperación de contraseña, seguir el enlace, cambiarla y entrar con la nueva.

No declarar este bloque activado hasta completar estas pruebas en el proyecto real. Las pruebas automatizadas locales no sustituyen la configuración ni los correos reales.

## Desarrollo y pruebas automatizadas

```bash
npm ci
cp .env.example .env.local
# Rellenar las variables públicas; para desarrollo usar NEXT_PUBLIC_SITE_URL=http://localhost:3000.
npm test
npm run build
npm run dev
```

Las pruebas incluyen CSV/XLS/XLSX, validación de límites, redirecciones restringidas, control de origen y la migración SQL sobre PostgreSQL embebido (PGlite), con dos identidades y un rol anónimo.

## Alcance y límites

- El historial contiene datos reales de cada cuenta; la demostración pública se mantiene separada y no guarda datos.
- Solo se comprueba la presencia de fabricante, responsable UE y advertencias. No se evalúa si son correctos, suficientes o exigibles para una categoría.
- 5 MB de archivo, 1.000 productos por importación, 1.000 caracteres por campo y 2 MB de solicitud JSON. Se analiza únicamente la primera hoja de Excel.
- No hay pagos ni límites por plan comercial implementados.
- No hay aún verificación normativa, alertas regulatorias, conectores a tiendas, borrado de cuenta desde la web, ni traducción completa de los nuevos formularios.
- Mantener acceso de pruebas hasta configurar correo, controles de abuso/cuotas, política de conservación y proceso de borrado, y verificar la instalación real.

Referencias: [Supabase SSR](https://supabase.com/docs/guides/auth/server-side/creating-a-client), [RLS](https://supabase.com/docs/guides/database/postgres/row-level-security), [correo](https://supabase.com/docs/guides/auth/auth-smtp), [plantillas](https://supabase.com/docs/guides/auth/auth-email-templates), [SheetJS](https://docs.sheetjs.com/docs/getting-started/installation/nodejs/).

## Acceso con Google

El formulario de acceso y registro incluye «Continuar con Google» mediante Supabase OAuth con PKCE. No solicita acceso a Drive, Gmail ni tokens de uso sin conexión. Apple todavía no está habilitado en la interfaz.

1. Configurar el cliente OAuth web en Google y el proveedor Google en Supabase. Los secretos van únicamente en Supabase, nunca en el repositorio.
2. En Supabase → Authentication → URL Configuration, añadir la URL exacta de retorno de la preview:
   `https://deploy-preview-1--euproductradar.netlify.app/auth/callback`.
   Mantener también el callback de producción documentado arriba.
3. Netlify construye cada Deploy Preview con NEXT_PUBLIC_SITE_URL igual a DEPLOY_PRIME_URL; esto conserva el callback y las solicitudes privadas en el mismo entorno.
4. Probar desde `/login`: pulsar «Continuar con Google», autorizar con una cuenta permitida por la configuración de pruebas de Google y comprobar que se vuelve a `/dashboard` en la misma preview.
5. Probar cancelar el consentimiento: debe regresar al acceso sin crear una sesión. Comprobar también registro con Google, cierre de sesión e historial privado.

La compilación y las pruebas locales no verifican las credenciales ni sustituyen esta prueba real. Las tablas products y price_history no sustituyen la tabla analyses que requiere esta rama.

## Informe Excel con formato

La descarga de análisis privados genera Resumen, Productos y Datos técnicos. Incluye totales con fórmulas y valores calculados, columnas con ancho definido, texto ajustado, prioridades con colores y encabezados fijos. Conserva los valores originales y la fecha en UTC. El libro es una instantánea: editarlo no cambia el análisis guardado.

ExcelJS se carga únicamente al descargar. El secreto de Google y las credenciales de sesión nunca se exportan. La dependencia uuid de ExcelJS se fija a 11.1.1 para evitar la versión vulnerable heredada; solo se utiliza la exportación XLSX.

Verificación: pruebas de ida y vuelta XLSX (datos, fórmulas, colores, fechas y texto con apariencia de fórmula), suite existente y compilación Next.js. Revisión visual con LibreOffice. La comprobación final en Apple Numbers requiere abrir una nueva descarga en el dispositivo; no se afirma compatibilidad visual idéntica entre aplicaciones.
