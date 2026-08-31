import Link from 'next/link';

const SUPPORT_EMAIL = 'importverifier@gmail.com';

export default function PrivacyPage() {
  return <main className="shell legal-page">
    <h1>Política de privacidad</h1>
    <p><strong>Última actualización:</strong> 31 de agosto de 2026.</p>
    <p>Import Rules Verifier trata los datos necesarios para crear y proteger tu cuenta, procesar análisis de producto, gestionar pagos y prestar soporte. Los catálogos, imágenes, documentos y resultados se asocian a tu cuenta privada y no se comparten con otros usuarios.</p>
    <h2>Datos tratados</h2><p>Podemos tratar correo electrónico, identificadores de autenticación, información de suscripción, archivos y datos de producto que decidas aportar, resultados regulatorios y registros técnicos de seguridad.</p>
    <h2>Finalidad</h2><p>Usamos esos datos para autenticarte, ejecutar los análisis solicitados, generar informes, gestionar la suscripción, prevenir abuso y mantener la seguridad del servicio.</p>
    <h2>Procesamiento automatizado e IA</h2><p>Algunas funciones de extracción, OCR, clasificación auxiliar o asistencia conversacional pueden utilizar proveedores especializados de inteligencia artificial. ImportVerifier puede enrutar una solicitud entre distintos proveedores según disponibilidad, coste y capacidad técnica. El resultado que se muestra al usuario se presenta como ImportVerifier AI; el proveedor técnico subyacente puede variar.</p>
    <p>Actualmente la arquitectura puede utilizar proveedores como SiliconFlow y OpenAI, además de procesamiento propio. Se minimiza la información enviada y se evita usar la IA para sustituir el motor regulatorio determinista o las fuentes oficiales. Cuando un tratamiento implique una transferencia internacional de datos, se aplicarán las garantías exigibles y se actualizará esta política cuando corresponda.</p>
    <h2>Otros proveedores</h2><p>El servicio utiliza proveedores de infraestructura, autenticación y pagos como Supabase, Netlify y Stripe, además de proveedores de IA cuando la función solicitada lo requiera. La lista puede evolucionar si se sustituye un proveedor por otro equivalente o mejor; los cambios materiales de tratamiento se reflejarán en esta política.</p>
    <h2>Conservación y eliminación</h2><p>Los análisis permanecen en tu cuenta hasta que cierres la cuenta, salvo información que deba conservarse durante más tiempo por obligaciones legales, contables, antifraude o de seguridad. Al cerrar la cuenta se revoca la sesión y se eliminan los datos del usuario sujetos a borrado.</p>
    <h2>Tus derechos y contacto</h2><p>Cuando resulte aplicable, puedes solicitar acceso, rectificación, supresión, limitación, portabilidad u oposición escribiendo a <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
    <p><strong>Información legal pendiente:</strong> antes de aceptar clientes de pago debe añadirse aquí la identidad legal y dirección del responsable del tratamiento.</p>
    <p><Link href="/terms">Términos de uso</Link> · <Link href="/">Volver a Import Rules Verifier</Link></p>
  </main>;
}
