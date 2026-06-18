export interface Protocol {
  id: number;
  name: string;
  ticker: string;
  assetClass: string;
  underlying: string;
  chain: string;
  yield: string;
  tvl: string;
  price: string;
  change: number;
  nav: number;
  liquidity: string;
  wrapper: string;
  // Protocol detail page fields
  protocolUrl: string;
  minInvestment: string;
  lockUp: string;
  eligibility: string;
  sectionIssuer: string;
  sectionAssets: string;
  sectionMechanics: string;
  sectionYield: string;
  sectionRedemption: string;
  monthsLive: string; // deprecated — replaced by issuingDate (migration 005), column kept
  issuingDate?: string; // e.g. "March 2023" (migration 005)
  distributionsPaid: string;
  incidents: string;
  riskCredit: number;
  riskLiquidity: number;
  riskRegulatory: number;
  riskSmartContract: number;
  riskCustodial: number;

  // ── Scorecard page fields (migration 001) ──────────────────
  // Optional: set directly in the DB for now; the admin form gains
  // inputs for these in a later step. Numeric scores are 0–10 or null.
  scoreTransparency?: number | null;
  noteTransparency?: string;
  scoreLiquidityFriction?: number | null;
  noteLiquidityFriction?: string;
  scoreRealCost?: number | null;
  noteRealCost?: string;
  scoreTrackRecord?: number | null;
  noteTrackRecord?: string;
  scoreCounterparty?: number | null;
  noteCounterparty?: string;
  scoreRegulatory?: number | null;
  noteRegulatory?: string;
  // Numeric values for the true-yield calculator
  navPerToken?: number | null;
  marketPrice?: number | null;
  headlineYield?: number | null;
  feeDrag?: number | null; // deprecated — kept in DB, replaced by the structured fee model below
  // Structured fee model (migration 003)
  feeFlat?: number | null;        // annual management fee, % of capital
  feePerformance?: number | null; // annual performance fee, % of the yield
  feeEntry?: number | null;       // one-time fee on subscription, % of capital
  feeExit?: number | null;        // one-time fee on redemption, % of capital
  // Short asset-facts fields
  issuerName?: string;
  tokenStandard?: string;
  redemptionTerms?: string; // shown as "Redemption" in the facts panel (reused)
  settlement?: string;      // e.g. "T+0", "T+2" (migration 005)
  custodian?: string;
  // Narrative fields
  plainRead?: string;
  exitRoutesNote?: string;
  // Asset logo (migration 004) — image URL, blank falls back to letter square
  logoUrl?: string;
  // "Suited for" panel (migration 002) — describes who the ASSET suits.
  // Tags are stored comma-separated, drawn from a fixed set in the admin form.
  suitedForTags?: string;
  suitedForText?: string;
}

// Converts a raw Supabase row (snake_case) into a Protocol object (camelCase)
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function rowToProtocol(row: any): Protocol {
  return {
    id: row.id,
    name: row.name ?? "",
    ticker: row.ticker ?? "",
    assetClass: row.asset_class ?? "",
    underlying: row.underlying ?? "",
    chain: row.chain ?? "",
    yield: row.net_yield ?? "—",
    tvl: row.tvl ?? "—",
    price: row.price ?? "—",
    change: row.change_24h ?? 0,
    nav: row.vs_nav ?? 0,
    liquidity: row.liquidity ?? "—",
    wrapper: row.wrapper ?? "—",
    protocolUrl: row.protocol_url ?? "",
    minInvestment: row.min_investment ?? "—",
    lockUp: row.lock_up ?? "—",
    eligibility: row.eligibility ?? "—",
    sectionIssuer: row.section_issuer ?? "",
    sectionAssets: row.section_assets ?? "",
    sectionMechanics: row.section_mechanics ?? "",
    sectionYield: row.section_yield_breakdown ?? "",
    sectionRedemption: row.section_redemption ?? "",
    monthsLive: row.months_live ?? "—",
    issuingDate: row.issuing_date ?? "",
    distributionsPaid: row.distributions_paid ?? "—",
    incidents: row.incidents ?? "—",
    riskCredit: row.risk_credit ?? 0,
    riskLiquidity: row.risk_liquidity ?? 0,
    riskRegulatory: row.risk_regulatory ?? 0,
    riskSmartContract: row.risk_smart_contract ?? 0,
    riskCustodial: row.risk_custodial ?? 0,

    // Scorecard page fields (migration 001) — null when not yet set
    scoreTransparency: row.score_transparency ?? null,
    noteTransparency: row.note_transparency ?? "",
    scoreLiquidityFriction: row.score_liquidity_friction ?? null,
    noteLiquidityFriction: row.note_liquidity_friction ?? "",
    scoreRealCost: row.score_real_cost ?? null,
    noteRealCost: row.note_real_cost ?? "",
    scoreTrackRecord: row.score_track_record ?? null,
    noteTrackRecord: row.note_track_record ?? "",
    scoreCounterparty: row.score_counterparty ?? null,
    noteCounterparty: row.note_counterparty ?? "",
    scoreRegulatory: row.score_regulatory ?? null,
    noteRegulatory: row.note_regulatory ?? "",
    navPerToken: row.nav_per_token ?? null,
    marketPrice: row.market_price ?? null,
    headlineYield: row.headline_yield ?? null,
    feeDrag: row.fee_drag ?? null,
    feeFlat: row.fee_flat ?? null,
    feePerformance: row.fee_performance ?? null,
    feeEntry: row.fee_entry ?? null,
    feeExit: row.fee_exit ?? null,
    issuerName: row.issuer_name ?? "",
    tokenStandard: row.token_standard ?? "",
    redemptionTerms: row.redemption_terms ?? "",
    settlement: row.settlement ?? "",
    custodian: row.custodian ?? "",
    plainRead: row.plain_read ?? "",
    exitRoutesNote: row.exit_routes_note ?? "",
    logoUrl: row.logo_url ?? "",
    suitedForTags: row.suited_for_tags ?? "",
    suitedForText: row.suited_for_text ?? "",
  };
}

// Converts a Protocol object back to DB column names for INSERT/UPDATE
export function protocolToRow(p: Omit<Protocol, "id">) {
  return {
    name: p.name,
    ticker: p.ticker || null,
    asset_class: p.assetClass || null,
    underlying: p.underlying || null,
    chain: p.chain || null,
    net_yield: p.yield || null,
    tvl: p.tvl || null,
    price: p.price || null,
    // change_24h / vs_nav / liquidity: deprecated (migration 005) — columns kept
    // in place but no longer written, so any existing values are preserved.
    wrapper: p.wrapper || null,
    protocol_url: p.protocolUrl || null,
    min_investment: p.minInvestment || null,
    lock_up: p.lockUp || null,
    eligibility: p.eligibility || null,
    section_issuer: p.sectionIssuer || null,
    section_assets: p.sectionAssets || null,
    section_mechanics: p.sectionMechanics || null,
    section_yield_breakdown: p.sectionYield || null,
    section_redemption: p.sectionRedemption || null,
    // months_live: deprecated (migration 005) — replaced by issuing_date, column kept
    issuing_date: p.issuingDate || null,
    distributions_paid: p.distributionsPaid || null,
    incidents: p.incidents || null,
    risk_credit: p.riskCredit || 0,
    risk_liquidity: p.riskLiquidity || 0,
    risk_regulatory: p.riskRegulatory || 0,
    risk_smart_contract: p.riskSmartContract || 0,
    risk_custodial: p.riskCustodial || 0,

    // Scorecard fields (migration 001) — null when blank
    score_transparency: p.scoreTransparency ?? null,
    note_transparency: p.noteTransparency || null,
    score_liquidity_friction: p.scoreLiquidityFriction ?? null,
    note_liquidity_friction: p.noteLiquidityFriction || null,
    score_real_cost: p.scoreRealCost ?? null,
    note_real_cost: p.noteRealCost || null,
    score_track_record: p.scoreTrackRecord ?? null,
    note_track_record: p.noteTrackRecord || null,
    score_counterparty: p.scoreCounterparty ?? null,
    note_counterparty: p.noteCounterparty || null,
    score_regulatory: p.scoreRegulatory ?? null,
    note_regulatory: p.noteRegulatory || null,
    nav_per_token: p.navPerToken ?? null,
    market_price: p.marketPrice ?? null,
    headline_yield: p.headlineYield ?? null,
    fee_drag: p.feeDrag ?? null,
    fee_flat: p.feeFlat ?? null,
    fee_performance: p.feePerformance ?? null,
    fee_entry: p.feeEntry ?? null,
    fee_exit: p.feeExit ?? null,
    issuer_name: p.issuerName || null,
    token_standard: p.tokenStandard || null,
    redemption_terms: p.redemptionTerms || null, // the "Redemption" fact (reused)
    settlement: p.settlement || null,
    custodian: p.custodian || null,
    plain_read: p.plainRead || null,
    exit_routes_note: p.exitRoutesNote || null,
    logo_url: p.logoUrl || null,
    suited_for_tags: p.suitedForTags || null,
    suited_for_text: p.suitedForText || null,
    updated_at: new Date().toISOString(),
  };
}
