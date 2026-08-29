import { siEbay, siEtsy, siMastercard, siNetlify, siPaypal, siShopify, siStripe, siSupabase, siVisa, siWoocommerce } from 'simple-icons';

type Logo = { name: string; icon?: { path: string; hex: string } };
type LogoGroup = 'commerce' | 'payments' | 'infrastructure';

const LOGOS: Record<LogoGroup, readonly Logo[]> = {
  commerce: [
    { name: 'Amazon' },
    { name: 'Shopify', icon: siShopify },
    { name: 'eBay', icon: siEbay },
    { name: 'Etsy', icon: siEtsy },
    { name: 'WooCommerce', icon: siWoocommerce },
  ],
  payments: [
    { name: 'Stripe', icon: siStripe },
    { name: 'PayPal', icon: siPaypal },
    { name: 'Visa', icon: siVisa },
    { name: 'Mastercard', icon: siMastercard },
  ],
  infrastructure: [
    { name: 'Netlify', icon: siNetlify },
    { name: 'Supabase', icon: siSupabase },
  ],
};

function LogoTile({ logo }: { logo: Logo }) {
  return <span className={`brand-logo-tile${logo.name === 'Amazon' ? ' amazon-logo' : ''}`} title={logo.name}>
    {logo.icon ? <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" style={{ color: `#${logo.icon.hex}` }}><path fill="currentColor" d={logo.icon.path} /></svg> : <span className="amazon-wordmark" aria-hidden="true">amazon<i>⌣</i></span>}
    <span className="sr-only">{logo.name}</span>
  </span>;
}

export default function BrandLogos({ group, label, note, compact = false }: { group: LogoGroup; label: string; note: string; compact?: boolean }) {
  return <div className={`brand-logo-strip ${compact ? 'compact' : ''}`}>
    <div className="brand-logo-copy"><strong>{label}</strong><small>{note}</small></div>
    <div className="brand-logo-list" aria-label={label}>{LOGOS[group].map(logo => <LogoTile key={logo.name} logo={logo} />)}</div>
  </div>;
}
