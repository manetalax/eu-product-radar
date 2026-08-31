import Dashboard from '@/components/Dashboard';
import AnalysisReviewGate from '@/components/AnalysisReviewGate';
import CheckoutReturnSync from '@/components/CheckoutReturnSync';
import FreeTrialUpgradePrompt from '@/components/FreeTrialUpgradePrompt';
import IntelligenceSuite from '@/components/IntelligenceSuite';
import LatestRegulatoryAssessment from '@/components/LatestRegulatoryAssessment';
import UnlimitedExperience from '@/components/UnlimitedExperience';
import WelcomeFlash from '@/components/WelcomeFlash';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
export const dynamic = 'force-dynamic';
export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string; checkout?: string; session_id?: string; synced?: string }> }) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect('/login');
  const params = await searchParams;
  return <><CheckoutReturnSync checkout={params.checkout} sessionId={params.session_id} synced={params.synced === '1'} /><WelcomeFlash show={params.welcome === 'registered'} /><UnlimitedExperience /><FreeTrialUpgradePrompt /><AnalysisReviewGate /><Dashboard email={user.email ?? ''} /><IntelligenceSuite /><LatestRegulatoryAssessment /></>;
}
