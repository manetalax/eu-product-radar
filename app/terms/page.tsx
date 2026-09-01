import Link from 'next/link';
import { termsCopy } from '@/lib/legal-pages-i18n';
import { canonicalLegalBrand, commercialTerms, LEGAL_COPY_UPDATED } from '@/lib/legal-commercial-i18n';
import { legalConfig } from '@/lib/legal-config';
import { serverLanguage } from '@/lib/server-language';

const SUPPORT_EMAIL = 'importverifier@gmail.com';

export default async function TermsPage({ searchParams }: { searchParams: Promise<{ lang?: string }> }) {
  const params = await searchParams;
  const language = await serverLanguage(params.lang);
  const t = termsCopy[language];
  const commercial = commercialTerms[language];
  const legal = legalConfig();
  const text = canonicalLegalBrand;
  const sections = t.sections.map((section, index) => {
    if (index === 2) return { title: commercial.offerTitle, body: commercial.offerBody };
    if (index === 3) return { title: commercial.paymentsTitle, body: commercial.paymentsBody };
    return { title: text(section.title), body: text(section.body) };
  });

  return <main className="shell legal-page" lang={language}>
    <h1>{text(t.title)}</h1>
    <p><strong>{text(t.updatedLabel)}:</strong> {LEGAL_COPY_UPDATED}.</p>
    <p>{text(t.intro)}</p>
    {sections.map(section => <section key={section.title}><h2>{section.title}</h2><p>{section.body}</p></section>)}
    <h2>{text(t.refundTitle)}</h2><p>{legal ? legal.refundPolicy : text(t.refundFallback)}</p>
    <h2>{text(t.providerTitle)}</h2>{legal ? <p><strong>{legal.providerName}</strong><br />{legal.providerAddress}<br />{text(t.taxId)}: {legal.taxId}<br />{text(t.jurisdiction)}: {legal.jurisdiction}</p> : <p><strong>{text(t.prerelease)}</strong></p>}
    <h2>{text(t.contactTitle)}</h2><p>{text(t.support)}: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.</p>
    <p><Link href={`/privacy?lang=${language}`}>{text(t.privacy)}</Link> · <Link href={`/${language}`}>{text(t.back)}</Link></p>
  </main>;
}
