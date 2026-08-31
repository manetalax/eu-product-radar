import AuthForm from '@/components/AuthForm';
import { isLoginNoticeKey } from '@/lib/auth-i18n';
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string; plan?: string }> }) {
  const { message, plan } = await searchParams;
  const requestedPlan = plan === 'starter' ? 'starter' as const : undefined;
  return <AuthForm initialMessageKey={isLoginNoticeKey(message) ? message : undefined} requestedPlan={requestedPlan} />;
}
