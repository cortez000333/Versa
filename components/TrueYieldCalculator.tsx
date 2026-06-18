"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

// ── Brand tokens ──────────────────────────────────────────────
const CARD = "#111A2E";
const BG_ELEV = "#0E1424";
const LINE = "#1E2A44";
const BLUE = "#4F8FF7";
const MINT = "#35D6A4";
const CORAL = "#F87171";
const INK = "#EAF0FB";
const MUTE = "#7E8DA8";
const FAINT = "#566179";
const FONT = "var(--font-space-grotesk), 'Space Grotesk', -apple-system, sans-serif";

function Stat({
  label, value, sub, color, big,
}: {
  label: string; value: string; sub: string; color: string; big?: boolean;
}) {
  return (
    <div style={{ background: BG_ELEV, borderRadius: 11, padding: "12px 13px" }}>
      <div style={{ fontSize: 10.5, color: FAINT, textTransform: "uppercase", letterSpacing: 0.4, fontWeight: 600, marginBottom: 5 }}>{label}</div>
      <div style={{ fontSize: big ? 22 : 17, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 10.5, color: FAINT, marginTop: 2 }}>{sub}</div>
    </div>
  );
}

// All inputs are plain numbers (serializable) so this client component can be
// dropped into the server-rendered scorecard page.
export default function TrueYieldCalculator({
  nav,
  marketPrice,
  headlineYield,
  feeFlat,
  feePerformance,
  feeEntry,
  feeExit,
}: {
  nav: number;
  marketPrice: number | null;
  headlineYield: number;
  feeFlat: number;        // annual mgmt fee, % of capital
  feePerformance: number; // annual perf fee, % of the yield
  feeEntry: number;       // one-time, % of capital
  feeExit: number;        // one-time, % of capital
}) {
  const [amount, setAmount] = useState(10000);
  const [pricePaid, setPricePaid] = useState(marketPrice ?? nav);

  // derive everything from the two intuitive inputs + known NAV
  const premiumDiscount = ((pricePaid - nav) / nav) * 100; // + premium / - discount
  const tokens = pricePaid > 0 ? amount / pricePaid : 0;

  // ── Net annual yield (at NAV) ──────────────────────────────
  // 1) flat management fee comes off the headline yield (both are % of capital)
  // 2) the performance fee is a % OF THE YIELD, applied to what's left —
  //    so a 10% perf fee turns a 3.13% yield into 3.13 × 0.90 = 2.82%,
  //    it never subtracts 10% of capital.
  const netNavYield =
    (headlineYield - feeFlat) * (1 - feePerformance / 100);
  // 3) entry-price effect: a premium dilutes your yield-on-cost, a discount lifts it
  const trueYield = pricePaid > 0 ? netNavYield * (nav / pricePaid) : 0;
  const annualIncome = amount * (trueYield / 100);

  // ── One-time costs (NOT blended into the annual yield) ─────
  const entryCost = amount * (feeEntry / 100);
  const exitCost = amount * (feeExit / 100);
  const hasOneTimeCosts = feeEntry > 0 || feeExit > 0;

  const isDiscount = premiumDiscount <= 0;

  return (
    <>
      <div style={{ fontSize: 11, color: FAINT, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 12 }}>
        True-yield calculator{" "}
        <span style={{ color: BLUE, textTransform: "none", letterSpacing: 0 }}>· personalized to your position</span>
      </div>
      <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18, color: BLUE }}>
          <Calculator size={18} />
          <span style={{ color: INK, fontWeight: 600, fontSize: 15 }}>What will you actually earn?</span>
        </div>

        {/* inputs: the two things a user actually knows */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 8 }}>
          <div>
            <label style={{ fontSize: 12.5, color: MUTE, display: "block", marginBottom: 8 }}>Amount invested (USD)</label>
            <div style={{ display: "flex", alignItems: "center", background: BG_ELEV, border: `1px solid ${LINE}`, borderRadius: 9, padding: "0 12px" }}>
              <span style={{ color: FAINT, fontSize: 16 }}>$</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(+e.target.value)}
                style={{ width: "100%", border: "none", outline: "none", background: "transparent", color: INK, fontSize: 17, fontWeight: 700, fontFamily: FONT, padding: "11px 8px" }}
              />
            </div>
          </div>
          <div>
            <label style={{ fontSize: 12.5, color: MUTE, display: "block", marginBottom: 8 }}>Price you paid per token (USD)</label>
            <div style={{ display: "flex", alignItems: "center", background: BG_ELEV, border: `1px solid ${LINE}`, borderRadius: 9, padding: "0 12px" }}>
              <span style={{ color: FAINT, fontSize: 16 }}>$</span>
              <input
                type="number"
                step="0.001"
                value={pricePaid}
                onChange={(e) => setPricePaid(+e.target.value)}
                style={{ width: "100%", border: "none", outline: "none", background: "transparent", color: INK, fontSize: 17, fontWeight: 700, fontFamily: FONT, padding: "11px 8px" }}
              />
            </div>
            <div style={{ fontSize: 11, color: FAINT, marginTop: 5 }}>
              Current NAV is ${nav.toFixed(3)} · leave at market price for a &ldquo;buy now&rdquo; estimate
            </div>
          </div>
        </div>

        {/* outputs — premium/discount is a RESULT, not an input */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, borderTop: `1px solid ${LINE}`, paddingTop: 18, marginTop: 14 }}>
          <Stat
            label={isDiscount ? "Your discount to NAV" : "Your premium to NAV"}
            value={`${isDiscount ? "" : "+"}${premiumDiscount.toFixed(2)}%`}
            sub="derived from your price"
            color={isDiscount ? MINT : CORAL}
          />
          <Stat label="Tokens acquired" value={tokens.toLocaleString(undefined, { maximumFractionDigits: 0 })} sub="at your price" color={INK} />
          <Stat label="Your true yield" value={`${trueYield.toFixed(2)}%`} sub="annual, after recurring fees + entry" color={MINT} big />
          <Stat label="Est. annual income" value={`$${Math.round(annualIncome).toLocaleString()}`} sub="on your amount" color={INK} />
        </div>

        {/* one-time costs — shown separately because they're not annual */}
        {hasOneTimeCosts ? (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 10 }}>
            {feeEntry > 0 ? (
              <Stat
                label="One-time entry cost"
                value={`$${Math.round(entryCost).toLocaleString()}`}
                sub={`${feeEntry}% on subscription`}
                color={CORAL}
              />
            ) : null}
            {feeExit > 0 ? (
              <Stat
                label="One-time exit cost"
                value={`$${Math.round(exitCost).toLocaleString()}`}
                sub={`${feeExit}% on redemption`}
                color={CORAL}
              />
            ) : null}
          </div>
        ) : null}

        <div style={{ marginTop: 16, fontSize: 12, color: FAINT, lineHeight: 1.5 }}>
          You paid <span style={{ color: INK, fontWeight: 600 }}>${pricePaid.toFixed(3)}</span> against a NAV of ${nav.toFixed(3)} — a{" "}
          {isDiscount ? "discount" : "premium"} of {Math.abs(premiumDiscount).toFixed(2)}%. Headline yield is {headlineYield}%; after the{" "}
          {feeFlat > 0 ? `${feeFlat}% flat fee` : "flat fee"}
          {feePerformance > 0 ? ` and a ${feePerformance}% performance fee on the yield` : ""} plus your entry price, your real annual return is{" "}
          <span style={{ color: MINT, fontWeight: 600 }}>{trueYield.toFixed(2)}%</span>.
          {hasOneTimeCosts
            ? " Entry and exit fees are one-time costs shown above — their impact on your overall return depends on how long you hold."
            : ""}{" "}
          That gap is what Versa exists to show.
        </div>
      </div>
    </>
  );
}
