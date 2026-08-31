'use client';

import { useEffect } from 'react';

const REGISTRATION_DELAY_MS = 1200;

export default function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return;
    let registration: ServiceWorkerRegistration | null = null;
    let cancelled = false;
    let registrationTimer: number | null = null;

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
      if (cancelled) return;
      try {
        const nextRegistration = await navigator.serviceWorker.register('/sw.js', { scope: '/', updateViaCache: 'none' });
        if (cancelled) return;
        registration = nextRegistration;
        await updateRegistration();
      } catch {
        registration = null;
      }
    };

    const scheduleRegistration = () => {
      if (cancelled || registration || registrationTimer !== null) return;
      registrationTimer = window.setTimeout(() => { void register(); }, REGISTRATION_DELAY_MS);
    };
    const refresh = () => { if (!document.hidden) void updateRegistration(); };

    if (document.readyState === 'complete') scheduleRegistration();
    else window.addEventListener('load', scheduleRegistration, { once: true });
    document.addEventListener('visibilitychange', refresh);
    window.addEventListener('online', refresh);

    return () => {
      cancelled = true;
      if (registrationTimer !== null) window.clearTimeout(registrationTimer);
      window.removeEventListener('load', scheduleRegistration);
      document.removeEventListener('visibilitychange', refresh);
      window.removeEventListener('online', refresh);
    };
  }, []);
  return null;
}
