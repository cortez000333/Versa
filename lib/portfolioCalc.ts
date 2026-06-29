// Pure calculation module for the portfolio tracker — NO React, NO UI.
//
// Every function here is deterministic and side-effect free. The whole design
// goal: turn user-entered positions into facts and math (never advice). All
// divisions are guarded so empty portfolios / zero values return null (shown as
// "—" in the UI) and never produce NaN.

import type { Position, RedemptionFrequency } from "./position";

const MS_PER_YEAR = 365.25 * 24 * 60 * 60 * 1000;
// A small floor so a position that's already at/past maturity doesn't divide by
// zero (or a tiny negative) when amortizing one-time fees over the horizon.
const HOLDING_FLOOR = 0.01;

export type LiquidityBucket =
  | "≤2 days"
  | "≤1 week"
  | "≤1 month"
  | ">1 month"
  | "gated";

export const LIQUIDITY_BUCKETS: LiquidityBucket[] = [
  "≤2 days",
  "≤1 week",
  "≤1 month",
  ">1 month",
  "gated",
];

export interface PositionResult {
  id: string;
  investedValue: number;
  currentValue: number;
  effectiveHoldingYears: number;
  perfFeeDrag: number; // percentage points
  trueYield: number; // percentage points; CAN be negative
  grossIncomePerYear: number; // dollars (at headline yield, gross of fees)
  netIncomePerYear: number; // dollars (at true yield, after recurring fees)
  feeDragDollarsPerYear: number; // dollars
  costToExit: number; // dollars
  premiumDiscountToNav: number | null; // percent; separate metric, NOT in trueYield
}

export interface LiquidityProfile {
  pctByBucket: Record<LiquidityBucket, number>;
  accessibleAmount: number; // total current value that is NOT gated
  lockedAmount: number; // total current value that IS gated
}

export interface IssuerSlice {
  issuer: string;
  currentValue: number;
}

export interface PortfolioResult {
  positions: PositionResult[];
  totalInvested: number | null;
  totalCurrentValue: number | null;
  totalGainDollars: number | null; // current − invested
  blendedTrueYield: number | null;
  blendedHeadlineYield: number | null; // for the headline-vs-true gap
  weightedAvgYieldOnCost: number | null;
  estAnnualIncome: number | null;
  totalFeeDragPerYear: number | null;
  costToExitAll: number | null;
  largestPositionConcentrationPct: number | null;
  positionCount: number;
  issuerCount: number;
  chainCount: number;
  blendedPremiumDiscount: number | null;
  liquidity: LiquidityProfile;
  byIssuer: IssuerSlice[];
}

function sum(xs: number[]): number {
  return xs.reduce((a, b) => a + b, 0);
}

function yearsUntil(iso: string, now: Date): number {
  return (new Date(iso).getTime() - now.getTime()) / MS_PER_YEAR;
}

function freqDays(freq: RedemptionFrequency): number {
  switch (freq) {
    case "daily":
      return 1;
    case "weekly":
      return 7;
    case "monthly":
      return 30;
    case "atMaturity":
      return Infinity; // can't freely redeem → treated as gated below
  }
}

// ── Single position ──────────────────────────────────────────────
export function computePosition(p: Position, now: Date = new Date()): PositionResult {
  const investedValue = p.amount * p.pricePaid;
  const currentValue = p.amount * p.currentPrice;

  // Horizon: only a valid FUTURE maturity overrides the user's intended holding
  // period. A blank, unparseable, or today/past maturity is ignored — otherwise
  // it would collapse the horizon to HOLDING_FLOOR (0.01yr) and blow every
  // fee-drag term up by ~100×, which is exactly the −296.5% bug.
  const maturityYears = p.maturityDate ? yearsUntil(p.maturityDate, now) : NaN;
  let effectiveHoldingYears: number;
  if (Number.isFinite(maturityYears) && maturityYears > 0) {
    effectiveHoldingYears = Math.max(maturityYears, HOLDING_FLOOR);
  } else {
    effectiveHoldingYears =
      p.holdingPeriodYears && p.holdingPeriodYears > 0 ? p.holdingPeriodYears : 1;
  }

  // CANONICAL VERSA MODEL — only recurring fees reduce true yield:
  //   trueYield = headline − managementFee − headline×(performanceFee/100)
  // Performance fee is charged on the HEADLINE yield (percentage points).
  // Entry/exit fees are NOT amortized in (they're reported as separate one-time
  // costs); premium/discount is NOT folded in (reported as its own metric).
  const perfFeeDrag = p.headlineYield * (p.feePerformance / 100);

  // True yield can go negative — we never floor it; that honesty is the point.
  const trueYield = p.headlineYield - p.feeFlat - perfFeeDrag;

  const grossIncomePerYear = currentValue * (p.headlineYield / 100);
  // Net income after recurring fees — drives Est. annual income.
  const netIncomePerYear = currentValue * (trueYield / 100);
  const feeDragDollarsPerYear = currentValue * ((p.headlineYield - trueYield) / 100);
  const costToExit = currentValue * (p.feeExit / 100);

  // Premium/discount to NAV is reported on its own — it is NOT folded into yield.
  // ENTRY premium: the price you PAID vs NAV (not current price vs NAV).
  const premiumDiscountToNav =
    p.nav && p.nav > 0 ? ((p.pricePaid - p.nav) / p.nav) * 100 : null;

  return {
    id: p.id,
    investedValue,
    currentValue,
    effectiveHoldingYears,
    perfFeeDrag,
    trueYield,
    grossIncomePerYear,
    netIncomePerYear,
    feeDragDollarsPerYear,
    costToExit,
    premiumDiscountToNav,
  };
}

// Classify a single position into a liquidity bucket using its lockup,
// redemption frequency, and settlement days.
export function classifyLiquidity(p: Position, now: Date = new Date()): LiquidityBucket {
  // An active lockup gates the position regardless of redemption terms.
  if (p.lockupUntil && new Date(p.lockupUntil).getTime() > now.getTime()) {
    return "gated";
  }
  const fd = freqDays(p.redemptionFrequency);
  if (!isFinite(fd)) return "gated"; // atMaturity
  const totalDays = fd + (p.settlementDays || 0);
  if (totalDays <= 2) return "≤2 days";
  if (totalDays <= 7) return "≤1 week";
  if (totalDays <= 30) return "≤1 month";
  return ">1 month";
}

function emptyLiquidity(): LiquidityProfile {
  return {
    pctByBucket: {
      "≤2 days": 0,
      "≤1 week": 0,
      "≤1 month": 0,
      ">1 month": 0,
      gated: 0,
    },
    accessibleAmount: 0,
    lockedAmount: 0,
  };
}

function emptyPortfolio(): PortfolioResult {
  return {
    positions: [],
    totalInvested: null,
    totalCurrentValue: null,
    totalGainDollars: null,
    blendedTrueYield: null,
    blendedHeadlineYield: null,
    weightedAvgYieldOnCost: null,
    estAnnualIncome: null,
    totalFeeDragPerYear: null,
    costToExitAll: null,
    largestPositionConcentrationPct: null,
    positionCount: 0,
    issuerCount: 0,
    chainCount: 0,
    blendedPremiumDiscount: null,
    liquidity: emptyLiquidity(),
    byIssuer: [],
  };
}

// ── Whole portfolio ──────────────────────────────────────────────
export function computePortfolio(positions: Position[], now: Date = new Date()): PortfolioResult {
  if (positions.length === 0) return emptyPortfolio();

  const results = positions.map((p) => computePosition(p, now));

  const totalInvested = sum(results.map((r) => r.investedValue));
  const totalCurrentValue = sum(results.map((r) => r.currentValue));
  const totalGainDollars = totalCurrentValue - totalInvested;

  // Current-value-weighted average true yield.
  const blendedTrueYield =
    totalCurrentValue > 0
      ? sum(results.map((r) => r.currentValue * r.trueYield)) / totalCurrentValue
      : null;

  // Current-value-weighted average headline yield (for the gap display).
  const blendedHeadlineYield =
    totalCurrentValue > 0
      ? sum(positions.map((p, i) => results[i].currentValue * p.headlineYield)) /
        totalCurrentValue
      : null;

  // Invested-weighted average of yield-on-cost (income per year ÷ cost basis).
  let yocNumer = 0;
  let yocDenom = 0;
  results.forEach((r) => {
    if (r.investedValue > 0) {
      const yoc = (r.grossIncomePerYear / r.investedValue) * 100;
      yocNumer += r.investedValue * yoc;
      yocDenom += r.investedValue;
    }
  });
  const weightedAvgYieldOnCost = yocDenom > 0 ? yocNumer / yocDenom : null;

  // Est. annual income is NET of recurring fees (current value × true yield).
  const estAnnualIncome = sum(results.map((r) => r.netIncomePerYear));
  const totalFeeDragPerYear = sum(results.map((r) => r.feeDragDollarsPerYear));
  const costToExitAll = sum(results.map((r) => r.costToExit));

  const largestPositionConcentrationPct =
    totalCurrentValue > 0
      ? (Math.max(...results.map((r) => r.currentValue)) / totalCurrentValue) * 100
      : null;

  const issuerCount = new Set(
    positions.map((p) => p.issuer.trim().toLowerCase()).filter(Boolean),
  ).size;
  const chainCount = new Set(
    positions.map((p) => p.chain.trim().toLowerCase()).filter(Boolean),
  ).size;

  // Current-value-weighted premium/discount, ignoring positions without a NAV.
  let pdNumer = 0;
  let pdDenom = 0;
  results.forEach((r) => {
    if (r.premiumDiscountToNav !== null) {
      pdNumer += r.currentValue * r.premiumDiscountToNav;
      pdDenom += r.currentValue;
    }
  });
  const blendedPremiumDiscount = pdDenom > 0 ? pdNumer / pdDenom : null;

  // Liquidity buckets.
  const bucketDollars: Record<LiquidityBucket, number> = {
    "≤2 days": 0,
    "≤1 week": 0,
    "≤1 month": 0,
    ">1 month": 0,
    gated: 0,
  };
  let accessibleAmount = 0;
  let lockedAmount = 0;
  positions.forEach((p, i) => {
    const cv = results[i].currentValue;
    const bucket = classifyLiquidity(p, now);
    bucketDollars[bucket] += cv;
    if (bucket === "gated") lockedAmount += cv;
    else accessibleAmount += cv;
  });
  const pctByBucket = {} as Record<LiquidityBucket, number>;
  LIQUIDITY_BUCKETS.forEach((b) => {
    pctByBucket[b] = totalCurrentValue > 0 ? (bucketDollars[b] / totalCurrentValue) * 100 : 0;
  });

  // Composition by issuer (for the donut), largest first.
  const issuerMap = new Map<string, number>();
  positions.forEach((p, i) => {
    const key = p.issuer.trim() || "—";
    issuerMap.set(key, (issuerMap.get(key) ?? 0) + results[i].currentValue);
  });
  const byIssuer: IssuerSlice[] = [...issuerMap.entries()]
    .map(([issuer, currentValue]) => ({ issuer, currentValue }))
    .sort((a, b) => b.currentValue - a.currentValue);

  return {
    positions: results,
    totalInvested,
    totalCurrentValue,
    totalGainDollars,
    blendedTrueYield,
    blendedHeadlineYield,
    weightedAvgYieldOnCost,
    estAnnualIncome,
    totalFeeDragPerYear,
    costToExitAll,
    largestPositionConcentrationPct,
    positionCount: positions.length,
    issuerCount,
    chainCount,
    blendedPremiumDiscount,
    liquidity: { pctByBucket, accessibleAmount, lockedAmount },
    byIssuer,
  };
}
