"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";

// ── Brand tokens (mirrors components/TrueYieldCalculator.tsx) ──
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

// Parse a free-text numeric field. Blank / invalid → null (so the math can
// gracefully degrade and show "—" rather than crash on NaN).
function num(s: string): number | null {
  if (s.trim() === "") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

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

const labelStyle: React.CSSProperties = {
  fontSize: 12.5,
  color: MUTE,
  display: "block",
  marginBottom: 8,
};
const inputWrapStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  background: BG_ELEV,
  border: `1px solid ${LINE}`,
  borderRadius: 9,
  padding: "0 12px",
};
const inputStyle: React.CSSProperties = {
  width: "100%",
  border: "none",
  outline: "none",
  background: "transparent",
  color: INK,
  fontSize: 16,
  fontWeight: 700,
  fontFamily: FONT,
  padding: "11px 8px",
};

// One numeric field with an optional leading/trailing adornment ($ or %).
function NumField({
  label, value, onChange, prefix, suffix, step, placeholder, hint,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  prefix?: string;
  suffix?: string;
  step?: string;
  placeholder?: string;
  hint?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <div style={inputWrapStyle}>
        {prefix ? <span style={{ color: FAINT, fontSize: 15 }}>{prefix}</span> : null}
        <input
          type="number"
          step={step}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
          style={inputStyle}
        />
        {suffix ? <span style={{ color: FAINT, fontSize: 15 }}>{suffix}</span> : null}
      </div>
      {hint ? <div style={{ fontSize: 11, color: FAINT, marginTop: 5 }}>{hint}</div> : null}
    </div>
  );
}

const DASH = "—";
const fmtPct = (n: number | null, sign = false) =>
  n === null ? DASH : `${sign && n > 0 ? "+" : ""}${n.toFixed(2)}%`;
const fmtUsd = (n: number | null) =>
  n === null ? DASH : `$${Math.round(n).toLocaleString()}`;

export default function StandaloneCalculator() {
  // Every input is free-text so it can be left blank. Nothing is required.
  const [amountStr, setAmountStr] = useState("");
  const [priceStr, setPriceStr] = useState("");
  const [navStr, setNavStr] = useState("");
  const [yieldStr, setYieldStr] = useState("");
  const [flatStr, setFlatStr] = useState("");
  const [perfStr, setPerfStr] = useState("");
  const [entryStr, setEntryStr] = useState("");
  const [exitStr, setExitStr] = useState("");

  const amount = num(amountStr);
  const pricePaid = num(priceStr);
  const nav = num(navStr);
  const headlineYield = num(yieldStr);
  // Fees are optional add-ons: a blank fee means "no fee" (0), so true yield can
  // still be computed from NAV + price + headline yield alone.
  const feeFlat = num(flatStr) ?? 0;
  const feePerformance = num(perfStr) ?? 0;
  const feeEntry = num(entryStr);
  const feeExit = num(exitStr);

  // ── Derived facts (same fee-aware math as TrueYieldCalculator) ──
  // Premium/discount needs NAV + price paid.
  const premiumDiscount =
    nav !== null && nav > 0 && pricePaid !== null
      ? ((pricePaid - nav) / nav) * 100
      : null;

  // Tokens acquired needs amount + a positive price.
  const tokens =
    amount !== null && pricePaid !== null && pricePaid > 0 ? amount / pricePaid : null;

  // Net yield at NAV needs the headline yield; fees fall back to 0.
  const netNavYield =
    headlineYield !== null ? (headlineYield - feeFlat) * (1 - feePerformance / 100) : null;

  // True yield additionally needs NAV + a positive price (entry-price effect).
  const trueYield =
    netNavYield !== null && nav !== null && pricePaid !== null && pricePaid > 0
      ? netNavYield * (nav / pricePaid)
      : null;

  const annualIncome =
    amount !== null && trueYield !== null ? amount * (trueYield / 100) : null;

  // Headline-vs-true gap (percentage points).
  const yieldGap =
    headlineYield !== null && trueYield !== null ? trueYield - headlineYield : null;

  // One-time costs only show when both an amount and that fee are entered.
  const entryCost =
    amount !== null && feeEntry !== null && feeEntry > 0 ? amount * (feeEntry / 100) : null;
  const exitCost =
    amount !== null && feeExit !== null && feeExit > 0 ? amount * (feeExit / 100) : null;
  const hasOneTimeCosts = entryCost !== null || exitCost !== null;

  const isDiscount = premiumDiscount !== null && premiumDiscount <= 0;

  return (
    <div style={{ fontFamily: FONT }}>
      <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: "22px 24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 18, color: BLUE }}>
          <Calculator size={18} />
          <span style={{ color: INK, fontWeight: 600, fontSize: 15 }}>What will you actually earn?</span>
        </div>

        {/* ── Your position ─────────────────────────────────── */}
        <div style={{ fontSize: 11, color: FAINT, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600, marginBottom: 12 }}>
          Your position
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 22 }}>
          <NumField label="Amount invested (USD)" value={amountStr} onChange={setAmountStr} prefix="$" placeholder="10000" />
          <NumField label="Price paid per token (USD)" value={priceStr} onChange={setPriceStr} prefix="$" step="0.001" placeholder="1.000" />
          <NumField label="Current NAV per token (USD)" value={navStr} onChange={setNavStr} prefix="$" step="0.001" placeholder="1.000" />
        </div>

        {/* ── Yield & fees ──────────────────────────────────── */}
        <div style={{ fontSize: 11, color: FAINT, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600, marginBottom: 12 }}>
          Yield &amp; fees
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 6 }}>
          <NumField label="Headline yield" value={yieldStr} onChange={setYieldStr} suffix="%" step="0.01" placeholder="5.00" />
          <NumField label="Flat / management fee" value={flatStr} onChange={setFlatStr} suffix="%" step="0.01" placeholder="0" hint="annual, % of capital" />
          <NumField label="Performance fee" value={perfStr} onChange={setPerfStr} suffix="%" step="0.01" placeholder="0" hint="% of the yield" />
          <NumField label="Entry fee" value={entryStr} onChange={setEntryStr} suffix="%" step="0.01" placeholder="0" hint="one-time, % of capital" />
          <NumField label="Exit fee" value={exitStr} onChange={setExitStr} suffix="%" step="0.01" placeholder="0" hint="one-time, % of capital" />
        </div>

        {/* ── Outputs ───────────────────────────────────────── */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, borderTop: `1px solid ${LINE}`, paddingTop: 18, marginTop: 18 }}>
          <Stat
            label={isDiscount ? "Discount to NAV" : "Premium to NAV"}
            value={fmtPct(premiumDiscount, true)}
            sub="derived from your price"
            color={premiumDiscount === null ? FAINT : isDiscount ? MINT : CORAL}
          />
          <Stat
            label="Tokens acquired"
            value={tokens === null ? DASH : tokens.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            sub="at your price"
            color={tokens === null ? FAINT : INK}
          />
          <Stat
            label="Your true yield"
            value={fmtPct(trueYield)}
            sub="annual, after recurring fees + entry"
            color={trueYield === null ? FAINT : trueYield < 0 ? CORAL : MINT}
            big
          />
          <Stat
            label="Est. annual income"
            value={fmtUsd(annualIncome)}
            sub="on your amount"
            color={annualIncome === null ? FAINT : INK}
          />
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginTop: 10 }}>
          <Stat
            label="Net yield at NAV"
            value={fmtPct(netNavYield)}
            sub="headline minus recurring fees"
            color={netNavYield === null ? FAINT : INK}
          />
          <Stat
            label="Headline vs true gap"
            value={yieldGap === null ? DASH : `${yieldGap > 0 ? "+" : ""}${yieldGap.toFixed(2)} pts`}
            sub="true minus headline"
            color={yieldGap === null ? FAINT : yieldGap < 0 ? CORAL : MINT}
          />
          {entryCost !== null ? (
            <Stat label="One-time entry cost" value={fmtUsd(entryCost)} sub={`${feeEntry}% on subscription`} color={CORAL} />
          ) : null}
          {exitCost !== null ? (
            <Stat label="One-time exit cost" value={fmtUsd(exitCost)} sub={`${feeExit}% on redemption`} color={CORAL} />
          ) : null}
        </div>

        <div style={{ marginTop: 16, fontSize: 12, color: FAINT, lineHeight: 1.5 }}>
          Enter what you know — every field is optional. Anything that needs a value you haven&rsquo;t
          provided shows {DASH}. True yield reflects the headline rate after recurring fees and your entry
          price against NAV; {hasOneTimeCosts ? "entry and exit fees are one-time costs shown separately, since their drag depends on how long you hold. " : ""}
          That gap between headline and true is what Versa exists to show.
        </div>
      </div>
    </div>
  );
}
