'use client';

import RecoveryPage from '@/components/RecoveryPage';

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <html lang="en">
    <body><RecoveryPage mode="global" reset={reset} /></body>
  </html>;
}
