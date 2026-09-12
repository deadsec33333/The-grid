'use client';

import {
  CARS,
  CAPPED_SEATS,
  CONSTRUCTOR_WEIGHT,
  GRID_WEIGHT,
  LAST_ROUND,
  PENALTY_BAN_THRESHOLD,
  RANKS,
  TOTAL_CARS,
  carOf,
  shareOfRound,
  type Car,
} from '@/lib/fixtures';
import { int, pct, token, units } from '@/lib/format';

function Row({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: React.ReactNode;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 py-[7px]">
      <span className="text-[12px] text-ink-3">{label}</span>
      <span
        className={`tnum text-[12px] ${muted ? 'text-ink-3' : 'text-ink'} text-right`}
      >
        {value}
      </span>
    </div>
  );
}

/** Progress against one of the three gates (§4). */
function Gate({
  label,
  have,
  need,
  suffix = '',
}: {
  label: string;
  have: number;
  need: number | null;
  suffix?: string;
}) {
  if (need === null) {
    return <Row label={label} value="—" muted />;
  }
  const met = have >= need;
  const ratio = Math.min(1, have / need);
  return (
    <div className="py-[7px]">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[12px] text-ink-3">{label}</span>
        <span className="tnum text-[12px]">
          {int(Math.round(have))}
          <span className="text-ink-3">
            {' / '}
            {int(need)}
            {suffix}
          </span>
        </span>
      </div>
      <div className="mt-2 h-[2px] w-full bg-rule">
        <div
          className={`h-full ${met ? 'bg-ink' : 'bg-ink-4'}`}
          style={{ width: `${ratio * 100}%` }}
        />
      </div>
    </div>
  );
}

function CarDetail({ car }: { car: Car }) {
  const next = RANKS[car.rank.tier + 1];
  const lastShare = shareOfRound(car, LAST_ROUND);
  const gridShare = car.rank.weight / CONSTRUCTOR_WEIGHT[car.constructor.id];

  return (
    <div>
      <div className="flex items-baseline gap-3">
        <span
          className="inline-block shrink-0"
          style={{
            width: 10,
            height: 10,
            borderRadius: 1,
            background: car.rank.color,
          }}
        />
        <span className="tnum text-[26px] leading-none font-medium tracking-[-0.02em]">
          {token(car.tokenId)}
        </span>
      </div>

      <div className="mt-3 text-[13px] text-ink">{car.constructor.name}</div>
      <div className="mt-1 text-[12px] text-ink-3">
        Paid in {car.constructor.ticker} · chassis spec {car.chassisSpec + 1} of 6
      </div>

      <div className="mt-6 flex items-baseline justify-between">
        <span className="text-[15px] font-medium">{car.rank.name}</span>
        <span className="tnum text-[13px] text-ink-2">
          {car.rank.weight.toFixed(1)}×
        </span>
      </div>

      {(car.payDriver || car.banned || car.immune || car.weightPendingHours > 0) && (
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
          {car.payDriver && (
            <span className="text-[11px] tracking-[0.1em] text-accent uppercase">
              Pay driver
            </span>
          )}
          {car.banned && (
            <span className="text-[11px] tracking-[0.1em] text-accent uppercase">
              Race ban
            </span>
          )}
          {car.immune && (
            <span className="text-[11px] tracking-[0.1em] text-ink-3 uppercase">
              Seat immune
            </span>
          )}
          {car.weightPendingHours > 0 && (
            <span className="tnum text-[11px] tracking-[0.1em] text-ink-3 uppercase">
              Weight live in {car.weightPendingHours}h
            </span>
          )}
        </div>
      )}

      <div className="mt-7">
        <div className="text-[11px] tracking-[0.16em] text-ink-3 uppercase">
          {next ? `Gates to ${next.name}` : 'Top of the ladder'}
        </div>
        <div className="mt-2">
          {next ? (
            <>
              <Gate
                label="Time served"
                have={car.daysAtRank}
                need={next.tenureDays}
                suffix="d"
              />
              <Gate label="Points" have={car.points} need={next.points} />
              <Row
                label="Sponsorship"
                value={
                  next.sponsorship === null ? '—' : `${next.sponsorship}% of garage`
                }
              />
              {car.rank.seats !== null && next.seats !== null && (
                <Row
                  label="Seats"
                  value={
                    next.id === 'champion'
                      ? 'Seat Bid only'
                      : `${int(next.seats)} · full`
                  }
                  muted
                />
              )}
            </>
          ) : (
            <Row label="Held by" value="Seat Bid only" muted />
          )}
        </div>
      </div>

      <div className="mt-7">
        <div className="text-[11px] tracking-[0.16em] text-ink-3 uppercase">
          Garage
        </div>
        <div className="mt-2">
          <Row
            label="Balance"
            value={`${units(car.garage)} ${car.constructor.ticker}`}
          />
          <Row
            label="Owed"
            value={
              car.owed > 0 ? (
                `${units(car.owed)} ${car.constructor.ticker}`
              ) : (
                <span className="text-ink-3">nothing</span>
              )
            }
          />
          <Row
            label={`Round ${LAST_ROUND.id}`}
            value={`${units(lastShare)} ${car.constructor.ticker}`}
            muted
          />
          <Row label="Share of stable" value={pct(gridShare * 100, 3)} muted />
        </div>
      </div>

      <div className="mt-7">
        <div className="text-[11px] tracking-[0.16em] text-ink-3 uppercase">
          Record
        </div>
        <div className="mt-2">
          <Row label="Days at rank" value={`${int(car.daysAtRank)}d`} />
          <Row
            label="Penalty points"
            value={
              <span className={car.penaltyPoints >= PENALTY_BAN_THRESHOLD ? 'text-accent' : undefined}>
                {int(car.penaltyPoints)}
                <span className="text-ink-3"> / {PENALTY_BAN_THRESHOLD}</span>
              </span>
            }
          />
        </div>
      </div>
    </div>
  );
}

function AtRest() {
  const filledCapped = CARS.filter((c) => c.rank.seats !== null).length;

  return (
    <div>
      <div className="text-[11px] tracking-[0.16em] text-ink-3 uppercase">
        The field
      </div>

      <div className="mt-4">
        <Row label="Signed" value={int(TOTAL_CARS)} />
        <Row label="Constructors" value="6 × 200" />
        <Row
          label="Capped seats"
          value={`${int(filledCapped)} / ${int(CAPPED_SEATS)}`}
        />
        <Row label="Grid weight" value={GRID_WEIGHT.toFixed(1)} muted />
      </div>

      <div className="mt-8">
        <div className="text-[11px] tracking-[0.16em] text-ink-3 uppercase">
          Reading the grid
        </div>
        <p className="mt-3 text-[12px] leading-[1.65] text-ink-2">
          Colour is rank. Size is seniority. Grey holds no seat; red holds one of
          the {CAPPED_SEATS}. Hover any car to inspect it.
        </p>
      </div>

      <div className="mt-7">
        {[...RANKS].reverse().map((rank) => (
          <div
            key={rank.id}
            className="flex items-center gap-3 py-[5px]"
          >
            <span
              className="inline-block shrink-0"
              style={{
                width: 9,
                height: 9,
                borderRadius: 1,
                background: rank.color,
              }}
            />
            <span className="text-[12px] text-ink-2">{rank.name}</span>
            <span className="tnum ml-auto text-[12px] text-ink-3">
              {rank.weight.toFixed(1)}×
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function Inspector({ tokenId }: { tokenId: number | null }) {
  return (
    <aside className="sticky top-20 h-fit">
      {tokenId === null ? <AtRest /> : <CarDetail car={carOf(tokenId)} />}
    </aside>
  );
}
