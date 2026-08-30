'use client';

import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/lib/analysis';
import { MARKETS, type MarketCode } from '@/lib/markets';
import ProductReview, { type ReviewDraft } from './ProductReview';

type PendingRequest = {
  input: RequestInfo | URL;
  init: RequestInit;
  body: Record<string, unknown>;
  resolve: (response: Response) => void;
  reject: (reason?: unknown) => void;
};

function isAnalysisCreate(input: RequestInfo | URL, init?: RequestInit) {
  const method = (init?.method || (input instanceof Request ? input.method : 'GET')).toUpperCase();
  const url = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;
  try {
    const parsed = new URL(url, window.location.origin);
    return method === 'POST' && parsed.origin === window.location.origin && parsed.pathname === '/api/analyses';
  } catch {
    return false;
  }
}

function cancelledResponse() {
  return new Response(JSON.stringify({ error: 'Análisis cancelado. No se ha consumido cuota ni guardado ningún producto.' }), {
    status: 409,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  });
}

export default function AnalysisReviewGate() {
  const [draft, setDraft] = useState<ReviewDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const pending = useRef<PendingRequest | null>(null);
  const originalFetch = useRef<typeof window.fetch | null>(null);

  useEffect(() => {
    if (originalFetch.current) return;
    const nativeFetch = window.fetch.bind(window);
    originalFetch.current = nativeFetch;

    window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
      if (!isAnalysisCreate(input, init) || pending.current) return nativeFetch(input, init);
      if (!init?.body || typeof init.body !== 'string') return nativeFetch(input, init);

      let body: Record<string, unknown>;
      try { body = JSON.parse(init.body) as Record<string, unknown>; }
      catch { return nativeFetch(input, init); }
      if (!Array.isArray(body.products) || typeof body.filename !== 'string') return nativeFetch(input, init);

      const marketCode = typeof body.marketCode === 'string' && body.marketCode in MARKETS ? body.marketCode as MarketCode : 'EU';
      setDraft({ filename: body.filename, marketLabel: MARKETS[marketCode].name, products: body.products as Product[] });

      return new Promise<Response>((resolve, reject) => {
        pending.current = { input, init: { ...init }, body, resolve, reject };
      });
    }) as typeof window.fetch;

    return () => {
      window.fetch = nativeFetch;
      originalFetch.current = null;
      if (pending.current) {
        pending.current.resolve(cancelledResponse());
        pending.current = null;
      }
    };
  }, []);

  const cancel = () => {
    const request = pending.current;
    if (!request) return;
    pending.current = null;
    setDraft(null);
    request.resolve(cancelledResponse());
  };

  const confirm = async () => {
    const request = pending.current;
    if (!request || !draft || !originalFetch.current) return;
    setBusy(true);
    try {
      const body = { ...request.body, products: draft.products };
      const response = await originalFetch.current(request.input, { ...request.init, body: JSON.stringify(body) });
      pending.current = null;
      setDraft(null);
      request.resolve(response);
    } catch (error) {
      pending.current = null;
      setDraft(null);
      request.reject(error);
    } finally {
      setBusy(false);
    }
  };

  if (!draft) return null;
  return <ProductReview
    draft={draft}
    busy={busy}
    onChange={products => setDraft(current => current ? { ...current, products } : current)}
    onCancel={cancel}
    onConfirm={() => void confirm()}
  />;
}
