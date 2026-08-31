import AuthForm from '@/components/AuthForm';
import { isLanguage } from '@/lib/landing-i18n';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  const language = isLanguage(lang) ? lang : undefined;
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect(`/login?message=link_error${language ? `&lang=${language}` : ''}`);
  return <AuthForm initialMode="reset" />;
}
