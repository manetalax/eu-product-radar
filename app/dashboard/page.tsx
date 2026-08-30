import Dashboard from '@/components/Dashboard';
import AnalysisReviewGate from '@/components/AnalysisReviewGate';
import LatestRegulatoryAssessment from '@/components/LatestRegulatoryAssessment';
import WelcomeFlash from '@/components/WelcomeFlash';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string }> }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/login');
  const params = await searchParams;
  return <><WelcomeFlash show={params.welcome === 'registered'} /><AnalysisReviewGate /><Dashboard email={user.email ?? ''} /><LatestRegulatoryAssessment /></>;
}
