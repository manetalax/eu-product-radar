import Link from 'next/link';
import { BRAND_NAME } from '@/lib/brand';
import { MarketCode, MARKETS } from '@/lib/markets';

function ImportVerifierMark() {
  return <span className="brand-lockup" aria-hidden="true">
    <svg className="brand-import-mark" viewBox="0 0 152 112" focusable="false" role="img">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M76 7c10 0 17 8 20 17 9-5 20-2 26 6 7 9 5 19-1 27 10 3 17 12 16 23-1 10-10 17-20 18 2 10-4 20-14 24-9 4-20 0-27-7-7 7-18 11-27 7-10-4-16-14-14-24-10-1-19-8-20-18-1-11 6-20 16-23-6-8-8-18-1-27 6-8 17-11 26-6 3-9 10-17 20-17Z" strokeWidth="4.2" />
        <path d="M76 11c9 0 15 7 18 16 9-5 18-2 24 5 6 8 4 17-2 24 10 3 16 11 15 21-1 9-8 15-18 17 2 9-3 17-12 21-8 4-18 0-25-7-7 7-17 11-25 7-9-4-14-12-12-21-10-2-17-8-18-17-1-10 5-18 15-21-6-7-8-16-2-24 6-7 15-10 24-5 3-9 9-16 18-16Z" strokeWidth="1.3" opacity=".32" />
      </g>
      <text x="76" y="48" textAnchor="middle" fill="currentColor" fontSize="25" fontWeight="900" fontFamily="ui-sans-serif,system-ui,sans-serif" letterSpacing="-.8">IMPORT</text>
      <text x="76" y="69" textAnchor="middle" fill="currentColor" fontSize="12" fontWeight="900" fontFamily="ui-sans-serif,system-ui,sans-serif" letterSpacing="3.6">AND</text>
      <text x="76" y="94" textAnchor="middle" fill="currentColor" fontSize="23" fontWeight="900" fontStyle="italic" fontFamily="'Segoe Print','Bradley Hand','Comic Sans MS',cursive" letterSpacing="-.9">VERIFIER</text>
    </svg>
    <span className="brand-pass-stamp">PASS</span>
  </span>;
}

export default function Brand({ market, inverse = false, asLink = true, href = '/' }: { market?: MarketCode; inverse?: boolean; asLink?: boolean; href?: string }) {
  const content = <>
    <ImportVerifierMark />
    <span className="brand-wordmark brand-wordmark-visually-secondary"><strong>Import</strong><strong> and </strong><strong className="brand-wordmark-accent">Verifier</strong></span>
    {market && <span className="brand-market">{MARKETS[market].code}</span>}
    <style>{`
      .brand-system{display:inline-flex;align-items:center;gap:8px;min-width:0;text-decoration:none;color:#174ea6}
      .brand-lockup{display:inline-flex;align-items:center;gap:10px;min-width:0;max-width:100%}
      .brand-import-mark{display:block;width:148px;height:auto;max-width:min(34vw,148px);filter:drop-shadow(0 1px 0 rgba(23,78,166,.08));transform:rotate(-.25deg);flex:0 0 auto}
      .brand-pass-stamp{display:inline-grid;place-items:center;min-width:58px;height:34px;padding:0 8px;border:3px solid #c62828;box-shadow:inset 0 0 0 1px rgba(198,40,40,.28);color:#c62828;background:rgba(255,255,255,.9);font-size:14px;font-weight:950;letter-spacing:.12em;line-height:1;transform:rotate(-2.5deg);font-family:ui-sans-serif,system-ui,sans-serif;flex:0 0 auto}
      .brand-system.inverse{color:#fff}.brand-system.inverse .brand-pass-stamp{color:#ff8a80;border-color:#ff8a80;background:transparent}
      .brand-wordmark-visually-secondary{font-size:0;width:1px;height:1px;overflow:hidden;position:absolute;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
      .brand-market{display:inline-grid;place-items:center;min-width:34px;height:26px;padding:0 8px;border:1px solid currentColor;border-radius:999px;font-size:11px;font-weight:850;letter-spacing:.08em;opacity:.8}
      @media(max-width:760px){.brand-lockup{gap:6px}.brand-import-mark{width:112px;max-width:31vw}.brand-pass-stamp{min-width:44px;height:28px;padding:0 5px;border-width:2px;font-size:10px;letter-spacing:.08em}.brand-market{min-width:30px;height:24px;padding:0 6px}}
      @media(max-width:420px){.brand-import-mark{width:96px;max-width:32vw}.brand-pass-stamp{min-width:38px;height:24px;font-size:9px;padding:0 4px}.brand-system{gap:5px}}
    `}</style>
  </>;
  const className = `brand brand-system${inverse ? ' inverse' : ''}`;
  return asLink ? <Link className={className} href={href} aria-label={BRAND_NAME}>{content}</Link> : <span className={className}>{content}</span>;
}
