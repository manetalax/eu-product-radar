import AuthForm from '@/components/AuthForm';
const validPlans = ['pro', 'business', 'audit'] as const;
type Plan = typeof validPlans[number];
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string; plan?: string }> }) {
  const { message, plan } = await searchParams;
  const text = message === 'password_updated' ? 'Contraseña actualizada. Entra con tu nueva contraseña.' : message === 'link_error' ? 'El enlace no es válido o ha caducado. Solicita otro enlace. Con el correo predeterminado, ábrelo en el mismo navegador donde lo solicitaste.' : '';
  const requestedPlan = validPlans.includes(plan as Plan) ? plan as Plan : undefined;
  return <AuthForm initialMessage={text} requestedPlan={requestedPlan} />;
}
