import { PageHead, Rule } from '@/components/primitives';
import {
  CARS,
  CARS_PER_CONSTRUCTOR,
  CONSTRUCTORS,
  CONSTRUCTOR_WEIGHT,
  LAST_ROUND,
  RANKS_DESC,
} from '@/lib/fixtures';
import { eth, int, pct, units } from '@/lib/format';

export default function PaddockPage() {
  const rows = CONSTRUCTORS.map((c) => {
    const cars = CARS.filter((car) => car.constructor.index === c.index);
    const slice = LAST_ROUND.slices.find((s) => s.constructorId === c.id)!;
    const seats = cars.filter((car) => car.rank.seats !== null).length;
    const counts = Object.fromEntries(
      RANKS_DESC.map((r) => [r.id, cars.filter((car) => car.rank.id === r.id).length]),
    ) as Record<string, number>;
    return { c, slice, seats, counts, weight: CONSTRUCTOR_WEIGHT[c.id] };
  });

  const maxShare = Math.max(...rows.map((r) => r.slice.share));

  return (
    <div className="mx-auto max-w-[1240px] px-8 pb-28">
      <PageHead
        eyebrow="The Paddock"
        title="Six teams, two hundred cars each."
        lede="Headcount is fixed at deploy — the constructor falls out of the token id and nothing is stored. What moves is the share of each round, set by the constructor’s share of the epoch’s trading volume, and how many of the 349 counted seats each one holds."
      />

      <Rule />

      {/* Column headings */}
      <div className="grid grid-cols-[1fr_92px_92px_130px_170px] items-baseline gap-x-8 py-4 text-[11px] tracking-[0.14em] text-ink-3 uppercase">
        <div>Constructor</div>
        <div className="text-right">Headcount</div>
        <div className="text-right">Seats held</div>
        <div className="text-right">Round {LAST_ROUND.id} share</div>
        <div className="text-right">Paid out</div>
      </div>

      <Rule />

      {rows.map((row, i) => (
        <div key={row.c.id}>
          {i > 0 && <Rule />}
          <div className="grid grid-cols-[1fr_92px_92px_130px_170px] items-baseline gap-x-8 py-7">
            <div>
              <div className="text-[17px] font-medium tracking-[-0.015em]">
                {row.c.name}
              </div>
              <div className="tnum mt-1.5 text-[12px] text-ink-3">
                {row.c.ticker} · tokens {int(row.c.firstToken)}–
                {int(row.c.lastToken)}
              </div>
              <p className="mt-3 max-w-[42ch] text-[13px] leading-[1.6] text-ink-2">
                {row.c.character}
              </p>
            </div>

            <div className="tnum text-right text-[15px]">
              {int(CARS_PER_CONSTRUCTOR)}
            </div>

            <div className="tnum text-right text-[15px]">{int(row.seats)}</div>

            <div className="text-right">
              <div className="tnum text-[15px]">{pct(row.slice.share)}</div>
              <div className="mt-2.5 ml-auto h-[2px] w-full bg-rule">
                <div
                  className="ml-auto h-full bg-ink"
                  style={{ width: `${(row.slice.share / maxShare) * 100}%` }}
                />
              </div>
            </div>

            <div className="tnum text-right">
              <div className="text-[15px]">
                {units(row.slice.units, 2)}{' '}
                <span className="text-ink-3">{row.c.ticker}</span>
              </div>
              <div className="mt-1.5 text-[12px] text-ink-3">
                {eth(row.slice.eth)} ETH
              </div>
            </div>
          </div>

          {/* Rank composition — the same colour language as the grid. */}
          <div className="flex items-end gap-6 pb-7">
            {RANKS_DESC.map((rank) => {
              const n = row.counts[rank.id];
              return (
                <div key={rank.id} className="flex items-center gap-2">
                  <span
                    className="inline-block shrink-0"
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 1,
                      background: rank.color,
                      opacity: n === 0 ? 0.25 : 1,
                    }}
                  />
                  <span
                    className={`tnum text-[12px] ${n === 0 ? 'text-ink-4' : 'text-ink-2'}`}
                  >
                    {n}
                  </span>
                  <span
                    className={`text-[12px] ${n === 0 ? 'text-ink-4' : 'text-ink-3'}`}
                  >
                    {rank.name}
                  </span>
                </div>
              );
            })}
            <div className="tnum ml-auto text-[12px] text-ink-3">
              weight {row.weight.toFixed(1)}
            </div>
          </div>
        </div>
      ))}

      <Rule />

      <p className="max-w-[68ch] pt-10 text-[13px] leading-[1.7] text-ink-3">
        Seats are counted across the whole grid rather than per constructor, so
        nothing stops all six Champions driving for one team. Brandt & Sons
        currently field the largest bottom half on the grid and neither a
        Champion nor a Lead Driver.
      </p>
    </div>
  );
}
