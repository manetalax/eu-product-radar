import AuthForm from '@/components/AuthForm';
import { isPlanId } from '@/lib/plans';
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string; plan?: string }> }) {
  const { message, plan } = await searchParams;
  const text = message === 'password_updated'
    ? 'Contraseña actualizada. Entra con tu nueva contraseña.'
    : message === 'account_deleted'
      ? 'Tu cuenta, tus análisis y tu historial se han eliminado definitivamente.'
      : message === 'link_error'
        ? 'El enlace no es válido o ha caducado. Solicita otro enlace. Con el correo predeterminado, ábrelo en el mismo navegador donde lo solicitaste.'
        : '';
  const requestedPlan = isPlanId(plan) ? plan : undefined;
  return <AuthForm initialMessage={text} requestedPlan={requestedPlan} />;
}
