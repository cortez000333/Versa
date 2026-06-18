// A lightweight, session-only type for user-entered portfolio positions.
//
// This is deliberately SEPARATE from the database-backed `Protocol` type in
// lib/data.ts: the portfolio tracker (Pass 1) holds everything in React state,
// has no Supabase mapping, and lets the user type in every value by hand —
// including the current price. There are no snake_case ↔ camelCase mappers
// here because nothing is persisted.

export type RedemptionFrequency = "daily" | "weekly" | "monthly" | "atMaturity";

export interface Position {
  id: string;
  assetName: string;

  // Classification — controlled-list values chosen in the UI (or a free-typed
  // value when the user picks "Other").
  issuer: string;
  chain: string;
  assetClass: string;

  // Holdings & prices (all per-token, user-entered in this pass)
  amount: number; // number of TOKENS held
  pricePaid: number; // price per token at purchase
  currentPrice: number; // current price per token (user-entered, no live feed yet)
  nav: number | null; // current NAV per token, optional

  // Yield & fees
  headlineYield: number; // advertised yield %, GROSS of fees
  feeFlat: number; // annual management fee %, of current value
  feePerformance: number; // performance fee %, charged on gains
  feeEntry: number; // entry fee %, of position value
  feeExit: number; // exit fee %, of position value

  // Horizon
  maturityDate: string | null; // ISO date if the asset has a fixed maturity, else null
  holdingPeriodYears: number; // intended holding period; default 1; IGNORED when maturityDate is set

  // Liquidity terms
  redemptionFrequency: RedemptionFrequency;
  settlementDays: number; // T+n
  lockupUntil: string | null; // ISO date, optional
}
