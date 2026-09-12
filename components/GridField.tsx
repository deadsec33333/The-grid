'use client';

import { memo, useCallback, useState } from 'react';
import {
  CHAMPIONS,
  CONSTRUCTORS,
  RANKS_DESC,
  band,
  type Car,
  type Rank,
} from '@/lib/fixtures';
import { int, token } from '@/lib/format';
import { Inspector } from '@/components/Inspector';

/** Marks sit this far apart. Scaled off the mark so every band breathes alike. */
const gapFor = (width: number) => Math.max(3, Math.round(width * 0.5));

function Mark({ car, index, band }: { car: Car; index: number; band: number }) {
  return (
    <div
      data-token={car.tokenId}
      data-pay={car.payDriver ? '1' : undefined}
      className="car relative hover:z-10"
      style={
        {
          width: car.rank.dotW,
          height: car.rank.dot,
          background: car.rank.color,
          opacity: car.banned ? 0.4 : 1,
          '--i': index,
          '--band': band,
        } as React.CSSProperties
      }
    />
  );
}

/** One rank, across all six constructors. Whitespace does the separating. */
function Band({ rank, order }: { rank: Rank; order: number }) {
  const gap = gapFor(rank.dotW);

  return (
    <div className="grid grid-cols-[108px_repeat(6,1fr)] gap-x-6 py-5">
      <div className="pt-[2px] text-right">
        <div className="text-[12px] leading-none text-ink">{rank.name}</div>
        <div className="tnum mt-[6px] text-[11px] leading-none text-ink-3">
          {rank.seats === null ? 'uncapped' : `${int(rank.seats)} seats`}
        </div>
      </div>

      {CONSTRUCTORS.map((constructor) => (
        <div
          key={constructor.id}
          className="flex flex-wrap content-start"
          style={{ gap }}
        >
          {band(constructor.index, rank.id).map((car, i) => (
            <Mark key={car.tokenId} car={car} index={i} band={order} />
          ))}
        </div>
      ))}
    </div>
  );
}

/**
 * The six Champions, alone at the top (§2 — never awarded, Seat Bid only).
 * They are deliberately not aligned to the columns below: two of them drive
 * for Marchetti and none for Brandt & Sons.
 */
function ChampionRow() {
  return (
    <div className="flex items-end justify-center gap-16 pb-16">
      {CHAMPIONS.map((car) => (
        <div key={car.tokenId} className="flex flex-col items-center">
          <div
            data-token={car.tokenId}
            className="car car--champion relative hover:z-10"
            style={{
              width: car.rank.dotW,
              height: car.rank.dot,
              background: car.rank.color,
            }}
          />
          <div className="tnum mt-4 text-[12px] text-ink">{token(car.tokenId)}</div>
          <div className="mt-1 text-[11px] whitespace-nowrap text-ink-3">
            {car.constructor.name}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * The field never re-renders. Hover is read by delegation on the wrapper and
 * kept in the board's state; the marks themselves are styled entirely in CSS,
 * so moving across 1,200 targets costs nothing.
 */
const Field = memo(function Field() {
  return (
    <div>
      <ChampionRow />

      <div className="grid grid-cols-[108px_repeat(6,1fr)] gap-x-6 pb-4">
        <div />
        {CONSTRUCTORS.map((constructor) => (
          <div key={constructor.id}>
            <div className="text-[12px] leading-none font-medium text-ink">
              {constructor.name}
            </div>
            <div className="tnum mt-[6px] text-[11px] leading-none text-ink-3">
              {constructor.ticker}
            </div>
          </div>
        ))}
      </div>

      <div className="h-px bg-rule" />

      {RANKS_DESC.filter((r) => r.id !== 'champion').map((rank, i) => (
        <Band key={rank.id} rank={rank} order={i + 1} />
      ))}
    </div>
  );
});

export function GridBoard() {
  const [hovered, setHovered] = useState<number | null>(null);

  const onOver = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>('[data-token]');
    setHovered(target ? Number(target.dataset.token) : null);
  }, []);

  const onLeave = useCallback(() => setHovered(null), []);

  return (
    <div className="grid grid-cols-[1fr_260px] gap-x-16">
      <div onMouseOver={onOver} onMouseLeave={onLeave}>
        <Field />
      </div>
      <Inspector tokenId={hovered} />
    </div>
  );
}
