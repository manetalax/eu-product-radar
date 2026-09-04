import Link from 'next/link';
import { BRAND_NAME } from '@/lib/brand';
import { MarketCode, MARKETS } from '@/lib/markets';

function ImportVerifierMark() {
  return <span className="brand-lockup" aria-hidden="true">
    <svg className="brand-import-mark" viewBox="0 0 170 118" focusable="false" role="img">
      <g fill="#fffdf8" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round">
        <path d="M85 7c11 0 19 8 22 18 10-5 22-2 29 7 7 9 5 20-2 28 11 3 18 13 17 24-1 11-11 18-22 19 2 11-4 21-15 25-10 4-22 0-29-8-8 8-20 12-30 8-11-4-17-14-15-25-11-1-21-8-22-19-1-11 6-21 17-24-7-8-9-19-2-28 7-9 19-12 29-7 3-10 11-18 21-18Z" strokeWidth="4.4" />
        <path d="M85 12c10 0 17 7 20 16 10-5 20-2 27 6 6 8 4 18-2 25 10 3 17 12 16 22-1 10-9 16-20 18 2 10-4 19-13 23-9 4-20 0-28-7-7 7-18 11-27 7-10-4-16-13-14-23-10-2-18-8-19-18-1-10 5-19 16-22-6-7-8-17-2-25 7-8 17-11 27-6 3-9 10-16 20-16Z" fill="none" stroke="#e5483b" strokeWidth="1.5" opacity=".75" />
      </g>
      <text x="85" y="50" textAnchor="middle" fill="currentColor" fontSize="27" fontWeight="950" fontStyle="italic" fontFamily="ui-sans-serif,system-ui,sans-serif" letterSpacing="-.8">IMPORT</text>
      <path d="M47 59 C70 56 102 56 124 59" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <text x="85" y="73" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="900" fontFamily="ui-sans-serif,system-ui,sans-serif" letterSpacing="4.4">AND</text>
      <text x="85" y="96" textAnchor="middle" fill="#e5483b" fontSize="21" fontWeight="900" fontStyle="italic" fontFamily="'Segoe Print','Bradley Hand','Comic Sans MS',cursive" letterSpacing="-.7">VERIFIER</text>
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
      .brand-lockup{display:inline-flex;align-items:center;gap:8px;min-width:0;max-width:100%}
      .brand-import-mark{display:block;width:158px;height:auto;max-width:min(36vw,158px);filter:drop-shadow(0 4px 5px rgba(23,78,166,.12));transform:rotate(-.5deg);flex:0 0 auto}
      .brand-pass-stamp{display:inline-grid;place-items:center;min-width:54px;height:54px;padding:0 5px;border:3px double currentColor;border-radius:50%;box-shadow:inset 0 0 0 2px #fff,inset 0 0 0 3px currentColor;color:#174ea6;background:rgba(255,255,255,.94);font-size:12px;font-weight:950;letter-spacing:.08em;line-height:1;transform:rotate(6deg);font-family:ui-sans-serif,system-ui,sans-serif;flex:0 0 auto}
      .brand-system.inverse{color:#fff}.brand-system.inverse .brand-pass-stamp{color:#fff;background:transparent;box-shadow:inset 0 0 0 2px transparent,inset 0 0 0 3px currentColor}
      .brand-wordmark-visually-secondary{font-size:0;width:1px;height:1px;overflow:hidden;position:absolute;clip:rect(0 0 0 0);clip-path:inset(50%);white-space:nowrap}
      .brand-market{display:inline-grid;place-items:center;min-width:34px;height:26px;padding:0 8px;border:1px solid currentColor;border-radius:999px;font-size:11px;font-weight:850;letter-spacing:.08em;opacity:.8}
      @media(max-width:760px){.brand-lockup{gap:5px}.brand-import-mark{width:122px;max-width:34vw}.brand-pass-stamp{min-width:40px;height:40px;padding:0 3px;border-width:2px;font-size:9px}.brand-market{min-width:30px;height:24px;padding:0 6px}}
      @media(max-width:420px){.brand-import-mark{width:104px;max-width:34vw}.brand-pass-stamp{min-width:34px;height:34px;font-size:8px}.brand-system{gap:4px}}
    `}</style>
  </>;
  const className = `brand brand-system${inverse ? ' inverse' : ''}`;
  return asLink ? <Link className={className} href={href} aria-label={BRAND_NAME}>{content}</Link> : <span className={className}>{content}</span>;
}
