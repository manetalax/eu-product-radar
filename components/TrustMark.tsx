export default function TrustMark({ title, detail, httpsLabel, explanation, compact = false }: { title: string; detail: string; httpsLabel: string; explanation: string; compact?: boolean }) {
  const brandTitle = title === 'EPR Trust Mark' ? 'IRV Trust Mark' : title.replace(/EPR/g, 'IRV');
  const brandExplanation = explanation.replace(/Product Radar/g, 'Import Rules Verifier');

  return <div className={`trust-cluster ${compact ? 'compact' : ''}`}>
    <div className="epr-trust-mark" title={brandExplanation}>
      <svg viewBox="0 0 40 44" aria-hidden="true" focusable="false">
        <path d="M20 2.8 35 8.2v12.2c0 9.2-5.4 16.7-15 21-9.6-4.3-15-11.8-15-21V8.2L20 2.8Z" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinejoin="round" />
        <path d="m13.1 21.7 4.6 4.6 9.5-10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span><strong>{brandTitle}</strong><small>{detail}</small></span>
    </div>
    <div className="https-trust"><span aria-hidden="true">⌁</span><strong>{httpsLabel}</strong></div>
    <p>{brandExplanation}</p>
  </div>;
}
