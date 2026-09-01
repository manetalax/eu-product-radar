'use client';

import { useEffect } from 'react';

const REGISTRATION_FALLBACK_DELAY_MS = 3000;
const REGISTRATION_IDLE_TIMEOUT_MS = 5000;

type IdleCapableWindow = Window & typeof globalThis & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

export default function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let registration: ServiceWorkerRegistration | null = null;
    let cancelled = false;
    let registrationTimer: number | null = null;
    let idleHandle: number | null = null;
    const idleWindow = window as IdleCapableWindow;

    const updateRegistration = async () => {
      if (cancelled || !registration) return;
      try {
        await registration.update();
      } catch {
        // Offline/Safari update failures are non-fatal and must not create unhandled rejections.
      }
    };

    const register = async () => {
      registrationTimer = null;
      idleHandle = null;
      if (cancelled) return;
      try {
        const nextRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
        if (cancelled) return;
        registration = nextRegistration;
        // register() already performs the service-worker update check; avoid a duplicate critical-window fetch.
      } catch {
        registration = null;
      }
    };

    const scheduleRegistration = () => {
      if (cancelled || registration || registrationTimer !== null || idleHandle !== null) return;
      if (idleWindow.requestIdleCallback) {
        idleHandle = idleWindow.requestIdleCallback(() => { void register(); }, { timeout: REGISTRATION_IDLE_TIMEOUT_MS });
        return;
      }
      registrationTimer = window.setTimeout(() => { void register(); }, REGISTRATION_FALLBACK_DELAY_MS);
    };
    const refresh = () => { if (!document.hidden) void updateRegistration(); };

    if (document.readyState === 'complete') scheduleRegistration();
    else window.addEventListener('load', scheduleRegistration, { once: true });
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('online', refresh);

    return () => {
      cancelled = true;
      if (registrationTimer !== null) window.clearTimeout(registrationTimer);
      if (idleHandle !== null && idleWindow.cancelIdleCallback) idleWindow.cancelIdleCallback(idleHandle);
      window.removeEventListener('load', scheduleRegistration);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('online', refresh);
    };
  }, []);
  return null;
}
