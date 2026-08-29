import AuthForm from '@/components/AuthForm';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function ResetPasswordPage() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/login?message=link_error');
  return <AuthForm initialMode="reset" />;
}
