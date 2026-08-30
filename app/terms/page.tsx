import Link from 'next/link';

const SUPPORT_EMAIL = 'importverifier@gmail.com';

export default function TermsPage() {
  return <main className="shell legal-page">
    <h1>Términos de uso</h1>
    <p><strong>Última actualización:</strong> 30 de agosto de 2026.</p>
    <p>Import Rules Verifier es una herramienta independiente de asistencia para organizar información de productos, identificar posibles obligaciones regulatorias y preparar revisiones documentales.</p>
    <h2>No es una autoridad ni certificación</h2><p>Los resultados son automatizados y orientativos. No constituyen aprobación, certificación, asesoramiento jurídico ni decisión de una autoridad de la Unión Europea. La aplicabilidad final depende de las características reales, composición, uso previsto, público, mercado y documentación del producto.</p>
    <h2>Responsabilidad del usuario</h2><p>El usuario debe revisar los datos detectados, confirmar la categoría y comprobar la documentación y fuentes oficiales antes de comercializar un producto. No debe introducir información ilícita ni datos personales innecesarios.</p>
    <h2>Pagos, renovaciones y cancelación</h2><p>El precio y la modalidad se muestran antes de confirmar el pago. Los planes mensuales se renuevan automáticamente hasta su cancelación desde el portal de cliente. Las auditorías de pago único no se renuevan. Para incidencias de facturación, escribe a <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
    <h2>Disponibilidad e historial</h2><p>El servicio puede cambiar reglas, fuentes y funcionalidades para reflejar cambios regulatorios o técnicos. Los análisis históricos son instantáneas inmutables y conservan la versión de reglas utilizada.</p>
    <h2>Contacto</h2><p>Soporte: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
    <p><strong>Información legal pendiente:</strong> antes de aceptar clientes de pago deben añadirse la identidad legal del prestador, domicilio, datos fiscales, jurisdicción y política de reembolsos aplicables.</p>
    <p><Link href="/privacy">Política de privacidad</Link> · <Link href="/">Volver a Import Rules Verifier</Link></p>
  </main>;
}
