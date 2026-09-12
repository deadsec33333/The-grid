/**
 * THE GRID — phase 1 fixtures.
 *
 * Every value the interface renders comes from this file. There is no network,
 * no chain, no backend. When the contracts land, this file is what gets
 * replaced: the component layer only ever touches the exported types and
 * constants below.
 *
 * Provenance rules for this file:
 *   - A figure with a §n marker is copied verbatim from the-grid-design.md.
 *   - A figure marked NOT IN SPEC is a placeholder the spec does not fix.
 *     These are flagged so they can be replaced with real decisions.
 *   - Per-car state (points banked, days served, balances) is simulated with a
 *     fixed-seed PRNG so the grid is byte-identical on server and client.
 */

/* ------------------------------------------------------------------ */
/* Deterministic PRNG                                                   */
/* ------------------------------------------------------------------ */

/** mulberry32 — small, fast, and stable across server and client renders. */
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = <T,>(rng: () => number, xs: readonly T[]): T =>
  xs[Math.floor(rng() * xs.length)];

const between = (rng: () => number, lo: number, hi: number): number =>
  lo + rng() * (hi - lo);

/** Fisher–Yates, seeded. */
function shuffled<T>(xs: readonly T[], rng: () => number): T[] {
  const out = xs.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/* ------------------------------------------------------------------ */
/* §2 — The ladder                                                      */
/* ------------------------------------------------------------------ */

export type RankId =
  | 'karting'
  | 'junior'
  | 'academy'
  | 'test'
  | 'reserve'
  | 'race'
  | 'lead'
  | 'champion';

export interface Rank {
  id: RankId;
  /** Position on the ladder, 0 = Karting. */
  tier: number;
  name: string;
  /** §2 seats. null = uncapped. */
  seats: number | null;
  /** §2 payout weight. */
  weight: number;
  /** §2 championship points required to reach this rank. */
  points: number | null;
  /** §3/§4 percentage of the car's own garage pulled into the pool. */
  sponsorship: number | null;
  /** §2 days that must be served at the rank below. */
  tenureDays: number | null;
  /** §4 $GRID to buy this rank outright. Junior/Academy/Test Driver only. */
  buyIn: number | null;
  /** §7 $GRID deposit to contest a seat at this rank. */
  deposit: number | null;
  /** Grid mark height in px — size is seniority. */
  dot: number;
  /** Grid mark width in px. Cars are taller than they are wide, seen from above. */
  dotW: number;
  /** Grid colour — colour is rank. Greys are uncapped, reds hold a seat. */
  color: string;
}

/** Ordered bottom to top. §2 table, copied without alteration. */
export const RANKS: readonly Rank[] = [
  { id: 'karting',  tier: 0, name: 'Karting',     seats: null, weight: 1.0, points: null,  sponsorship: null, tenureDays: null, buyIn: null,    deposit: null,      dot: 8,  dotW: 6,  color: '#d4d4d4' },
  { id: 'junior',   tier: 1, name: 'Junior',      seats: null, weight: 1.4, points: 40,    sponsorship: 5,    tenureDays: 3,    buyIn: 100_000, deposit: null,      dot: 9,  dotW: 6,  color: '#b4b4b4' },
  { id: 'academy',  tier: 2, name: 'Academy',     seats: null, weight: 1.9, points: 120,   sponsorship: 8,    tenureDays: 7,    buyIn: 300_000, deposit: null,      dot: 10, dotW: 7,  color: '#949494' },
  { id: 'test',     tier: 3, name: 'Test Driver', seats: 216,  weight: 2.5, points: 300,   sponsorship: 12,   tenureDays: 14,   buyIn: 700_000, deposit: 180_000,   dot: 12, dotW: 8,  color: '#f0aea6' },
  { id: 'reserve',  tier: 4, name: 'Reserve',     seats: 86,   weight: 3.3, points: 700,   sponsorship: 15,   tenureDays: 21,   buyIn: null,    deposit: 380_000,   dot: 14, dotW: 10, color: '#e58074' },
  { id: 'race',     tier: 5, name: 'Race Seat',   seats: 32,   weight: 4.3, points: 1_400, sponsorship: 20,   tenureDays: 30,   buyIn: null,    deposit: 800_000,   dot: 17, dotW: 12, color: '#d8483a' },
  { id: 'lead',     tier: 6, name: 'Lead Driver', seats: 9,    weight: 5.5, points: 2_600, sponsorship: 25,   tenureDays: 45,   buyIn: null,    deposit: 1_800_000, dot: 21, dotW: 14, color: '#b22518' },
  { id: 'champion', tier: 7, name: 'Champion',    seats: 6,    weight: 7.0, points: 5_000, sponsorship: 30,   tenureDays: 60,   buyIn: null,    deposit: 3_620_000, dot: 36, dotW: 24, color: '#7f0d04' },
] as const;

export const RANK_BY_ID: Record<RankId, Rank> = Object.fromEntries(
  RANKS.map((r) => [r.id, r]),
) as Record<RankId, Rank>;

/** Top of the ladder down — the order the grid is drawn in. */
export const RANKS_DESC: readonly Rank[] = [...RANKS].reverse();

/** §2 — 349 capped seats, counted across the whole grid, not per constructor. */
export const CAPPED_SEATS = RANKS.reduce((n, r) => n + (r.seats ?? 0), 0);

/** §4 — all three buy-in steps at once. */
export const BUY_IN_BUNDLE = 1_000_000;
/** §4 — a marked car pays this much more to step out of Test Driver. */
export const PAY_DRIVER_POINTS_PENALTY = 0.5;
/** §4 — 1,050 instead of 700. */
export const PAY_DRIVER_RESERVE_POINTS = 1_050;
/** §2 — a new weight does not count for this long. */
export const WEIGHT_ACTIVATION_HOURS = 24;
/** §4 — buy-in steps are this far apart; the bundle ignores the gap once. */
export const BUY_IN_STEP_GAP_HOURS = 24;

/* ------------------------------------------------------------------ */
/* §6 — Penalty points                                                  */
/* ------------------------------------------------------------------ */

export const PENALTY_BAN_THRESHOLD = 12;
export const BAN_DAYS = 14;
export const BAN_WEIGHT_MULTIPLIER = 0.8;

/* ------------------------------------------------------------------ */
/* §7 — The Seat Bid                                                    */
/* ------------------------------------------------------------------ */

export const SEAT_BID_WINDOW_HOURS = 72;
export const SEAT_BID_WINDOW_SECONDS = SEAT_BID_WINDOW_HOURS * 3600;
/** Incumbent matches: this share of the challenger's stake burns. */
export const SEAT_BID_DEFEND_BURN = 0.5;
/** Incumbent fails: the ousted driver receives this share of the deposit. */
export const SEAT_BID_OUSTED_SHARE = 0.3;
/** A defended seat cannot be contested again for this long. */
export const SEAT_BID_IMMUNITY_DAYS = 7;

/* ------------------------------------------------------------------ */
/* §3 — Signing                                                         */
/* ------------------------------------------------------------------ */

export const SIGNING_PRICE_GRID = 100_000;
export const SIGNING_BURN_SHARE = 0.5;
export const TOTAL_SIGNING_BURN = 60_000_000;
export const BURN_SHARE_OF_SUPPLY = 6;
/** §3 — buyout returns this share of Buy-in spend, vested over 7 days. */
export const BUYOUT_RETURN_SHARE = 0.25;
export const BUYOUT_VEST_DAYS = 7;

/* ------------------------------------------------------------------ */
/* §8 — Fees                                                            */
/* ------------------------------------------------------------------ */

export const POOL_SHARE = 70;
export const TREASURY_SHARE = 30;
export const CLERK_FEE = 0.005;

export const FEES = [
  { id: 'signing',  label: 'Signing fee',        rate: '10%',   note: 'On the ETH notional of one car' },
  { id: 'pick',     label: 'Pick a car',         rate: '15%',   note: 'Instead of taking the next one out' },
  { id: 'royalty',  label: 'Secondary royalty',  rate: '3.33%', note: 'Every resale' },
] as const;

/* ------------------------------------------------------------------ */
/* §1 — The six constructors                                            */
/* ------------------------------------------------------------------ */

export interface Constructor {
  index: number;
  id: string;
  name: string;
  ticker: string;
  character: string;
  /** §1 — constructor falls out of the token id. Nothing stored. */
  firstToken: number;
  lastToken: number;
}

export const CARS_PER_CONSTRUCTOR = 200;
export const TOTAL_CARS = 1_200;

export const CONSTRUCTORS: readonly Constructor[] = [
  { index: 0, id: 'castellan',  name: 'Castellan',      ticker: 'AAPL',  character: 'Design cult. Immaculate, expensive, insufferable about it.' },
  { index: 1, id: 'vantari',    name: 'Vantari',        ticker: 'NVDA',  character: 'The fastest car on the grid and the most volatile purse.' },
  { index: 2, id: 'brandt',     name: 'Brandt & Sons',  ticker: 'AMZN',  character: 'The biggest operation in the paddock. Logistics wins races.' },
  { index: 3, id: 'halcyon',    name: 'Halcyon',        ticker: 'GOOGL', character: 'Clinical, data-led, never emotional.' },
  { index: 4, id: 'lindqvist',  name: 'Lindqvist',      ticker: 'MSFT',  character: 'Old, unglamorous, reliable. Wins on strategy in the wet.' },
  { index: 5, id: 'marchetti',  name: 'Marchetti',      ticker: 'TSLA',  character: 'Founder cult. Erratic genius, night shifts, no sleep.' },
].map((c) => ({
  ...c,
  firstToken: c.index * CARS_PER_CONSTRUCTOR + 1,
  lastToken: (c.index + 1) * CARS_PER_CONSTRUCTOR,
}));

export const CONSTRUCTOR_BY_ID: Record<string, Constructor> = Object.fromEntries(
  CONSTRUCTORS.map((c) => [c.id, c]),
);

/** §1 — derived from the token id, exactly as the contract would. */
export const constructorOf = (tokenId: number): Constructor =>
  CONSTRUCTORS[Math.floor((tokenId - 1) / CARS_PER_CONSTRUCTOR)];

/* ------------------------------------------------------------------ */
/* Standing of the grid                                                 */
/* ------------------------------------------------------------------ */

/**
 * NOT IN SPEC — how the 1,200 cars are currently distributed.
 *
 * The spec fixes the seat caps, not who holds them. This matrix is the
 * simulated present state: rows are constructors in CONSTRUCTORS order,
 * columns are ranks in RANKS order (Karting first).
 *
 * Two constraints it satisfies, and the module asserts both below:
 *   - every row sums to 200 (§1, fixed at deploy)
 *   - the capped columns sum to exactly their §2 caps, all five full
 *
 * The distribution is deliberately lopsided. §2 counts seats across the whole
 * grid rather than per constructor, so Brandt & Sons fielding no Champion and
 * no Lead Driver while Vantari holds five of the top fifteen is the intended
 * behaviour, not an artefact.
 */
const STANDING: readonly (readonly number[])[] = [
  //  kart  jun  aca  test  res  race  lead  champ
  [    60,  40,  39,   37,  15,    6,    2,     1 ], // Castellan
  [    58,  38,  38,   38,  16,    7,    3,     2 ], // Vantari
  [    70,  43,  40,   32,  12,    3,    0,     0 ], // Brandt & Sons
  [    64,  40,  39,   36,  14,    5,    1,     1 ], // Halcyon
  [    65,  40,  39,   36,  14,    5,    1,     0 ], // Lindqvist
  [    63,  39,  36,   37,  15,    6,    2,     2 ], // Marchetti
];

// Fail loudly at import time rather than render a grid that does not add up.
STANDING.forEach((row, i) => {
  const total = row.reduce((a, b) => a + b, 0);
  if (total !== CARS_PER_CONSTRUCTOR) {
    throw new Error(
      `STANDING row ${i} (${CONSTRUCTORS[i].name}) totals ${total}, expected ${CARS_PER_CONSTRUCTOR}`,
    );
  }
});

RANKS.forEach((rank, col) => {
  if (rank.seats === null) return;
  const filled = STANDING.reduce((a, row) => a + row[col], 0);
  if (filled !== rank.seats) {
    throw new Error(
      `${rank.name} has ${filled} cars in ${rank.seats} seats`,
    );
  }
});

/** Cars at each rank across the whole grid. */
export const RANK_HEADCOUNT: Record<RankId, number> = Object.fromEntries(
  RANKS.map((r, col) => [r.id, STANDING.reduce((a, row) => a + row[col], 0)]),
) as Record<RankId, number>;

/* ------------------------------------------------------------------ */
/* The cars                                                             */
/* ------------------------------------------------------------------ */

export interface Car {
  tokenId: number;
  constructor: Constructor;
  rank: Rank;
  /** §9 — keccak(seed, tokenId) % 6. Stubbed here; the spec names no specs. */
  chassisSpec: number;
  /** Days served at the current rank. §4 gate one. */
  daysAtRank: number;
  /** Championship points banked at the current rank. §4 gate two. */
  points: number;
  /** §6 — twelve in a season is a race ban. */
  penaltyPoints: number;
  /** §6 — 14 days at 80% weight, ladder frozen. */
  banned: boolean;
  /** §4 — rank was bought, not earned. Dies on transfer. */
  payDriver: boolean;
  /** §2 — hours until a freshly taken weight starts counting. 0 = live. */
  weightPendingHours: number;
  /** The car's own wallet, in its constructor's ticker. §4 gate three taxes it. */
  garage: number;
  /** Paid out but not yet claimed, in the constructor's ticker. */
  owed: number;
  /** How many past rounds the owed figure covers. */
  unclaimedRounds: number;
  /** §7 — defended a seat inside the last 7 days. */
  immune: boolean;
}

/**
 * Assign ranks to token ids, then give every car its simulated state.
 * Ids are shuffled inside each constructor so the bands read as a real grid
 * rather than as six sorted runs.
 */
function buildCars(): Car[] {
  const cars: Car[] = [];
  const layoutRng = prng(0x6a11d);

  CONSTRUCTORS.forEach((constructor) => {
    const ids = shuffled(
      Array.from({ length: CARS_PER_CONSTRUCTOR }, (_, i) => constructor.firstToken + i),
      layoutRng,
    );

    let cursor = 0;
    RANKS.forEach((rank, col) => {
      const count = STANDING[constructor.index][col];
      for (let n = 0; n < count; n++) {
        const tokenId = ids[cursor++];
        const rng = prng(tokenId * 2654435761);

        const tenure = rank.tenureDays ?? 3;
        const daysAtRank = Math.floor(between(rng, 0, tenure * 2.4));

        const next = RANKS[rank.tier + 1];
        const target = next?.points ?? rank.points ?? 0;
        const points = Math.floor(between(rng, 0, target * 1.15));

        const penaltyPoints =
          rng() < 0.72 ? 0 : Math.floor(between(rng, 1, PENALTY_BAN_THRESHOLD + 2));

        // §4 — buy-in covers Junior, Academy and Test Driver only, and the
        // mark lasts only as long as the holder keeps the bought rank.
        const buyable = rank.buyIn !== null;
        const payDriver = buyable && rng() < 0.22;

        cars.push({
          tokenId,
          constructor,
          rank,
          chassisSpec: Math.floor(rng() * 6),
          daysAtRank,
          points,
          penaltyPoints,
          banned: penaltyPoints >= PENALTY_BAN_THRESHOLD,
          payDriver,
          weightPendingHours: rng() < 0.04 ? Math.ceil(between(rng, 1, WEIGHT_ACTIVATION_HOURS)) : 0,
          garage: 0, // filled once round payouts are known
          owed: 0,
          unclaimedRounds: rng() < 0.45 ? 1 + Math.floor(rng() * 3) : 0,
          immune: rank.seats !== null && rng() < 0.03,
        });
      }
    });
  });

  return cars.sort((a, b) => a.tokenId - b.tokenId);
}

export const CARS: readonly Car[] = buildCars();

/** Index by token id for O(1) inspector lookups. */
const CAR_BY_TOKEN = new Map(CARS.map((c) => [c.tokenId, c]));
export const carOf = (tokenId: number): Car => {
  const car = CAR_BY_TOKEN.get(tokenId);
  if (!car) throw new Error(`No car with token id ${tokenId}`);
  return car;
};

/** §8 — payouts are pro rata by rank weight inside each constructor. */
export const CONSTRUCTOR_WEIGHT: Record<string, number> = Object.fromEntries(
  CONSTRUCTORS.map((c) => [
    c.id,
    CARS.filter((car) => car.constructor.index === c.index).reduce(
      (sum, car) => sum + car.rank.weight,
      0,
    ),
  ]),
);

export const GRID_WEIGHT = Object.values(CONSTRUCTOR_WEIGHT).reduce((a, b) => a + b, 0);

/** Cars of one constructor at one rank, for the grid bands. */
export function band(constructorIndex: number, rankId: RankId): Car[] {
  return CARS.filter(
    (c) => c.constructor.index === constructorIndex && c.rank.id === rankId,
  );
}

export const CHAMPIONS: readonly Car[] = CARS.filter((c) => c.rank.id === 'champion');

/* ------------------------------------------------------------------ */
/* §8 — Race Day                                                        */
/* ------------------------------------------------------------------ */

export interface RoundSlice {
  constructorId: string;
  /** Share of the epoch's trading volume, percent. */
  share: number;
  /** ETH converted into this constructor's ticker. */
  eth: number;
  /** Units of the ticker paid into the constructor's garages. */
  units: number;
}

export interface Round {
  id: number;
  /** Fixed strings — no clock is read at module scope. */
  date: string;
  /** Pool size in ETH when the lever was pulled. */
  pool: number;
  /** §8 — whoever called it. Named permanently in the results. */
  clerk: string;
  clerkFeeEth: number;
  txHash: string;
  slices: RoundSlice[];
}

/**
 * NOT IN SPEC — the threshold the pool must cross before anyone can start a
 * race. §8 says a threshold exists and that any wallet may pull the lever once
 * it is crossed, but fixes no figure. This one is a placeholder.
 */
export const RACE_THRESHOLD_ETH = 40;

/** NOT IN SPEC — the pool as it stands right now. */
export const POOL_ETH = 27.412;

/** NOT IN SPEC — treasury side of the 70/30 split, this epoch. */
export const TREASURY_ETH = 11.748;

function buildRound(
  id: number,
  date: string,
  pool: number,
  clerk: string,
  txHash: string,
  shares: readonly number[],
  prices: readonly number[],
): Round {
  const clerkFeeEth = pool * CLERK_FEE;
  const distributable = pool - clerkFeeEth;
  return {
    id,
    date,
    pool,
    clerk,
    clerkFeeEth,
    txHash,
    slices: CONSTRUCTORS.map((c, i) => {
      const eth = (distributable * shares[i]) / 100;
      return {
        constructorId: c.id,
        share: shares[i],
        eth,
        // Settled from pre-funded inventory at the Chainlink price (§8).
        units: (eth * ETH_PRICE_USD) / prices[i],
      };
    }),
  };
}

/** NOT IN SPEC — settlement prices. §8 fixes the mechanism, not the marks. */
const ETH_PRICE_USD = 3_180;
const TICKER_PRICE_USD = [241.6, 183.4, 226.9, 197.3, 512.8, 344.1];

export const ROUNDS: readonly Round[] = [
  buildRound(
    41, '11 Sep 2026', 42.118,
    '0x9f2c...41ab', '0x7d1e44c0',
    [18.4, 24.1, 16.7, 15.2, 13.9, 11.7],
    TICKER_PRICE_USD,
  ),
  buildRound(
    40, '04 Sep 2026', 40.906,
    '0x3ae7...c012', '0x2b90f7a1',
    [17.9, 22.8, 17.4, 15.8, 14.2, 11.9],
    TICKER_PRICE_USD,
  ),
  buildRound(
    39, '27 Aug 2026', 44.370,
    '0xc184...9d55', '0xe5470b23',
    [19.1, 26.3, 15.9, 14.6, 13.1, 11.0],
    TICKER_PRICE_USD,
  ),
  buildRound(
    38, '19 Aug 2026', 40.215,
    '0x9f2c...41ab', '0x1cc8a90d',
    [18.8, 21.4, 17.1, 16.0, 14.4, 12.3],
    TICKER_PRICE_USD,
  ),
];

export const LAST_ROUND = ROUNDS[0];

/** A car's cut of one round: its constructor's slice, pro rata by weight (§8). */
export function shareOfRound(car: Car, round: Round): number {
  const slice = round.slices.find((s) => s.constructorId === car.constructor.id)!;
  return (slice.units * car.rank.weight) / CONSTRUCTOR_WEIGHT[car.constructor.id];
}

// Garage balances and unclaimed amounts are derived from the rounds above so
// that every figure on Your Garage reconciles against Race Day.
(CARS as Car[]).forEach((car) => {
  const rng = prng(car.tokenId * 40503 + 7);
  car.owed = ROUNDS.slice(0, car.unclaimedRounds).reduce(
    (sum, round) => sum + shareOfRound(car, round),
    0,
  );
  const claimed = ROUNDS.slice(car.unclaimedRounds).reduce(
    (sum, round) => sum + shareOfRound(car, round),
    0,
  );
  // Held rather than sold, plus whatever the holder brought with them.
  car.garage = claimed * between(rng, 0.35, 1.4);
});

/* ------------------------------------------------------------------ */
/* §7 — Open seat bids                                                  */
/* ------------------------------------------------------------------ */

export type SeatBidState = 'open' | 'defended' | 'taken';

export interface SeatBid {
  id: number;
  /** The car posting the deposit — always one rung below the seat. */
  challenger: number;
  /** The named incumbent. */
  incumbent: number;
  /** The rank being contested. */
  rankId: RankId;
  deposit: number;
  state: SeatBidState;
  /** Seconds left on the 72-hour clock. Only meaningful while open. */
  secondsLeft: number;
  /** How the settled ones ended. */
  settledOn?: string;
}

/**
 * Challenger and incumbent are chosen from the real car list so every token id
 * on the page resolves. The challenger sits exactly one rung below the seat.
 */
function bidPair(rankId: RankId, seed: number): { challenger: number; incumbent: number } {
  const rng = prng(seed);
  const rank = RANK_BY_ID[rankId];
  const below = RANKS[rank.tier - 1];
  const atRank = CARS.filter((c) => c.rank.id === rankId);
  const atBelow = CARS.filter((c) => c.rank.id === below.id);
  const incumbents = atRank.filter((c) => !c.immune);
  const challengers = atBelow.filter((c) => !c.banned);
  return {
    challenger: pick(rng, challengers.length ? challengers : atBelow).tokenId,
    incumbent: pick(rng, incumbents.length ? incumbents : atRank).tokenId,
  };
}

/** NOT IN SPEC — which seats happen to be under challenge right now. */
const BID_SEEDS: readonly {
  id: number;
  rankId: RankId;
  seed: number;
  state: SeatBidState;
  secondsLeft: number;
  settledOn?: string;
}[] = [
  { id: 318, rankId: 'champion', seed: 11, state: 'open', secondsLeft: 9_142 },
  { id: 317, rankId: 'race',     seed: 23, state: 'open', secondsLeft: 41_205 },
  { id: 316, rankId: 'lead',     seed: 37, state: 'open', secondsLeft: 96_318 },
  { id: 315, rankId: 'test',     seed: 41, state: 'open', secondsLeft: 158_402 },
  { id: 314, rankId: 'reserve',  seed: 59, state: 'open', secondsLeft: 211_846 },
  { id: 313, rankId: 'race',     seed: 67, state: 'open', secondsLeft: 248_930 },
  { id: 312, rankId: 'reserve',  seed: 71, state: 'defended', secondsLeft: 0, settledOn: '09 Sep 2026' },
  { id: 311, rankId: 'lead',     seed: 83, state: 'taken',    secondsLeft: 0, settledOn: '07 Sep 2026' },
  { id: 310, rankId: 'test',     seed: 97, state: 'defended', secondsLeft: 0, settledOn: '05 Sep 2026' },
];

export const SEAT_BIDS: readonly SeatBid[] = BID_SEEDS.map(
  ({ seed, rankId, ...rest }) => ({
    ...rest,
    rankId,
    deposit: RANK_BY_ID[rankId].deposit!,
    ...bidPair(rankId, seed),
  }),
);

export const OPEN_BIDS = SEAT_BIDS.filter((b) => b.state === 'open');
export const SETTLED_BIDS = SEAT_BIDS.filter((b) => b.state !== 'open');

/* ------------------------------------------------------------------ */
/* Your Garage                                                          */
/* ------------------------------------------------------------------ */

/** NOT IN SPEC — the car the connected wallet holds, for the mockup. */
export const YOUR_TOKEN_ID = 418;
export const YOUR_WALLET = '0x4d81...7fe2';

/* ------------------------------------------------------------------ */
/* §10 — What can go wrong                                              */
/* ------------------------------------------------------------------ */

/**
 * §10 requires these to be disclosed as plainly as NTF discloses them, on the
 * homepage as well as in the docs, unhedged. The wording below is deliberately
 * flat. Do not soften it.
 */
export const ADMIN_DISCLOSURES = [
  {
    title: 'The owner can withdraw from the prize pool',
    body: 'Not only fee revenue. The withdrawal function reaches the money that pays out on Race Day. If you are signed, that is your money it can reach.',
  },
  {
    title: 'The owner can add seats to capped ranks',
    body: 'The 349 seats are what the ladder’s scarcity rests on, and every car that buys or contests a rank does so on the premise that they are finite. That premise is revocable.',
  },
] as const;
