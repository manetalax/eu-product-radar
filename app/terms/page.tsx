import Link from 'next/link';
import { termsCopy } from '@/lib/legal-pages-i18n';
import { legalConfig } from '@/lib/legal-config';
import { serverLanguage } from '@/lib/server-language';

const SUPPORT_EMAIL = 'importverifier@gmail.com';

export default async function TermsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const language = await serverLanguage(params.lang);
  const t = termsCopy[language];
  const legal = legalConfig();
  return <main className="shell legal-page" lang={language}>
    <h1>{t.title}</h1>
    <p><strong>{t.updatedLabel}:</strong> {t.updated}.</p>
    <p>{t.intro}</p>
    {t.sections.map(section => <section key={section.title}><h2>{section.title}</h2><p>{section.body}</p></section>)}
    <h2>{t.refundTitle}</h2><p>{legal ? legal.refundPolicy : t.refundFallback}</p>
    <h2>{t.providerTitle}</h2>{legal ? <p><strong>{legal.providerName}</strong><br />{legal.providerAddress}<br />{t.taxId}: {legal.taxId}<br />{t.jurisdiction}: {legal.jurisdiction}</p> : <p><strong>{t.prerelease}</strong></p>}
    <h2>{t.contactTitle}</h2><p>{t.support}: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
    <p><Link href={`/privacy?lang=${language}`}>{t.privacy}</Link> · <Link href={`/${language}`}>{t.back}</Link></p>
  </main>;
}
