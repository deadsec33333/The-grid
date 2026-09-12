'use client';

import { useEffect, useState } from 'react';
import { clock } from '@/lib/format';

/**
 * A running 72-hour clock. The first render matches the server exactly — the
 * ticking only starts after mount — so nothing rehydrates mismatched.
 */
export function Countdown({
  seconds,
  className = '',
}: {
  seconds: number;
  className?: string;
}) {
  const [left, setLeft] = useState(seconds);

  useEffect(() => {
    setLeft(seconds);
    const id = setInterval(() => {
      setLeft((n) => (n <= 0 ? 0 : n - 1));
    }, 1000);
    return () => clearInterval(id);
  }, [seconds]);

  return <span className={`tnum ${className}`}>{clock(left)}</span>;
}
