import { Circuit } from '@/components/Circuit';
import { GridBoard } from '@/components/GridField';
import { Rule } from '@/components/primitives';
import {
  ADMIN_DISCLOSURES,
  CAPPED_SEATS,
  SEAT_BID_WINDOW_HOURS,
  TOTAL_CARS,
} from '@/lib/fixtures';
import { int } from '@/lib/format';

export default function GridPage() {
  return (
    <>
      <div className="mx-auto max-w-[1500px] px-8">
        <div className="flex items-end justify-between gap-16 pt-16 pb-20">
          <div className="max-w-[52ch]">
            <div className="text-[11px] font-medium tracking-[0.2em] text-ink-3 uppercase">
              The order of the grid
            </div>
            <h1 className="mt-4 text-[44px] leading-[1.04] font-semibold tracking-[-0.028em]">
              One thousand two hundred cars.
              <br />
              Three hundred and forty-nine seats.
            </h1>
            <p className="mt-6 max-w-[46ch] text-[14px] leading-[1.65] text-ink-2">
              Six constructors, two hundred cars each, fixed at deploy. The
              bottom three rungs are open to anyone. Everything above them is
              counted, and the only way in is to take a seat off the car holding
              it.
            </p>
          </div>

          <div className="tnum flex shrink-0 gap-14 pb-2">
            <div>
              <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
                Signed
              </div>
              <div className="mt-2 text-[28px] leading-none font-medium tracking-[-0.02em]">
                {int(TOTAL_CARS)}
              </div>
            </div>
            <div>
              <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
                Seats
              </div>
              <div className="mt-2 text-[28px] leading-none font-medium tracking-[-0.02em]">
                {int(CAPPED_SEATS)}
              </div>
            </div>
            <div>
              <div className="text-[11px] tracking-[0.14em] text-ink-3 uppercase">
                Champions
              </div>
              <div className="mt-2 text-[28px] leading-none font-medium tracking-[-0.02em]">
                6
              </div>
            </div>
          </div>
        </div>

        <Circuit />

        <GridBoard />

        <div className="pt-24 pb-16">
          <Rule />
          <div className="grid max-w-[1000px] grid-cols-[220px_1fr] gap-x-16 pt-10">
            <div className="text-[11px] tracking-[0.16em] text-ink-3 uppercase">
              What can go wrong
            </div>
            <div>
              <p className="max-w-[62ch] text-[13px] leading-[1.7] text-ink-2">
                Two admin functions exist on this contract. They are listed here
                because you should be able to check them in under a minute,
                before you sign anything.
              </p>
              <div className="mt-8 grid grid-cols-2 gap-x-12 gap-y-8">
                {ADMIN_DISCLOSURES.map((item) => (
                  <div key={item.title}>
                    <div className="text-[13px] font-medium text-ink">
                      {item.title}
                    </div>
                    <p className="mt-2 text-[13px] leading-[1.65] text-ink-2">
                      {item.body}
                    </p>
                  </div>
                ))}
              </div>
              <p className="mt-8 max-w-[62ch] text-[13px] leading-[1.7] text-ink-3">
                Race Day itself is not one of them. Any wallet can start a race
                once the pool crosses its threshold, and whoever does is named
                permanently in the results. Seat Bids run on a{' '}
                <span className="tnum">{SEAT_BID_WINDOW_HOURS}</span>-hour clock
                that nobody can pause.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
