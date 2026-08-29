import Dashboard from '@/components/Dashboard';
import WelcomeFlash from '@/components/WelcomeFlash';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/login');
  const params = await searchParams;
  return <><WelcomeFlash show={params.welcome === 'registered'} /><Dashboard email={user.email ?? ''} /></>;
}
