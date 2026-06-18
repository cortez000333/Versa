import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ExternalLink, ShieldCheck, Lock, Building2,
  TrendingUp, Scale, Activity, Info, ChevronRight, Calculator, Users,
} from "lucide-react";
import { getProtocol } from "@/lib/protocols";
import { Protocol } from "@/lib/data";
import TrueYieldCalculator from "@/components/TrueYieldCalculator";

// ── Brand tokens ──────────────────────────────────────────────
const BG_ELEV = "#0E1424";
const CARD = "#111A2E";
const LINE = "#1E2A44";
const BLUE = "#4F8FF7";
const BLUE_SOFT = "#16233F";
const MINT = "#35D6A4";
const CORAL = "#F87171";
const AMBER = "#E0B354";
const INK = "#EAF0FB";
const MUTE = "#7E8DA8";
const FAINT = "#566179";
const FONT = "var(--font-space-grotesk), 'Space Grotesk', -apple-system, sans-serif";

function scoreColor(v: number) {
  if (v >= 7) return MINT;
  if (v >= 4) return AMBER;
  return CORAL;
}

type ScoreItem = {
  key: string;
  name: string;
  short: string;
  value: number | null;
  note: string;
  icon: React.ReactNode;
};

// ── Pure SVG helpers (no state → safe in a server component) ──
function Radar({ scores }: { scores: ScoreItem[] }) {
  const cx = 130, cy = 125, R = 92;
  const n = scores.length;
  const angle = (i: number) => (Math.PI * 2 * i) / n - Math.PI / 2;
  const point = (i: number, r: number): [number, number] => [
    cx + Math.cos(angle(i)) * r,
    cy + Math.sin(angle(i)) * r,
  ];

  const rings = [0.25, 0.5, 0.75, 1].map((f) =>
    scores.map((_, i) => point(i, R * f).join(",")).join(" ")
  );
  const dataPts = scores
    .map((s, i) => point(i, R * ((s.value ?? 0) / 10)).join(","))
    .join(" ");

  return (
    <svg width="260" height="250" viewBox="0 0 260 250">
      {rings.map((pts, i) => (
        <polygon key={i} points={pts} fill="none" stroke={LINE} strokeWidth="1" />
      ))}
      {scores.map((_, i) => {
        const [x, y] = point(i, R);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke={LINE} strokeWidth="1" />;
      })}
      <polygon points={dataPts} fill="rgba(79,143,247,0.25)" stroke={BLUE} strokeWidth="2" />
      {scores.map((s, i) => {
        const [x, y] = point(i, R * ((s.value ?? 0) / 10));
        return <circle key={i} cx={x} cy={y} r="3.5" fill={s.value == null ? FAINT : scoreColor(s.value)} />;
      })}
      {scores.map((s, i) => {
        const [x, y] = point(i, R + 20);
        return (
          <text key={i} x={x} y={y} textAnchor="middle" dominantBaseline="central"
            fontFamily={FONT} fontSize="10.5" fontWeight="600" fill={MUTE}>{s.short}</text>
        );
      })}
    </svg>
  );
}

function Donut({ value, text, color }: { value: number; text: string; color: string }) {
  const pct = value / 10, r = 30, c = 2 * Math.PI * r;
  return (
    <svg width="78" height="78" viewBox="0 0 78 78">
      <circle cx="39" cy="39" r={r} fill="none" stroke={LINE} strokeWidth="7" />
      <circle cx="39" cy="39" r={r} fill="none" stroke={color} strokeWidth="7"
        strokeDasharray={`${c * pct} ${c}`} strokeLinecap="round" transform="rotate(-90 39 39)" />
      <text x="39" y="39" textAnchor="middle" dominantBaseline="central" fontFamily={FONT} fontSize="22" fontWeight="700" fill={INK}>{text}</text>
    </svg>
  );
}

function Bar({ value }: { value: number | null }) {
  const v = value ?? 0;
  const col = value == null ? LINE : scoreColor(v);
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[...Array(10)].map((_, i) => (
        <div key={i} style={{ width: 9, height: 7, borderRadius: 2, background: i < v ? col : LINE }} />
      ))}
    </div>
  );
}

function pill(bg: string, fg: string, bd: string): React.CSSProperties {
  return { background: bg, color: fg, fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 7, border: `1px solid ${bd}`, whiteSpace: "nowrap" };
}

// "—" for any empty value
function orDash(v: string | null | undefined) {
  return v && v.trim() ? v : "—";
}

// Best-effort elapsed time from a free-form issuing date like "March 2023".
// Returns "" when the text can't be parsed, so display falls back to the date alone.
function elapsedSince(v: string | null | undefined): string {
  if (!v || !v.trim()) return "";
  const d = new Date(v);
  if (isNaN(d.getTime())) return "";
  const now = new Date();
  let months = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
  if (months < 0) return "";
  if (months < 12) return `~${months} mo live`;
  const yrs = Math.floor(months / 12);
  const rem = months % 12;
  return rem ? `~${yrs} yr ${rem} mo live` : `~${yrs} yr live`;
}

export default async function ProtocolPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const protocol: Protocol | null = await getProtocol(parseInt(id));
  if (!protocol) notFound();

  // ── Six proprietary scores ──────────────────────────────────
  const scores: ScoreItem[] = [
    { key: "transparency", name: "Transparency", short: "Transparency",
      value: protocol.scoreTransparency ?? null, note: protocol.noteTransparency ?? "",
      icon: <ShieldCheck size={17} /> },
    { key: "liquidity", name: "Redemption / Liquidity Friction", short: "Redemption",
      value: protocol.scoreLiquidityFriction ?? null, note: protocol.noteLiquidityFriction ?? "",
      icon: <Lock size={17} /> },
    { key: "cost", name: "Real Cost", short: "Real cost",
      value: protocol.scoreRealCost ?? null, note: protocol.noteRealCost ?? "",
      icon: <TrendingUp size={17} /> },
    { key: "track", name: "Track Record", short: "Track record",
      value: protocol.scoreTrackRecord ?? null, note: protocol.noteTrackRecord ?? "",
      icon: <Activity size={17} /> },
    { key: "counterparty", name: "Counterparty / Backing", short: "Counterparty",
      value: protocol.scoreCounterparty ?? null, note: protocol.noteCounterparty ?? "",
      icon: <Building2 size={17} /> },
    { key: "regulatory", name: "Regulatory Clarity", short: "Regulatory",
      value: protocol.scoreRegulatory ?? null, note: protocol.noteRegulatory ?? "",
      icon: <Scale size={17} /> },
  ];

  // ── Composite Versa Score (average of scores that are set) ──
  const present = scores.map((s) => s.value).filter((v): v is number => v != null);
  const hasScores = present.length > 0;
  const avg = hasScores ? present.reduce((a, b) => a + b, 0) / present.length : 0;
  const versaStr = hasScores ? avg.toFixed(1) : "—";
  const versaColor = hasScores ? scoreColor(avg) : FAINT;

  // ── Asset facts strip ───────────────────────────────────────
  const money3 = (n: number | null | undefined) =>
    n != null ? `$${n.toFixed(3)}` : "—";
  const facts: [string, string][] = [
    ["Issuer / manager", orDash(protocol.issuerName)],
    ["Underlying", orDash(protocol.underlying)],
    ["Chain(s)", orDash(protocol.chain)],
    ["Token standard", orDash(protocol.tokenStandard)],
    ["NAV / token", money3(protocol.navPerToken)],
    ["Market price", money3(protocol.marketPrice)],
    ["Headline yield", protocol.headlineYield != null ? `${protocol.headlineYield}% APY` : "—"],
    ["TVL / AUM", orDash(protocol.tvl)],
    ["Min. investment", orDash(protocol.minInvestment)],
    ["Lock-up", orDash(protocol.lockUp)],
    ["Redemption", orDash(protocol.redemptionTerms)],
    ["Settlement", orDash(protocol.settlement)],
    ["Eligibility", orDash(protocol.eligibility)],
    ["Regulatory wrapper", orDash(protocol.wrapper)],
    ["Custodian", orDash(protocol.custodian)],
  ];

  // ── "Suited for" — who the ASSET suits (descriptive, never advice) ──
  const suitedTags = (protocol.suitedForTags ?? "")
    .split(",").map((t) => t.trim()).filter(Boolean);
  const suitedText = (protocol.suitedForText ?? "").trim();
  const hasSuitedFor = suitedTags.length > 0 || suitedText.length > 0;

  // ── Track Record evidence (filter out empty / "—" placeholder values) ──
  const hasVal = (v: string | null | undefined) => !!(v && v.trim() && v.trim() !== "—");
  const issuingEl = elapsedSince(protocol.issuingDate);
  const issuingDisplay = protocol.issuingDate
    ? `${protocol.issuingDate}${issuingEl ? ` · ${issuingEl}` : ""}`
    : "";
  const trackRows: [string, string][] = [
    ["Issuing date", issuingDisplay],
    ["Distributions paid", protocol.distributionsPaid],
    ["Incidents", protocol.incidents],
  ].filter(([, v]) => hasVal(v)) as [string, string][];
  const hasTrackRecord = trackRows.length > 0;

  // The calculator needs a real NAV and headline yield to mean anything
  const canCalc =
    protocol.navPerToken != null && protocol.navPerToken > 0 && protocol.headlineYield != null;

  return (
    <div style={{ paddingTop: 24 }}>
      {/* Back button */}
      <Link
        href="/"
        style={{ display: "inline-flex", alignItems: "center", gap: 6, color: MUTE, fontSize: 13.5, textDecoration: "none", fontWeight: 600, marginBottom: 18 }}
      >
        <ArrowLeft size={15} /> Back to markets
      </Link>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 20, marginBottom: 20, flexWrap: "wrap" }}>
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          {protocol.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={protocol.logoUrl}
              alt={`${protocol.name} logo`}
              style={{ width: 58, height: 58, borderRadius: 14, objectFit: "cover", border: `1px solid #26406E`, background: BLUE_SOFT, flexShrink: 0 }}
            />
          ) : (
            <div style={{ width: 58, height: 58, borderRadius: 14, background: BLUE_SOFT, border: `1px solid #26406E`, display: "flex", alignItems: "center", justifyContent: "center", color: BLUE, fontWeight: 700, fontSize: 20, flexShrink: 0 }}>
              {protocol.name.slice(0, 2).toUpperCase()}
            </div>
          )}
          <div>
            <h1 style={{ fontSize: 26, margin: 0, fontWeight: 700, letterSpacing: -0.5, color: INK }}>{protocol.name}</h1>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14, background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "12px 18px" }}>
          <Donut value={hasScores ? avg : 0} text={hasScores ? String(Math.round(avg)) : "—"} color={versaColor} />
          <div>
            <div style={{ fontSize: 11, color: FAINT, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 600 }}>Versa Score</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: versaColor }}>{versaStr}<span style={{ fontSize: 14, color: FAINT }}>/10</span></div>
            <div style={{ fontSize: 11.5, color: MUTE }}>composite of 6 scores</div>
          </div>
        </div>
      </div>

      {/* Asset facts strip */}
      <div style={{ fontSize: 11, color: FAINT, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 10 }}>Asset facts</div>
      <div style={{ background: BG_ELEV, border: `1px solid ${LINE}`, borderRadius: 14, padding: "16px 8px", marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "14px 8px" }}>
          {facts.map(([k, v]) => (
            <div key={k} style={{ padding: "0 14px" }}>
              <div style={{ fontSize: 11, color: FAINT, marginBottom: 3 }}>{k}</div>
              <div style={{ fontSize: 13.5, color: INK, fontWeight: 500 }}>{v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Plain read (hidden if empty) */}
      {protocol.plainRead && protocol.plainRead.trim() ? (
        <div style={{ background: BLUE_SOFT, border: `1px solid #26406E`, borderRadius: 14, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7, color: BLUE }}>
            <Info size={16} /><span style={{ fontWeight: 600, fontSize: 14 }}>The plain read</span>
          </div>
          <p style={{ margin: 0, fontSize: 14, color: INK, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>{protocol.plainRead}</p>
        </div>
      ) : null}

      {/* Suited for — who the ASSET suits (descriptive, hidden if empty) */}
      {hasSuitedFor ? (
        <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "16px 20px", marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: suitedTags.length > 0 ? 12 : 7, color: BLUE }}>
            <Users size={16} /><span style={{ fontWeight: 600, fontSize: 14, color: INK }}>Suited for</span>
          </div>
          {suitedTags.length > 0 ? (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: suitedText ? 12 : 0 }}>
              {suitedTags.map((t) => (
                <span key={t} style={pill(BLUE_SOFT, BLUE, "#26406E")}>{t}</span>
              ))}
            </div>
          ) : null}
          {suitedText ? (
            <p style={{ margin: 0, fontSize: 13.5, color: MUTE, lineHeight: 1.55, whiteSpace: "pre-wrap" }}>{suitedText}</p>
          ) : null}
        </div>
      ) : null}

      {/* Scorecard: radar + six score cards */}
      <div style={{ fontSize: 11, color: FAINT, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 12 }}>The scorecard</div>
      <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 16, marginBottom: 28, alignItems: "start" }}>
        <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "16px 10px 10px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <Radar scores={scores} />
          <div style={{ fontSize: 11.5, color: FAINT, textAlign: "center", marginTop: 4, lineHeight: 1.4 }}>
            Score shape across all six dimensions
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {scores.map((s) => (
            <div key={s.key} style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "14px 16px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 9 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, color: BLUE }}>
                  {s.icon}<span style={{ color: INK, fontWeight: 600, fontSize: 12.5 }}>{s.name}</span>
                </div>
                <span style={{ fontWeight: 700, fontSize: 15, color: s.value == null ? FAINT : scoreColor(s.value) }}>
                  {s.value == null ? "—" : s.value}<span style={{ fontSize: 10.5, color: FAINT }}>/10</span>
                </span>
              </div>
              <div style={{ marginBottom: 9 }}><Bar value={s.value} /></div>
              <p style={{ margin: 0, fontSize: 12, color: MUTE, lineHeight: 1.45 }}>{orDash(s.note)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Track Record evidence (hidden entirely when no data) */}
      {hasTrackRecord ? (
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: FAINT, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 12 }}>Track record</div>
          <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 14, padding: "18px 22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: BLUE }}>
              <Activity size={17} /><span style={{ color: INK, fontWeight: 600, fontSize: 13.5 }}>Track record — the evidence behind the score</span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${trackRows.length}, 1fr)`, gap: 8 }}>
              {trackRows.map(([k, v]) => (
                <div key={k} style={{ padding: "0 14px", borderLeft: `2px solid ${LINE}` }}>
                  <div style={{ fontSize: 11, color: FAINT, marginBottom: 4, textTransform: "uppercase", letterSpacing: 0.5 }}>{k}</div>
                  <div style={{ fontSize: 14, color: INK, fontWeight: 500, lineHeight: 1.4 }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* True-yield calculator (or a notice if data isn't entered yet) */}
      {canCalc ? (
        <TrueYieldCalculator
          nav={protocol.navPerToken as number}
          marketPrice={protocol.marketPrice ?? null}
          headlineYield={protocol.headlineYield as number}
          feeFlat={protocol.feeFlat ?? 0}
          feePerformance={protocol.feePerformance ?? 0}
          feeEntry={protocol.feeEntry ?? 0}
          feeExit={protocol.feeExit ?? 0}
        />
      ) : (
        <>
          <div style={{ fontSize: 11, color: FAINT, textTransform: "uppercase", letterSpacing: 0.8, fontWeight: 600, marginBottom: 12 }}>True-yield calculator</div>
          <div style={{ background: CARD, border: `1px solid ${LINE}`, borderRadius: 16, padding: "22px 24px", display: "flex", alignItems: "center", gap: 9, color: MUTE }}>
            <Calculator size={18} />
            <span style={{ fontSize: 13.5 }}>
              The calculator needs a NAV per token and a headline yield for this asset — add them in the admin panel to enable it.
            </span>
          </div>
        </>
      )}

      {/* Exit note (hidden if empty) */}
      {protocol.exitRoutesNote && protocol.exitRoutesNote.trim() ? (
        <div style={{ marginTop: 20, background: BG_ELEV, border: `1px dashed ${LINE}`, borderRadius: 12, padding: "14px 18px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6, color: MUTE }}>
            <ChevronRight size={14} /><span style={{ fontSize: 12.5, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>Where holders have exited (informational)</span>
          </div>
          <p style={{ margin: 0, fontSize: 12.5, color: FAINT, lineHeight: 1.5, whiteSpace: "pre-wrap" }}>{protocol.exitRoutesNote}</p>
        </div>
      ) : null}

      {/* Visit issuer */}
      <div style={{ marginTop: 22, display: "flex", justifyContent: "flex-end" }}>
        {protocol.protocolUrl ? (
          <a
            href={protocol.protocolUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: "flex", alignItems: "center", gap: 7, background: BLUE, color: "#fff", textDecoration: "none", border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 13.5, fontWeight: 700 }}
          >
            Visit issuer <ExternalLink size={14} />
          </a>
        ) : (
          <button style={{ display: "flex", alignItems: "center", gap: 7, background: BLUE, color: "#fff", border: "none", borderRadius: 10, padding: "11px 18px", fontSize: 13.5, fontWeight: 700, cursor: "not-allowed", opacity: 0.6 }}>
            Visit issuer <ExternalLink size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
