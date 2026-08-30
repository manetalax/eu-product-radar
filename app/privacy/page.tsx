import Link from 'next/link';

const SUPPORT_EMAIL = 'importverifier@gmail.com';

export default function PrivacyPage() {
  return <main className="shell legal-page">
    <h1>Política de privacidad</h1>
    <p><strong>Última actualización:</strong> 30 de agosto de 2026.</p>
    <p>Import Rules Verifier trata los datos necesarios para crear y proteger tu cuenta, procesar análisis de producto, gestionar pagos y prestar soporte. Los catálogos, imágenes, documentos y resultados se asocian a tu cuenta privada y no se comparten con otros usuarios.</p>
    <h2>Datos tratados</h2><p>Podemos tratar correo electrónico, identificadores de autenticación, información de suscripción, archivos y datos de producto que decidas aportar, resultados regulatorios y registros técnicos de seguridad.</p>
    <h2>Finalidad</h2><p>Usamos esos datos para autenticarte, ejecutar los análisis solicitados, generar informes, aplicar cuotas, gestionar pagos, prevenir abuso y mantener la seguridad del servicio.</p>
    <h2>Proveedores</h2><p>El servicio puede utilizar proveedores de infraestructura, autenticación, pagos y procesamiento de IA, incluidos Supabase, Stripe, Netlify y OpenAI, según las funciones utilizadas.</p>
    <h2>Conservación y eliminación</h2><p>Los análisis permanecen en tu cuenta hasta que cierres la cuenta, salvo información que deba conservarse durante más tiempo por obligaciones legales, contables, antifraude o de seguridad. Al cerrar la cuenta se revoca la sesión y se eliminan los datos del usuario sujetos a borrado.</p>
    <h2>Tus derechos y contacto</h2><p>Cuando resulte aplicable, puedes solicitar acceso, rectificación, supresión, limitación, portabilidad u oposición escribiendo a <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
    <p><strong>Información legal pendiente:</strong> antes de aceptar clientes de pago debe añadirse aquí la identidad legal y dirección del responsable del tratamiento.</p>
    <p><Link href="/terms">Términos de uso</Link> · <Link href="/">Volver a Import Rules Verifier</Link></p>
  </main>;
}
