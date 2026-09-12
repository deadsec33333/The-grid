import { PageHead, Rule, SectionLabel } from '@/components/primitives';
import {
  BUYOUT_RETURN_SHARE,
  BUYOUT_VEST_DAYS,
  CONSTRUCTOR_WEIGHT,
  PENALTY_BAN_THRESHOLD,
  RANKS,
  ROUNDS,
  SEAT_BID_WINDOW_HOURS,
  YOUR_TOKEN_ID,
  YOUR_WALLET,
  carOf,
  shareOfRound,
} from '@/lib/fixtures';
import { grid, int, pct, token, units } from '@/lib/format';

function GateRow({
  label,
  detail,
  have,
  need,
  met,
}: {
  label: string;
  detail: string;
  have: string;
  need: string;
  met: boolean;
}) {
  return (
    <div className="grid grid-cols-[150px_1fr_130px_92px] items-baseline gap-x-8 py-5">
      <div className="text-[13px]">{label}</div>
      <div className="text-[13px] text-ink-3">{detail}</div>
      <div className="tnum text-right text-[14px]">
        {have}
        <span className="text-ink-3"> / {need}</span>
      </div>
      <div
        className={`text-right text-[11px] tracking-[0.14em] uppercase ${
          met ? 'text-ink-2' : 'text-accent'
        }`}
      >
        {met ? 'met' : 'short'}
      </div>
    </div>
  );
}

export default function GaragePage() {
  const car = carOf(YOUR_TOKEN_ID);
  const next = RANKS[car.rank.tier + 1];
  const ticker = car.constructor.ticker;

  const unclaimed = ROUNDS.slice(0, car.unclaimedRounds);
  const sponsorshipDue =
    next?.sponsorship != null ? (car.garage * next.sponsorship) / 100 : 0;
  const stableShare = car.rank.weight / CONSTRUCTOR_WEIGHT[car.constructor.id];
  const seatFull = next?.seats != null;

  const timeMet = next?.tenureDays != null && car.daysAtRank >= next.tenureDays;
  const pointsMet = next?.points != null && car.points >= next.points;

  return (
    <div className="mx-auto max-w-[1100px] px-8 pb-28">
      <PageHead
        eyebrow="Your Garage"
        title={`${car.constructor.name} ${token(car.tokenId)}`}
        lede={car.constructor.character}
        aside={
          <div className="text-right">
            <div className="flex items-center justify-end gap-3">
              <span
                className="inline-block shrink-0"
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 1,
                  background: car.rank.color,
                }}
              />
              <span className="text-[26px] leading-none font-medium tracking-[-0.02em]">
                {car.rank.name}
              </span>
            </div>
            <div className="tnum mt-3 text-[12px] text-ink-3">
              {car.rank.weight.toFixed(1)}× weight · {int(car.daysAtRank)} days at
              rank
            </div>
          </div>
        }
      />

      <Rule />

      {/* Identity */}
      <div className="grid grid-cols-[220px_1fr] gap-x-16 py-12">
        <SectionLabel>The car</SectionLabel>
        <div className="grid grid-cols-4 gap-x-10">
          <div>
            <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
              Token
            </div>
            <div className="tnum mt-3 text-[15px]">{token(car.tokenId)}</div>
          </div>
          <div>
            <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
              Paid in
            </div>
            <div className="tnum mt-3 text-[15px]">{ticker}</div>
          </div>
          <div>
            <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
              Chassis spec
            </div>
            <div className="tnum mt-3 text-[15px]">{car.chassisSpec + 1} of 6</div>
          </div>
          <div>
            <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
              Held by
            </div>
            <div className="tnum mt-3 text-[15px]">{YOUR_WALLET}</div>
          </div>
        </div>
      </div>

      <Rule />

      {/* The wallet */}
      <div className="grid grid-cols-[220px_1fr] gap-x-16 py-12">
        <SectionLabel>The wallet</SectionLabel>
        <div>
          <div className="flex items-start gap-20">
            <div>
              <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
                Owed to you
              </div>
              <div className="tnum mt-3 text-[44px] leading-none font-medium tracking-[-0.03em]">
                {units(car.owed)}
                <span className="ml-3 text-[18px] font-normal text-ink-3">
                  {ticker}
                </span>
              </div>
              <button
                type="button"
                disabled={car.owed <= 0}
                className="mt-7 h-10 rounded-[3px] bg-ink px-6 text-[13px] font-medium text-paper disabled:bg-rule disabled:text-ink-3"
              >
                Claim
              </button>
            </div>

            <div className="pt-1">
              <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
                Garage balance
              </div>
              <div className="tnum mt-3 text-[22px] leading-none font-medium">
                {units(car.garage)}{' '}
                <span className="text-[14px] font-normal text-ink-3">{ticker}</span>
              </div>
              <div className="mt-4 max-w-[34ch] text-[12px] leading-[1.6] text-ink-3">
                Held by the car, not by you. The sponsorship gate is taken from
                this balance.
              </div>
            </div>
          </div>

          <div className="mt-12">
            <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
              Unclaimed rounds
            </div>
            <div className="mt-3">
              {unclaimed.length === 0 && (
                <div className="py-4 text-[13px] text-ink-3">
                  Nothing outstanding. Everything paid so far has been claimed.
                </div>
              )}
              {unclaimed.map((round, i) => (
                <div key={round.id}>
                  {i > 0 && <Rule />}
                  <div className="flex items-baseline gap-8 py-4">
                    <span className="tnum w-24 shrink-0 text-[13px]">
                      Round {round.id}
                    </span>
                    <span className="tnum w-28 shrink-0 text-[12px] text-ink-3">
                      {round.date}
                    </span>
                    <span className="flex-1 text-[12px] text-ink-3">
                      {car.rank.weight.toFixed(1)}× of{' '}
                      {CONSTRUCTOR_WEIGHT[car.constructor.id].toFixed(1)} total
                      constructor weight
                    </span>
                    <span className="tnum text-[13px]">
                      {units(shareOfRound(car, round))} {ticker}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="tnum mt-8 text-[12px] text-ink-3">
            Your share of every {car.constructor.name} payout is{' '}
            <span className="text-ink-2">{pct(stableShare * 100, 3)}</span> while
            you hold this rank.
          </div>
        </div>
      </div>

      <Rule />

      {/* The three gates */}
      <div className="grid grid-cols-[220px_1fr] gap-x-16 py-12">
        <SectionLabel>
          {next ? `The three gates to ${next.name}` : 'Top of the ladder'}
        </SectionLabel>
        <div>
          {next ? (
            <>
              <GateRow
                label="Time served"
                detail="The clock restarts at every rung"
                have={`${int(car.daysAtRank)}d`}
                need={`${int(next.tenureDays ?? 0)}d`}
                met={!!timeMet}
              />
              <Rule />
              <GateRow
                label="Championship points"
                detail="Banked at your current rank. Cannot be bought, sent or lent"
                have={int(car.points)}
                need={int(next.points ?? 0)}
                met={!!pointsMet}
              />
              <Rule />
              <GateRow
                label="Sponsorship"
                detail={`${next.sponsorship}% of the garage, pulled into the prize pool`}
                have={`${units(sponsorshipDue, 3)}`}
                need={`${units(car.garage, 3)} ${ticker}`}
                met
              />
              <Rule />

              {seatFull && (
                <div className="pt-8">
                  <div className="flex items-baseline justify-between">
                    <div className="max-w-[52ch]">
                      <div className="text-[15px] font-medium">
                        {next.name} is full.
                      </div>
                      <p className="mt-2 text-[13px] leading-[1.65] text-ink-2">
                        All {int(next.seats ?? 0)} seats are taken, so the gates
                        alone will not move you. Name a car one rung above,
                        post the deposit, and they have{' '}
                        <span className="tnum">{SEAT_BID_WINDOW_HOURS}</span>{' '}
                        hours to match it.
                      </p>
                    </div>
                    <div className="tnum shrink-0 text-right">
                      <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
                        Deposit
                      </div>
                      <div className="mt-2 text-[20px] leading-none font-medium">
                        {grid(next.deposit ?? 0)}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="mt-7 h-10 rounded-[3px] bg-ink px-6 text-[13px] font-medium text-paper"
                  >
                    Open a Seat Bid
                  </button>
                </div>
              )}
            </>
          ) : (
            <p className="max-w-[56ch] text-[13px] leading-[1.7] text-ink-2">
              Champion is never awarded. The seat is held until someone names
              this car in a Seat Bid and you decline to match them.
            </p>
          )}
        </div>
      </div>

      <Rule />

      {/* Record */}
      <div className="grid grid-cols-[220px_1fr] gap-x-16 py-12">
        <SectionLabel>Record</SectionLabel>
        <div className="grid grid-cols-3 gap-x-10">
          <div>
            <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
              Penalty points
            </div>
            <div className="tnum mt-3 text-[22px] leading-none font-medium">
              <span className={car.banned ? 'text-accent' : undefined}>
                {int(car.penaltyPoints)}
              </span>
              <span className="text-[14px] font-normal text-ink-3">
                {' '}
                / {PENALTY_BAN_THRESHOLD}
              </span>
            </div>
            <div className="mt-3 max-w-[30ch] text-[12px] leading-[1.6] text-ink-3">
              {car.banned
                ? 'Race ban in force: 14 days at 80% weight, ladder frozen. One completed Race Weekend lifts it early.'
                : `${PENALTY_BAN_THRESHOLD - car.penaltyPoints} more and you take a race ban.`}
            </div>
          </div>

          <div>
            <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
              Rank taken
            </div>
            <div className="mt-3 text-[22px] leading-none font-medium">
              {car.payDriver ? 'Bought' : 'Earned'}
            </div>
            <div className="mt-3 max-w-[30ch] text-[12px] leading-[1.6] text-ink-3">
              {car.payDriver
                ? `Marked pay driver for as long as you hold it, and the step out of Test Driver costs 50% more points. The mark dies on transfer.`
                : 'No pay driver flash on the livery.'}
            </div>
          </div>

          <div>
            <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
              On buyout
            </div>
            <div className="mt-3 text-[22px] leading-none font-medium">
              {car.payDriver ? `${BUYOUT_RETURN_SHARE * 100}%` : 'Nothing'}
            </div>
            <div className="mt-3 max-w-[30ch] text-[12px] leading-[1.6] text-ink-3">
              {car.payDriver
                ? `Returns ${BUYOUT_RETURN_SHARE * 100}% of your Buy-in spend, vested over ${BUYOUT_VEST_DAYS} days.`
                : 'A rank that was earned rather than bought leaves nothing behind.'}
            </div>
          </div>
        </div>
      </div>

      <Rule />

      <p className="max-w-[68ch] pt-10 text-[13px] leading-[1.7] text-ink-3">
        Selling means listing on the secondary market, and the contract resets
        this car to Karting in the same transfer. Points wipe, the pay driver
        mark dies, and what changes hands is always an empty seat. Your record
        belongs to you, not to the paperwork.
      </p>
    </div>
  );
}
