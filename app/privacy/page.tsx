import Link from 'next/link';
import { privacyCopy } from '@/lib/legal-pages-i18n';
import { canonicalLegalBrand, LEGAL_COPY_UPDATED } from '@/lib/legal-commercial-i18n';
import { legalConfig } from '@/lib/legal-config';
import { serverLanguage } from '@/lib/server-language';

const SUPPORT_EMAIL = 'importverifier@gmail.com';

export default async function PrivacyPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const language = await serverLanguage(params.lang);
  const t = privacyCopy[language];
  const legal = legalConfig();
  const text = canonicalLegalBrand;
  return <main className="shell legal-page" lang={language}>
    <h1>{text(t.title)}</h1>
    <p><strong>{text(t.updatedLabel)}:</strong> {LEGAL_COPY_UPDATED}.</p>
    <p>{text(t.intro)}</p>
    {t.sections.map(section => <section key={section.title}><h2>{text(section.title)}</h2><p>{text(section.body)}</p></section>)}
    <h2>{text(t.controllerTitle)}</h2>
    {legal ? <p><strong>{legal.providerName}</strong><br />{legal.providerAddress}<br />{text(t.taxId)}: {legal.taxId}<br />{text(t.jurisdiction)}: {legal.jurisdiction}<br />{text(t.contact)}: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p> : <p><strong>{text(t.prerelease)}</strong></p>}
    <p><Link href={`/terms?lang=${language}`}>{text(t.terms)}</Link> · <Link href={`/${language}`}>{text(t.back)}</Link></p>
  </main>;
}
