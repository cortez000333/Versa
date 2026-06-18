import Link from "next/link";
import { Fragment } from "react";
import { Protocol } from "@/lib/data";

const BG      = "#080B16";
const BG_ELEV = "#0E1424";
const CARD    = "#111A2E";
const LINE    = "#1E2A44";
const BLUE    = "#4F8FF7";
const BLUE_SOFT = "#16233F";
const MINT    = "#35D6A4";
const CORAL   = "#F87171";
const INK     = "#EAF0FB";
const MUTE    = "#7E8DA8";
const FAINT   = "#566179";

const ASSET_CLASSES = [
  "", "Real Estate", "Commodities", "Gov. Securities",
  "Money Market", "Equities", "Private Credit", "Bonds",
];

// Fixed set of investor-type tags for the "Suited for" panel (descriptive).
const SUITED_FOR_TAGS = [
  "Conservative", "Yield-seeker", "Institution / Treasury", "Long-term holder",
  "Liquidity-focused", "Accredited / Pro only", "Retail-accessible",
] as const;

// The six proprietary scorecard scores — [score field, note field, label]
const SCORE_DEFS = [
  ["scoreTransparency",      "noteTransparency",      "Transparency"],
  ["scoreLiquidityFriction", "noteLiquidityFriction", "Redemption / Liquidity Friction"],
  ["scoreRealCost",          "noteRealCost",          "Real Cost"],
  ["scoreTrackRecord",       "noteTrackRecord",       "Track Record"],
  ["scoreCounterparty",      "noteCounterparty",      "Counterparty / Backing"],
  ["scoreRegulatory",        "noteRegulatory",        "Regulatory Clarity"],
] as const;

function Field({
  label, name, value, type = "text", placeholder, hint, required, min, max, step,
}: {
  label: string; name: string; value?: string | number | null;
  type?: string; placeholder?: string; hint?: string; required?: boolean;
  min?: number; max?: number; step?: number | string;
}) {
  return (
    <div>
      <label style={{ fontSize: 11.5, fontWeight: 700, color: MUTE, letterSpacing: 0.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>
        {label}{required && <span style={{ color: CORAL }}> *</span>}
      </label>
      <input
        name={name}
        type={type}
        min={min}
        max={max}
        step={type === "number" ? (step ?? "0.01") : undefined}
        defaultValue={value ?? ""}
        placeholder={placeholder}
        required={required}
        style={{
          width: "100%", background: BG, border: `1px solid ${LINE}`,
          borderRadius: 9, padding: "10px 13px", fontSize: 14,
          color: INK, outline: "none", boxSizing: "border-box",
        }}
      />
      {hint && <div style={{ fontSize: 11.5, color: FAINT, marginTop: 5 }}>{hint}</div>}
    </div>
  );
}

function TextArea({
  label, name, value, placeholder, rows = 4,
}: {
  label: string; name: string; value?: string; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label style={{ fontSize: 11.5, fontWeight: 700, color: MUTE, letterSpacing: 0.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>
        {label}
      </label>
      <textarea
        name={name}
        defaultValue={value ?? ""}
        placeholder={placeholder}
        rows={rows}
        style={{
          width: "100%", background: BG, border: `1px solid ${LINE}`,
          borderRadius: 9, padding: "10px 13px", fontSize: 14,
          color: INK, outline: "none", boxSizing: "border-box",
          resize: "vertical", fontFamily: "inherit", lineHeight: 1.5,
        }}
      />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "22px 24px" }}>
      <div style={{ fontSize: 12, fontWeight: 700, color: MUTE, letterSpacing: 1.1, textTransform: "uppercase", marginBottom: 18 }}>
        {title}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        {children}
      </div>
    </div>
  );
}

function FullRow({ children }: { children: React.ReactNode }) {
  return <div style={{ gridColumn: "1 / -1" }}>{children}</div>;
}

export default function ProtocolForm({
  action,
  protocol,
  error,
  submitLabel,
}: {
  action: (formData: FormData) => Promise<void>;
  protocol?: Protocol;
  error?: string;
  submitLabel: string;
}) {
  const p = protocol;
  const selectedTags = new Set(
    (p?.suitedForTags ?? "").split(",").map((t) => t.trim()).filter(Boolean)
  );

  return (
    <form action={action} style={{ display: "flex", flexDirection: "column", gap: 22 }}>
      {error && (
        <div style={{
          background: "#2A1515", border: `1px solid #5A2020`,
          borderRadius: 10, padding: "12px 16px", fontSize: 13.5, color: CORAL,
        }}>
          {decodeURIComponent(error)}
        </div>
      )}

      {/* Market data */}
      <Section title="Market data">
        <FullRow>
          <Field label="Protocol name" name="name" value={p?.name} placeholder="e.g. Franklin OnChain U.S. Government Money Fund" required />
        </FullRow>
        <FullRow>
          <Field label="Logo URL" name="logoUrl" type="url" value={p?.logoUrl} placeholder="https://…/logo.png" hint="Paste a link to the asset's logo image. Leave blank to show the letter placeholder." />
        </FullRow>
        <Field label="Ticker / symbol" name="ticker" value={p?.ticker} placeholder="e.g. FOBXX" />
        <div>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: MUTE, letterSpacing: 0.5, display: "block", marginBottom: 6, textTransform: "uppercase" }}>
            Asset class
          </label>
          <select
            name="assetClass"
            defaultValue={p?.assetClass ?? ""}
            style={{
              width: "100%", background: BG, border: `1px solid ${LINE}`,
              borderRadius: 9, padding: "10px 13px", fontSize: 14,
              color: INK, outline: "none", boxSizing: "border-box",
            }}
          >
            {ASSET_CLASSES.map((ac) => (
              <option key={ac} value={ac}>{ac || "— Select —"}</option>
            ))}
          </select>
        </div>
        <Field label="Blockchain / chain" name="chain" value={p?.chain} placeholder="e.g. Ethereum, Solana" />
        <Field label="Net yield" name="yield" value={p?.yield} placeholder="e.g. 4.51%" hint="Include the % sign" />
        <Field label="TVL / AUM" name="tvl" value={p?.tvl} placeholder="e.g. $687.4M" hint="Include the $ sign" />
        <Field label="Token price" name="price" value={p?.price} placeholder="e.g. $1.00" />
        <Field label="Wrapper" name="wrapper" value={p?.wrapper} placeholder="e.g. ERC-20" />
        <FullRow>
          <Field label="Underlying asset description" name="underlying" value={p?.underlying} placeholder="One-line description shown under the name in the table" />
        </FullRow>
      </Section>

      {/* Scorecard — Facts strip */}
      <Section title="Scorecard — Facts">
        <Field label="Issuer / manager" name="issuerName" value={p?.issuerName} placeholder="e.g. Ondo Finance" />
        <Field label="Token standard" name="tokenStandard" value={p?.tokenStandard} placeholder="e.g. ERC-20 (rebasing)" />
        <Field label="Redemption" name="redemptionTerms" value={p?.redemptionTerms} placeholder="e.g. Daily, 24/7, Monthly window" hint="How often holders can redeem" />
        <Field label="Settlement" name="settlement" value={p?.settlement} placeholder="e.g. T+0, T+2" hint="How long settlement takes" />
        <Field label="Custodian" name="custodian" value={p?.custodian} placeholder="e.g. Ankura Trust" />
      </Section>

      {/* Scorecard — Calculator inputs */}
      <Section title="Scorecard — Calculator inputs">
        <Field label="NAV per token ($)" name="navPerToken" type="number" step="0.001" value={p?.navPerToken} placeholder="e.g. 1.080" hint="Net asset value per token, in dollars" />
        <Field label="Market price ($)" name="marketPrice" type="number" step="0.001" value={p?.marketPrice} placeholder="e.g. 1.082" hint="Current market price per token" />
        <Field label="Headline yield (%)" name="headlineYield" type="number" step="0.01" value={p?.headlineYield} placeholder="e.g. 4.2" hint="Advertised at-NAV APY, number only" />
        <Field label="Flat management fee (%)" name="feeFlat" type="number" step="0.01" value={p?.feeFlat} placeholder="e.g. 0.5" hint="Annual fee charged on capital" />
        <Field label="Performance fee (%)" name="feePerformance" type="number" step="0.01" value={p?.feePerformance} placeholder="e.g. 10" hint="% of the yield, not capital" />
        <Field label="Entry fee (%)" name="feeEntry" type="number" step="0.01" value={p?.feeEntry} placeholder="e.g. 0.04" hint="One-time, charged on subscription" />
        <Field label="Exit fee (%)" name="feeExit" type="number" step="0.01" value={p?.feeExit} placeholder="e.g. 0.03" hint="One-time, charged on redemption" />
        <FullRow>
          <div style={{ fontSize: 11.5, color: FAINT }}>
            The calculator needs at least <strong>NAV per token</strong> and <strong>Headline yield</strong> to appear on the scorecard. Leave all blank to hide it.
          </div>
        </FullRow>
      </Section>

      {/* Scorecard — Scores & notes */}
      <Section title="Scorecard — Scores & notes (0–10)">
        {SCORE_DEFS.map(([scoreField, noteField, label]) => (
          <Fragment key={scoreField}>
            <Field
              label={`${label} — score`}
              name={scoreField}
              type="number"
              min={0} max={10} step={1}
              value={p?.[scoreField] as number | null | undefined}
              placeholder="0–10"
            />
            <Field
              label={`${label} — note`}
              name={noteField}
              value={p?.[noteField] as string | undefined}
              placeholder="One-line justification"
            />
          </Fragment>
        ))}
        <FullRow>
          <div style={{ fontSize: 11.5, color: FAINT }}>
            Leave a score blank to show &ldquo;—&rdquo; for that dimension. The composite Versa Score averages whichever scores are filled in.
          </div>
        </FullRow>
      </Section>

      {/* Scorecard — Narrative */}
      <Section title="Scorecard — Narrative">
        <FullRow>
          <TextArea label="The plain read" name="plainRead" value={p?.plainRead} rows={4} placeholder="Plain-language summary shown in the blue box near the top of the scorecard." />
        </FullRow>
        <FullRow>
          <TextArea label="Where holders have exited (informational)" name="exitRoutesNote" value={p?.exitRoutesNote} rows={3} placeholder="Documented exit routes — primary redemption, observed secondary activity, etc." />
        </FullRow>
      </Section>

      {/* Scorecard — Suited for */}
      <Section title="Scorecard — Suited for">
        <FullRow>
          <label style={{ fontSize: 11.5, fontWeight: 700, color: MUTE, letterSpacing: 0.5, display: "block", marginBottom: 10, textTransform: "uppercase" }}>
            Investor-type tags
          </label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {SUITED_FOR_TAGS.map((tag) => (
              <label
                key={tag}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: BG, border: `1px solid ${LINE}`, borderRadius: 9,
                  padding: "8px 12px", fontSize: 13, color: INK, cursor: "pointer",
                }}
              >
                <input
                  type="checkbox"
                  name="suitedForTags"
                  value={tag}
                  defaultChecked={selectedTags.has(tag)}
                  style={{ accentColor: BLUE, width: 15, height: 15 }}
                />
                {tag}
              </label>
            ))}
          </div>
          <div style={{ fontSize: 11.5, color: FAINT, marginTop: 8 }}>
            Describes who the asset suits — pick any that apply. Shown as pills on the scorecard.
          </div>
        </FullRow>
        <FullRow>
          <TextArea label="Suited for (description)" name="suitedForText" value={p?.suitedForText} rows={2} placeholder="One or two sentences describing the natural holder — e.g. 'Treasuries and conservative allocators wanting dollar yield with daily liquidity.'" />
        </FullRow>
      </Section>

      {/* Protocol detail */}
      <Section title="Protocol detail page">
        <FullRow>
          <Field label="Protocol URL" name="protocolUrl" type="url" value={p?.protocolUrl} placeholder="https://…" hint="Used for the 'Visit protocol' button" />
        </FullRow>
        <Field label="Min. investment" name="minInvestment" value={p?.minInvestment} placeholder="e.g. $20,000 or Accredited only" />
        <Field label="Lock-up" name="lockUp" value={p?.lockUp} placeholder="e.g. None, 30-day, 1 year" />
        <FullRow>
          <Field label="Eligibility" name="eligibility" value={p?.eligibility} placeholder="e.g. US accredited investors, Global (excl. US)" />
        </FullRow>
        <FullRow>
          <TextArea label="Issuer & legal structure" name="sectionIssuer" value={p?.sectionIssuer} placeholder="Entity, jurisdiction, regulatory wrapper, SPV diagram. Who legally owns the underlying asset." />
        </FullRow>
      </Section>

      {/* Track record */}
      <Section title="Track record">
        <Field label="Issuing date" name="issuingDate" value={p?.issuingDate} placeholder="e.g. March 2023" hint="When the asset was issued / launched" />
        <Field label="Distributions paid" name="distributionsPaid" value={p?.distributionsPaid} placeholder="e.g. Monthly since Jan 2023" />
        <FullRow>
          <Field label="Incidents" name="incidents" value={p?.incidents} placeholder="e.g. None, or describe any relevant events" />
        </FullRow>
      </Section>

      {/* Buttons */}
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <button
          type="submit"
          style={{
            background: BLUE, color: "#fff", border: "none",
            borderRadius: 10, padding: "12px 24px", fontSize: 14,
            fontWeight: 700, cursor: "pointer",
          }}
        >
          {submitLabel}
        </button>
        <Link
          href="/admin"
          style={{ fontSize: 13.5, color: MUTE, textDecoration: "none" }}
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
