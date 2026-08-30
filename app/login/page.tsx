import AuthForm from '@/components/AuthForm';
import { isLoginNoticeKey } from '@/lib/auth-i18n';
import { isPurchaseId } from '@/lib/plans';
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string; plan?: string }> }) {
  const { message, plan } = await searchParams;
  const requestedPlan = isPurchaseId(plan) ? plan : undefined;
  return <AuthForm initialMessageKey={isLoginNoticeKey(message) ? message : undefined} requestedPlan={requestedPlan} />;
}
