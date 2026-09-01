import AuthForm from '@/components/AuthForm';
import { serverLanguage } from '@/lib/server-language';
import { createClient } from '@/lib/supabase/server';
import { LanguageProvider } from '@/lib/use-language';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function ResetPasswordPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const { lang } = await searchParams;
  const language = await serverLanguage(lang);
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect(`/login?message=link_error&lang=${language}`);
  return <LanguageProvider initialLanguage={language}><AuthForm initialMode="reset" /></LanguageProvider>;
}
