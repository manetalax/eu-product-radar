import Dashboard from '@/components/Dashboard';
import DashboardExtrasHub from '@/components/DashboardExtrasHub';
import DashboardModuleOrganizer from '@/components/DashboardModuleOrganizer';
import AnalysisReviewGate from '@/components/AnalysisReviewGate';
import CheckoutReturnSync from '@/components/CheckoutReturnSync';
import FreeTrialUpgradePrompt from '@/components/FreeTrialUpgradePrompt';
import IntelligenceSuite from '@/components/IntelligenceSuite';
import LatestRegulatoryAssessment from '@/components/LatestRegulatoryAssessment';
import PersonalizedPlanOffer from '@/components/PersonalizedPlanOffer';
import UnlimitedExperience from '@/components/UnlimitedExperience';
import WelcomeFlash from '@/components/WelcomeFlash';
import { serverLanguage } from '@/lib/server-language';
import { createClient } from '@/lib/supabase/server';
import { LanguageProvider } from '@/lib/use-language';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ welcome?: string; checkout?: string; session_id?: string; synced?: string; lang?: string }> }) {
  const params = await searchParams;
  const language = await serverLanguage(params.lang);
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect(`/login?lang=${language}`);
  return <LanguageProvider initialLanguage={language}>
    <CheckoutReturnSync checkout={params.checkout} sessionId={params.session_id} synced={params.synced === '1'} />
    <WelcomeFlash show={params.welcome === 'registered'} />
    <UnlimitedExperience />
    <FreeTrialUpgradePrompt />
    <AnalysisReviewGate />
    <DashboardModuleOrganizer />
    <Dashboard email={user.email ?? ''} />
    <DashboardExtrasHub
      personalized={<PersonalizedPlanOffer />}
      intelligence={<IntelligenceSuite />}
      assessment={<LatestRegulatoryAssessment />}
    />
  </LanguageProvider>;
}
