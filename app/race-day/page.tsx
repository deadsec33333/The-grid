import { PageHead, Rule, SectionLabel, Stat } from '@/components/primitives';
import {
  CLERK_FEE,
  CONSTRUCTOR_BY_ID,
  FEES,
  POOL_ETH,
  POOL_SHARE,
  RACE_THRESHOLD_ETH,
  ROUNDS,
  TREASURY_ETH,
  TREASURY_SHARE,
} from '@/lib/fixtures';
import { eth, pct, units } from '@/lib/format';

export default function RaceDayPage() {
  const filled = Math.min(1, POOL_ETH / RACE_THRESHOLD_ETH);
  const short = RACE_THRESHOLD_ETH - POOL_ETH;
  const ready = POOL_ETH >= RACE_THRESHOLD_ETH;

  return (
    <div className="mx-auto max-w-[1100px] px-8 pb-28">
      <PageHead
        eyebrow="Race Day"
        title="The bar fills. Anyone pulls the lever."
        lede="Every fee the protocol charges is paid in ETH and split seventy-thirty between the prize pool and the treasury. When the pool crosses its threshold any wallet may start the race, takes half a percent for the gas, and is named permanently in the results as Clerk of the Course."
      />

      <div className="pt-4 pb-20">
        <div className="flex items-end justify-between">
          <div>
            <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
              Prize pool
            </div>
            <div className="tnum mt-3 text-[52px] leading-none font-medium tracking-[-0.03em]">
              {eth(POOL_ETH)}
              <span className="ml-3 text-[20px] font-normal text-ink-3">ETH</span>
            </div>
          </div>
          <div className="tnum text-right">
            <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
              Threshold
            </div>
            <div className="mt-3 text-[20px] leading-none text-ink-2">
              {eth(RACE_THRESHOLD_ETH, 0)} ETH
            </div>
          </div>
        </div>

        {/* Five lights, the way a race actually starts. They fill as the pool
            does, and the fifth one lighting is the threshold. */}
        <div className="mt-10 flex items-center gap-4">
          {Array.from({ length: 5 }, (_, i) => {
            const lit = i < Math.floor(filled * 5);
            const next = i === Math.floor(filled * 5);
            return (
              <span
                key={i}
                className={`h-7 w-7 rounded-full ${next ? 'pip' : ''}`}
                style={{
                  background: lit ? 'var(--color-accent)' : 'var(--color-rule)',
                }}
              />
            );
          })}
          <span className="ml-4 text-[12px] text-ink-3">
            {ready
              ? 'All five lit. Lights out whenever someone pulls the lever.'
              : `${5 - Math.floor(filled * 5)} to go before anyone can start a race.`}
          </span>
        </div>

        <div className="relative mt-8 h-[6px] w-full bg-rule">
          <div className="h-full bg-accent" style={{ width: `${filled * 100}%` }} />
        </div>

        <div className="tnum mt-4 flex items-baseline justify-between text-[12px]">
          <span className="text-ink-2">
            {pct(filled * 100)} of the way to round {ROUNDS[0].id + 1}
          </span>
          <span className="text-ink-3">
            {ready ? 'ready to start' : `${eth(short)} ETH short`}
          </span>
        </div>

        <div className="mt-12 flex items-center gap-8">
          <button
            type="button"
            disabled={!ready}
            className="h-10 rounded-[3px] bg-ink px-6 text-[13px] font-medium text-paper disabled:bg-rule disabled:text-ink-3"
          >
            Start the race
          </button>
          <span className="tnum text-[12px] text-ink-3">
            Pays the caller {pct(CLERK_FEE * 100, 1)} of the pool ·{' '}
            {eth(POOL_ETH * CLERK_FEE)} ETH at the current size
          </span>
        </div>
      </div>

      <Rule />

      <div className="grid grid-cols-[220px_1fr] gap-x-16 py-14">
        <SectionLabel>Where it comes from</SectionLabel>
        <div>
          <div className="flex gap-16">
            <Stat
              label="To the pool"
              value={`${POOL_SHARE}%`}
              sub={`${eth(POOL_ETH)} ETH this epoch`}
            />
            <Stat
              label="To the treasury"
              value={`${TREASURY_SHARE}%`}
              sub={`${eth(TREASURY_ETH)} ETH this epoch`}
            />
          </div>

          <div className="mt-12">
            {FEES.map((fee, i) => (
              <div key={fee.id}>
                {i > 0 && <Rule />}
                <div className="flex items-baseline justify-between py-4">
                  <span className="text-[13px] text-ink">{fee.label}</span>
                  <span className="flex-1 px-8 text-[12px] text-ink-3">
                    {fee.note}
                  </span>
                  <span className="tnum text-[13px]">{fee.rate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Rule />

      <div className="grid grid-cols-[220px_1fr] gap-x-16 py-14">
        <SectionLabel>Rounds run</SectionLabel>

        <div className="space-y-14">
          {ROUNDS.map((round) => (
            <div key={round.id}>
              <div className="flex items-baseline justify-between">
                <div className="flex items-baseline gap-5">
                  <span className="tnum text-[22px] leading-none font-medium tracking-[-0.02em]">
                    Round {round.id}
                  </span>
                  <span className="tnum text-[12px] text-ink-3">{round.date}</span>
                </div>
                <span className="tnum text-[15px]">{eth(round.pool)} ETH</span>
              </div>

              <div className="tnum mt-3 flex items-baseline gap-6 text-[12px] text-ink-3">
                <span>
                  Clerk of the Course{' '}
                  <span className="text-ink-2">{round.clerk}</span>
                </span>
                <span>took {eth(round.clerkFeeEth, 4)} ETH</span>
                <span className="text-ink-4">{round.txHash}</span>
              </div>

              <div className="mt-6 grid grid-cols-6 gap-x-6">
                {round.slices.map((slice) => {
                  const c = CONSTRUCTOR_BY_ID[slice.constructorId];
                  return (
                    <div key={slice.constructorId}>
                      <div className="text-[12px] text-ink">{c.name}</div>
                      <div className="tnum mt-2 text-[13px] text-ink-2">
                        {pct(slice.share)}
                      </div>
                      <div className="tnum mt-1 text-[11px] text-ink-3">
                        {units(slice.units, 2)} {c.ticker}
                      </div>
                      <div className="mt-2 h-[2px] w-full bg-rule">
                        <div
                          className="h-full bg-ink-4"
                          style={{ width: `${(slice.share / 30) * 100}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Rule />

      <p className="max-w-[64ch] pt-10 text-[13px] leading-[1.7] text-ink-3">
        Settlement runs from pre-funded inventory at the Chainlink price rather
        than routing through shallow pools. Everyone signed is paid: rank
        changes the size of a share, never whether there is one.
      </p>
    </div>
  );
}
