import { Countdown } from '@/components/Countdown';
import { PageHead, Rule, SectionLabel } from '@/components/primitives';
import {
  OPEN_BIDS,
  RANK_BY_ID,
  SEAT_BID_DEFEND_BURN,
  SEAT_BID_IMMUNITY_DAYS,
  SEAT_BID_OUSTED_SHARE,
  SEAT_BID_WINDOW_HOURS,
  SEAT_BID_WINDOW_SECONDS,
  SETTLED_BIDS,
  carOf,
  type SeatBid,
} from '@/lib/fixtures';
import { compactGrid, grid, int, token } from '@/lib/format';

function Party({ tokenId, role }: { tokenId: number; role: string }) {
  const car = carOf(tokenId);
  return (
    <div>
      <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
        {role}
      </div>
      <div className="mt-3 flex items-center gap-2.5">
        <span
          className="inline-block shrink-0"
          style={{ width: 9, height: 9, borderRadius: 1, background: car.rank.color }}
        />
        <span className="tnum text-[16px] font-medium tracking-[-0.01em]">
          {token(car.tokenId)}
        </span>
      </div>
      <div className="mt-2 text-[12px] text-ink-2">{car.constructor.name}</div>
      <div className="mt-1 text-[12px] text-ink-3">
        {car.rank.name}
        {car.payDriver && <span className="text-accent"> · pay driver</span>}
      </div>
    </div>
  );
}

function OpenBid({ bid }: { bid: SeatBid }) {
  const rank = RANK_BY_ID[bid.rankId];
  const elapsed = SEAT_BID_WINDOW_SECONDS - bid.secondsLeft;
  const urgent = bid.secondsLeft < 12 * 3600;

  return (
    <div className="py-12">
      <div className="flex items-baseline justify-between">
        <div className="flex items-baseline gap-5">
          <span className="text-[22px] leading-none font-medium tracking-[-0.02em]">
            {rank.name}
          </span>
          <span className="tnum text-[12px] text-ink-3">
            {int(rank.seats ?? 0)} seats · full
          </span>
        </div>
        <div className="flex items-start gap-3 text-right">
          <span
            className="pip mt-2 h-[7px] w-[7px] shrink-0 rounded-full"
            style={{
              background: urgent ? 'var(--color-accent)' : 'var(--color-ink-4)',
            }}
          />
          <div>
          <Countdown
            seconds={bid.secondsLeft}
            className={`text-[26px] leading-none font-medium tracking-[-0.02em] ${
              urgent ? 'text-accent' : 'text-ink'
            }`}
          />
          <div className="tnum mt-2 text-[11px] tracking-[0.14em] text-ink-3 uppercase">
            left to answer
          </div>
          </div>
        </div>
      </div>

      <div className="mt-6 h-[2px] w-full bg-rule">
        <div
          className={urgent ? 'h-full bg-accent' : 'h-full bg-ink-4'}
          style={{ width: `${(elapsed / SEAT_BID_WINDOW_SECONDS) * 100}%` }}
        />
      </div>

      <div className="mt-10 grid grid-cols-[1fr_1fr_1fr] gap-x-12">
        <Party tokenId={bid.challenger} role="Challenger" />
        <Party tokenId={bid.incumbent} role="Incumbent" />
        <div>
          <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
            Deposit posted
          </div>
          <div className="tnum mt-3 text-[16px] font-medium tracking-[-0.01em]">
            {compactGrid(bid.deposit)}
          </div>
          <div className="tnum mt-2 text-[12px] text-ink-3">
            {grid(bid.deposit)}
          </div>
          <div className="mt-4 text-[12px] leading-[1.6] text-ink-2">
            Match it and the seat stays, {SEAT_BID_DEFEND_BURN * 100}% of the
            stake burns, and the seat is immune for {SEAT_BID_IMMUNITY_DAYS}{' '}
            days.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function SeatBidsPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-8 pb-28">
      <PageHead
        eyebrow="Seat Bids"
        title="Seventy-two hours to answer."
        lede="From Test Driver upward the seats are counted. When the rank you want is full you name a specific car one rung above you and post the deposit. The incumbent has three days to match it."
        aside={
          <div className="tnum text-right">
            <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
              Open now
            </div>
            <div className="mt-2 text-[44px] leading-none font-medium tracking-[-0.03em]">
              {OPEN_BIDS.length}
            </div>
          </div>
        }
      />

      <Rule />

      <div>
        {OPEN_BIDS.map((bid, i) => (
          <div key={bid.id}>
            {i > 0 && <Rule />}
            <OpenBid bid={bid} />
          </div>
        ))}
      </div>

      <Rule />

      <div className="grid grid-cols-[220px_1fr] gap-x-16 py-14">
        <SectionLabel>Settled</SectionLabel>
        <div>
          {SETTLED_BIDS.map((bid, i) => {
            const rank = RANK_BY_ID[bid.rankId];
            const defended = bid.state === 'defended';
            const challenger = carOf(bid.challenger);
            const incumbent = carOf(bid.incumbent);
            return (
              <div key={bid.id}>
                {i > 0 && <Rule />}
                <div className="flex items-baseline gap-6 py-5">
                  <span className="tnum w-24 shrink-0 text-[12px] text-ink-3">
                    {bid.settledOn}
                  </span>
                  <span className="w-28 shrink-0 text-[13px]">{rank.name}</span>
                  <span className="flex-1 text-[13px] text-ink-2">
                    {defended ? (
                      <>
                        <span className="tnum text-ink">
                          {token(incumbent.tokenId)}
                        </span>{' '}
                        matched and kept the seat.{' '}
                        <span className="tnum">
                          {compactGrid(bid.deposit * SEAT_BID_DEFEND_BURN)}
                        </span>{' '}
                        of{' '}
                        <span className="tnum">{token(challenger.tokenId)}</span>
                        ’s stake burned.
                      </>
                    ) : (
                      <>
                        <span className="tnum text-ink">
                          {token(challenger.tokenId)}
                        </span>{' '}
                        took the seat.{' '}
                        <span className="tnum">
                          {token(incumbent.tokenId)}
                        </span>{' '}
                        dropped a rung and received{' '}
                        <span className="tnum">
                          {compactGrid(bid.deposit * SEAT_BID_OUSTED_SHARE)}
                        </span>
                        .
                      </>
                    )}
                  </span>
                  <span className="w-24 shrink-0 text-right text-[12px] text-ink-3">
                    {defended ? 'defended' : 'taken'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <Rule />

      <div className="grid grid-cols-[220px_1fr] gap-x-16 py-14">
        <SectionLabel>Deposits</SectionLabel>
        <div>
          {['test', 'reserve', 'race', 'lead', 'champion'].map((id, i) => {
            const rank = RANK_BY_ID[id as keyof typeof RANK_BY_ID];
            return (
              <div key={id}>
                {i > 0 && <Rule />}
                <div className="flex items-baseline justify-between py-4">
                  <span className="text-[13px]">{rank.name}</span>
                  <span className="tnum flex-1 px-8 text-[12px] text-ink-3">
                    {int(rank.seats ?? 0)} seats
                  </span>
                  <span className="tnum text-[13px]">{grid(rank.deposit!)}</span>
                </div>
              </div>
            );
          })}
          <p className="mt-8 max-w-[64ch] text-[13px] leading-[1.7] text-ink-3">
            Champion is Seat Bid only. Promotion refuses it even when a seat is
            free, so all six are won in the open on the same{' '}
            <span className="tnum">{SEAT_BID_WINDOW_HOURS}</span>-hour clock.
            Fail to answer and the challenger takes it: the ousted driver drops a
            rung and receives {SEAT_BID_OUSTED_SHARE * 100}% of the deposit, and
            the remainder burns.
          </p>
        </div>
      </div>
    </div>
  );
}
