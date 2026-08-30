# Deploy paralelo en Netlify

Crear un sitio Netlify independiente conectado a este repositorio y fijar la rama de producción a `feat/import-rules-verifier-branding`.

Nombre solicitado del sitio: `importrulesverifier`.

URL objetivo: `https://importrulesverifier.netlify.app`.

Variables mínimas: copiar las variables requeridas del despliegue original y cambiar únicamente `NEXT_PUBLIC_SITE_URL` a la URL nueva. No copiar secretos al repositorio.

OAuth/Auth: añadir el nuevo dominio y callbacks a las allowlists de Supabase y Google sin borrar las URLs del producto original.
