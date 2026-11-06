'use client';

import { useEffect, useState } from 'react';
import { remainingTime } from '@/lib/canvas/token-expiry';

export function TokenCountdown({ expiresAt }: { expiresAt: number | null }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (expiresAt === null) return;
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, [expiresAt]);

  if (expiresAt === null) return <span className="token-countdown">Token expiry unavailable</span>;
  if (now >= expiresAt) return <span className="token-countdown">Token expired · 00:00</span>;
  return <span className="token-countdown">Token remaining · {remainingTime(expiresAt, now)}</span>;
}
