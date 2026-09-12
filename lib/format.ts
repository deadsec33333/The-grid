/** Display helpers. No data lives here — see lib/fixtures.ts. */

export const grid = (n: number): string =>
  `${n.toLocaleString('en-US')} $GRID`;

export const compactGrid = (n: number): string =>
  n >= 1_000_000
    ? `${(n / 1_000_000).toLocaleString('en-US', { maximumFractionDigits: 2 })}M`
    : `${(n / 1_000).toLocaleString('en-US', { maximumFractionDigits: 0 })}k`;

export const eth = (n: number, dp = 3): string =>
  n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });

export const units = (n: number, dp = 4): string =>
  n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp });

export const pct = (n: number, dp = 1): string =>
  `${n.toLocaleString('en-US', { minimumFractionDigits: dp, maximumFractionDigits: dp })}%`;

export const int = (n: number): string => n.toLocaleString('en-US');

export const token = (id: number): string => `#${String(id).padStart(4, '0')}`;

/** 72:00:00 style. Hours are not wrapped to days — the clock is a countdown. */
export function clock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
