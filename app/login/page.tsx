import AuthForm from '@/components/AuthForm';
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  const text = message === 'password_updated' ? 'Contraseña actualizada. Entra con tu nueva contraseña.' : message === 'link_error' ? 'El enlace no es válido o ha caducado. Solicita otro enlace. Con el correo predeterminado, ábrelo en el mismo navegador donde lo solicitaste.' : '';
  return <AuthForm initialMessage={text} />;
}
