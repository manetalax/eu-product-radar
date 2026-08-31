import Link from 'next/link';

const SUPPORT_EMAIL = 'importverifier@gmail.com';

export default function TermsPage() {
  return <main className="shell legal-page">
    <h1>Términos de uso</h1>
    <p><strong>Última actualización:</strong> 31 de agosto de 2026.</p>
    <p>Import Rules Verifier es una herramienta independiente de asistencia para organizar información de productos, identificar posibles obligaciones regulatorias y preparar revisiones documentales.</p>
    <h2>No es una autoridad ni certificación</h2><p>Los resultados son automatizados y orientativos. No constituyen aprobación, certificación, asesoramiento jurídico ni decisión de una autoridad de la Unión Europea. La aplicabilidad final depende de las características reales, composición, uso previsto, público, mercado y documentación del producto.</p>
    <h2>Responsabilidad del usuario</h2><p>El usuario debe revisar los datos detectados, confirmar la categoría y comprobar la documentación y fuentes oficiales antes de comercializar un producto. No debe introducir información ilícita ni datos personales innecesarios.</p>
    <h2>Suscripción Unlimited</h2><p>La oferta pública de pago es una suscripción mensual Unlimited de 9,95 € al mes, salvo promoción expresamente indicada. Se renueva automáticamente hasta su cancelación desde el portal de cliente. El uso ilimitado está sujeto a medidas técnicas razonables contra abuso automatizado, fraude, ataques o utilización incompatible con un servicio interactivo normal. Estas salvaguardas no se presentan como una cuota comercial de productos.</p>
    <h2>Pagos, renovaciones y cancelación</h2><p>Stripe muestra el importe y las condiciones antes de confirmar el pago. La cancelación evita futuras renovaciones y mantiene el acceso pagado hasta el final del periodo ya abonado, salvo supuestos legalmente permitidos de suspensión por fraude o abuso. Para incidencias de facturación, escribe a <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
    <h2>Disponibilidad e historial</h2><p>El servicio puede cambiar reglas, fuentes, modelos de IA y funcionalidades para reflejar cambios regulatorios o técnicos. Los análisis históricos son instantáneas y conservan la versión de reglas utilizada cuando técnicamente corresponda.</p>
    <h2>Contacto</h2><p>Soporte: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
    <p><strong>Información legal pendiente:</strong> antes de aceptar clientes de pago deben añadirse la identidad legal del prestador, domicilio, datos fiscales, jurisdicción y política de reembolsos aplicables.</p>
    <p><Link href="/privacy">Política de privacidad</Link> · <Link href="/">Volver a Import Rules Verifier</Link></p>
  </main>;
}
