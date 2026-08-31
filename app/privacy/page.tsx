import Link from 'next/link';
import { privacyCopy } from '@/lib/legal-pages-i18n';
import { legalConfig } from '@/lib/legal-config';
import { serverLanguage } from '@/lib/server-language';

const SUPPORT_EMAIL = 'importverifier@gmail.com';

export default async function PrivacyPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const language = await serverLanguage(params.lang);
  const t = privacyCopy[language];
  const legal = legalConfig();
  return <main className="shell legal-page" lang={language}>
    <h1>{t.title}</h1>
    <p><strong>{t.updatedLabel}:</strong> {t.updated}.</p>
    <p>{t.intro}</p>
    {t.sections.map(section => <section key={section.title}><h2>{section.title}</h2><p>{section.body}</p></section>)}
    <h2>{t.controllerTitle}</h2>
    {legal ? <p><strong>{legal.providerName}</strong><br />{legal.providerAddress}<br />{t.taxId}: {legal.taxId}<br />{t.jurisdiction}: {legal.jurisdiction}<br />{t.contact}: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p> : <p><strong>{t.prerelease}</strong></p>}
    <p><Link href={`/terms?lang=${language}`}>{t.terms}</Link> · <Link href={`/?lang=${language}`}>{t.back}</Link></p>
  </main>;
}
