import AuthForm from '@/components/AuthForm';
import { isLoginNoticeKey } from '@/lib/auth-i18n';
import { isUnlimitedBillingOption } from '@/lib/billing';
import { serverLanguage } from '@/lib/server-language';
import { LanguageProvider } from '@/lib/use-language';

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ message?: string; plan?: string; billing?: string; lang?: string }> }) {
  const { message, plan, billing, lang } = await searchParams;
  const requestedPlan = plan === 'starter' ? 'starter' as const : undefined;
  const requestedBillingOption = isUnlimitedBillingOption(billing) ? billing : undefined;
  const language = await serverLanguage(lang);
  return <LanguageProvider initialLanguage={language}>
    <AuthForm
      initialMessageKey={isLoginNoticeKey(message) ? message : undefined}
      requestedPlan={requestedPlan}
      requestedBillingOption={requestedPlan ? requestedBillingOption : undefined}
    />
  </LanguageProvider>;
}
