import Link from 'next/link';
import { BRAND_NAME } from '@/lib/brand';
import { MarketCode, MARKETS } from '@/lib/markets';

function Mark() {
  return <svg className="brand-mark" viewBox="0 0 144 144" aria-hidden="true" focusable="false">
    <path d="M20 48.5 72 20l52 28.5v57L72 134l-52-28.5v-57Z" fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
    <path d="m20 48.5 52 28.5 52-28.5M72 77v57" fill="none" stroke="currentColor" strokeWidth="10" strokeLinejoin="round" />
    <path d="m72 77 38-38" fill="none" stroke="var(--accent)" strokeWidth="10" strokeLinecap="round" />
    <path d="M80 23a50 50 0 0 1 45 45" fill="none" stroke="var(--accent)" strokeWidth="10" strokeLinecap="round" />
    <circle cx="72" cy="77" r="9" fill="var(--accent)" />
  </svg>;
}

export default function Brand({ market, inverse = false, asLink = true }: { market?: MarketCode; inverse?: boolean; asLink?: boolean }) {
  const content = <><Mark /><span className="brand-wordmark">Import Rules <b>Verifier</b></span>{market && <span className="brand-market">{MARKETS[market].code}</span>}</>;
  const className = `brand brand-system${inverse ? ' inverse' : ''}`;
  return asLink ? <Link className={className} href="/" aria-label={`${BRAND_NAME}, inicio`}>{content}</Link> : <span className={className}>{content}</span>;
}
