import { CONSTRUCTORS, LAST_ROUND } from '@/lib/fixtures';
import { pct } from '@/lib/format';

/**
 * The circuit. One closed path, drawn once as tarmac and used again as the
 * line the cars are animated along, so the two can never disagree.
 */
const TRACK =
  'M 120 58 L 880 58 C 962 58 1012 80 1042 122 C 1072 164 1058 204 996 216 ' +
  'L 620 216 C 556 216 542 190 498 176 C 454 162 420 176 378 192 L 198 192 ' +
  'C 128 192 88 160 88 120 C 88 84 100 58 120 58 Z';

/** An F1 car seen from above, nose at +x so `rotate="auto"` points it forward. */
const CAR = 'M 9 0 L 3.5 -3 L -5 -3 L -5 -4.8 L -7.5 -4.8 L -7.5 4.8 L -5 4.8 L -5 3 L 3.5 3 Z';

/** Slowest and fastest lap in seconds, mapped off share of the last round. */
const SLOWEST = 13;
const FASTEST = 8.5;

export function Circuit() {
  const shares = LAST_ROUND.slices;
  const lo = Math.min(...shares.map((s) => s.share));
  const hi = Math.max(...shares.map((s) => s.share));

  const runners = CONSTRUCTORS.map((c, i) => {
    const share = shares.find((s) => s.constructorId === c.id)!.share;
    // A bigger slice of the round laps quicker. The leader runs in the accent.
    const dur = SLOWEST - ((share - lo) / (hi - lo)) * (SLOWEST - FASTEST);
    return {
      c,
      share,
      dur,
      leader: share === hi,
      // Spread the field around the lap so they never start stacked.
      lag: -(i / CONSTRUCTORS.length) * dur,
    };
  });

  const leader = runners.find((r) => r.leader)!;

  return (
    <div className="pb-16">
      <svg
        viewBox="60 30 1030 215"
        className="w-full"
        role="img"
        aria-label="The six constructors lapping the circuit, ordered by their share of the last round."
      >
        <path id="grid-track" className="tarmac" d={TRACK} />
        <path className="kerb" d={TRACK} />

        {/* Start / finish. */}
        <line x1="300" y1="47" x2="300" y2="69" stroke="#0a0a0a" strokeWidth="2" />

        {runners.map((r) => (
          <g key={r.c.id}>
            <path d={CAR} fill={r.leader ? 'var(--color-accent)' : '#0a0a0a'} />
            <animateMotion
              dur={`${r.dur.toFixed(2)}s`}
              begin={`${r.lag.toFixed(2)}s`}
              repeatCount="indefinite"
              rotate="auto"
            >
              <mpath href="#grid-track" />
            </animateMotion>
          </g>
        ))}
      </svg>

      <div className="mt-6 flex items-baseline justify-between">
        <div className="text-[12px] text-ink-2">
          Lap time is each constructor’s share of round {LAST_ROUND.id}.{' '}
          <span className="text-accent">{leader.c.name}</span> leads on{' '}
          <span className="tnum">{pct(leader.share)}</span>.
        </div>
        <div className="tnum flex gap-6 text-[11px] text-ink-3">
          {runners.map((r) => (
            <span key={r.c.id}>
              {r.c.name} <span className="text-ink-4">{pct(r.share)}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
