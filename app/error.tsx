'use client';

import RecoveryPage from '@/components/RecoveryPage';

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <RecoveryPage mode="error" reset={reset} />;
}
