import Link from 'next/link';
import { BRAND_NAME } from '@/lib/brand';
import { MarketCode, MARKETS } from '@/lib/markets';

function ActiveVerifierStamp() {
  return <svg className="brand-active-stamp" viewBox="0 0 164 94" aria-hidden="true" focusable="false" role="img">
    <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="6" width="116" height="80" rx="8" strokeWidth="4.2" transform="rotate(-1.2 63 46)" />
      <rect x="8" y="8" width="112" height="76" rx="7" strokeWidth="1.4" opacity=".42" transform="rotate(.8 64 46)" />
      <path d="M20 45c23 2 58 1 86-2" strokeWidth="2.2" opacity=".75" />
    </g>
    <text x="19" y="39" fill="currentColor" fontSize="27" fontWeight="800" fontFamily="'Segoe Print','Bradley Hand','Comic Sans MS',cursive" letterSpacing="-1.2">active</text>
    <text x="18" y="72" fill="currentColor" fontSize="24" fontWeight="700" fontStyle="italic" fontFamily="'Segoe Print','Bradley Hand','Comic Sans MS',cursive" letterSpacing="-1.1">verifier</text>
    <g transform="translate(112 18) rotate(6 25 25)" fill="none" stroke="currentColor">
      <circle cx="25" cy="25" r="23" strokeWidth="3.2" />
      <circle cx="25" cy="25" r="18.5" strokeWidth="1.3" strokeDasharray="2.5 2.6" opacity=".8" />
      <path d="M7 23h36M8 34h34" strokeWidth="1.5" opacity=".8" />
      <path d="m15 15 2.5 2.3 3.2-.5-1.2 3 1.5 2.9-3.2-.3-2.3 2.2-.7-3.1-2.9-1.5 2.8-1.7.3-3.3ZM34 15l2.5 2.3 3.2-.5-1.2 3 1.5 2.9-3.2-.3-2.3 2.2-.7-3.1-2.9-1.5 2.8-1.7.3-3.3Z" fill="currentColor" stroke="none" opacity=".9" />
      <text x="25" y="31" textAnchor="middle" fill="currentColor" stroke="none" fontSize="13" fontWeight="900" fontFamily="ui-sans-serif,system-ui,sans-serif" letterSpacing=".5">PASS</text>
    </g>
  </svg>;
}

export default function Brand({ market, inverse = false, asLink = true, href = '/' }: { market?: MarketCode; inverse?: boolean; asLink?: boolean; href?: string }) {
  const content = <>
    <ActiveVerifierStamp />
    <span className="brand-wordmark brand-wordmark-visually-secondary"><strong>Import</strong><strong className="brand-wordmark-accent">Verifier</strong></span>
    {market && <span className="brand-market">{MARKETS[market].code}</span>}
    <style>{`
      .brand-system{display:inline-flex;align-items:center;gap:10px;min-width:0;text-decoration:none;color:#174ea6}
      .brand-active-stamp{display:block;width:164px;height:auto;max-width:min(41vw,164px);filter:drop-shadow(0 1px 0 rgba(23,78,166,.08));transform:rotate(-.35deg);flex:0 0 auto}
      .brand-system.inverse{color:#fff}
      .brand-wordmark-visually-secondary{font-size:0;width:1px;height:1px;overflow:hidden;position:absolute;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
      .brand-market{display:inline-grid;place-items:center;min-width:34px;height:26px;padding:0 8px;border:1px solid currentColor;border-radius:999px;font-size:11px;font-weight:850;letter-spacing:.08em;opacity:.8}
      @media(max-width:640px){.brand-active-stamp{width:132px}.brand-market{min-width:30px;height:24px;padding:0 6px}}
    `}</style>
  </>;
  const className = `brand brand-system${inverse ? ' inverse' : ''}`;
  return asLink ? <Link className={className} href={href} aria-label={BRAND_NAME}>{content}</Link> : <span className={className}>{content}</span>;
}
