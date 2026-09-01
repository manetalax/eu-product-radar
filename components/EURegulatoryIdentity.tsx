const DOTS = [
  [50, 10], [70, 15], [85, 30], [90, 50], [85, 70], [70, 85],
  [50, 90], [30, 85], [15, 70], [10, 50], [15, 30], [30, 15],
] as const;

export default function EURegulatoryIdentity({ label, detail }: { label: string; detail: string }) {
  return <div className="eu-regulatory-identity" aria-label={`${label}. ${detail}`}>
    <span className="eu-signal" aria-hidden="true">
      <svg viewBox="0 0 100 100" focusable="false">
        <rect width="100" height="100" rx="24" fill="currentColor" />
        {DOTS.map(([cx, cy]) => <circle className="eu-star-dot" key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.4" />)}
        <circle className="eu-radar-ring" cx="50" cy="50" r="18" />
        <path className="eu-radar-line" d="M50 50 65 37" />
        <circle className="eu-radar-core" cx="50" cy="50" r="4" />
      </svg>
    </span>
    <span className="eu-regulatory-copy"><strong>{label}</strong><small>{detail}</small></span>
  </div>;
}
