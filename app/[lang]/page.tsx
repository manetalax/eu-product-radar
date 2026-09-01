import Home from '../page';
import { LANGUAGES, isLanguage } from '@/lib/landing-i18n';
import { notFound } from 'next/navigation';

export const dynamic = 'force-static';
export const dynamicParams = false;

export function generateStaticParams() {
  return LANGUAGES.map(lang => ({ lang }));
}

export default async function LocalizedLanding({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!isLanguage(lang)) notFound();
  return Home({ searchParams: Promise.resolve({ lang }) });
}
